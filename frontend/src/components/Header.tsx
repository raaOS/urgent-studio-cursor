import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Truck } from 'lucide-react';

export function Header() {
  return (
    <header className="absolute top-0 z-40 w-full bg-transparent text-primary-foreground">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="text-2xl font-bold tracking-tighter text-background" style={{ textShadow: '2px 2px 0px rgba(0,0,0,0.1)' }}>
          Urgent <span className="font-light">Studio</span>
        </Link>
        <nav>
          <Button asChild variant="ghost" className="font-bold text-background hover:bg-white/10 hover:text-white">
            <Link href="/track">
              <Truck className="mr-2 h-5 w-5" />
              Lacak Pesanan
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
