'use client';

import { ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';

import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { useActionLogger, useComponentLifecycle } from '@/hooks/useActionLogger';
import { usePerformanceMonitor } from '@/components/ui/performance';
import { Container, Typography, ConsistentCard, ConsistentButton } from '@/components/ui/visual-consistency';
import EnhancedInput from '@/components/ui/enhanced-input';
import { AnimatedCounter, SuccessAnimation, StaggerContainer } from '@/components/ui/micro-interactions';

interface ServiceTier {
  id: string;
  name: string;
  description: string;
  buttonText: string;
  buttonColor: string;
  features: string[];
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
  const [isLoading, setIsLoading] = useState(true);
  const [orderTrackingValue, setOrderTrackingValue] = useState('');
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const buttonRefs = useRef<RefState>({});
  const dropdownRefs = useRef<DivRefState>({});
  
  // Logging hooks
  const { logClick, logFormSubmit } = useActionLogger('HomePage');
  useComponentLifecycle('HomePage');
  
  // Performance monitoring
  const performanceData = usePerformanceMonitor();
  
  // Simulate loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);
  
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
        setOpenDropdowns(Object.keys(openDropdowns).reduce((acc: DropdownState, curr: string): DropdownState => {
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

  const toggleDropdown = (tier: string): void => {
    const key = `${tier}-features`;
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
    
    logFormSubmit('order-tracking', {
      metadata: {
        hasOrderId: orderId !== null && orderId.trim() !== '',
        orderIdLength: orderId?.trim().length || 0
      }
    });
    
    if (orderId !== null && orderId.trim() !== '') {
      setShowSuccessAnimation(true);
      
      // Delay navigation to show success animation
      setTimeout(() => {
        window.location.href = `/track?orderId=${encodeURIComponent(orderId.trim())}`;
      }, 1000);
    }
  };

  // Daftar layanan desain satuan
  const serviceTiers: ServiceTier[] = [
    {
      id: 'jasa-satuan',
      name: 'Jasa Satuan',
      description: 'Layanan desain terjangkau untuk semua kebutuhan bisnis Anda. Harga transparan dengan kualitas terjamin.',
      buttonText: 'Lihat Semua Produk',
      buttonColor: 'bg-blue-500 hover:bg-blue-600',
      features: [
        'Harga mulai dari Rp 25.000',
        'Konten feed & story media sosial',
        'Kartu nama & kop surat',
        'Poster & brosur promosi',
        'X-Banner & sampul e-book',
        'Undangan digital/cetak',
        'Revisi 3-5 kali',
        'Delivery 2-5 hari'
      ]
    }
  ];

  const renderServiceCard = (service: ServiceTier): JSX.Element => (
    <ConsistentCard key={service.id} className="p-6 flex flex-col">
      <Typography variant="h3" className="mb-2">
        {service.name}
      </Typography>
      <Typography variant="body" className="text-gray-600 mb-4">
        {service.description}
      </Typography>
      
      {/* Features Dropdown Button */}
      <div className="flex flex-col gap-2 mb-4">
        <button 
          ref={(el: HTMLButtonElement | null): void => { 
            buttonRefs.current[`${service.id}-features`] = el;
          }}
          onClick={(): void => {
            logClick('features-dropdown', {
              metadata: {
                serviceId: service.id,
                serviceName: service.name,
                isOpen: !openDropdowns[`${service.id}-features`]
              }
            });
            toggleDropdown(service.id);
          }}
          className="w-full h-[44px] sm:h-[40px] bg-amber-400 rounded-md p-2 sm:p-3 font-semibold flex justify-between items-center text-sm sm:text-base border-2 border-black hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:bg-amber-300 transition-all duration-200"
          type="button"
        >
          ✨ Lihat Fitur & Harga
          {openDropdowns[`${service.id}-features`] ? <ChevronUp className="h-5 w-5" />  : <ChevronDown className="h-5 w-5" />}
        </button>
        
        {/* Dropdown Content - Features */}
        {openDropdowns[`${service.id}-features`] && (
          <div 
            ref={(el: HTMLDivElement | null): void => {
              if (dropdownRefs.current !== null) {
                dropdownRefs.current[`${service.id}-features`] = el;
              }
            }}
            className="bg-[#fffce1] rounded-md p-3 border border-gray-300 mb-2"
          >
            <ul className="space-y-2 max-h-[200px] overflow-y-auto">
              {service.features.map((feature: string, index: number): JSX.Element => (
                <li key={index} className="text-xs text-gray-700 flex items-start">
                  <div className="min-w-[16px] h-4 mr-2 mt-0.5 flex-shrink-0">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <rect width="16" height="16" fill="#FFC107" rx="2"/>
                      <path d="M3 8L7 12L13 4" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <span className="leading-relaxed">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Action Button */}
      <Link href="/products" className="mt-auto">
        <ConsistentButton 
          onClick={(): void => {
            logClick('view-products-button', {
              metadata: {
                serviceId: service.id,
                serviceName: service.name,
                buttonText: service.buttonText
              }
            });
          }}
          variant="primary"
          className="w-full h-12 bg-[#fe6714] text-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:bg-[#e55a0f] transition-all duration-200 font-semibold"
          type="button"
        >
          🛍️ {service.buttonText}
        </ConsistentButton>
      </Link>
    </ConsistentCard>
  );

  return (
    <main className="min-h-screen">
      {/* Performance Monitor Display */}
      {performanceData && (
        <div className="fixed top-4 right-4 z-50 bg-black/80 text-white p-2 rounded text-xs">
          Render: {performanceData.renderTime}ms | Memory: {performanceData.memoryUsage}MB
        </div>
      )}

      {/* Success Animation */}
      {showSuccessAnimation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <SuccessAnimation 
            isVisible={showSuccessAnimation}
            message="Berhasil!"
            onComplete={() => setShowSuccessAnimation(false)} 
          />
        </div>
      )}

      {/* Header */}
      <header className="bg-[#ff7a2f] text-white p-6">
        <Container>
          <Typography variant="h1" className="text-white">Urgent Studio</Typography>
          <Typography variant="h2" className="text-white/90">Desain cepat, hasil oke</Typography>
        </Container>
      </header>

      {/* Lacak Pesanan - Section 1 */}
      <div className="p-6 bg-[#ff7a2f]/10 border-b-2 border-black">
        <Container>
          <Typography variant="h2" className="mb-4 text-center">Lacak Pesanan Anda</Typography>
          <form onSubmit={handleOrderTrackSubmit} className="flex flex-col sm:flex-row gap-3 sm:gap-4 max-w-2xl mx-auto px-4">
            <div className="flex-1">
              <EnhancedInput
                id="orderIdInput"
                name="orderIdInput"
                type="text"
                placeholder="Masukkan kode pesanan lengkap Anda..."
                value={orderTrackingValue}
                onChange={(e) => setOrderTrackingValue(e.target.value)}
                className="h-12 sm:h-10 text-base sm:text-sm"
                required
              />
            </div>
            <div>
              <ConsistentButton 
                type="submit"
                variant="neo"
                className="w-full sm:w-auto h-12 sm:h-10 px-6 sm:px-4 text-base sm:text-sm font-semibold"
                loading={isLoading}
              >
                <span>🔍</span> Lacak Pesanan
              </ConsistentButton>
            </div>
          </form>
        </Container>
      </div>

      {/* Main Content - Jasa Desain Satuan */}
      <div className="p-6">
        <Container>
          <Typography variant="h2" className="mb-6 text-center">Jasa Desain Satuan</Typography>
          <Typography variant="body" className="text-center text-gray-600 mb-8 max-w-3xl mx-auto">
            Kami menyediakan layanan desain berkualitas dengan harga terjangkau untuk semua kebutuhan bisnis Anda.
            Semua produk tersedia dengan harga transparan dan kualitas terjamin.
          </Typography>
          
          {/* Tampilan untuk Mobile dan Desktop */}
          <div className="max-w-xl mx-auto">
            <StaggerContainer>
              {serviceTiers.map((service: ServiceTier): JSX.Element => renderServiceCard(service))}
            </StaggerContainer>
          </div>
        </Container>
      </div>

      {/* Testimonials */}
      <div className="p-6 bg-gray-50">
        <Container>
          <Typography variant="h2" className="mb-6">Testimoni Klien</Typography>
          
          {/* Tampilan Carousel untuk Mobile dan Tablet */}
          <div className="block lg:hidden">
            <Carousel className="w-full">
              <CarouselContent>
                <CarouselItem>
                  <ConsistentCard className="p-4">
                    <Typography variant="body" className="mb-4">&quot;Desainnya keren banget, sesuai dengan brand kita. Prosesnya juga cepat!&quot;</Typography>
                    <Typography variant="caption" weight="bold">- Budi, Warung Kopi Kulo</Typography>
                  </ConsistentCard>
                </CarouselItem>
                <CarouselItem>
                  <ConsistentCard className="p-4">
                    <Typography variant="body" className="mb-4">&quot;Tim Urgent Studio sangat responsif dan memahami kebutuhan bisnis kami.&quot;</Typography>
                    <Typography variant="caption" weight="bold">- Siti, Batik Nusantara</Typography>
                  </ConsistentCard>
                </CarouselItem>
                <CarouselItem>
                  <ConsistentCard className="p-4">
                    <Typography variant="body" className="mb-4">&quot;Hasil desainnya profesional dengan harga yang terjangkau untuk startup kami.&quot;</Typography>
                    <Typography variant="caption" weight="bold">- Rudi, TechStart Indonesia</Typography>
                  </ConsistentCard>
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
            <ConsistentCard className="p-4">
              <Typography variant="body" className="mb-4">&quot;Desainnya keren banget, sesuai dengan brand kita. Prosesnya juga cepat!&quot;</Typography>
              <Typography variant="caption" weight="bold">- Budi, Warung Kopi Kulo</Typography>
            </ConsistentCard>
            <ConsistentCard className="p-4">
              <Typography variant="body" className="mb-4">&quot;Tim Urgent Studio sangat responsif dan memahami kebutuhan bisnis kami.&quot;</Typography>
              <Typography variant="caption" weight="bold">- Siti, Batik Nusantara</Typography>
            </ConsistentCard>
            <ConsistentCard className="p-4">
              <Typography variant="body" className="mb-4">&quot;Hasil desainnya profesional dengan harga yang terjangkau untuk startup kami.&quot;</Typography>
              <Typography variant="caption" weight="bold">- Rudi, TechStart Indonesia</Typography>
            </ConsistentCard>
          </div>
        </Container>
      </div>

      {/* How It Works */}
      <div className="p-6">
        <Container>
          <Typography variant="h2" className="mb-6">Cara Kerja</Typography>
          
          {/* Tampilan Carousel untuk Mobile dan Tablet */}
          <div className="block lg:hidden">
            <Carousel className="w-full">
              <CarouselContent>
                <CarouselItem>
                  <ConsistentCard className="p-4 text-center">
                    <AnimatedCounter value={1} className="bg-amber-400 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl" />
                    <Typography variant="h4" className="mb-2">Pilih Produk</Typography>
                    <Typography variant="body">Pilih produk desain yang sesuai dengan kebutuhan bisnismu</Typography>
                  </ConsistentCard>
                </CarouselItem>
                <CarouselItem>
                  <ConsistentCard className="p-4 text-center">
                    <AnimatedCounter value={2} className="bg-amber-400 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl" />
                    <Typography variant="h4" className="mb-2">Isi Brief</Typography>
                    <Typography variant="body">Ceritakan tentang bisnismu dan apa yang kamu inginkan</Typography>
                  </ConsistentCard>
                </CarouselItem>
                <CarouselItem>
                  <ConsistentCard className="p-4 text-center">
                    <AnimatedCounter value={3} className="bg-amber-400 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl" />
                    <Typography variant="h4" className="mb-2">Proses Desain</Typography>
                    <Typography variant="body">Tim kami akan mengerjakan desain sesuai brief yang kamu berikan</Typography>
                  </ConsistentCard>
                </CarouselItem>
                <CarouselItem>
                  <ConsistentCard className="p-4 text-center">
                    <AnimatedCounter value={4} className="bg-amber-400 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl" />
                    <Typography variant="h4" className="mb-2">Terima Hasil</Typography>
                    <Typography variant="body">Dapatkan file desain final dalam berbagai format yang siap pakai</Typography>
                  </ConsistentCard>
                </CarouselItem>
              </CarouselContent>
              <div className="flex justify-center mt-4">
                <CarouselPrevious className="static translate-y-0 mr-2" />
                <CarouselNext className="static translate-y-0 ml-2" />
              </div>
            </Carousel>
          </div>
          
          {/* Tampilan Grid untuk Desktop */}
          <div className="hidden lg:block">
            <StaggerContainer>
              <div className="grid grid-cols-4 gap-6">
                <ConsistentCard className="p-4 text-center">
                  <AnimatedCounter value={1} className="bg-amber-400 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl" />
                  <Typography variant="h4" className="mb-2">Pilih Produk</Typography>
                  <Typography variant="body">Pilih produk desain yang sesuai dengan kebutuhan bisnismu</Typography>
                </ConsistentCard>
                <ConsistentCard className="p-4 text-center">
                  <AnimatedCounter value={2} className="bg-amber-400 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl" />
                  <Typography variant="h4" className="mb-2">Isi Brief</Typography>
                  <Typography variant="body">Ceritakan tentang bisnismu dan apa yang kamu inginkan</Typography>
                </ConsistentCard>
                <ConsistentCard className="p-4 text-center">
                  <AnimatedCounter value={3} className="bg-amber-400 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl" />
                  <Typography variant="h4" className="mb-2">Proses Desain</Typography>
                  <Typography variant="body">Tim kami akan mengerjakan desain sesuai brief yang kamu berikan</Typography>
                </ConsistentCard>
                <ConsistentCard className="p-4 text-center">
                  <AnimatedCounter value={4} className="bg-amber-400 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl" />
                  <Typography variant="h4" className="mb-2">Terima Hasil</Typography>
                  <Typography variant="body">Dapatkan file desain final dalam berbagai format yang siap pakai</Typography>
                </ConsistentCard>
              </div>
            </StaggerContainer>
          </div>
        </Container>
      </div>


    </main>
  );
}