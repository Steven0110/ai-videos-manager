'use client';

import { ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
  Navbar, 
  NavbarBrand, 
  NavbarContent, 
  NavbarItem, 
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem
} from "@heroui/navbar";

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar position='sticky' className='justify-start'>
        <NavbarBrand>
          <Link href="/">
            <Image src="/icons/logo.png" alt="AI Videos Manager" width={40} height={40} />
          </Link>
          <Link href="/">
            <p className="font-bold text-inherit">AI Videos Manager</p>
          </Link>
        </NavbarBrand>
        
      </Navbar>
      <main>
        {children}
      </main>
    </div>
  );
} 