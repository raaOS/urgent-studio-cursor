'use client';

import { ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';

import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

interface TierData {
  id: string;
  name: string;
  price: string;
  description: string;
  included: string[];
  excluded: string[];
}

interface DropdownState {
  [key: string]: boolean;
}

interface RefState {
  [key: string]: HTMLButtonElement | null;
}

interface DivRefState {
  [key: string]: HTMLDivElement | null;
}

export default function HomePage(): JSX.Element {
  const [openDropdowns, setOpenDropdowns] = useState<DropdownState>({});
  const buttonRefs = useRef<RefState>({});
  const dropdownRefs = useRef<DivRefState>({});
  
  // Event listener untuk menutup dropdown saat klik di luar
  useEffect((): (() => void) => {
    const handleClickOutside = (event: MouseEvent): void => {
      const target = event.target as Node;
      
      // Periksa apakah ada dropdown yang terbuka
      const openDropdownKeys = Object.keys(openDropdowns).filter((key: string): boolean => 
        !!openDropdowns[key]
      );
      
      if (openDropdownKeys.length <= 0) {
        return;
      }
      let clickedInsideDropdown = false;
        
      // Periksa apakah klik terjadi di dalam dropdown atau tombol dropdown
      for (const key of openDropdownKeys) {
        const dropdownElement = dropdownRefs.current[key];
        const buttonElement = buttonRefs.current[key];
          
        if (
          (dropdownElement?.contains(target)) ||
          (buttonElement?.contains(target))
        ) {
          clickedInsideDropdown = true;
          break;
        }
      }
        
      // Jika klik di luar dropdown dan tombol, tutup semua dropdown
      if (!clickedInsideDropdown) {
        setOpenDropdowns(Object.keys(openDropdowns).reduce((acc   : DropdownState, curr: string): DropdownState => {
          acc[curr] = false;
          return acc;
        }, {}));
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    
    return (): void => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdowns]);

  const toggleDropdown = (tier: string, type: string): void => {
    const key = `${tier}-${type}`;
    const isCurrentlyOpen = !!openDropdowns[key];
    
    // Tutup semua dropdown terlebih dahulu
    const newDropdowns = Object.keys(openDropdowns).reduce((acc: DropdownState, curr: string): DropdownState => {
      acc[curr] = false;
      return acc;
    }, {});
    
    // Buka dropdown yang diklik jika sebelumnya tertutup
    if (!isCurrentlyOpen) {
      newDropdowns[key] = true;
    }
    
    setOpenDropdowns(newDropdowns);
  };

  const handleOrderTrackSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const orderId = formData.get('orderIdInput') as string | null;
    
    if (orderId !== null && orderId.trim() !== '') {
      window.location.href = `/track?orderId=${encodeURIComponent(orderId.trim())}`;
    }
  };

  // Daftar tingkatan harga
  const tiers   : TierData[] = [
    {
      id: 'kaki-lima',
      name: 'Kaki Lima',
      price: 'Rp 1.5jt',
      description: 'Cocok untuk usaha kecil yang baru memulai dan butuh identitas visual sederhana.',
      included: [
        '2 konsep awal',
        '3x revisi ringan',
        'File JPG, PNG',
        'File PDF (untuk cetak)',
        'File mentah (AI, PSD)',
      ],
      excluded: [
        'Konsultasi strategi marketing',
        'Riset kompetitor',
        'Guideline penggunaan',
        'Merchandise design',
        'Social media kit',
      ],
    },
    {
      id: 'umkm',
      name: 'UMKM',
      price: 'Rp 3jt',
      description: 'Untuk bisnis yang sudah berjalan dan ingin meningkatkan kualitas brand identity.',
      included: [
        '3 konsep awal',
        '5x revisi',
        'File JPG, PNG, SVG',
        'File PDF (untuk cetak)',
        'File mentah (AI, PSD, Figma)',
        'Guideline penggunaan dasar',
      ],
      excluded: [
        'Riset kompetitor mendalam',
        'Konsultasi strategi marketing',
        'Social media kit lengkap',
        'Merchandise design premium',
        'Brand voice & tone guide',
      ],
    },
    {
      id: 'corporate',
      name: 'Corporate',
      price: 'Rp 10jt+',
      description: 'Solusi lengkap untuk perusahaan yang membutuhkan brand identity profesional & konsisten.',
      included: [
        '5 konsep awal',
        'Revisi unlimited',
        'Semua format file',
        'Brand guideline lengkap',
        'Konsultasi strategi',
        'Social media kit',
        'Merchandise design',
      ],
      excluded: [
        'TV Commercial',
        'Billboard design',
        'Brand ambassador',
        'Marketing campaign',
      ],
    },
  ];

  const renderTierCard = (tier: TierData): JSX.Element => (
    <div key={tier.id} className="rounded-md p-6 flex flex-col border-2 border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white relative">
      <h3 className="text-base sm:text-lg md:text-xl font-bold bg-white border-2 border-black rounded-md p-2 mb-2">
        {tier.name}
      </h3>
      <p className="text-lg sm:text-xl md:text-2xl font-bold mb-2">{tier.price}</p>
      <p className="text-xs sm:text-sm md:text-base text-gray-600 mb-4">{tier.description}</p>
      
      {/* Dropdown Buttons */}
      <div className="flex flex-col gap-2 mb-4">
        <button 
          ref={(el: HTMLButtonElement | null): void => { 
            buttonRefs.current[`${tier.id}-included`] = el;
          }}
          onClick={(): void => toggleDropdown(tier.id, 'included')}
          className="w-full h-[40px] bg-amber-400 rounded-md p-2 font-normal flex justify-between items-center text-xs sm:text-sm border-2 border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          type="button"
        >
          ✅ Yang Didapat
          {openDropdowns[`${tier.id}-included`] ? <ChevronUp className="h-5 w-5" />  : <ChevronDown className="h-5 w-5" />}
        </button>
        
        {/* Dropdown Content - Included */}
        {openDropdowns[`${tier.id}-included`] && (
          <div 
            ref={(el: HTMLDivElement | null): void => {
              if (dropdownRefs.current !== null) {
                dropdownRefs.current[`${tier.id}-included`] = el;
              }
            }}
            className="bg-[#fffce1] rounded-md p-3 border border-gray-300 mb-2"
          >
            <ul className="space-y-2 max-h-[200px] overflow-y-auto">
              {tier.included.map((item: string, index: number): JSX.Element => (
                <li key={index} className="text-xs text-gray-700 flex items-start">
                  <div className="min-w-[16px] h-4 mr-2 mt-0.5 flex-shrink-0">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <rect width="16" height="16" fill="#FFC107" rx="2"/>
                      <path d="M3 8L7 12L13 4" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        <button 
          ref={(el: HTMLButtonElement | null): void => { 
            if (buttonRefs.current !== null) {
              buttonRefs.current[`${tier.id}-excluded`] = el; 
            }
          }}
          onClick={(): void => toggleDropdown(tier.id, 'excluded')}
          className="w-full h-[40px] bg-white rounded-md p-2 font-normal flex justify-between items-center text-xs sm:text-sm border-2 border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          type="button"
        >
          ❌ Tidak Termasuk
          {openDropdowns[`${tier.id}-excluded`] ? <ChevronUp className="h-5 w-5" />  : <ChevronDown className="h-5 w-5" />}
        </button>
        
        {/* Dropdown Content - Excluded */}
        {openDropdowns[`${tier.id}-excluded`] && (
          <div 
            ref={(el: HTMLDivElement | null): void => {
              if (dropdownRefs.current !== null) {
                dropdownRefs.current[`${tier.id}-excluded`] = el;
              }
            }}
            className="bg-gray-100 rounded-md p-3 border border-gray-300 mb-2"
          >
            <ul className="space-y-2 max-h-[200px] overflow-y-auto">
              {tier.excluded.map((item: string, index: number): JSX.Element => (
                <li key={index} className="text-xs text-gray-600 flex items-start">
                  <div className="min-w-[16px] h-4 mr-2 mt-0.5 flex-shrink-0">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <rect width="16" height="16" fill="#FFFFFF" rx="2" stroke="#ccc"/>
                      <path d="M4 4L12 12M4 12L12 4" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="bg-[#ff7a2f] text-white p-6">
        <div className="container mx-auto">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Urgent Studio</h1>
          <p className="text-base sm:text-lg md:text-xl">Desain cepat, hasil oke</p>
        </div>
      </header>

      {/* Lacak Pesanan - Section 1 */}
      <div className="p-6 bg-[#ff7a2f]/10 border-b-2 border-black">
        <div className="container mx-auto">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-4 text-center">Lacak Pesanan Anda</h2>
          <form onSubmit={handleOrderTrackSubmit} className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
            <div className="flex-1">
              <input
                id="orderIdInput"
                name="orderIdInput"
                type="text"
                placeholder="Masukkan kode pesanan lengkap Anda..."
                className="w-full border-2 border-black rounded-md p-2 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] outline-none"
                required
              />
            </div>
            <div>
              <button 
                type="submit"
                className="bg-amber-400 rounded-md p-2 font-bold w-full sm:w-auto border-2 border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-xs sm:text-sm md:text-base flex items-center justify-center gap-2"
              >
                <span>🔍</span> Lacak Pesanan
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <div className="container mx-auto">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-6">Pilih paket sesuai kebutuhan</h2>
          
          {/* Tampilan Carousel untuk Mobile dan Tablet */}
          <div className="block lg:hidden">
            <Carousel className="w-full">
              <CarouselContent>
                {tiers.map((tier: TierData): JSX.Element => (
                  <CarouselItem key={tier.id}>
                    {renderTierCard(tier)}
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="flex justify-center mt-4">
                <CarouselPrevious className="static translate-y-0 mr-2" />
                <CarouselNext className="static translate-y-0 ml-2" />
              </div>
            </Carousel>
          </div>
          
          {/* Tampilan Grid untuk Desktop */}
          <div className="hidden lg:grid lg:grid-cols-3 gap-6">
            {tiers.map((tier: TierData): JSX.Element => renderTierCard(tier))}
          </div>
          
          {/* Tombol "Pesan Sesuai Budget" */}
          <div className="flex justify-center mt-8 px-4 sm:px-6 md:px-8">
            <Link href="/products" className="w-full max-w-3xl">
              <button 
                className="w-full py-3 px-6 bg-gradient-to-r from-[#ff7a2f] to-[#ff5f00] text-white font-bold text-sm sm:text-base md:text-lg rounded-md border-2 border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 hover:brightness-105"
                data-tooltip="Hasil desain disesuaikan dengan budget yang kamu keluarkan"
                data-flow="bottom"
                type="button"
              >
                Pesan Sesuai Budget
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="p-6 bg-gray-50">
        <div className="container mx-auto">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-6">Testimoni Klien</h2>
          
          {/* Tampilan Carousel untuk Mobile dan Tablet */}
          <div className="block lg:hidden">
            <Carousel className="w-full">
              <CarouselContent>
                <CarouselItem>
                  <div className="p-4 bg-white rounded-md border-2 border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <p className="mb-4 text-xs sm:text-sm md:text-base">&quot;Desainnya keren banget, sesuai dengan brand kita. Prosesnya juga cepat!&quot;</p>
                    <p className="font-bold text-xs sm:text-sm md:text-base">- Budi, Warung Kopi Kulo</p>
                  </div>
                </CarouselItem>
                <CarouselItem>
                  <div className="p-4 bg-white rounded-md border-2 border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <p className="mb-4 text-xs sm:text-sm md:text-base">&quot;Tim Urgent Studio sangat responsif dan memahami kebutuhan bisnis kami.&quot;</p>
                    <p className="font-bold text-xs sm:text-sm md:text-base">- Siti, Batik Nusantara</p>
                  </div>
                </CarouselItem>
                <CarouselItem>
                  <div className="p-4 bg-white rounded-md border-2 border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <p className="mb-4 text-xs sm:text-sm md:text-base">&quot;Hasil desainnya profesional dengan harga yang terjangkau untuk startup kami.&quot;</p>
                    <p className="font-bold text-xs sm:text-sm md:text-base">- Rudi, TechStart Indonesia</p>
                  </div>
                </CarouselItem>
              </CarouselContent>
              <div className="flex justify-center mt-4">
                <CarouselPrevious className="static translate-y-0 mr-2" />
                <CarouselNext className="static translate-y-0 ml-2" />
              </div>
            </Carousel>
          </div>
          
          {/* Tampilan Grid untuk Desktop */}
          <div className="hidden lg:grid lg:grid-cols-3 gap-6">
            <div className="p-4 bg-white rounded-md border-2 border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <p className="mb-4 text-xs sm:text-sm md:text-base">&quot;Desainnya keren banget, sesuai dengan brand kita. Prosesnya juga cepat!&quot;</p>
              <p className="font-bold text-xs sm:text-sm md:text-base">- Budi, Warung Kopi Kulo</p>
            </div>
            <div className="p-4 bg-white rounded-md border-2 border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <p className="mb-4 text-xs sm:text-sm md:text-base">&quot;Tim Urgent Studio sangat responsif dan memahami kebutuhan bisnis kami.&quot;</p>
              <p className="font-bold text-xs sm:text-sm md:text-base">- Siti, Batik Nusantara</p>
            </div>
            <div className="p-4 bg-white rounded-md border-2 border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <p className="mb-4 text-xs sm:text-sm md:text-base">&quot;Hasil desainnya profesional dengan harga yang terjangkau untuk startup kami.&quot;</p>
              <p className="font-bold text-xs sm:text-sm md:text-base">- Rudi, TechStart Indonesia</p>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="p-6">
        <div className="container mx-auto">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-6">Cara Kerja</h2>
          
          {/* Tampilan Carousel untuk Mobile dan Tablet */}
          <div className="block lg:hidden">
            <Carousel className="w-full">
              <CarouselContent>
                <CarouselItem>
                  <div className="p-4 text-center rounded-md border-2 border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <div className="bg-amber-400 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-base sm:text-lg md:text-xl">1</div>
                    <h3 className="font-bold mb-2 text-xs sm:text-sm md:text-base">Pilih Paket</h3>
                    <p className="text-xs sm:text-sm md:text-base">Pilih paket yang sesuai dengan kebutuhan dan budget kamu</p>
                  </div>
                </CarouselItem>
                <CarouselItem>
                  <div className="p-4 text-center rounded-md border-2 border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <div className="bg-amber-400 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-base sm:text-lg md:text-xl">2</div>
                    <h3 className="font-bold mb-2 text-xs sm:text-sm md:text-base">Isi Brief</h3>
                    <p className="text-xs sm:text-sm md:text-base">Ceritakan tentang bisnismu dan apa yang kamu inginkan</p>
                  </div>
                </CarouselItem>
                <CarouselItem>
                  <div className="p-4 text-center rounded-md border-2 border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <div className="bg-amber-400 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-base sm:text-lg md:text-xl">3</div>
                    <h3 className="font-bold mb-2 text-xs sm:text-sm md:text-base">Proses Desain</h3>
                    <p className="text-xs sm:text-sm md:text-base">Tim kami akan mengerjakan desain sesuai brief yang kamu berikan</p>
                  </div>
                </CarouselItem>
                <CarouselItem>
                  <div className="p-4 text-center rounded-md border-2 border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <div className="bg-amber-400 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-base sm:text-lg md:text-xl">4</div>
                    <h3 className="font-bold mb-2 text-xs sm:text-sm md:text-base">Terima Hasil</h3>
                    <p className="text-xs sm:text-sm md:text-base">Dapatkan file desain final dalam berbagai format yang siap pakai</p>
                  </div>
                </CarouselItem>
              </CarouselContent>
              <div className="flex justify-center mt-4">
                <CarouselPrevious className="static translate-y-0 mr-2" />
                <CarouselNext className="static translate-y-0 ml-2" />
              </div>
            </Carousel>
          </div>
          
          {/* Tampilan Grid untuk Desktop */}
          <div className="hidden lg:grid lg:grid-cols-4 gap-6">
            <div className="p-4 text-center rounded-md border-2 border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="bg-amber-400 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-base sm:text-lg md:text-xl">1</div>
              <h3 className="font-bold mb-2 text-xs sm:text-sm md:text-base">Pilih Paket</h3>
              <p className="text-xs sm:text-sm md:text-base">Pilih paket yang sesuai dengan kebutuhan dan budget kamu</p>
            </div>
            <div className="p-4 text-center rounded-md border-2 border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="bg-amber-400 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-base sm:text-lg md:text-xl">2</div>
              <h3 className="font-bold mb-2 text-xs sm:text-sm md:text-base">Isi Brief</h3>
              <p className="text-xs sm:text-sm md:text-base">Ceritakan tentang bisnismu dan apa yang kamu inginkan</p>
            </div>
            <div className="p-4 text-center rounded-md border-2 border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="bg-amber-400 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-base sm:text-lg md:text-xl">3</div>
              <h3 className="font-bold mb-2 text-xs sm:text-sm md:text-base">Proses Desain</h3>
              <p className="text-xs sm:text-sm md:text-base">Tim kami akan mengerjakan desain sesuai brief yang kamu berikan</p>
            </div>
            <div className="p-4 text-center rounded-md border-2 border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="bg-amber-400 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-base sm:text-lg md:text-xl">4</div>
              <h3 className="font-bold mb-2 text-xs sm:text-sm md:text-base">Terima Hasil</h3>
              <p className="text-xs sm:text-sm md:text-base">Dapatkan file desain final dalam berbagai format yang siap pakai</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}