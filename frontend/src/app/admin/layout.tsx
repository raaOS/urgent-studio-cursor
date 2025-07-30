'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { LayoutDashboard, Package, ShoppingCart, Users, Settings, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps): JSX.Element {
  const { logout } = useAuth();

  const handleLogout = async (): Promise<void> => {
    await logout();
    // Redirect akan ditangani oleh hook useAuth
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-primary">Urgent Studio</h1>
          <p className="text-sm text-gray-500">Admin Panel</p>
        </div>
        <nav className="mt-6 flex-grow">
          <ul>
            <NavItem href="/admin" icon={<LayoutDashboard size={20} />} label="Dashboard" />
            <NavItem href="/admin/products" icon={<Package size={20} />} label="Products" />
            <NavItem href="/admin/orders" icon={<ShoppingCart size={20} />} label="Orders" />
            <NavItem href="/admin/users" icon={<Users size={20} />} label="Users" />
            <NavItem href="/admin/settings" icon={<Settings size={20} />} label="Settings" />
          </ul>
        </nav>
        <div className="p-4 border-t border-gray-200">
          <Button 
            variant="outline" 
            className="w-full flex items-center justify-center gap-2"
            onClick={handleLogout}
          >
            <LogOut size={16} />
            <span>Logout</span>
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}

interface NavItemProps {
  href: string;
  icon: ReactNode;
  label: string;
}

function NavItem({ href, icon, label }: NavItemProps): JSX.Element {
  return (
    <li>
      <Link 
        href={href} 
        className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 hover:text-primary transition-colors"
      >
        <span className="mr-3">{icon}</span>
        <span>{label}</span>
      </Link>
    </li>
  );
}