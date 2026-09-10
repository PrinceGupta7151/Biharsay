'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { X, Sparkles, PlusCircle, LogOut, Bookmark, User, Compass } from 'lucide-react';
import styles from './MobileNav.module.css';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const { user, logout, openAuthModal, openSubmitModal } = useAuth();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen) return null;

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, slug: string) => {
    onClose();
    if (typeof window !== 'undefined' && window.location.pathname === '/') {
      e.preventDefault();
      if (slug === 'home') {
        window.dispatchEvent(new CustomEvent('biharsay:navigate', { detail: { slug: 'home' } }));
        window.history.pushState(null, '', '/');
      } else {
        window.dispatchEvent(new CustomEvent('biharsay:navigate', { detail: { slug } }));
        window.history.pushState(null, '', `/#${slug}`);
      }
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
        <div className={styles.drawerHeader}>
          <div className={styles.brand}>
            Bihar<em>Say</em>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close menu">
            <X size={22} />
          </button>
        </div>

        {/* User Card inside Mobile Drawer */}
        <div className={styles.userBanner}>
          {mounted && user ? (
            <div className={styles.userInfo}>
              <div className={styles.avatar}>
                {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'B'}
              </div>
              <div className={styles.userDetails}>
                <div className={styles.userName}>{user.displayName}</div>
                <div className={styles.userEmail}>{user.email}</div>
              </div>
            </div>
          ) : (
            <button 
              className={styles.btnMobileJoin}
              onClick={() => {
                onClose();
                openAuthModal();
              }}
            >
              <Sparkles size={16} />
              <span>Join Bihar Say Community</span>
            </button>
          )}
        </div>

        {/* Navigation Sections */}
        <div className={styles.navSection}>
          <h4 className={styles.sectionTitle}>
            <Compass size={14} />
            <span>Categories</span>
          </h4>
          <nav className={styles.linksList}>
            <Link 
              href="/" 
              onClick={(e) => handleNavClick(e, 'home')} 
              className={styles.linkItem}
            >
              All Stories (Home)
            </Link>
            <Link 
              href="/#culture-heritage" 
              onClick={(e) => handleNavClick(e, 'culture-heritage')} 
              className={styles.linkItem}
            >
              <span className="dot culture" /> Culture & Heritage
            </Link>
            <Link 
              href="/#education-social" 
              onClick={(e) => handleNavClick(e, 'education-social')} 
              className={styles.linkItem}
            >
              <span className="dot edu" /> Education & Social
            </Link>
            <Link 
              href="/#entrepreneurship-startups" 
              onClick={(e) => handleNavClick(e, 'entrepreneurship-startups')} 
              className={styles.linkItem}
            >
              <span className="dot startup" /> Startups & Innovation
            </Link>
            <Link 
              href="/#industry-innovation" 
              onClick={(e) => handleNavClick(e, 'industry-innovation')} 
              className={styles.linkItem}
            >
              <span className="dot industry" /> Industry & Tech
            </Link>
            <Link 
              href="/#sports" 
              onClick={(e) => handleNavClick(e, 'sports')} 
              className={styles.linkItem}
            >
              <span className="dot sports" /> Sports
            </Link>
            <Link 
              href="/#investments-economic" 
              onClick={(e) => handleNavClick(e, 'investments-economic')} 
              className={styles.linkItem}
            >
              <span className="dot invest" /> Investments & Economy
            </Link>
            <Link 
              href="/#commercial-services" 
              onClick={(e) => handleNavClick(e, 'commercial-services')} 
              className={styles.linkItem}
            >
              <span className="dot startup" style={{ background: '#F59E0B' }} /> Commercial & Services
            </Link>
            <Link 
              href="/#partner-brands" 
              onClick={(e) => handleNavClick(e, 'partner-brands')} 
              className={styles.linkItem}
            >
              <span className="dot edu" style={{ background: '#2563EB' }} /> Associated Brands &amp; Partners
            </Link>
            <Link 
              href="/#msme-community" 
              onClick={(e) => handleNavClick(e, 'msme-community')} 
              className={styles.linkItem}
            >
              <span className="dot startup" style={{ background: '#10B981' }} /> MSME Community (Frootex)
            </Link>
            <Link 
              href="/#about-us" 
              onClick={(e) => handleNavClick(e, 'about-us')} 
              className={styles.linkItem}
            >
              <span className="dot culture" style={{ background: '#10B981' }} /> About & Media Reach
            </Link>
          </nav>
        </div>

        {/* Highlight MSME Card in Mobile Drawer */}
        <div className={styles.msmeMobileCard}>
          <div className={styles.msmeMobileHeader}>
            <span className={styles.msmeMobileDot} />
            <span>Targeting MSMEs Across Bihar</span>
          </div>
          <div className={styles.msmeMobileTitle}>
            Register on seller.frootex.com
          </div>
          <p className={styles.msmeMobileDesc}>
            Join Bihar&apos;s largest B2B business community with 0% commission &amp; pan-India buyer demand.
          </p>
          <a 
            href="https://seller.frootex.com/"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.msmeMobileBtn}
            onClick={onClose}
          >
            Open Seller Portal ↗
          </a>
        </div>

        {/* Action Buttons in Drawer */}
        <div className={styles.drawerActions}>
          <button 
            className={styles.actionBtnPrimary}
            onClick={() => {
              onClose();
              if (user) openSubmitModal();
              else openAuthModal();
            }}
          >
            <PlusCircle size={18} />
            <span>Share Your Story</span>
          </button>

          {user && (
            <button 
              className={styles.actionBtnDanger}
              onClick={() => {
                logout();
                onClose();
              }}
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          )}
        </div>

        <div className={styles.drawerFooter}>
          <p>© 2026 Bihar Say. Empowering stories from Bihar to the world.</p>
        </div>
      </div>
    </div>
  );
}
