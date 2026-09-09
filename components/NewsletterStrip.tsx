'use client';

import React, { useState } from 'react';
import { Mail, MessageCircle, CheckCircle2, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';
import styles from './NewsletterStrip.module.css';

export default function NewsletterStrip() {
  const [channel, setChannel] = useState<'email' | 'whatsapp'>('email');
  const [contactValue, setContactValue] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactValue.trim()) return;

    if (typeof window !== 'undefined') {
      try {
        const existing = JSON.parse(localStorage.getItem('biharsay_subscribers') || '[]');
        existing.push({
          channel,
          value: contactValue.trim(),
          date: new Date().toISOString()
        });
        localStorage.setItem('biharsay_subscribers', JSON.stringify(existing));
      } catch {
        // localStorage fallback
      }
    }

    setSubmitted(true);
  };

  return (
    <section className={`${styles.container} reveal`}>
      <div className={styles.inner}>
        <div>
          <div className={styles.badge}>
            <Sparkles size={13} />
            <span>Weekly Intelligence Briefing</span>
          </div>
          <h3 className={styles.headline}>The Bihar Brief</h3>
          <p className={styles.description}>
            A 3-minute Sunday digest summarizing Bihar&apos;s most promising venture moves, grassroots changemakers, agritech innovations, and cultural renaissance. Zero spam, high-signal reporting.
          </p>
        </div>

        <div className={styles.formCard}>
          {submitted ? (
            <div className={styles.successState}>
              <CheckCircle2 size={20} color="#10B981" />
              <div>
                <strong>You&apos;re subscribed!</strong>
                <div>Welcome to The Bihar Brief. Look out for our Sunday edition.</div>
              </div>
            </div>
          ) : (
            <>
              <div className={styles.channelToggle}>
                <button
                  type="button"
                  className={`${styles.toggleBtn} ${channel === 'email' ? styles.activeToggle : ''}`}
                  onClick={() => setChannel('email')}
                >
                  <Mail size={13} />
                  <span>Email Digest</span>
                </button>
                <button
                  type="button"
                  className={`${styles.toggleBtn} ${channel === 'whatsapp' ? styles.activeToggle : ''}`}
                  onClick={() => setChannel('whatsapp')}
                >
                  <MessageCircle size={13} />
                  <span>WhatsApp Alerts</span>
                </button>
              </div>

              <form onSubmit={handleSubmit} className={styles.inputRow}>
                <input
                  type={channel === 'email' ? 'email' : 'tel'}
                  placeholder={channel === 'email' ? 'Enter your work email address...' : 'Enter your 10-digit WhatsApp number...'}
                  value={contactValue}
                  onChange={(e) => setContactValue(e.target.value)}
                  className={styles.inputField}
                  required
                />
                <button type="submit" className={styles.submitBtn}>
                  <span>Subscribe</span>
                  <ArrowRight size={14} />
                </button>
              </form>

              <div className={styles.trustNote}>
                <ShieldCheck size={14} color="#10B981" />
                <span>Join 13,000+ founders & professionals · Free forever · 1-click unsubscribe</span>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
