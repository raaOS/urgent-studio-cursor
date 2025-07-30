'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Loader2, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

// Lazy Image Component with progressive loading
interface LazyImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src: string; // Make src required and ensure it's a string
  alt: string;
  placeholder?: string;
  blurDataURL?: string;
  quality?: number;
  priority?: boolean;
  onLoad?: () => void;
  onError?: () => void;
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  placeholder,
  blurDataURL,
  quality = 75,
  priority = false,
  onLoad,
  onError,
  className,
  ..._restProps
}) => {
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [isInView, setIsInView] = useState<boolean>(priority);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Check if src is valid
  const isValidSrc = src && typeof src === 'string' && src.trim() !== '';

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || !isValidSrc) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observerRef.current?.disconnect();
          }
        });
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    if (imgRef.current) {
      observerRef.current.observe(imgRef.current);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [priority, isValidSrc]);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setIsError(true);
    onError?.();
  }, [onError]);

  const optimizedSrc = useMemo(() => {
    if (!isInView || !isValidSrc) return '';
    
    // Ensure src is a string before using string methods
    const srcString = String(src);
    
    // Add quality parameter if it's a supported format
    if (srcString.includes('?')) {
      return `${srcString}&q=${quality}`;
    }
    return `${srcString}?q=${quality}`;
  }, [src, quality, isInView, isValidSrc]);

  // Early return after all hooks
  if (!isValidSrc) {
    return (
      <div className={cn('relative overflow-hidden bg-muted flex items-center justify-center', className)}>
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <AlertCircle className="w-8 h-8" />
          <span className="text-sm">Gambar tidak tersedia</span>
        </div>
      </div>
    );
  }

  return (
    <div ref={imgRef} className={cn('relative overflow-hidden', className)}>
      {/* Placeholder */}
      {!isLoaded && !isError && (
        <div className="absolute inset-0 bg-muted flex items-center justify-center">
          {blurDataURL ? (
            <Image
              src={blurDataURL}
              alt=""
              fill
              className="object-cover filter blur-sm scale-110"
            />
          ) : placeholder ? (
            <Image
              src={placeholder}
              alt=""
              fill
              className="object-cover opacity-50"
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <ImageIcon className="w-8 h-8" />
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
          )}
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="absolute inset-0 bg-muted flex items-center justify-center">
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <AlertCircle className="w-8 h-8" />
            <span className="text-sm">Gagal memuat gambar</span>
          </div>
        </div>
      )}

      {/* Main Image */}
      {isInView && (
        <motion.div
          className={cn(
            'w-full h-full transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0'
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: isLoaded ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <Image
            src={optimizedSrc}
            alt={alt}
            fill
            className="object-cover"
            onLoad={handleLoad}
            onError={handleError}
          />
        </motion.div>
      )}
    </div>
  );
};

// Virtual List for large datasets
interface VirtualListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  overscan?: number;
}

export function VirtualList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  className,
  overscan = 5
}: VirtualListProps<T>): JSX.Element {
  const [scrollTop, setScrollTop] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(items.length, startIndex + visibleCount + overscan * 2);

  const visibleItems = useMemo(() => {
    return items.slice(startIndex, endIndex).map((item, index) => ({
      item,
      index: startIndex + index
    }));
  }, [items, startIndex, endIndex]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn('overflow-auto', className)}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: items.length * itemHeight, position: 'relative' }}>
        {visibleItems.map(({ item, index }) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              top: index * itemHeight,
              height: itemHeight,
              width: '100%'
            }}
          >
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  );
}

// Debounced Input
interface DebouncedInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  debounceMs?: number;
}

export const DebouncedInput: React.FC<DebouncedInputProps> = ({
  value,
  onChange,
  debounceMs = 300,
  ...props
}) => {
  const [localValue, setLocalValue] = useState<string>(value);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      onChange(newValue);
    }, debounceMs);
  }, [onChange, debounceMs]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <input
      {...props}
      value={localValue}
      onChange={handleChange}
    />
  );
};

