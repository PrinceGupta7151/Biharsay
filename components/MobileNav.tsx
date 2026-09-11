'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { X, Sparkles, PlusCircle, LogOut, Bookmark, User, Compass, MessageCircle, Mail } from 'lucide-react';
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
              href="/#about-us" 
              onClick={(e) => handleNavClick(e, 'about-us')} 
              className={`${styles.linkItem} ${styles.linkItemFeatured}`}
            >
              <span className="dot culture" style={{ background: '#2563EB' }} />
              <div className={styles.aboutTextWrap}>
                <span className={styles.aboutTitle}>About Bihar Say</span>
                <span className={styles.aboutSubtitle}>Mission, Vision &amp; Reach</span>
              </div>
            </Link>
            <Link 
              href="/#culture-heritage" 
              onClick={(e) => handleNavClick(e, 'culture-heritage')} 
              className={styles.linkItem}
            >
              <span className="dot culture" /> Culture &amp; Heritage
            </Link>
            <Link 
              href="/#entrepreneurship-startups" 
              onClick={(e) => handleNavClick(e, 'entrepreneurship-startups')} 
              className={styles.linkItem}
            >
              <span className="dot startup" /> Startups &amp; Innovation
            </Link>
            <Link 
              href="/#investments-economic" 
              onClick={(e) => handleNavClick(e, 'investments-economic')} 
              className={styles.linkItem}
            >
              <span className="dot invest" /> Investments &amp; Economy
            </Link>
            <Link 
              href="/#education-social" 
              onClick={(e) => handleNavClick(e, 'education-social')} 
              className={styles.linkItem}
            >
              <span className="dot edu" /> Education &amp; Social
            </Link>
            <Link 
              href="/#industry-innovation" 
              onClick={(e) => handleNavClick(e, 'industry-innovation')} 
              className={styles.linkItem}
            >
              <span className="dot industry" /> Industry &amp; Tech
            </Link>
            <Link 
              href="/#sports" 
              onClick={(e) => handleNavClick(e, 'sports')} 
              className={styles.linkItem}
            >
              <span className="dot sports" /> Sports &amp; Youth
            </Link>
            <Link 
              href="/#commercial-services" 
              onClick={(e) => handleNavClick(e, 'commercial-services')} 
              className={styles.linkItem}
            >
              <span className="dot startup" style={{ background: '#F59E0B' }} /> Commercial &amp; Services
            </Link>
            <Link 
              href="/#partner-brands" 
              onClick={(e) => handleNavClick(e, 'partner-brands')} 
              className={styles.linkItem}
            >
              <span className="dot edu" style={{ background: '#2563EB' }} /> Associated Brands &amp; Partners
            </Link>
          </nav>
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

        {/* Direct Contact Card */}
        <div className={styles.drawerContactCard}>
          <div className={styles.drawerContactTitle}>Official Connect</div>
          <a
            href="https://wa.me/918050083233?text=Hi%20Bihar%20Say%20Team!%20Reaching%20out%20via%20mobile%20website."
            target="_blank"
            rel="noopener noreferrer"
            className={styles.drawerWhatsAppLink}
          >
            <MessageCircle size={16} color="#25D366" />
            <span>Chat on WhatsApp</span>
          </a>
          <a
            href="mailto:neehar@biharsay.com"
            className={styles.drawerEmailLink}
          >
            <Mail size={15} color="#60A5FA" />
            <span>neehar@biharsay.com</span>
          </a>
        </div>

        <div className={styles.drawerFooter}>
          <p>© 2026 Bihar Say. Empowering stories from Bihar to the world.</p>
        </div>
      </div>
    </div>
  );
}
