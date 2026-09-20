'use client';

import React, { useState, useEffect } from 'react';
import AdminGuard from '@/components/admin/AdminGuard';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { useAuth } from '@/context/AuthContext';
import { Menu } from 'lucide-react';
import './admin.css';

function AdminShell({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AdminGuard>
      <div className="admin-layout">
        <AdminSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <div className="admin-main">
          <div className="admin-topbar">
            <button
              className="mobile-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle sidebar"
            >
              <Menu size={22} />
            </button>
            <h1>Admin Panel</h1>
            <div className="admin-topbar-actions">
              <div className="admin-user-pill">
                <span className="avatar">
                  {user?.displayName?.charAt(0).toUpperCase() || 'A'}
                </span>
                <span>{user?.displayName || 'Admin'}</span>
              </div>
            </div>
          </div>
          <div className="admin-content">
            {children}
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
