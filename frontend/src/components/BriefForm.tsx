"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Trash2, ShoppingCart } from "lucide-react";
import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  category: string;
}

interface BriefData {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  details: string;
  dimensions: string;
  additionalNotes?: string | undefined;
}

interface BriefFormProps {
  cart: CartItem[];
}

const briefSchema = z.object({
  briefs: z.array(
    z.object({
      productId: z.string().min(1, "Product ID diperlukan"),
      productName: z.string().min(1, "Nama produk diperlukan"),
      price: z.number().min(0, "Harga harus valid"),
      quantity: z.number().min(1, "Quantity minimal 1"),
      details: z.string().min(10, "Detail minimal 10 karakter"),
      dimensions: z.string().min(1, "Dimensi diperlukan"),
      additionalNotes: z.string().optional(),
    }),
  ),
  customerInfo: z.object({
    name: z.string().min(1, "Nama diperlukan"),
    whatsapp: z.string().min(10, "Nomor WhatsApp minimal 10 digit"),
    email: z.string().email("Email tidak valid").optional(),
  }),
});

type BriefFormData = z.infer<typeof briefSchema>;

export default function BriefForm({ cart }: BriefFormProps): JSX.Element {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { toast } = useToast();

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
    register,
  } = useForm<BriefFormData>({
    resolver: zodResolver(briefSchema),
    defaultValues: {
      briefs: [],
      customerInfo: {
        name: "",
        whatsapp: "",
        email: "",
      },
    },
  });

  const { fields, remove } = useFieldArray({
    control,
    name: "briefs",
  });

  const watchedBriefs = watch("briefs");

  useEffect((): void => {
    if (cart.length > 0) {
      // Initialize form with cart items
      const initialBriefs: BriefData[] = cart.map((item) => ({
        productId: item.productId,
        productName: item.name,
        price: item.price,
        quantity: item.quantity,
        details: "",
        dimensions: "",
        additionalNotes: "",
      }));

      reset({ 
        briefs: initialBriefs,
        customerInfo: {
          name: "",
          whatsapp: "",
          email: "",
        },
      });
    }
  }, [cart, reset]);

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getTotalPrice = (): number => {
    return watchedBriefs.reduce(
      (total, brief) => total + brief.price * brief.quantity,
      0,
    );
  };

  const generateOrderCode = (): string => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `URS-${timestamp}-${random}`;
  };

  const generateWhatsAppMessage = (data: BriefFormData): string => {
    const orderCode = generateOrderCode();
    const totalPrice = getTotalPrice();
    
    let message = `*PESANAN DESAIN URGENT STUDIO*\n\n`;
    message += `📋 *Kode Pesanan:* ${orderCode}\n`;
    message += `👤 *Nama:* ${data.customerInfo.name}\n`;
    message += `📱 *WhatsApp:* ${data.customerInfo.whatsapp}\n`;
    if (data.customerInfo.email) {
      message += `📧 *Email:* ${data.customerInfo.email}\n`;
    }
    message += `\n*DETAIL PESANAN:*\n`;
    
    data.briefs.forEach((brief, index) => {
      message += `\n${index + 1}. *${brief.productName}*\n`;
      message += `   💰 Harga: ${formatPrice(brief.price)}\n`;
      message += `   📦 Quantity: ${brief.quantity}x\n`;
      message += `   📝 Detail: ${brief.details}\n`;
      message += `   📐 Dimensi: ${brief.dimensions}\n`;
      if (brief.additionalNotes) {
        message += `   📌 Catatan: ${brief.additionalNotes}\n`;
      }
      message += `   💵 Subtotal: ${formatPrice(brief.price * brief.quantity)}\n`;
    });
    
    message += `\n💰 *TOTAL PEMBAYARAN: ${formatPrice(totalPrice)}*\n\n`;
    message += `Mohon konfirmasi pesanan ini. Terima kasih! 🙏`;
    
    return encodeURIComponent(message);
  };

  const onSubmit = async (data: BriefFormData): Promise<void> => {
    setIsSubmitting(true);

    try {
      // Generate WhatsApp message
      const whatsappMessage = generateWhatsAppMessage(data);
      const whatsappNumber = "6288224785326"; // Replace with actual WhatsApp number
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

      toast({
        title: "Pesanan berhasil dibuat",
        description: "Anda akan diarahkan ke WhatsApp untuk konfirmasi",
      });

      // Redirect to WhatsApp
      setTimeout(() => {
        window.open(whatsappUrl, '_blank');
      }, 1000);

    } catch (error) {
      console.error("Error creating order:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal membuat pesanan. Silakan coba lagi.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md border-black border shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          <CardHeader className="text-center">
            <div className="text-6xl mb-4">🛒</div>
            <CardTitle>Keranjang Kosong</CardTitle>
            <CardDescription>
              Anda belum memiliki produk di keranjang. Silakan pilih produk
              terlebih dahulu.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button 
              className="border-black border shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all duration-150" 
              onClick={() => { window.location.href = "/products"; }}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Lihat Produk
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Form Brief Design
            </h1>
            <p className="text-gray-600">
              Lengkapi detail untuk setiap design yang Anda pesan
            </p>
          </div>

          {/* Summary Card */}
          <Card className="mb-8 border-black border shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Ringkasan Pesanan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between items-center">
                    <span>{item.name}</span>
                    <span className="font-medium">
                      {item.quantity}x {formatPrice(item.price)}
                    </span>
                  </div>
                ))}
              </div>
              <Separator />
              <div className="flex justify-between items-center mt-4">
                <span className="text-lg font-semibold">Total:</span>
                <span className="text-2xl font-bold text-blue-600">
                  {formatPrice(getTotalPrice())}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Brief Form */}
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Customer Information */}
            <Card className="mb-8 border-black border shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <CardHeader>
                <CardTitle>Informasi Pemesan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="customerInfo.name">
                    Nama Lengkap <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="customerInfo.name"
                    placeholder="Masukkan nama lengkap Anda"
                    {...register("customerInfo.name")}
                    className="mt-1 border-black border shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  />
                  {errors.customerInfo?.name && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.customerInfo.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="customerInfo.whatsapp">
                    Nomor WhatsApp <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="customerInfo.whatsapp"
                    placeholder="Contoh: 081234567890"
                    {...register("customerInfo.whatsapp")}
                    className="mt-1 border-black border shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  />
                  {errors.customerInfo?.whatsapp && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.customerInfo.whatsapp.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="customerInfo.email">
                    Email (Opsional)
                  </Label>
                  <Input
                    id="customerInfo.email"
                    type="email"
                    placeholder="email@example.com"
                    {...register("customerInfo.email")}
                    className="mt-1 border-black border shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  />
                  {errors.customerInfo?.email && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.customerInfo.email.message}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Product Briefs */}
            <div className="space-y-6">
              {fields.map((field, index) => (
                <Card key={field.id} className="border-black border shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">
                          {field.productName}
                        </CardTitle>
                        <CardDescription>
                          {formatPrice(field.price)} x {field.quantity}
                        </CardDescription>
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="border-black border shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all duration-150"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor={`briefs.${index}.details`}>
                        Detail Design <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        id={`briefs.${index}.details`}
                        placeholder="Jelaskan detail design yang Anda inginkan..."
                        {...register(`briefs.${index}.details`)}
                        className="mt-1 border-black border shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                      />
                      {errors.briefs?.[index]?.details && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.briefs[index]?.details?.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor={`briefs.${index}.dimensions`}>
                        Dimensi/Ukuran <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id={`briefs.${index}.dimensions`}
                        placeholder="Contoh: 1080x1080px, A4, 21x29.7cm"
                        {...register(`briefs.${index}.dimensions`)}
                        className="mt-1 border-black border shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                      />
                      {errors.briefs?.[index]?.dimensions && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.briefs[index]?.dimensions?.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor={`briefs.${index}.additionalNotes`}>
                        Catatan Tambahan
                      </Label>
                      <Textarea
                        id={`briefs.${index}.additionalNotes`}
                        placeholder="Catatan tambahan, referensi, atau permintaan khusus..."
                        {...register(`briefs.${index}.additionalNotes`)}
                        className="mt-1 border-black border shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Submit Button */}
            <div className="mt-8 text-center">
              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting || fields.length === 0}
                className="min-w-48 border-black border shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all duration-150"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Memproses...
                  </>
                ) : (
                  <>
                    📱 Kirim ke WhatsApp
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}