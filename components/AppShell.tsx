'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import TopStrip from '@/components/TopStrip';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AuthModal from '@/components/AuthModal';
import SubmitStoryModal from '@/components/SubmitStoryModal';
import WelcomePopup from '@/components/WelcomePopup';
import ScrollRevealInit from '@/components/ScrollRevealInit';
import BackToTop from '@/components/BackToTop';

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');

  if (isAdminRoute) {
    return <div className="admin-root-container">{children}</div>;
  }

  return (
    <>
      <ScrollRevealInit />
      <TopStrip />
      <Header />
      <main className="wrap">{children}</main>
      <Footer />
      <BackToTop />
      <AuthModal />
      <SubmitStoryModal />
      <WelcomePopup />
    </>
  );
}
