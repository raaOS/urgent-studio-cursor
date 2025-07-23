'use client';

import { ShoppingCart, ShoppingBag } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';

import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface Product {
  id: string;
  name: string;
  category: string;
  budgetKakiLima: number;
  budgetUMKM: number;
  budgetECommerce: number;
  description?: string;
  imageUrl?: string;
  instanceId?: string;
  isBestSeller?: boolean;
  isHighMargin?: boolean;
  isPromo?: boolean;
}

interface CartItem {
  id: string;
  name: string;
  tier: string;
  price: number;
  imageUrl?: string;
  instanceId: string;
}

export default function ProductsPage(): JSX.Element {
  // State untuk tab tier
  const [selectedTier, setSelectedTier] = useState<'budgetKakiLima' | 'budgetUMKM' | 'budgetECommerce'>('budgetKakiLima');
  const [cart, setCart] = useState<CartItem[]>([]);
  const { toast } = useToast();
  
  // Load cart from sessionStorage on mount
  useEffect(() => {
    const cartFromSession = sessionStorage.getItem("globalCart");
    if (cartFromSession !== null && cartFromSession !== '') {
      try {
        setCart(JSON.parse(cartFromSession));
      } catch (e) {
        console.error("Failed to parse cart from session storage:", e);
        setCart([]);
      }
    }
  }, []);
  
  // Update cart when storage changes (from other components)
  useEffect(() => {
    const handleStorageChange = (): void => {
      const cartFromSession = sessionStorage.getItem("globalCart");
      if (cartFromSession !== null && cartFromSession !== '') {
        try {
          setCart(JSON.parse(cartFromSession));
        } catch (e) {
          console.error("Failed to parse cart from session storage:", e);
        }
      }
    };
    
    window.addEventListener('cartUpdated', handleStorageChange);
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('cartUpdated', handleStorageChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const products: Product[] = [
    { id: 'JDS-01', name: 'Desain Konten Feed (Single Post)', category: 'Konten Sosial Media', budgetKakiLima: 15000, budgetUMKM: 25000, budgetECommerce: 70000, isBestSeller: true, isHighMargin: false, isPromo: false },
    { id: 'JDS-02', name: 'Desain Konten Carousel (3 Slide)', category: 'Konten Sosial Media', budgetKakiLima: 30000, budgetUMKM: 60000, budgetECommerce: 180000, isBestSeller: true, isHighMargin: true, isPromo: true },
    { id: 'JDS-03', name: 'Desain Konten Story (Vertikal)', category: 'Konten Sosial Media', budgetKakiLima: 15000, budgetUMKM: 25000, budgetECommerce: 70000, isBestSeller: false, isHighMargin: false, isPromo: false },
    { id: 'JDS-04', name: 'Desain Kop Surat (Letterhead)', category: 'Identitas Bisnis', budgetKakiLima: 15000, budgetUMKM: 28000, budgetECommerce: 65000, isBestSeller: false, isHighMargin: false, isPromo: false },
    { id: 'JDS-05', name: 'Desain Kartu Nama', category: 'Identitas Bisnis', budgetKakiLima: 18000, budgetUMKM: 30000, budgetECommerce: 70000, isBestSeller: false, isHighMargin: true, isPromo: false },
    { id: 'JDS-06', name: 'Desain Frame Foto Profil (Twibbon)', category: 'Konten Sosial Media', budgetKakiLima: 18000, budgetUMKM: 35000, budgetECommerce: 80000, isBestSeller: false, isHighMargin: false, isPromo: false },
    { id: 'JDS-07', name: 'Desain Sertifikat / Piagam', category: 'Dokumen & Presentasi', budgetKakiLima: 20000, budgetUMKM: 45000, budgetECommerce: 105000, isBestSeller: false, isHighMargin: false, isPromo: false },
    { id: 'JDS-08', name: 'Desain Lanyard / Tali ID Card', category: 'Identitas Bisnis', budgetKakiLima: 20000, budgetUMKM: 35000, budgetECommerce: 85000, isBestSeller: false, isHighMargin: false, isPromo: false },
    { id: 'JDS-09', name: 'Desain Poster (Ukuran A4)', category: 'Promosi & Event', budgetKakiLima: 22000, budgetUMKM: 50000, budgetECommerce: 125000, isBestSeller: true, isHighMargin: true, isPromo: false },
    { id: 'JDS-10', name: 'Desain Buku Menu', category: 'Dokumen & Presentasi', budgetKakiLima: 25000, budgetUMKM: 60000, budgetECommerce: 160000, isBestSeller: false, isHighMargin: false, isPromo: false },
    { id: 'JDS-11', name: 'Desain Undangan Digital / Cetak', category: 'Dokumen & Presentasi', budgetKakiLima: 25000, budgetUMKM: 60000, budgetECommerce: 145000, isBestSeller: false, isHighMargin: false, isPromo: true },
    { id: 'JDS-12', name: 'Desain Brosur / Pamflet Promosi', category: 'Promosi & Event', budgetKakiLima: 35000, budgetUMKM: 75000, budgetECommerce: 195000, isBestSeller: false, isHighMargin: true, isPromo: false },
    { id: 'JDS-13', name: 'Desain X-Banner', category: 'Promosi & Event', budgetKakiLima: 35000, budgetUMKM: 75000, budgetECommerce: 185000, isBestSeller: false, isHighMargin: false, isPromo: false },
    { id: 'JDS-14', name: 'Desain Sampul E-book', category: 'Dokumen & Presentasi', budgetKakiLima: 35000, budgetUMKM: 70000, budgetECommerce: 175000, isBestSeller: false, isHighMargin: false, isPromo: false },
    { id: 'JDS-15', name: 'Desain Spanduk / Banner Outdoor', category: 'Promosi & Event', budgetKakiLima: 40000, budgetUMKM: 85000, budgetECommerce: 210000, isBestSeller: false, isHighMargin: true, isPromo: false },
    { id: 'JDS-16', name: 'Desain Roll-Up Banner', category: 'Promosi & Event', budgetKakiLima: 45000, budgetUMKM: 90000, budgetECommerce: 240000, isBestSeller: false, isHighMargin: false, isPromo: false },
    { id: 'JDS-17', name: 'Desain Gerbang Acara (Gate)', category: 'Promosi & Event', budgetKakiLima: 70000, budgetUMKM: 150000, budgetECommerce: 375000, isBestSeller: false, isHighMargin: false, isPromo: false },
    { id: 'JDS-18', name: 'Desain Slide Presentasi (PPT)', category: 'Dokumen & Presentasi', budgetKakiLima: 70000, budgetUMKM: 150000, budgetECommerce: 425000, isBestSeller: false, isHighMargin: false, isPromo: false },
    { id: 'JDS-19', name: 'Desain Visual Landing Page', category: 'Digital Marketing', budgetKakiLima: 125000, budgetUMKM: 350000, budgetECommerce: 950000, isBestSeller: false, isHighMargin: true, isPromo: true },
  ];

  // Format harga dalam Rupiah
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };
  
  // Fungsi untuk menambah produk ke keranjang
  const addToCart = (product: Product) => {
    const tierMapping: Record<string, string> = {
      'budgetKakiLima': 'Budget Kaki Lima',
      'budgetUMKM': 'Budget UMKM',
      'budgetECommerce': 'Budget E-commerce'
    };
    
    const price = product[selectedTier];
    if (!price) {
      toast({
        variant: 'destructive',
        title: "Error",
        description: "Harga untuk tier ini tidak tersedia.",
      });
      return;
    }
    
    const newProduct: CartItem = {
      id: product.id,
      name: product.name,
      tier: tierMapping[selectedTier] || selectedTier,
      price: price,
      ...(product.imageUrl && { imageUrl: product.imageUrl }),
      instanceId: `${product.id}-${Date.now()}`
    };
    
    const newCart = [...cart, newProduct];
    setCart(newCart);
    
    // Simpan ke sessionStorage
    sessionStorage.setItem("globalCart", JSON.stringify(newCart));
    window.dispatchEvent(new Event('cartUpdated'));
    
    toast({
      title: "Produk ditambahkan",
      description: `${product.name} telah ditambahkan ke keranjang.`,
    });
  };
  
  // Fungsi untuk langsung ke checkout
  const orderNow = (product: Product) => {
    const tierMapping: Record<string, string> = {
      'budgetKakiLima': 'Budget Kaki Lima',
      'budgetUMKM': 'Budget UMKM',
      'budgetECommerce': 'Budget E-commerce'
    };
    
    const price = product[selectedTier];
    if (!price) {
      toast({
        variant: 'destructive',
        title: "Error",
        description: "Harga untuk tier ini tidak tersedia.",
      });
      return;
    }
    
    const newProduct: CartItem = {
      id: product.id,
      name: product.name,
      tier: tierMapping[selectedTier] || selectedTier,
      price: price,
      ...(product.imageUrl && { imageUrl: product.imageUrl }),
      instanceId: `${product.id}-${Date.now()}`
    };
    
    // Simpan produk ini saja ke sessionStorage
    sessionStorage.setItem("globalCart", JSON.stringify([newProduct]));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  // Ambil daftar kategori unik
  const categories = Array.from(new Set(products.map(p => p.category)));

  // State untuk filter multi-select
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]); // e.g. ['promo', 'laris']

  // Fungsi toggle filter (tanpa termurah)
  function toggleFilter(filter: string) {
    setSelectedFilters((prev) =>
      prev.includes(filter)
        ? prev.filter((f) => f !== filter)
        : [...prev, filter]
    );
  }

  // Fungsi sortir produk per kategori
  function getSortedProducts(category: string) {
    let filtered = products.filter(p => p.category === category);
    switch (selectedFilters.find(f => f !== 'termurah')) { // Only sort if not 'termurah' is selected
      case 'laris':
        filtered = [...filtered].sort((a, b) => (Number(b.isBestSeller) - Number(a.isBestSeller)));
        break;
      case 'untung':
        filtered = [...filtered].sort((a, b) => (Number(b.isHighMargin) - Number(a.isHighMargin)));
        break;
      case 'promo':
        filtered = [...filtered].sort((a, b) => (Number(b.isPromo) - Number(a.isPromo)));
        break;
      default:
        break;
    }
    return filtered;
  }

  // Fungsi untuk menampilkan label tier
  function getTierLabel(tier: string) {
    if (tier === 'budgetKakiLima') {return 'Kaki Lima';}
    if (tier === 'budgetUMKM') {return 'UMKM';}
    if (tier === 'budgetECommerce') {return 'E-Commerce';}
    return '';
  }



  // Apakah filter global aktif
  const isGlobalFilter = selectedFilters.length > 0;

  // Produk yang lolos filter global multi-select (tanpa termurah)




  // Filter dan sortir produk sesuai kebutuhan (sementara tampilkan semua)
  // Nanti filter/sortir akan diimplementasikan di langkah berikutnya

  return (
    <div className="min-h-screen bg-[#f7efe9]">
      <Header />
      <div className="container mx-auto py-24 px-4">
        <h1 className="text-3xl font-bold text-center mb-8">Katalog Produk Desain</h1>
        {/* Tab 3 Tier */}
        <div className="flex justify-center gap-2 mb-6">
          <button onClick={() => setSelectedTier('budgetKakiLima')} className={`px-4 py-2 rounded border-2 border-black font-bold ${selectedTier==='budgetKakiLima' ? 'bg-black text-white' : 'bg-white text-black'}`}>Kaki Lima</button>
          <button onClick={() => setSelectedTier('budgetUMKM')} className={`px-4 py-2 rounded border-2 border-black font-bold ${selectedTier==='budgetUMKM' ? 'bg-black text-white' : 'bg-white text-black'}`}>UMKM</button>
          <button onClick={() => setSelectedTier('budgetECommerce')} className={`px-4 py-2 rounded border-2 border-black font-bold ${selectedTier==='budgetECommerce' ? 'bg-black text-white' : 'bg-white text-black'}`}>E-Commerce</button>
        </div>
        {/* Filter/Sortir */}
        <div className="flex flex-wrap gap-2 mb-8 items-center justify-center">
          <span className="font-semibold mr-2">Filter:</span>
          <button onClick={() => setSelectedFilters([])} className={`px-3 py-1 rounded border-2 border-black font-bold ${selectedFilters.length === 0 ? 'bg-black text-white'   : 'bg-white text-black'}`}>Default</button>
          <button onClick={() => toggleFilter('laris')} className={`px-3 py-1 rounded border-2 border-black font-bold transition-colors ${selectedFilters.includes('laris') ? 'bg-yellow-400 text-black' : 'bg-white text-black hover:bg-yellow-100'}`}>Paling Laris</button>
          <button onClick={() => toggleFilter('untung')} className={`px-3 py-1 rounded border-2 border-black font-bold transition-colors ${selectedFilters.includes('untung') ? 'bg-green-500 text-white' : 'bg-white text-black hover:bg-green-100'}`}>Menguntungkan</button>
          <button onClick={() => toggleFilter('promo')} className={`px-3 py-1 rounded border-2 border-black font-bold transition-colors ${selectedFilters.includes('promo') ? 'bg-pink-500 text-white' : 'bg-white text-black hover:bg-pink-100'}`}>Promo</button>
        </div>
        {/* Produk per kategori, per tier aktif */}
        {/* Hybrid: filter global (per produk x tier, per kategori) */}
        {isGlobalFilter ? (
          categories.map((category) => {
            // Ambil semua produk di kategori ini
            const productsInCategory = products.filter(p => p.category === category);
            // Untuk setiap produk x tier yang lolos filter
            type TierObj = { key   : string, label: string, harga: number, promo: boolean, laris: boolean, untung: boolean };
            const filteredProductTiers: Array<{ product: Product, tier: TierObj }> = [];
            productsInCategory.forEach(product => {
              [
                { key: 'budgetKakiLima', label: getTierLabel('budgetKakiLima'), harga: product.budgetKakiLima, promo: !!product.isPromo, laris: !!product.isBestSeller, untung: !!product.isHighMargin },
                { key: 'budgetUMKM', label: getTierLabel('budgetUMKM'), harga: product.budgetUMKM, promo: !!product.isPromo, laris: !!product.isBestSeller, untung: !!product.isHighMargin },
                { key: 'budgetECommerce', label: getTierLabel('budgetECommerce'), harga: product.budgetECommerce, promo: !!product.isPromo, laris: !!product.isBestSeller, untung: !!product.isHighMargin },
              ].forEach(tier => {
                if (!tier.harga) {return;}
                const checks = [
                  { f: 'promo', v: tier.promo },
                  { f: 'laris', v: tier.laris },
                  { f: 'untung', v: tier.untung },
                ];
                const pass = selectedFilters.every(f => {
                  const check = checks.find(c => c.f === f);
                  return check?.v ?? false;
                });
                if (pass) {
                  filteredProductTiers.push({ product, tier });
                }
              });
            });
            if (filteredProductTiers.length === 0) { return null; }
            return (
              <div key={category} className="mb-12">
                <h2 className="text-xl sm:text-2xl font-bold mb-4 border-b-2 border-black pb-2">{category}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProductTiers.map(({ product, tier }) => (
                    <Card key={product.id + tier.key} className="overflow-hidden border-2 border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 min-w-[260px] flex-shrink-0">
                      <CardHeader className="p-4">
                        <div className="bg-gray-100 h-40 rounded-md flex items-center justify-center mb-2 border-2 border-black">
                          {product.imageUrl ? (
                            <Image 
                              src={product.imageUrl ?? '/placeholder-image.jpg'} 
                              alt={product.name} 
                              width={150} 
                              height={150} 
                              className="object-contain border-2 border-black rounded-md" 
                            />
                          )    : (
                            <div className="text-gray-400 text-center p-4">
                              <span className="block text-3xl mb-2">🎨</span>
                              <span>Contoh Desain</span>
                            </div>
                          )}
                        </div>
                        <CardTitle className="text-lg">{product.name}</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        {/* Label Tier */}
                        <div className="mb-2">
                          <span className="inline-block bg-gray-200 border border-black text-xs font-bold px-2 py-1 rounded uppercase tracking-wide">{tier.label}</span>
                        </div>
                        {/* BADGE HORIZONTAL */}
                        <div className="flex flex-wrap gap-2 mb-2">
                          {selectedFilters.includes('promo') && tier.promo && (
                            <span className="badge-ticket bg-pink-500 text-white border-2 border-black rounded-md px-3 py-1 font-bold text-xs">Promo</span>
                          )}
                          {selectedFilters.includes('laris') && tier.laris && (
                            <span className="badge-ticket bg-yellow-400 text-black border-2 border-black rounded-md px-3 py-1 font-bold text-xs">Paling Laris</span>
                          )}
                          {selectedFilters.includes('untung') && tier.untung && (
                            <span className="badge-ticket bg-green-500 text-white border-2 border-black rounded-md px-3 py-1 font-bold text-xs">Menguntungkan</span>
                          )}
                        </div>
                        <p className="text-xl font-bold text-[#ff7a2f]">
                          {formatPrice(tier.harga)}
                        </p>
                        {/* Tombol aksi */}
                        <Button 
                          className="mt-2 bg-gradient-to-r from-[#ff7a2f] to-[#ff5f00] text-white border-2 border-black rounded-md px-2 py-1 text-xs font-bold"
                          asChild
                        >
                          <Link href="/brief" onClick={() => orderNow(product)}>
                            Pesan Sekarang
                          </Link>
                        </Button>
                        <Button 
                          className="mt-2 ml-2 bg-white text-black border-2 border-black rounded-md px-2 py-1 text-xs font-bold"
                          onClick={() => addToCart(product)}
                        >
                          + Keranjang
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })
        ) : (
          categories.map((category) => (
            <div key={category} className="mb-12">
              <h2 className="text-xl sm:text-2xl font-bold mb-4 border-b-2 border-black pb-2">{category}</h2>
              {/* Responsive: grid di desktop, carousel di mobile/tablet */}
              <div className="hidden lg:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {getSortedProducts(category).filter(p => p[selectedTier]).map((product) => (
                  <Card key={product.id} className="overflow-hidden border-2 border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 min-w-[260px] flex-shrink-0">
                    <CardHeader className="p-4">
                      <div className="bg-gray-100 h-40 rounded-md flex items-center justify-center mb-2 border-2 border-black">
                        {product.imageUrl ? (
                          <Image 
                            src={product.imageUrl ?? '/placeholder-image.jpg'} 
                            alt={product.name} 
                            width={150} 
                            height={150} 
                            className="object-contain border-2 border-black rounded-md" 
                          />
                        )    : (
                          <div className="text-gray-400 text-center p-4">
                            <span className="block text-3xl mb-2">🎨</span>
                            <span>Contoh Desain</span>
                          </div>
                        )}
                      </div>
                      <CardTitle className="text-lg">{product.name}</CardTitle>
                      <CardDescription className="text-sm">{product.id}</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      {/* Label Tier */}
                      <div className="mb-2">
                        <span className="inline-block bg-gray-200 border border-black text-xs font-bold px-2 py-1 rounded uppercase tracking-wide">{getTierLabel(selectedTier)}</span>
                      </div>
                      {/* BADGE HORIZONTAL */}
                      <div className="flex flex-wrap gap-2 mb-2">
                        {product.isPromo && (
                          <span className="badge-ticket bg-pink-500 text-white border-2 border-black rounded-md px-3 py-1 font-bold text-xs">Promo</span>
                        )}
                        {product.isBestSeller && (
                          <span className="badge-ticket bg-yellow-400 text-black border-2 border-black rounded-md px-3 py-1 font-bold text-xs">Paling Laris</span>
                        )}
                        {product.isHighMargin && (
                          <span className="badge-ticket bg-green-500 text-white border-2 border-black rounded-md px-3 py-1 font-bold text-xs">Menguntungkan</span>
                        )}
                      </div>
                      <p className="text-xl font-bold text-[#ff7a2f]">
                        {formatPrice(product[selectedTier as keyof typeof product] as number)}
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        {'Desain profesional sesuai kebutuhan Anda dengan revisi hingga 2 kali.'}
                      </p>
                    </CardContent>
                    <CardFooter className="p-4 pt-0 flex flex-col sm:flex-row gap-2">
                      <Button 
                        className="w-full sm:w-1/2 bg-gradient-to-r from-[#ff7a2f] to-[#ff5f00] text-white border-2 border-black hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                        asChild
                      >
                        <Link href="/brief" onClick={() => orderNow(product)} className="w-full overflow-hidden text-ellipsis">
                          <ShoppingBag className="mr-1 h-4 w-4 sm:hidden" />
                          <span className="hidden sm:inline">Pesan Sekarang</span>
                          <span className="sm:hidden">Pesan</span>
                        </Link>
                      </Button>
                      <Button 
                        className="w-full sm:w-1/2 bg-white text-black border-2 border-black hover:bg-gray-100 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                        onClick={() => addToCart(product)}
                      >
                        <ShoppingCart className="mr-1 h-4 w-4 sm:hidden" />
                        <span className="hidden sm:inline overflow-hidden text-ellipsis">Masukkan ke Keranjang</span>
                        <span className="sm:hidden">+ Keranjang</span>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
              <div className="flex lg:hidden gap-4 overflow-x-auto pb-2 custom-scrollbar" style={{WebkitOverflowScrolling:'touch'}}>
                {getSortedProducts(category).filter(p => p[selectedTier]).map((product) => (
                  <Card key={product.id} className="overflow-hidden border-2 border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 min-w-[260px] flex-shrink-0">
                    <CardHeader className="p-4">
                      <div className="bg-gray-100 h-40 rounded-md flex items-center justify-center mb-2 border-2 border-black">
                        {product.imageUrl ? (
                          <Image 
                            src={product.imageUrl ?? '/placeholder-image.jpg'} 
                            alt={product.name} 
                            width={150} 
                            height={150} 
                            className="object-contain border-2 border-black rounded-md" 
                          />
                        )    : (
                          <div className="text-gray-400 text-center p-4">
                            <span className="block text-3xl mb-2">🎨</span>
                            <span>Contoh Desain</span>
                          </div>
                        )}
                      </div>
                      <CardTitle className="text-lg">{product.name}</CardTitle>
                      <CardDescription className="text-sm">{product.id}</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      {/* Label Tier */}
                      <div className="mb-2">
                        <span className="inline-block bg-gray-200 border border-black text-xs font-bold px-2 py-1 rounded uppercase tracking-wide">{getTierLabel(selectedTier)}</span>
                      </div>
                      {/* BADGE HORIZONTAL */}
                      <div className="flex flex-wrap gap-2 mb-2">
                        {product.isPromo && (
                          <span className="badge-ticket bg-pink-500 text-white border-2 border-black rounded-md px-3 py-1 font-bold text-xs">Promo</span>
                        )}
                        {product.isBestSeller && (
                          <span className="badge-ticket bg-yellow-400 text-black border-2 border-black rounded-md px-3 py-1 font-bold text-xs">Paling Laris</span>
                        )}
                        {product.isHighMargin && (
                          <span className="badge-ticket bg-green-500 text-white border-2 border-black rounded-md px-3 py-1 font-bold text-xs">Menguntungkan</span>
                        )}
                      </div>
                      <p className="text-xl font-bold text-[#ff7a2f]">
                        {formatPrice(product[selectedTier as keyof typeof product] as number)}
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        {'Desain profesional sesuai kebutuhan Anda dengan revisi hingga 2 kali.'}
                      </p>
                    </CardContent>
                    <CardFooter className="p-4 pt-0 flex flex-col sm:flex-row gap-2">
                      <Button 
                        className="w-full sm:w-1/2 bg-gradient-to-r from-[#ff7a2f] to-[#ff5f00] text-white border-2 border-black hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                        asChild
                      >
                        <Link href="/brief" onClick={() => orderNow(product)} className="w-full overflow-hidden text-ellipsis">
                          <ShoppingBag className="mr-1 h-4 w-4 sm:hidden" />
                          <span className="hidden sm:inline">Pesan Sekarang</span>
                          <span className="sm:hidden">Pesan</span>
                        </Link>
                      </Button>
                      <Button 
                        className="w-full sm:w-1/2 bg-white text-black border-2 border-black hover:bg-gray-100 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                        onClick={() => addToCart(product)}
                      >
                        <ShoppingCart className="mr-1 h-4 w-4 sm:hidden" />
                        <span className="hidden sm:inline overflow-hidden text-ellipsis">Masukkan ke Keranjang</span>
                        <span className="sm:hidden">+ Keranjang</span>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
      {/* Custom scrollbar style */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #ff7a2f;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
}