"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  FileText,
  Eye,
  Filter,
  User,
  Mail,
} from "lucide-react";
import { Invoice, InvoiceItem } from "@/types/mayar";

interface InvoiceFormData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: InvoiceItem[];
  dueDate: string;
  notes: string;
}

export default function MayarInvoicesPage(): JSX.Element {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [formData, setFormData] = useState<InvoiceFormData>({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    items: [{ name: "", price: 0, quantity: 1, description: "" }],
    dueDate: "",
    notes: "",
  });

  // Mock data untuk demo
  useEffect(() => {
    const mockInvoices: Invoice[] = [
      {
        id: "inv_001",
        invoiceNumber: "INV-2024-001",
        customerName: "John Doe",
        customerEmail: "john@example.com",
        customerPhone: "+62812345678",
        items: [
          {
            name: "Website Development",
            price: 5000000,
            quantity: 1,
            description: "Complete website with admin panel",
          },
        ],
        subtotal: 5000000,
        total: 5000000,
        status: "sent",
        dueDate: "2024-02-15T00:00:00Z",
        createdAt: "2024-01-15T10:00:00Z",
        updatedAt: "2024-01-15T10:00:00Z",
        notes: "Payment due in 30 days",
      },
      {
        id: "inv_002",
        invoiceNumber: "INV-2024-002",
        customerName: "Jane Smith",
        customerEmail: "jane@example.com",
        customerPhone: "+62812345679",
        items: [
          {
            name: "Mobile App Development",
            price: 8000000,
            quantity: 1,
            description: "iOS and Android app",
          },
          {
            name: "UI/UX Design",
            price: 2000000,
            quantity: 1,
            description: "Complete app design",
          },
        ],
        subtotal: 10000000,
        total: 10000000,
        status: "paid",
        dueDate: "2024-02-20T00:00:00Z",
        paidAt: "2024-01-18T14:30:00Z",
        createdAt: "2024-01-16T10:00:00Z",
        updatedAt: "2024-01-18T14:30:00Z",
        notes: "Rush project - completed early",
      },
      {
        id: "inv_003",
        invoiceNumber: "INV-2024-003",
        customerName: "Bob Wilson",
        customerEmail: "bob@example.com",
        items: [
          {
            name: "E-commerce Website",
            price: 7500000,
            quantity: 1,
            description: "Online store with payment gateway",
          },
        ],
        subtotal: 7500000,
        total: 7500000,
        status: "overdue",
        dueDate: "2024-01-30T00:00:00Z",
        createdAt: "2024-01-10T10:00:00Z",
        updatedAt: "2024-01-10T10:00:00Z",
        notes: "Follow up required",
      },
    ];

    setTimeout(() => {
      setInvoices(mockInvoices);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredInvoices = invoices.filter(
    (invoice) =>
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateInvoice = async (): Promise<void> => {
    try {
      const newInvoice: Invoice = {
        id: `inv_${Date.now()}`,
        invoiceNumber: `INV-2024-${String(invoices.length + 1).padStart(
          3,
          "0"
        )}`,
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
        items: formData.items,
        subtotal: formData.items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        ),
        total: formData.items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        ),
        status: "draft",
        dueDate: formData.dueDate,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        notes: formData.notes,
      };

      setInvoices((prev) => [...prev, newInvoice]);
      setShowCreateForm(false);
      resetForm();
    } catch (error) {
      console.error("Error creating invoice:", error);
    }
  };

  const handleUpdateInvoice = async (): Promise<void> => {
    if (!editingInvoice) return;

    try {
      const updatedInvoice: Invoice = {
        ...editingInvoice,
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
        items: formData.items,
        subtotal: formData.items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        ),
        total: formData.items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        ),
        dueDate: formData.dueDate,
        notes: formData.notes,
        updatedAt: new Date().toISOString(),
      };

      setInvoices((prev) =>
        prev.map((inv) => (inv.id === editingInvoice.id ? updatedInvoice : inv))
      );
      setEditingInvoice(null);
      setShowCreateForm(false);
      resetForm();
    } catch (error) {
      console.error("Error updating invoice:", error);
    }
  };

  const handleDeleteInvoice = async (invoiceId: string): Promise<void> => {
    try {
      setInvoices((prev) => prev.filter((inv) => inv.id !== invoiceId));
    } catch (error) {
      console.error("Error deleting invoice:", error);
    }
  };

  const resetForm = (): void => {
    setFormData({
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      items: [{ name: "", price: 0, quantity: 1, description: "" }],
      dueDate: "",
      notes: "",
    });
  };

  const startEdit = (invoice: Invoice): void => {
    setEditingInvoice(invoice);
    setFormData({
      customerName: invoice.customerName,
      customerEmail: invoice.customerEmail,
      customerPhone: invoice.customerPhone || "",
      items: invoice.items,
      dueDate: invoice.dueDate?.split("T")[0] ?? "",
      notes: invoice.notes || "",
    });
    setShowCreateForm(true);
  };

  const addItem = (): void => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        { name: "", price: 0, quantity: 1, description: "" },
      ],
    }));
  };

  const removeItem = (index: number): void => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const updateItem = (
    index: number,
    field: keyof InvoiceItem,
    value: string | number
  ): void => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(price);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusColor = (status: Invoice["status"]): string => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "sent":
        return "bg-blue-100 text-blue-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      case "cancelled":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  const getStatusText = (status: Invoice["status"]): string => {
    switch (status) {
      case "paid":
        return "Dibayar";
      case "sent":
        return "Terkirim";
      case "overdue":
        return "Terlambat";
      case "cancelled":
        return "Dibatalkan";
      default:
        return "Draft";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Invoice Mayar.id
            </h1>
            <p className="text-gray-600 mt-1">
              Kelola invoice dan tagihan untuk pelanggan
            </p>
          </div>
          <Button
            onClick={() => {
              setShowCreateForm(true);
              setEditingInvoice(null);
              resetForm();
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Buat Invoice
          </Button>
        </div>

        {/* Search and Filter */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Cari invoice berdasarkan nomor, nama pelanggan, atau email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Create/Edit Form */}
        {showCreateForm && (
          <Card>
            <CardHeader>
              <CardTitle>
                {editingInvoice ? "Edit Invoice" : "Buat Invoice Baru"}
              </CardTitle>
              <CardDescription>
                {editingInvoice
                  ? "Perbarui informasi invoice"
                  : "Buat invoice baru untuk pelanggan"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Customer Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Informasi Pelanggan</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="customerName">Nama Pelanggan</Label>
                    <Input
                      id="customerName"
                      value={formData.customerName}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          customerName: e.target.value,
                        }))
                      }
                      placeholder="Masukkan nama pelanggan"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customerEmail">Email</Label>
                    <Input
                      id="customerEmail"
                      type="email"
                      value={formData.customerEmail}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          customerEmail: e.target.value,
                        }))
                      }
                      placeholder="Masukkan email pelanggan"
                    />
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="customerPhone">Nomor Telepon</Label>
                    <Input
                      id="customerPhone"
                      value={formData.customerPhone}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          customerPhone: e.target.value,
                        }))
                      }
                      placeholder="Masukkan nomor telepon"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dueDate">Tanggal Jatuh Tempo</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          dueDate: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Item Invoice</h3>
                  <Button variant="outline" size="sm" onClick={addItem}>
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Item
                  </Button>
                </div>

                {formData.items.map((item, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Item {index + 1}</h4>
                      {formData.items.length > 1 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeItem(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Nama Item</Label>
                        <Input
                          value={item.name}
                          onChange={(e) =>
                            updateItem(index, "name", e.target.value)
                          }
                          placeholder="Masukkan nama item"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Deskripsi</Label>
                        <Input
                          value={item.description || ""}
                          onChange={(e) =>
                            updateItem(index, "description", e.target.value)
                          }
                          placeholder="Deskripsi item (opsional)"
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="space-y-2">
                        <Label>Harga (IDR)</Label>
                        <Input
                          type="number"
                          value={item.price}
                          onChange={(e) =>
                            updateItem(index, "price", Number(e.target.value))
                          }
                          placeholder="0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Jumlah</Label>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) =>
                            updateItem(
                              index,
                              "quantity",
                              Number(e.target.value)
                            )
                          }
                          placeholder="1"
                          min="1"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Total</Label>
                        <div className="p-2 bg-gray-50 rounded border text-sm font-medium">
                          {formatPrice(item.price * item.quantity)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center text-lg font-semibold">
                    <span>Total Invoice:</span>
                    <span className="text-green-600">
                      {formatPrice(
                        formData.items.reduce(
                          (sum, item) => sum + item.price * item.quantity,
                          0
                        )
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Catatan</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  placeholder="Catatan tambahan untuk invoice (opsional)"
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-3 pt-4">
                <Button
                  onClick={
                    editingInvoice ? handleUpdateInvoice : handleCreateInvoice
                  }
                  disabled={
                    !formData.customerName ||
                    !formData.customerEmail ||
                    formData.items.some((item) => !item.name || item.price <= 0)
                  }
                >
                  {editingInvoice ? "Update Invoice" : "Simpan Invoice"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingInvoice(null);
                    resetForm();
                  }}
                >
                  Batal
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Invoices List */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredInvoices.map((invoice) => (
            <Card
              key={invoice.id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">
                      {invoice.invoiceNumber}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      <div className="flex items-center text-sm text-gray-500">
                        <User className="h-3 w-3 mr-1" />
                        {invoice.customerName}
                      </div>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <Mail className="h-3 w-3 mr-1" />
                        {invoice.customerEmail}
                      </div>
                    </CardDescription>
                  </div>
                  <Badge
                    variant="secondary"
                    className={getStatusColor(invoice.status)}
                  >
                    {getStatusText(invoice.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Total:</span>
                    <span className="font-semibold text-green-600">
                      {formatPrice(invoice.total)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Items:</span>
                    <span className="text-sm font-medium">
                      {invoice.items.length} item
                      {invoice.items.length > 1 ? "s" : ""}
                    </span>
                  </div>
                  {invoice.dueDate && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        Jatuh Tempo:
                      </span>
                      <span className="text-sm font-medium">
                        {formatDate(invoice.dueDate)}
                      </span>
                    </div>
                  )}
                  {invoice.paidAt && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Dibayar:</span>
                      <span className="text-sm font-medium text-green-600">
                        {formatDate(invoice.paidAt)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => startEdit(invoice)}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      /* View details */
                    }}
                  >
                    <Eye className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      /* Send invoice */
                    }}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <FileText className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteInvoice(invoice.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredInvoices.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? "Invoice tidak ditemukan" : "Belum ada invoice"}
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm
                  ? "Coba ubah kata kunci pencarian Anda"
                  : "Mulai dengan membuat invoice pertama Anda"}
              </p>
              {!searchTerm && (
                <Button onClick={() => setShowCreateForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Buat Invoice Pertama
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
