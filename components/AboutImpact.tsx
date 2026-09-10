'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Users, Eye, BookOpen, Rocket, Globe2, Linkedin, Sparkles, ArrowRight, ShieldCheck, TrendingUp, Mail, MessageCircle } from 'lucide-react';
import styles from './AboutImpact.module.css';

interface AboutImpactProps {
  onInquire: (serviceId?: string) => void;
}

interface MetricItem {
  icon: typeof Eye;
  target: number;
  suffix: string;
  decimals?: number;
  isLocale?: boolean;
  label: string;
  sub: string;
  color: string;
}

const METRICS: MetricItem[] = [
  {
    icon: Eye,
    target: 8.5,
    suffix: ' Lakh+',
    decimals: 1,
    label: 'Monthly Unique Visitors',
    sub: '8,50,000+ active readers exploring Bihar development, news & culture',
    color: '#1D6FD8',
  },
  {
    icon: TrendingUp,
    target: 25,
    suffix: ' Lakh+',
    decimals: 0,
    label: 'Monthly Impressions',
    sub: 'High-intent brand reach across Web, Google News & Social feeds',
    color: '#10B981',
  },
  {
    icon: Users,
    target: 15000,
    suffix: '+',
    isLocale: true,
    label: 'Global Bihari Network',
    sub: 'Active founders, professionals, diaspora leaders & students',
    color: '#8B5CF6',
  },
  {
    icon: Rocket,
    target: 85,
    suffix: '+',
    label: 'Startups & Ventures Featured',
    sub: 'From bootstrapped agritech to venture-funded unicorns',
    color: '#F59E0B',
  },
  {
    icon: Globe2,
    target: 22,
    suffix: '+',
    label: 'Countries Reached',
    sub: 'Active diaspora readership across US, UK, UAE & Singapore',
    color: '#0F172A',
  },
];

export default function AboutImpact({ onInquire }: AboutImpactProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [counts, setCounts] = useState<number[]>(METRICS.map(() => 0));

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          const duration = 1600;
          const startTime = performance.now();

          const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const easeOut = 1 - Math.pow(1 - progress, 3);

            setCounts(
              METRICS.map((m) => {
                const current = m.target * easeOut;
                return m.decimals ? parseFloat(current.toFixed(m.decimals)) : Math.round(current);
              })
            );

            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              setCounts(METRICS.map((m) => m.target));
            }
          };

          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.15 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [hasAnimated]);

  const formatValue = (metric: MetricItem, index: number) => {
    const val = counts[index];
    let formatted = metric.decimals ? val.toFixed(metric.decimals) : val.toString();
    if (metric.isLocale) {
      formatted = Math.round(val).toLocaleString();
    }
    return `${formatted}${metric.suffix}`;
  };

  return (
    <section className={`${styles.section} reveal`} id="about-us" ref={sectionRef}>
      {/* Top Header */}
      <div className={styles.header}>
        <div className={styles.badge}>
          <Sparkles size={14} color="#1D6FD8" />
          <span>About Bihar Say Media Network</span>
        </div>
        <h2>The Voice of Bihar’s Resurgence & Innovation</h2>
        <p className={styles.subtext}>
          We chronicle grassroots change, interview fearless entrepreneurs, celebrate cultural milestones, and connect the global Bihari community.
        </p>
      </div>

      {/* Dynamic Credibility Metrics Grid */}
      <div className={styles.metricsGrid}>
        {METRICS.map((metric, idx) => {
          const Icon = metric.icon;
          return (
            <div key={idx} className={styles.metricCard}>
              <div className={styles.metricIconWrap} style={{ color: metric.color, backgroundColor: `${metric.color}15` }}>
                <Icon size={24} />
              </div>
              <div className={styles.metricValue} style={{ color: metric.color }}>
                {formatValue(metric, idx)}
              </div>
              <div className={styles.metricLabel}>{metric.label}</div>
              <div className={styles.metricSub}>{metric.sub}</div>
            </div>
          );
        })}
      </div>

      {/* Founder Profile & Vision Card */}
      <div className={styles.founderCard}>
        <div className={styles.founderVisual}>
          <div className={styles.avatarContainer}>
            <div className={styles.avatarWrap}>
              <Image
                src="/founder.png"
                alt="Neehar R — Founder & CEO of Bihar Say"
                width={116}
                height={116}
                priority
                className={styles.avatarImg}
              />
            </div>
            <div className={styles.verifiedDot} title="Verified Founder">
              <ShieldCheck size={15} color="#FFFFFF" />
            </div>
          </div>
          <div className={styles.founderNameRow}>
            <h4>Neehar R</h4>
            <span>Founder & CEO · Bihar Say</span>
          </div>
          <div className={styles.founderConnectStack}>
            <a
              href="https://www.linkedin.com/in/neehar-r-49760417/"
              target="_blank"
              rel="noreferrer noopener"
              className={styles.linkedinBtn}
              title="Connect with Neehar on LinkedIn"
            >
              <Linkedin size={13} />
              <span>LinkedIn</span>
            </a>

            <a
              href="https://wa.me/918050083233?text=Hi%20Neehar%2C%20reaching%20out%20via%20Bihar%20Say"
              target="_blank"
              rel="noreferrer noopener"
              className={styles.whatsappFounderBtn}
              title="Chat with Neehar on WhatsApp (+91 8050083233)"
            >
              <MessageCircle size={13} color="#25D366" />
              <span>WhatsApp: +91 8050083233</span>
            </a>

            <a
              href="mailto:neehar@biharsay.com"
              className={styles.emailFounderBtn}
              title="Email Neehar directly: neehar@biharsay.com"
            >
              <Mail size={13} color="#60A5FA" />
              <span>neehar@biharsay.com</span>
            </a>
          </div>
        </div>

        <div className={styles.founderBio}>
          <div className={styles.quoteMark}>“</div>
          <p className={styles.founderQuote}>
            At <strong>Bihar Say</strong>, we are more than just a platform — we are a movement dedicated to reconnecting Biharis across the globe and sparking meaningful conversations about our state’s growth and potential. Our mission is to shine a spotlight on Bihar’s development, amplify its untold success stories, and create a positive atmosphere where progress thrives.
          </p>

          <div className={styles.founderActions}>
            <button 
              className={styles.btnFeatureBrand}
              onClick={() => onInquire('founder-story')}
            >
              <span>Feature Your Brand or Startup Story</span>
              <ArrowRight size={15} />
            </button>

            <button 
              className={styles.btnPartnerCommercial}
              onClick={() => onInquire('performance-marketing')}
            >
              <span>Commercial & Ad Inquiries</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
