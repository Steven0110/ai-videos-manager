'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button, Navbar, NavbarBrand, NavbarContent, NavbarItem } from '@heroui/react';

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar>
        <NavbarBrand>
          <Link href="/" className="font-bold text-xl">
            AI Videos Manager
          </Link>
        </NavbarBrand>
        <NavbarContent className="flex gap-4">
          <NavbarItem>
            <Link href="/" passHref>
              <Button 
                variant={pathname === '/' ? 'solid' : 'ghost'}
                color="primary"
              >
                Dashboard
              </Button>
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link href="/studio" passHref>
              <Button 
                variant={pathname === '/studio' ? 'solid' : 'ghost'}
                color="primary"
              >
                Studio
              </Button>
            </Link>
          </NavbarItem>
        </NavbarContent>
      </Navbar>
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  );
} 