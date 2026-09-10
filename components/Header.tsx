'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { Menu, X, User, Bookmark, LogOut, PlusCircle, Sparkles, ChevronDown } from 'lucide-react';
import MobileNav from './MobileNav';
import styles from './Header.module.css';

export default function Header() {
  const { user, logout, openAuthModal, openSubmitModal } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isMoreDropdownOpen, setIsMoreDropdownOpen] = useState(false);
  const [activeSlug, setActiveSlug] = useState('home');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const moreDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
      if (moreDropdownRef.current && !moreDropdownRef.current.contains(e.target as Node)) {
        setIsMoreDropdownOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsProfileDropdownOpen(false);
        setIsMoreDropdownOpen(false);
      }
    };

    if (isProfileDropdownOpen || isMoreDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isProfileDropdownOpen, isMoreDropdownOpen]);

  useEffect(() => {
    const updateActive = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) {
        setActiveSlug(hash);
      } else if (window.scrollY < 250) {
        setActiveSlug('home');
      }
    };

    updateActive();
    window.addEventListener('hashchange', updateActive);
    window.addEventListener('scroll', updateActive, { passive: true });
    return () => {
      window.removeEventListener('hashchange', updateActive);
      window.removeEventListener('scroll', updateActive);
    };
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, slug: string) => {
    setActiveSlug(slug);
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
    <>
      <header className={styles.siteHeader}>
        <div className="wrap">
          <div className={styles.navRow}>
            {/* Left: Brand Logo & Title */}
            <Link 
              href="/" 
              className={styles.brand}
              onClick={(e) => handleNavClick(e, 'home')}
            >
              <span className={styles.logoMark}>
                <Image
                  src="https://biharsay.com/wp-content/uploads/2024/09/cropped-logo-1-270x270.webp"
                  alt="Bihar Say Logo"
                  width={38}
                  height={38}
                  priority
                  className={styles.logoImg}
                />
              </span>
              <span className={styles.brandTitle}>
                Bihar<em>Say</em>
              </span>
            </Link>

            {/* Middle: Desktop Navigation Links */}
            <nav className={styles.desktopNav}>
              <Link 
                href="/" 
                onClick={(e) => handleNavClick(e, 'home')}
                className={activeSlug === 'home' ? styles.activeLink : ''}
              >
                Home
              </Link>
              <Link 
                href="/#culture-heritage" 
                onClick={(e) => handleNavClick(e, 'culture-heritage')}
                className={activeSlug === 'culture-heritage' ? styles.activeLink : ''}
              >
                Culture
              </Link>
              <Link 
                href="/#entrepreneurship-startups" 
                onClick={(e) => handleNavClick(e, 'entrepreneurship-startups')}
                className={activeSlug === 'entrepreneurship-startups' ? styles.activeLink : ''}
              >
                Startups
              </Link>
              <Link 
                href="/#investments-economic" 
                onClick={(e) => handleNavClick(e, 'investments-economic')}
                className={activeSlug === 'investments-economic' ? styles.activeLink : ''}
              >
                Investments
              </Link>
              <Link 
                href="/#partner-brands" 
                onClick={(e) => handleNavClick(e, 'partner-brands')}
                className={activeSlug === 'partner-brands' ? styles.activeLink : ''}
              >
                Partners
              </Link>
              <Link 
                href="/#about-us" 
                onClick={(e) => handleNavClick(e, 'about-us')}
                className={activeSlug === 'about-us' ? styles.activeLink : ''}
              >
                About Bihar Say
              </Link>

              {/* More Topics Dropdown */}
              <div className={styles.moreDropdownWrapper} ref={moreDropdownRef}>
                <button
                  type="button"
                  className={`${styles.moreTriggerBtn} ${['education-social', 'industry-innovation', 'sports', 'commercial-services'].includes(activeSlug) ? styles.activeLink : ''}`}
                  onClick={() => setIsMoreDropdownOpen(!isMoreDropdownOpen)}
                  aria-expanded={isMoreDropdownOpen}
                >
                  <span>More</span>
                  <ChevronDown 
                    size={14} 
                    className={`${styles.moreChevron} ${isMoreDropdownOpen ? styles.moreChevronRotated : ''}`} 
                    aria-hidden="true"
                  />
                </button>

                {isMoreDropdownOpen && (
                  <div className={styles.moreDropdownMenu}>
                    <Link
                      href="/#education-social"
                      onClick={(e) => {
                        handleNavClick(e, 'education-social');
                        setIsMoreDropdownOpen(false);
                      }}
                      className={styles.moreDropdownItem}
                    >
                      <span className="dot edu" /> Education &amp; Social
                    </Link>
                    <Link
                      href="/#industry-innovation"
                      onClick={(e) => {
                        handleNavClick(e, 'industry-innovation');
                        setIsMoreDropdownOpen(false);
                      }}
                      className={styles.moreDropdownItem}
                    >
                      <span className="dot industry" /> Industry &amp; Tech
                    </Link>
                    <Link
                      href="/#sports"
                      onClick={(e) => {
                        handleNavClick(e, 'sports');
                        setIsMoreDropdownOpen(false);
                      }}
                      className={styles.moreDropdownItem}
                    >
                      <span className="dot sports" /> Sports &amp; Youth
                    </Link>
                    <Link
                      href="/#commercial-services"
                      onClick={(e) => {
                        handleNavClick(e, 'commercial-services');
                        setIsMoreDropdownOpen(false);
                      }}
                      className={styles.moreDropdownItem}
                    >
                      <span className="dot startup" style={{ background: '#F59E0B' }} /> Commercial Services
                    </Link>
                  </div>
                )}
              </div>
            </nav>

            {/* Right: Actions (Join / Profile / Mobile Toggle) */}
            <div className={styles.actions}>
              {mounted && user ? (
                <div className={styles.userActions}>
                  <button 
                    className={styles.btnSubmitStory}
                    onClick={openSubmitModal}
                    title="Publish an article to Bihar Say"
                  >
                    <PlusCircle size={16} />
                    <span>Post Story</span>
                  </button>

                  <div className={styles.profileWrapper} ref={profileRef}>
                    <button 
                      className={styles.avatarBtn}
                      onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                      aria-label="User account"
                    >
                      {user.photoURL ? (
                        <Image 
                          src={user.photoURL} 
                          alt={user.displayName || 'User'} 
                          width={34} 
                          height={34} 
                          className={styles.avatarImg}
                        />
                      ) : (
                        <span className={styles.avatarFallback}>
                          {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'B'}
                        </span>
                      )}
                    </button>

                    {isProfileDropdownOpen && (
                      <div className={styles.dropdownMenu}>
                        <div className={styles.dropdownHeader}>
                          <p className={styles.dropdownName}>{user.displayName}</p>
                          <p className={styles.dropdownEmail}>{user.email}</p>
                        </div>
                        <div className={styles.dropdownDivider} />
                        <button 
                          className={styles.dropdownItem}
                          onClick={() => {
                            openSubmitModal();
                            setIsProfileDropdownOpen(false);
                          }}
                        >
                          <PlusCircle size={15} />
                          <span>Submit a Story</span>
                        </button>
                        <button 
                          className={styles.dropdownItem}
                          onClick={() => {
                            setToastMessage('Your saved stories are synchronized with your account.');
                            setIsProfileDropdownOpen(false);
                            setTimeout(() => setToastMessage(null), 3500);
                          }}
                        >
                          <Bookmark size={15} />
                          <span>Saved Articles</span>
                        </button>
                        <div className={styles.dropdownDivider} />
                        <button 
                          className={`${styles.dropdownItem} ${styles.danger}`}
                          onClick={() => {
                            logout();
                            setIsProfileDropdownOpen(false);
                          }}
                        >
                          <LogOut size={15} />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <button 
                  className="btn-join" 
                  onClick={openAuthModal}
                >
                  <Sparkles size={15} color="#38BDF8" />
                  <span>Join Community</span>
                </button>
              )}

              {/* Mobile Menu Toggle Button */}
              <button
                className={styles.hamburgerBtn}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle Menu"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Floating In-Page Toast Notification */}
      {toastMessage && (
        <div className={styles.toastNotice} role="status">
          <Bookmark size={15} color="#38BDF8" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Mobile Slide-out Menu */}
      <MobileNav 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />
    </>
  );
}
