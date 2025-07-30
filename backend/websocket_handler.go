package main

import (
	"encoding/json"
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"github.com/sirupsen/logrus"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // Allow all origins for development
	},
}

type Client struct {
	conn *websocket.Conn
	send chan []byte
}

type WebSocketHub struct {
	clients    map[*Client]bool
	broadcast  chan []byte
	register   chan *Client
	unregister chan *Client
	mu         sync.RWMutex
}

type WebSocketMessage struct {
	Type string      `json:"type"`
	Data interface{} `json:"data"`
	Timestamp time.Time `json:"timestamp"`
}

type OrderUpdate struct {
	ID            string    `json:"id"`
	Status        string    `json:"status"`
	PaymentStatus string    `json:"payment_status"`
	TotalAmount   float64   `json:"total_amount"`
	Customer      string    `json:"customer"`
	UpdatedAt     time.Time `json:"updated_at"`
}

type DashboardUpdate struct {
	TotalOrders   int     `json:"total_orders"`
	TotalRevenue  float64 `json:"total_revenue"`
	OrdersToday   int     `json:"orders_today"`
	RevenueToday  float64 `json:"revenue_today"`
	ActiveUsers   int     `json:"active_users"`
	LastUpdated   time.Time `json:"last_updated"`
}

var hub = &WebSocketHub{
	clients:    make(map[*Client]bool),
	broadcast:  make(chan []byte),
	register:   make(chan *Client),
	unregister: make(chan *Client),
}

func (h *WebSocketHub) run() {
	for {
		select {
		case client := <-h.register:
			h.mu.Lock()
			h.clients[client] = true
			h.mu.Unlock()
			logrus.Info("Client connected to WebSocket", logrus.Fields{
				"client_count": len(h.clients),
			})

		case client := <-h.unregister:
			h.mu.Lock()
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				close(client.send)
			}
			h.mu.Unlock()
			logrus.Info("Client disconnected from WebSocket", logrus.Fields{
				"client_count": len(h.clients),
			})

		case message := <-h.broadcast:
			h.mu.RLock()
			for client := range h.clients {
				select {
				case client.send <- message:
				default:
					close(client.send)
					delete(h.clients, client)
				}
			}
			h.mu.RUnlock()
		}
	}
}

func (c *Client) readPump() {
	defer func() {
		hub.unregister <- c
		c.conn.Close()
	}()
	
	c.conn.SetReadLimit(1024)
	if err := c.conn.SetReadDeadline(time.Now().Add(60 * time.Second)); err != nil {
		logrus.Error("Failed to set read deadline", logrus.Fields{
			"error": err.Error(),
		})
		return
	}
	c.conn.SetPongHandler(func(string) error {
		if err := c.conn.SetReadDeadline(time.Now().Add(60 * time.Second)); err != nil {
			logrus.Error("Failed to set read deadline in pong handler", logrus.Fields{
				"error": err.Error(),
			})
		}
		return nil
	})

	for {
		_, message, err := c.conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("WebSocket error: %v", err)
			}
			break
		}
		
		// Handle incoming messages (for future use)
		var msg WebSocketMessage
		if err := json.Unmarshal(message, &msg); err != nil {
			logrus.Warn("Invalid WebSocket message format", logrus.Fields{
				"error": err.Error(),
			})
			continue
		}
	}
}

func (c *Client) writePump() {
	ticker := time.NewTicker(54 * time.Second)
	defer func() {
		ticker.Stop()
		c.conn.Close()
	}()

	for {
		select {
		case message, ok := <-c.send:
			if err := c.conn.SetWriteDeadline(time.Now().Add(10 * time.Second)); err != nil {
				logrus.Error("Failed to set write deadline", logrus.Fields{
					"error": err.Error(),
				})
				return
			}
			if !ok {
				if err := c.conn.WriteMessage(websocket.CloseMessage, []byte{}); err != nil {
					logrus.Error("Failed to write close message", logrus.Fields{
						"error": err.Error(),
					})
				}
				return
			}

			w, err := c.conn.NextWriter(websocket.TextMessage)
			if err != nil {
				return
			}
			if _, err := w.Write(message); err != nil {
				logrus.Error("Failed to write message", logrus.Fields{
					"error": err.Error(),
				})
				return
			}

			if err := w.Close(); err != nil {
				return
			}

		case <-ticker.C:
			if err := c.conn.SetWriteDeadline(time.Now().Add(10 * time.Second)); err != nil {
				logrus.Error("Failed to set write deadline for ping", logrus.Fields{
					"error": err.Error(),
				})
				return
			}
			if err := c.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

func handleWebSocket(c *gin.Context) {
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		logrus.Error("WebSocket upgrade failed", logrus.Fields{
			"error": err.Error(),
		})
		return
	}

	client := &Client{
		conn: conn,
		send: make(chan []byte, 256),
	}

	hub.register <- client

	go client.writePump()
	go client.readPump()
}

func BroadcastOrderUpdate(orderUpdate OrderUpdate) {
	message := WebSocketMessage{
		Type:      "order_update",
		Data:      orderUpdate,
		Timestamp: time.Now(),
	}
	
	payload, err := json.Marshal(message)
	if err != nil {
		logrus.Error("Failed to marshal order update", logrus.Fields{
			"error": err.Error(),
		})
		return
	}
	
	hub.broadcast <- payload
	logrus.Info("Order update broadcasted", logrus.Fields{
		"order_id": orderUpdate.ID,
		"status":   orderUpdate.Status,
	})
}

func BroadcastDashboardUpdate(dashboardUpdate DashboardUpdate) {
	message := WebSocketMessage{
		Type:      "dashboard_update",
		Data:      dashboardUpdate,
		Timestamp: time.Now(),
	}
	
	payload, err := json.Marshal(message)
	if err != nil {
		logrus.Error("Failed to marshal dashboard update", logrus.Fields{
			"error": err.Error(),
		})
		return
	}
	
	hub.broadcast <- payload
	logrus.Info("Dashboard update broadcasted", logrus.Fields{
		"total_orders": dashboardUpdate.TotalOrders,
		"total_revenue": dashboardUpdate.TotalRevenue,
	})
}

func StartWebSocketHub() {
	go hub.run()
	logrus.Info("WebSocket hub started")
}