// Memoized Card Component
interface MemoizedCardProps {
  title: string;
  description: string;
  image?: string;
  price?: number;
  onClick?: () => void;
  className?: string;
}

export const MemoizedCard: React.FC<MemoizedCardProps> = React.memo(({
  title,
  description,
  image,
  price,
  onClick,
  className
}) => {
  return (
    <motion.div
      className={cn(
        'border-2 border-foreground rounded-lg shadow-neo bg-background p-4 cursor-pointer',
        'hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all duration-200',
        className
      )}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {image && (
        <LazyImage
          src={image}
          alt={title}
          className="w-full h-48 rounded-md mb-4"
        />
      )}
      
      <h3 className="font-bold text-lg mb-2">{title}</h3>
      <p className="text-muted-foreground mb-4">{description}</p>
      
      {price && (
        <div className="text-xl font-bold text-primary">
          Rp {price.toLocaleString('id-ID')}
        </div>
      )}
    </motion.div>
  );
});

MemoizedCard.displayName = 'MemoizedCard';

// Performance Monitor Hook
interface PerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  fps: number;
}

export const usePerformanceMonitor = (): PerformanceMetrics => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    memoryUsage: 0,
    fps: 0
  });

  const frameCountRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(performance.now());

  useEffect(() => {
    let animationFrame: number;

    const measurePerformance = (): void => {
      const now = performance.now();
      frameCountRef.current++;

      // Calculate FPS every second
      if (now - lastTimeRef.current >= 1000) {
        const fps = Math.round((frameCountRef.current * 1000) / (now - lastTimeRef.current));
        
        setMetrics(prev => ({
          ...prev,
          fps,
          renderTime: now - lastTimeRef.current,
          memoryUsage: (performance as Performance & { memory?: { usedJSHeapSize: number } }).memory?.usedJSHeapSize || 0
        }));

        frameCountRef.current = 0;
        lastTimeRef.current = now;
      }

      animationFrame = requestAnimationFrame(measurePerformance);
    };

    animationFrame = requestAnimationFrame(measurePerformance);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, []);

  return metrics;
};

// Intersection Observer Hook
interface UseIntersectionObserverOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

export const useIntersectionObserver = (
  options: UseIntersectionObserverOptions = {}
): [React.RefObject<HTMLDivElement>, boolean] => {
  const { threshold = 0.1, rootMargin = '0px', triggerOnce = true } = options;
  const [isIntersecting, setIsIntersecting] = useState<boolean>(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry) {
          setIsIntersecting(entry.isIntersecting);
          
          if (entry.isIntersecting && triggerOnce) {
            observer.disconnect();
          }
        }
      },
      { threshold, rootMargin }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold, rootMargin, triggerOnce]);

  return [ref, isIntersecting];
};

// Preload Images
export const preloadImages = (urls: string[]): Promise<void[]> => {
  return Promise.all(
    urls.map(url => {
      return new Promise<void>((resolve, reject) => {
        const img = new window.Image();
        img.onload = () => resolve();
        img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
        img.src = url;
      });
    })
  );
};

// Bundle Size Analyzer (Development only)
export const analyzeBundleSize = (): void => {
  if (process.env.NODE_ENV === 'development') {
    const scripts = Array.from(document.querySelectorAll('script[src]'));
    const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
    
    console.group('📦 Bundle Analysis');
    console.log('Scripts:', scripts.length);
    console.log('Stylesheets:', styles.length);
    
    scripts.forEach((script: Element) => {
      const src = script.getAttribute('src');
      if (src) {
        console.log(`Script: ${src}`);
      }
    });
    
    styles.forEach((style: Element) => {
      const href = style.getAttribute('href');
      if (href) {
        console.log(`Stylesheet: ${href}`);
      }
    });
    
    console.groupEnd();
  }
};