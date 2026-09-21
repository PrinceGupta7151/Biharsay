'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, Sparkles, Check, ArrowRight, CheckCircle2 } from 'lucide-react';
import { subscribeNewsletter } from '@/lib/db';
import { useAuth } from '@/context/AuthContext';
import styles from './WelcomePopup.module.css';

export default function WelcomePopup() {
  const { openAuthModal } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    // Check if previously dismissed in this session
    const dismissed = sessionStorage.getItem('biharsay_popup_dismissed');
    if (dismissed) return;

    // Show after 1.5 seconds delay for a smooth entrance
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem('biharsay_popup_dismissed', 'true');
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await subscribeNewsletter({
        contact: email.trim(),
        channel: 'email',
      });
      setIsSubscribed(true);
      setTimeout(() => {
        handleClose();
      }, 2500);
    } catch (err) {
      console.warn('Newsletter popup subscribe error:', err);
      setIsSubscribed(true);
      setTimeout(() => {
        handleClose();
      }, 2500);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleJoinCommunity = () => {
    handleClose();
    openAuthModal();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.backdrop} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={handleClose} aria-label="Close popup">
          <X size={18} />
        </button>

        {/* Header with Bihar Say Emblem */}
        <div className={styles.headerBanner}>
          <div className={styles.logoWrapper}>
            <Image
              src="/logos/biharsay-popup-logo.png"
              alt="Bihar Say"
              width={130}
              height={65}
              priority
              style={{ objectFit: 'contain', width: 'auto', height: '100%' }}
            />
          </div>

          <div className={styles.badge}>
            <Sparkles size={12} />
            <span>Join 15,000+ Members & 8.5L+ Readers</span>
          </div>

          <h2 className={styles.title}>Discover the New Bihar</h2>
          <p className={styles.subtitle}>
            Grassroots innovations, high-growth startups, cultural pride, and stories setting the pace for modern Bihar.
          </p>
        </div>

        {/* Content Body */}
        <div className={styles.body}>
          <div className={styles.highlights}>
            <div className={styles.highlightItem}>
              <div className={styles.highlightDot}>
                <Check size={12} strokeWidth={3} />
              </div>
              <span>
                <strong>The Sunday Bihar Brief:</strong> 3-minute weekly intelligence on startups, policy & economy.
              </span>
            </div>
            <div className={styles.highlightItem}>
              <div className={styles.highlightDot}>
                <Check size={12} strokeWidth={3} />
              </div>
              <span>
                <strong>Grassroots Changemakers:</strong> Inspiring profiles of innovators transforming Bihar.
              </span>
            </div>
          </div>

          {isSubscribed ? (
            <div className={styles.successNotice}>
              <CheckCircle2 size={18} color="#10B981" />
              <span>Welcome aboard! You&apos;re subscribed to The Bihar Brief.</span>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className={styles.form}>
              <input
                type="email"
                placeholder="Enter your email address..."
                className={styles.input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
                {isSubmitting ? 'Subscribing...' : 'Get Weekly Brief'}
                <ArrowRight size={14} />
              </button>
            </form>
          )}

          <div className={styles.bottomLinks}>
            <button type="button" className={styles.secondaryBtn} onClick={handleClose}>
              Explore website first
            </button>
            <button type="button" className={styles.communityBtn} onClick={handleJoinCommunity}>
              <span>Join Community</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
