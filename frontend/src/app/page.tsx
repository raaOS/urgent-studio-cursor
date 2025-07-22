'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp, ChevronRight } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

export default function HomePage() {
  const [openDropdowns, setOpenDropdowns] = useState<{[key: string]: boolean}>({});
  const [dropdownPositions, setDropdownPositions] = useState<{[key: string]: {top: number, left: number, maxWidth: number}}>({});
  const buttonRefs = useRef<{[key: string]: HTMLButtonElement | null}>({});
  const dropdownRefs = useRef<{[key: string]: HTMLDivElement | null}>({});
  
  // Menambahkan event listener untuk menutup dropdown saat klik di luar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      
      // Periksa apakah ada dropdown yang terbuka
      const openDropdownKeys = Object.keys(openDropdowns).filter(key => openDropdowns[key]);
      
      if (openDropdownKeys.length > 0) {
        let clickedInsideDropdown = false;
        
        // Periksa apakah klik terjadi di dalam dropdown atau tombol dropdown
        for (const key of openDropdownKeys) {
          const dropdownElement = dropdownRefs.current[key];
          const buttonElement = buttonRefs.current[key];
          
          if (
            (dropdownElement && dropdownElement.contains(target)) ||
            (buttonElement && buttonElement.contains(target))
          ) {
            clickedInsideDropdown = true;
            break;
          }
        }
        
        // Jika klik di luar dropdown dan tombol, tutup semua dropdown
        if (!clickedInsideDropdown) {
          setOpenDropdowns(Object.keys(openDropdowns).reduce((acc, curr) => {
            acc[curr] = false;
            return acc;
          }, {} as {[key: string]: boolean}));
        }
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdowns]);

  const toggleDropdown = (tier: string, type: string) => {
    const key = `${tier}-${type}`;
    const isCurrentlyOpen = openDropdowns[key];
    
    // Tutup semua dropdown terlebih dahulu
    const newDropdowns = Object.keys(openDropdowns).reduce((acc, curr) => {
      acc[curr] = false;
      return acc;
    }, {} as {[key: string]: boolean});
    
    // Buka dropdown yang diklik jika sebelumnya tertutup
    if (!isCurrentlyOpen) {
      newDropdowns[key] = true;
      
      // Hitung posisi dropdown dengan boundary checking
      const buttonElement = buttonRefs.current[key];
      if (buttonElement) {
        const rect = buttonElement.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        let top = rect.bottom + window.scrollY;
        let left = rect.left;
        const buttonWidth = rect.width;
        
        // Cek apakah dropdown akan keluar dari viewport horizontal
        const dropdownWidth = buttonWidth;
        if (left + dropdownWidth > viewportWidth - 20) {
          left = viewportWidth - dropdownWidth - 20;
        }
        
        // Cek apakah dropdown akan keluar dari viewport vertikal
        const estimatedDropdownHeight = 250; // Estimasi tinggi dropdown
        if (top + estimatedDropdownHeight > viewportHeight + window.scrollY - 20) {
          top = rect.top + window.scrollY - estimatedDropdownHeight - 5;
        }
        
        setDropdownPositions(prev => ({
          ...prev,
          [key]: {
            top: Math.max(top, 10), // Minimum 10px dari top
            left: Math.max(left, 10), // Minimum 10px dari left
            maxWidth: Math.min(buttonWidth, viewportWidth - 40)
          }
        }));
      }
    }
    
    setOpenDropdowns(newDropdowns);
  };

  // Daftar layanan
  const services = [
    'Branding',
    'UI/UX Design',
    'Web Development',
    'Mobile App',
    'SEO',
    'Content',
  ];

  // Daftar tingkatan harga
  const tiers = [
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

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="bg-[#ff7a2f] text-white p-6">
        <div className="container mx-auto">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Urgent Studio</h1>
          <p className="text-base sm:text-lg md:text-xl">Desain cepat, hasil oke</p>
        </div>
      </header>

      {/* Search Bar */}
      <div className="p-6">
        <div className="container mx-auto">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Cari layanan desain..."
                className="w-full border-2 border-black rounded-md p-2 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] outline-none"
              />
            </div>
            <div>
              <button className="bg-amber-400 rounded-md p-2 font-bold w-full lg:w-auto border-2 border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-xs sm:text-sm md:text-base">
                Cari
              </button>
            </div>
          </div>
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
                {tiers.map((tier) => (
                  <CarouselItem key={tier.id}>
                    <div className="rounded-md p-6 flex flex-col h-[350px] overflow-visible border-2 border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white relative">
                      <h3 className="text-base sm:text-lg md:text-xl font-bold bg-white border-2 border-black rounded-md p-2">
                        {tier.id === 'kaki-lima' ? (
                          <>
                            <span className="px-2">Kaki Lima</span>
                          </>
                        ) : tier.name}
                      </h3>
                      <p className="text-lg sm:text-xl md:text-2xl font-bold mb-2">{tier.price}</p>
                      
                      <div className="h-[120px] flex flex-col justify-between">
                        <p className="text-xs sm:text-sm md:text-base text-gray-600">{tier.description}</p>
                        <div className="my-4"></div>
                      </div>
                      
                      <div className="flex flex-col lg:flex-row gap-2 mb-6 mt-4">
                        <div className="flex-1 relative">
                          <button 
                            ref={(el) => { buttonRefs.current[`${tier.id}-included`] = el; return undefined; }}
                            onClick={() => toggleDropdown(tier.id, 'included')}
                            className="w-full h-[40px] bg-amber-400 rounded-md p-2 font-normal flex justify-between items-center text-xs sm:text-sm md:text-base border-2 border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                          >
                            dapat?
                            {openDropdowns[`${tier.id}-included`] ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                          </button>
                        </div>
                        
                        <div className="flex-1 relative">
                          <button 
                            ref={(el) => { buttonRefs.current[`${tier.id}-excluded`] = el; return undefined; }}
                            onClick={() => toggleDropdown(tier.id, 'excluded')}
                            className="w-full h-[40px] bg-white rounded-md p-2 font-normal flex justify-between items-center text-xs sm:text-sm md:text-base border-2 border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                          >
                            tidak dapat?
                            {openDropdowns[`${tier.id}-excluded`] ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                          </button>
                        </div>
                      </div>
                    </div>
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
            {tiers.map((tier) => (
              <div key={tier.id} className="rounded-md p-6 flex flex-col h-[350px] overflow-visible border-2 border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white relative">
                <h3 className="text-base sm:text-lg md:text-xl font-bold bg-white border-2 border-black rounded-md p-2">
                  {tier.id === 'kaki-lima' ? (
                    <>
                      <span className="px-2">Kaki Lima</span>
                    </>
                  ) : tier.name}
                </h3>
                <p className="text-lg sm:text-xl md:text-2xl font-bold mb-2">{tier.price}</p>
                
                <div className="h-[120px] flex flex-col justify-between">
                  <p className="text-xs sm:text-sm md:text-base text-gray-600">{tier.description}</p>
                  <div className="my-4"></div>
                </div>
                
                <div className="flex flex-col lg:flex-row gap-2 mb-6 mt-4">
                  <div className="flex-1 relative">
                    <button 
                      ref={(el) => { buttonRefs.current[`${tier.id}-included`] = el; return undefined; }}
                      onClick={() => toggleDropdown(tier.id, 'included')}
                      className="w-full h-[40px] bg-amber-400 rounded-md p-2 font-normal flex justify-between items-center text-xs sm:text-sm md:text-base border-2 border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                    >
                      dapat?
                      {openDropdowns[`${tier.id}-included`] ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </button>
                  </div>
                  
                  <div className="flex-1 relative">
                    <button 
                      ref={(el) => { buttonRefs.current[`${tier.id}-excluded`] = el; return undefined; }}
                      onClick={() => toggleDropdown(tier.id, 'excluded')}
                      className="w-full h-[40px] bg-white rounded-md p-2 font-normal flex justify-between items-center text-xs sm:text-sm md:text-base border-2 border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                    >
                      tidak dapat?
                      {openDropdowns[`${tier.id}-excluded`] ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Dropdown Portal - Rendered outside cards to avoid overflow issues */}
      {Object.keys(openDropdowns).map((key) => {
        if (!openDropdowns[key]) return null;
        
        const [tierId, type] = key.split('-');
        const tier = tiers.find(t => t.id === tierId);
        const items = type === 'included' ? tier?.included || [] : tier?.excluded || [];
        const position = dropdownPositions[key];
        
        if (!position || !tier) return null;
        
        return (
          <div 
            key={key}
            ref={(el) => { dropdownRefs.current[key] = el; return undefined; }}
            className="fixed z-50 bg-[#fffce1] rounded-lg p-4 border-2 border-black shadow-lg" 
            style={{
              top: `${position.top}px`,
              left: `${position.left}px`,
              width: `${position.maxWidth}px`,
              maxHeight: '250px'
            }}
          >
            <ul className="space-y-2 max-h-[200px] overflow-y-auto">
              {items.map((item, index) => (
                <li key={index} className="text-xs sm:text-sm md:text-base font-normal text-gray-700">
                  <div className="flex items-start">
                    <div className="min-w-[16px] h-4 mr-2 mt-0.5 flex-shrink-0">
                      {type === 'included' ? (
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect width="16" height="16" fill="#FFC107"/>
                          <path d="M3 8L7 12L13 4" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect width="16" height="16" fill="#FFFFFF"/>
                          <path d="M4 4L12 12M4 12L12 4" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                    <span className="break-words">{item}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        );
      })}

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
                    <p className="mb-4 text-xs sm:text-sm md:text-base">"Desainnya keren banget, sesuai dengan brand kita. Prosesnya juga cepat!"</p>
                    <p className="font-bold text-xs sm:text-sm md:text-base">- Budi, Warung Kopi Kulo</p>
                  </div>
                </CarouselItem>
                <CarouselItem>
                  <div className="p-4 bg-white rounded-md border-2 border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <p className="mb-4 text-xs sm:text-sm md:text-base">"Tim Urgent Studio sangat responsif dan memahami kebutuhan bisnis kami."</p>
                    <p className="font-bold text-xs sm:text-sm md:text-base">- Siti, Batik Nusantara</p>
                  </div>
                </CarouselItem>
                <CarouselItem>
                  <div className="p-4 bg-white rounded-md border-2 border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <p className="mb-4 text-xs sm:text-sm md:text-base">"Hasil desainnya profesional dengan harga yang terjangkau untuk startup kami."</p>
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
              <p className="mb-4 text-xs sm:text-sm md:text-base">"Desainnya keren banget, sesuai dengan brand kita. Prosesnya juga cepat!"</p>
              <p className="font-bold text-xs sm:text-sm md:text-base">- Budi, Warung Kopi Kulo</p>
            </div>
            <div className="p-4 bg-white rounded-md border-2 border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <p className="mb-4 text-xs sm:text-sm md:text-base">"Tim Urgent Studio sangat responsif dan memahami kebutuhan bisnis kami."</p>
              <p className="font-bold text-xs sm:text-sm md:text-base">- Siti, Batik Nusantara</p>
            </div>
            <div className="p-4 bg-white rounded-md border-2 border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <p className="mb-4 text-xs sm:text-sm md:text-base">"Hasil desainnya profesional dengan harga yang terjangkau untuk startup kami."</p>
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
                    <p className="text-xs sm:text-sm md:text-base">Tim kami akan mengerjakan desain sesuai brief</p>
                  </div>
                </CarouselItem>
                <CarouselItem>
                  <div className="p-4 text-center rounded-md border-2 border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <div className="bg-amber-400 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-base sm:text-lg md:text-xl">4</div>
                    <h3 className="font-bold mb-2 text-xs sm:text-sm md:text-base">Revisi & Selesai</h3>
                    <p className="text-xs sm:text-sm md:text-base">Berikan feedback dan terima hasil final</p>
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
              <p className="text-xs sm:text-sm md:text-base">Tim kami akan mengerjakan desain sesuai brief</p>
            </div>
            <div className="p-4 text-center rounded-md border-2 border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="bg-amber-400 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-base sm:text-lg md:text-xl">4</div>
              <h3 className="font-bold mb-2 text-xs sm:text-sm md:text-base">Revisi & Selesai</h3>
              <p className="text-xs sm:text-sm md:text-base">Berikan feedback dan terima hasil final</p>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="p-6 bg-gray-50">
        <div className="container mx-auto">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-6">FAQ</h2>
          
          <div className="space-y-4">
            <div className="p-4 bg-white rounded-md border-2 border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <button className="w-full flex justify-between items-center font-bold text-xs sm:text-sm md:text-base">
                Berapa lama proses desainnya?
                <ChevronDown className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 bg-white rounded-md border-2 border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <button className="w-full flex justify-between items-center font-bold text-xs sm:text-sm md:text-base">
                Apakah bisa revisi unlimited?
                <ChevronDown className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 bg-white rounded-md border-2 border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <button className="w-full flex justify-between items-center font-bold text-xs sm:text-sm md:text-base">
                Bagaimana cara pembayarannya?
                <ChevronDown className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 bg-white rounded-md border-2 border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <button className="w-full flex justify-between items-center font-bold text-xs sm:text-sm md:text-base">
                Apakah bisa meeting konsultasi dulu?
                <ChevronDown className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black text-white p-6">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div>
              <h3 className="text-base sm:text-lg md:text-xl font-bold mb-4">Urgent Studio</h3>
              <p className="text-xs sm:text-sm md:text-base">Jasa desain cepat dan terpercaya untuk bisnis kamu</p>
            </div>
            <div>
              <h3 className="text-base sm:text-lg md:text-xl font-bold mb-4">Kontak</h3>
              <p className="text-xs sm:text-sm md:text-base">hello@urgentstudio.id</p>
              <p className="text-xs sm:text-sm md:text-base">+62 812 3456 7890</p>
            </div>
            <div>
              <h3 className="text-base sm:text-lg md:text-xl font-bold mb-4">Ikuti Kami</h3>
              <div className="flex space-x-4">
                <a href="#" className="text-white text-xs sm:text-sm md:text-base">IG</a>
                <a href="#" className="text-white text-xs sm:text-sm md:text-base">FB</a>
                <a href="#" className="text-white text-xs sm:text-sm md:text-base">TW</a>
              </div>
            </div>
          </div>
          <div className="mt-6 pt-6">
            <p className="text-xs sm:text-sm md:text-base">© 2023 Urgent Studio. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}