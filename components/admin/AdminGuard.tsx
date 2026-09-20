'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { isAdminUser } from '@/lib/admin';
import { ShieldX } from 'lucide-react';
import Link from 'next/link';

interface AdminGuardProps {
  children: React.ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="admin-auth-guard">
        <div className="admin-spinner" />
        <p>Verifying admin access...</p>
      </div>
    );
  }

  if (!user || !isAdminUser(user.email)) {
    return (
      <div className="admin-auth-guard">
        <div className="lock-icon">
          <ShieldX size={28} />
        </div>
        <h2>Access Restricted</h2>
        <p>You don&apos;t have admin privileges to access the Bihar Say dashboard. Please sign in with an authorized admin account.</p>
        <Link href="/" className="admin-btn primary" style={{ marginTop: 12 }}>
          ← Back to Bihar Say
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
