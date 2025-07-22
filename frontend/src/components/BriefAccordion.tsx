
"use client";

import { UseFormReturn } from "react-hook-form";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BriefFormValues } from "./BriefForm";
import { Trash2, X, ChevronUp } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { cn } from "@/lib/utils";
import type { Product } from "@/lib/types";

interface BriefAccordionProps {
    form: UseFormReturn<BriefFormValues>;
    fields: (any & { originalIndex: number })[];
    remove: (index?: number | number[]) => void;
    tier: string;
    openItems: string[];
    setOpenItems: (items: string[]) => void;
}

export function BriefAccordion({ form, fields, remove, tier, openItems, setOpenItems }: BriefAccordionProps) {
    const { control, getValues, trigger, setValue } = form;

    const handleRemoveBrief = (indexToRemove: number) => {
        remove(indexToRemove);
        
        const updatedBriefs = getValues('briefs');
        
        const updatedCart: Product[] = updatedBriefs.map(b => ({
            id: b.productId,
            name: b.productName,
            tier: b.tier,
            price: 0, // Harga tidak relevan di sini
            instanceId: b.instanceId,
            briefDetails: b.briefDetails,
            googleDriveAssetLinks: b.googleDriveAssetLinks,
            width: b.width,
            height: b.height,
            unit: b.unit,
        }));
        
        sessionStorage.setItem("globalCart", JSON.stringify(updatedCart));
        window.dispatchEvent(new Event('cartUpdated'));
    };

    return (
        <div className="space-y-2">
            <Accordion 
                type="multiple" 
                className="w-full space-y-2"
                value={openItems}
                onValueChange={setOpenItems}
            >
                {fields.map((field, index) => {
                    const briefInstanceId = getValues(`briefs.${field.originalIndex}.instanceId`);
                    const productName = getValues(`briefs.${field.originalIndex}.productName`);
                    const briefNumber = String(index + 1).padStart(2, '0');

                    const isAccordionOpen = openItems.includes(briefInstanceId);

                    return (
                    <AccordionItem 
                        key={briefInstanceId} 
                        value={briefInstanceId}
                        className="bg-white border-2 border-foreground rounded-md overflow-hidden"
                    >
                         <div className="flex items-center justify-between w-full p-2.5">
                            <div className="font-semibold text-sm">
                                {briefNumber} - {productName}
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="h-9 w-9 p-0 text-xs border-2 border-foreground bg-background hover:bg-destructive/10"
                                    onClick={() => handleRemoveBrief(field.originalIndex)}
                                    title="Hapus Pesanan"
                                >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                                <AccordionTrigger className="p-0">
                                  <div className="w-9 h-9 flex items-center justify-center border-2 border-foreground rounded-md bg-white">
                                    <ChevronUp className={cn("h-5 w-5 shrink-0 transition-transform duration-200", !isAccordionOpen && "rotate-180")}/>
                                  </div>
                                </AccordionTrigger>
                            </div>
                        </div>

                        <AccordionContent className="space-y-6 px-4">
                            <div className="space-y-4">
                                <FormField
                                    control={control}
                                    name={`briefs.${field.originalIndex}.briefDetails`}
                                    render={({ field: formField }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm">Detail Brief</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Jelaskan detail desain yang Anda inginkan di sini..."
                                                    {...formField}
                                                    className="min-h-[100px]"
                                                    onBlur={() => trigger(`briefs.${field.originalIndex}.briefDetails`)}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                     <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                                        <FormField
                                            control={control}
                                            name={`briefs.${field.originalIndex}.width`}
                                            render={({ field: formField }) => (
                                                <FormItem>
                                                    <FormLabel className="text-sm">Lebar</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" placeholder="1080" {...formField} onChange={event => formField.onChange(event.target.value === '' ? '' : Number(event.target.value))}/>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <X className="h-4 w-4 text-muted-foreground self-end mb-2.5" />
                                         <FormField
                                            control={control}
                                            name={`briefs.${field.originalIndex}.height`}
                                            render={({ field: formField }) => (
                                                <FormItem>
                                                    <FormLabel className="text-sm">Tinggi</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" placeholder="1080" {...formField} onChange={event => formField.onChange(event.target.value === '' ? '' : Number(event.target.value))}/>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField
                                        control={control}
                                        name={`briefs.${field.originalIndex}.unit`}
                                        render={({ field: formField }) => (
                                            <FormItem>
                                            <FormLabel className="text-sm">Satuan</FormLabel>
                                            <Select onValueChange={formField.onChange} defaultValue={formField.value}>
                                                <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Pilih satuan" />
                                                </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="px">piksel (px)</SelectItem>
                                                    <SelectItem value="cm">sentimeter (cm)</SelectItem>
                                                    <SelectItem value="mm">milimeter (mm)</SelectItem>
                                                    <SelectItem value="in">inci (in)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={control}
                                    name={`briefs.${field.originalIndex}.googleDriveAssetLinks`}
                                    render={({ field: formField }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm">Tautan Aset Google Drive (Opsional)</FormLabel>
                                            <FormControl>
                                                <Input 
                                                    placeholder="https://drive.google.com/..." 
                                                    {...formField} 
                                                    onBlur={() => trigger(`briefs.${field.originalIndex}.googleDriveAssetLinks`)}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                )})}
            </Accordion>
        </div>
    );
}
