'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  BookOpen,
  MessageSquare,
  Users,
  Briefcase,
  ArrowLeft,
} from 'lucide-react';

interface SidebarLink {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

interface AdminSidebarProps {
  pendingCount?: number;
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminSidebar({ pendingCount, isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  const links: SidebarLink[] = [
    { href: '/admin', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    {
      href: '/admin/submissions',
      label: 'Submissions',
      icon: <FileText size={18} />,
      badge: pendingCount && pendingCount > 0 ? pendingCount : undefined,
    },
    { href: '/admin/stories', label: 'Stories', icon: <BookOpen size={18} /> },
    { href: '/admin/comments', label: 'Comments', icon: <MessageSquare size={18} /> },
    { href: '/admin/subscribers', label: 'Subscribers', icon: <Users size={18} /> },
    { href: '/admin/inquiries', label: 'Inquiries', icon: <Briefcase size={18} /> },
  ];

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 49,
            display: 'none',
          }}
          className="sidebar-overlay"
        />
      )}
      <aside className={`admin-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-brand">
          <div className="brand-icon">BS</div>
          <div>
            <h2>Bihar Say</h2>
            <span>Admin Panel</span>
          </div>
        </div>

        <nav className="admin-sidebar-nav">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={isActive(link.href) ? 'active' : ''}
              onClick={onClose}
            >
              {link.icon}
              <span>{link.label}</span>
              {link.badge !== undefined && (
                <span className="nav-badge">{link.badge}</span>
              )}
            </Link>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <Link href="/">
            <ArrowLeft size={15} />
            <span>Back to Bihar Say</span>
          </Link>
        </div>
      </aside>
    </>
  );
}
