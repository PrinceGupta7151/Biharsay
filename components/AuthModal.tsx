'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { X, Mail, Lock, User, Sparkles, CheckCircle2 } from 'lucide-react';
import styles from './AuthModal.module.css';

export default function AuthModal() {
  const { 
    isAuthModalOpen, 
    closeAuthModal, 
    signInWithEmail, 
    signUpWithEmail, 
    signInWithGoogle, 
    isFirebaseLive 
  } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>('signup');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      if (mode === 'signup') {
        if (!name.trim()) throw new Error('Please enter your name');
        if (!email.trim() || !password.trim()) throw new Error('Please enter email and password');
        await signUpWithEmail(email, password, name);
      } else {
        if (!email.trim() || !password.trim()) throw new Error('Please enter email and password');
        await signInWithEmail(email, password);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError(null);
    setSubmitting(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setError(err.message || 'Google authentication failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={closeAuthModal}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div className={styles.brandTitle}>
            Bihar<em>Say</em>
          </div>
          <button 
            className={styles.closeBtn} 
            onClick={closeAuthModal} 
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.tabBar}>
            <button
              className={`${styles.tabBtn} ${mode === 'signup' ? styles.activeTab : ''}`}
              onClick={() => { setMode('signup'); setError(null); }}
            >
              Join Community
            </button>
            <button
              className={`${styles.tabBtn} ${mode === 'signin' ? styles.activeTab : ''}`}
              onClick={() => { setMode('signin'); setError(null); }}
            >
              Sign In
            </button>
          </div>

          <div className={styles.tagline}>
            {mode === 'signup' 
              ? 'Connect with over 13,000+ Biharis shaping culture, enterprise, and progress.' 
              : 'Welcome back to your Bihar Say community feed.'}
          </div>

          {error && <div className={styles.errorMessage}>{error}</div>}

          <form onSubmit={handleSubmit} className={styles.form}>
            {mode === 'signup' && (
              <div className={styles.inputGroup}>
                <label>Your Full Name</label>
                <div className={styles.inputWrap}>
                  <User size={18} className={styles.inputIcon} />
                  <input
                    type="text"
                    placeholder="e.g. Amrita Sinha"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            <div className={styles.inputGroup}>
              <label>Email Address</label>
              <div className={styles.inputWrap}>
                <Mail size={18} className={styles.inputIcon} />
                <input
                  type="email"
                  placeholder="you@biharsay.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label>Password</label>
              <div className={styles.inputWrap}>
                <Lock size={18} className={styles.inputIcon} />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              className={styles.btnSubmit} 
              disabled={submitting}
            >
              {submitting ? 'Connecting...' : mode === 'signup' ? 'Create Account & Join' : 'Sign In'}
            </button>
          </form>

          <div className={styles.divider}>
            <span>OR CONTINUE WITH</span>
          </div>

          <button 
            type="button" 
            className={styles.googleBtn} 
            onClick={handleGoogleAuth}
            disabled={submitting}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Configuration / Live status badge */}
          <div className={styles.statusNotice}>
            <CheckCircle2 size={14} color={isFirebaseLive ? '#10B981' : '#3B82F6'} />
            <span>
              {isFirebaseLive 
                ? 'Connected to Live Firebase Authentication.' 
                : 'Demo Mode Active: Enter any test email & password to test sign in instantly!'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
