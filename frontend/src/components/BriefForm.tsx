
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, ArrowLeft, Home, FileText, Scaling } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { getAllProducts } from "@/lib/products";
import type { Product } from "@/lib/types";
import { BriefSchema } from "@/lib/types";
import { cn } from "@/lib/utils";
import { createMultipleOrdersFromCart } from "@/services/orderService";

import { BriefAccordion } from "./BriefAccordion";
import { Separator } from "./ui/separator";


const briefFormSchema = z.object({
  briefs: z.array(BriefSchema),
});

export type BriefFormValues = z.infer<typeof briefFormSchema>;

export function BriefForm(): JSX.Element {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [openAccordionItemsPerTier, setOpenAccordionItemsPerTier] = useState<Record<string, string[]>>({});

  const form = useForm<BriefFormValues>({
    resolver: zodResolver(briefFormSchema),
    defaultValues: {
      briefs: [],
    },
    mode: 'onBlur',
  });

  const { fields, remove, replace } = useFieldArray({
    control: form.control,
    name: "briefs"
  });
  
  const { getValues, setValue } = form;

  useEffect(() => {
    const cartFromSession = sessionStorage.getItem("globalCart");
    if (cartFromSession !== null && cartFromSession !== '') {
      try {
        const cartItems: Product[] = JSON.parse(cartFromSession);
        const newBriefs = cartItems.map((product, index) => {
          // Konversi width dan height ke tipe yang sesuai dengan BriefSchema
          let width: number | "" | undefined = undefined;
          let height: number | "" | undefined = undefined;
          
          if (product.width === '') {
            width = '';
          } else if (typeof product.width === 'number') {
            width = product.width;
          }
          
          if (product.height === '') {
            height = '';
          } else if (typeof product.height === 'number') {
            height = product.height;
          }
          
          return {
            instanceId: product.instanceId ?? `${product.id}-${Date.now() + index}`,
            productId   : product.id,
            productName: product.name,
            tier: product.tier,
            briefDetails: product.briefDetails ?? "",
            googleDriveAssetLinks   : product.googleDriveAssetLinks ?? "",
            width,
            height,
            unit: product.unit ?? 'px',
          };
        });
        
        replace(newBriefs);
      } catch (error) {
        console.error("Gagal mem-parse keranjang dari sessionStorage   : ", error);
        toast({
          variant: "destructive",
          title: "Data Keranjang Tidak Valid",
          description: "Data keranjang belanja Anda rusak.",
        });
      }
    }
  }, [replace, toast]);
  
  const briefsByTier = useMemo(() => {
    return fields.reduce((acc, field, index) => {
      const brief = getValues(`briefs.${index}`);
      if (!acc[brief.tier]) {
        acc[brief.tier] = [];
      }
      acc[brief.tier]!.push({ ...field, originalIndex: index });
      return acc;
    }, {} as Record<string, (typeof fields[0] & { originalIndex: number })[]>);
  }, [fields, getValues]);

  const handleValidationErrors = (errors: Record<string, unknown>) => {
    if (errors.briefs) {
        const firstErrorKey = Object.keys(errors.briefs)[0];
        if (firstErrorKey) {
            const errorBriefIndex = parseInt(firstErrorKey, 10);
            const errorBrief = getValues(`briefs.${errorBriefIndex}`);
            if (errorBrief) {
                const tier = errorBrief.tier;
                const instanceId = errorBrief.instanceId;

                setOpenAccordionItemsPerTier(prev => ({
                    ...prev,
                    [tier]: [...new Set([...(prev[tier] ?? []), instanceId])]
                }));

                toast({
                    variant: "destructive",
                    title: "Form Belum Lengkap",
                    description: "Harap periksa dan lengkapi semua brief yang wajib diisi.",
                });
            }
        }
    }
  }

  async function onSubmit(data: BriefFormValues) {
    setIsLoading(true);

    if (data.briefs.length === 0) {
      toast({
        variant: "destructive",
        title: "Keranjang Kosong",
        description: "Silakan tambahkan setidaknya satu item desain.",
      });
      setIsLoading(false);
      return;
    }

    try {
        const cartForService: Product[] = data.briefs.map(b => {
            const productInfo = getAllProducts().find(p => p.id === b.productId);
            return {
                id: b.productId,
                name: b.productName,
                tier: b.tier,
                price: productInfo?.price ?? 0,
                promoPrice    : productInfo?.promoPrice,
                instanceId: b.instanceId,
                briefDetails: b.briefDetails,
                googleDriveAssetLinks: b.googleDriveAssetLinks,
                width: b.width,
                height: b.height,
                unit: b.unit,
            };
        });
        
        const newOrderIds = await createMultipleOrdersFromCart(cartForService);

        toast({
          title: "Pesanan Berhasil Dibuat!",
          description: `Mengarahkan ke halaman checkout...`,
        });
        
        router.push(`/checkout/summary?orderIds=${newOrderIds.join(',')}`);

    } catch (error) {
      console.error("Gagal menyimpan pesanan   : ", error);
      toast({
        variant: "destructive",
        title: "Gagal Menyimpan Pesanan",
        description: "Terjadi kesalahan saat menyimpan pesanan Anda. Silakan coba lagi.",
      });
      setIsLoading(false);
    }
  }
  
  const handleOpenProductDialog = (): void => {
    const currentBriefs = getValues('briefs').map(brief => {
        const productInfo = getAllProducts().find(p => p.id === brief.productId);
        return {
          id: brief.productId,
          name: brief.productName,
          tier: brief.tier,
          price: productInfo?.price ?? 0,
          promoPrice    : productInfo?.promoPrice,
          imageUrl: productInfo?.imageUrl,
          instanceId    : brief.instanceId,
          briefDetails: brief.briefDetails,
          googleDriveAssetLinks: brief.googleDriveAssetLinks,
          width: brief.width,
          height: brief.height,
          unit: brief.unit,
        };
    });
    sessionStorage.setItem("globalCart", JSON.stringify(currentBriefs));
    router.push('/'); 
  };
  
  const handleApplyTemplateToTier = (tier: string, type: 'details' | 'dimensions') => {
        const allBriefs = getValues('briefs');
        const tierBriefs = allBriefs.filter(b => b.tier === tier);

        if (tierBriefs.length < 2) {
             toast({
                title: "Tidak Cukup Item",
                description: `Perlu minimal 2 item di tier ini untuk menyalin data.`,
            });
            return;
        }

        const sourceBrief = tierBriefs[0];
        if (!sourceBrief) {
            toast({
                variant: 'destructive',
                title: "Error",
                description: "Tidak dapat menemukan item pertama di tier ini.",
            });
            return;
        }

        if (type === 'details' && !sourceBrief.briefDetails) {
            toast({
                variant: 'destructive',
                title: "Brief Pertama Kosong",
                description: "Isi detail brief pada item pertama untuk dapat menyalinnya.",
            });
            return;
        }

        if (type === 'dimensions' && (!sourceBrief.width || !sourceBrief.height || String(sourceBrief.width) === '' || String(sourceBrief.height) === '')) {
            toast({
                variant : 'destructive',
                title: "Ukuran Pertama Tidak Lengkap",
                description: "Isi lebar dan tinggi pada item pertama untuk dapat menyalinnya.",
            });
            return;
        }
        
        let copiedCount = 0;
        allBriefs.forEach((brief, idx) => {
            if (brief.tier !== tier || brief.instanceId === sourceBrief.instanceId) {return;}

            if (type === 'details') {
                setValue(`briefs.${idx}.briefDetails`, sourceBrief.briefDetails);
                setValue(`briefs.${idx}.googleDriveAssetLinks`, sourceBrief.googleDriveAssetLinks);
            } else if (type === 'dimensions') {
                setValue(`briefs.${idx}.width`, sourceBrief.width);
                setValue(`briefs.${idx}.height`, sourceBrief.height);
                setValue(`briefs.${idx}.unit`, sourceBrief.unit);
            }
            copiedCount++;
        });

        if (copiedCount > 0) {
            toast({
                title : "Berhasil Disalin!",
                description: `Data dari item pertama telah disalin ke ${copiedCount} item lain di tier ini.`,
            });
        }
  };

  if (fields.length === 0 && !isLoading) {
    return (
        <div className="flex min-h-screen w-full flex-col bg-background">
            <header className="bg-background border-b-2 border-foreground">
                <div className="container flex h-16 items-center justify-end" />
            </header>
            <main className="flex-1 flex items-center justify-center p-4">
                <Card className="max-w-xl mx-auto border-2 border-foreground shadow-neo text-center">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold tracking-tighter">Keranjang Anda Kosong</CardTitle>
                        <CardDescription>
                            Sepertinya Anda belum memilih produk apapun.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild className="w-full h-11 text-base font-bold border-2 border-foreground bg-primary text-primary-foreground hover:bg-primary/90 shadow-neo hover:shadow-neo-hover active:shadow-neo-sm transition-all">
                          <Link href="/">
                            <Home className="mr-2"/> Kembali ke Beranda
                          </Link>
                        </Button>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
  }
  
  return (
    <>
     <div className="flex min-h-screen w-full flex-col bg-background">
        <header className="bg-background border-b-2 border-foreground">
              <div className="container flex h-16 items-center justify-between">
                  <div/>
                  <Button asChild variant="outline" className="font-bold border-2 border-foreground">
                    <Link href="/">
                      <ArrowLeft className="mr-2 h-5 w-5" />
                      Kembali & Ubah Pilihan
                    </Link>
                  </Button>
              </div>
        </header>
        <main className="flex-1 py-16 sm:py-24">
            <div className="container mx-auto px-4 max-w-3xl">
                <Card className="border-2 border-foreground shadow-neo">
                    <CardHeader className="text-center">
                    <CardTitle className="text-3xl font-bold tracking-tighter">
                        Isi Brief Desain Anda
                    </CardTitle>
                    <CardDescription>
                        Pastikan semua brief diisi dengan jelas sebelum melanjutkan.
                    </CardDescription>
                    </CardHeader>
                    <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit, handleValidationErrors)} className="space-y-6">
                            
                            {Object.entries(briefsByTier).map(([tier, briefs], tierIndex) => (
                                <div key={tier}>
                                    {tierIndex > 0 && <Separator className="my-8 border-dashed border-foreground/50"/>}
                                    <div className="text-center mb-2">
                                        <h2 className="text-xl font-bold tracking-tight">{tier}</h2>
                                        <p className="text-sm text-muted-foreground">({briefs.length} item)</p>
                                    </div>
                                     <div className="flex flex-col sm:flex-row items-center justify-center gap-2 mb-4 w-full">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="h-8 text-xs border-2 border-foreground bg-background w-full sm:w-auto overflow-hidden"
                                            onClick={() => handleApplyTemplateToTier(tier, 'details')}
                                            title={"Salin Detail & Aset dari item pertama ke semua item di tier ini"}
                                        >
                                            <FileText className="h-3 w-3 text-primary mr-1.5" />
                                            <span className="overflow-hidden text-ellipsis">Salin Detail ke Semua</span>
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="h-8 text-xs border-2 border-foreground bg-[#ff9900] text-white w-full sm:w-auto hover:bg-[#ff9900]/90 focus:outline-none overflow-hidden"
                                            onClick={() => handleApplyTemplateToTier(tier, 'dimensions')}
                                            title={"Salin Ukuran dari item pertama ke semua item di tier ini"}
                                        >
                                            <Scaling className="h-3 w-3 text-white mr-1.5" />
                                            <span className="overflow-hidden text-ellipsis">Salin Ukuran ke Semua</span>
                                        </Button>
                                    </div>

                                    <BriefAccordion
                                        form={form}
                                        fields={briefs}
                                        remove={remove}
                                        openItems={openAccordionItemsPerTier[tier] || []}
                                        setOpenItems={(items) => setOpenAccordionItemsPerTier(prev => ({...prev, [tier]: items}))}
                                    />
                                </div>
                            ))}
                            <div className="flex flex-row items-center gap-3 pt-4">
                                <Button 
                                    type="button" 
                                    variant="outline"
                                    onClick={handleOpenProductDialog}
                                    className="h-12 text-base font-bold border-2 border-foreground w-full bg-[#ffe502] text-foreground hover:bg-[#ffe502]/90 overflow-hidden">
                                    <span className="overflow-hidden text-ellipsis">+desain</span>
                                </Button>
                                <Button 
                                    type="submit" 
                                    disabled={isLoading || fields.length === 0} 
                                    className={cn(
                                        "w-full h-12 text-base font-bold border-2 border-foreground hover:shadow-neo-hover active:shadow-neo-sm transition-all disabled:bg-muted disabled:shadow-none disabled:text-muted-foreground disabled:cursor-not-allowed overflow-hidden",
                                        isLoading ? "bg-primary text-primary-foreground"  : "bg-accent text-accent-foreground hover:bg-accent/90"
                                    )}>
                                {isLoading ? <Loader2 className="animate-spin" />  : <span className="overflow-hidden text-ellipsis">Lanjutkan</span>}
                                </Button>
                            </div>
                        </form>
                    </Form>
                    </CardContent>
                </Card>
            </div>
        </main>
      </div>
    </>
  );
}
