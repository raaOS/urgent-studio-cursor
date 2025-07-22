package main

import (
	"html/template"
	"net/http"
)

// Handler untuk halaman login admin
func adminLoginHandler(w http.ResponseWriter, _ *http.Request) {
	tmpl := template.Must(template.New("login").Parse(`
	<!DOCTYPE html>
	<html><head><title>Admin Login</title></head><body>
	<h2>Login Admin Panel</h2>
	<form method="POST" action="/admin/login">
	  <input type="text" name="username" placeholder="Username" required><br><br>
	  <input type="password" name="password" placeholder="Password" required><br><br>
	  <button type="submit">Login</button>
	</form>
	</body></html>
	`))
	tmpl.Execute(w, nil)
}

// Handler untuk dashboard admin
func adminDashboardHandler(w http.ResponseWriter, _ *http.Request) {
	tmpl := template.Must(template.New("dashboard").Parse(`
	<!DOCTYPE html>
	<html><head><title>Admin Dashboard</title></head><body>
	<h2>Dashboard Admin (Go)</h2>
	<p>Selamat datang di admin panel sederhana berbasis Go.</p>
	<a href="/admin/logout">Logout</a>
	</body></html>
	`))
	tmpl.Execute(w, nil)
}
