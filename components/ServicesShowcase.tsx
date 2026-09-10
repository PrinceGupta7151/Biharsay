'use client';

import React, { useState } from 'react';
import { Newspaper, TrendingUp, Users, PackageCheck, Tv, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import styles from './ServicesShowcase.module.css';

interface ServiceCategory {
  id: string;
  inquiryId: string;
  name: string;
  tagline: string;
  icon: React.ComponentType<{ size?: number; color?: string; className?: string }>;
  accentColor: string;
  points: string[];
  metrics: string;
  popular?: boolean;
}

const SERVICES: ServiceCategory[] = [
  {
    id: 'editorial',
    inquiryId: 'founder-story',
    name: 'Brand & Founder Stories',
    tagline: 'Authentic editorial feature on Bihar Say website, weekly newsletter, and 15,000+ community.',
    icon: Newspaper,
    accentColor: '#2563EB',
    points: ['In-depth Founder Interview', 'Permanent SEO-indexed Article', 'WhatsApp & Social Broadcast'],
    metrics: 'Avg. 15,000+ Reads per Feature',
    popular: true,
  },
  {
    id: 'performance',
    inquiryId: 'performance-marketing',
    name: 'Performance & Google Ads',
    tagline: 'Hyper-targeted regional acquisition campaigns tuned for Bihar & Eastern India markets.',
    icon: TrendingUp,
    accentColor: '#1D6FD8',
    points: ['Google Search & YouTube In-Stream', 'Meta Regional Demographics', 'High-Converting Landing Pages'],
    metrics: '3.4x Average Return on Ad Spend',
  },
  {
    id: 'influencer',
    inquiryId: 'influencer-marketing',
    name: 'Influencer & Creator Campaigns',
    tagline: 'Engage credible regional creators, vloggers, and community icons across Bihar.',
    icon: Users,
    accentColor: '#8B5CF6',
    points: ['10M+ Combined Creator Reach', 'Authentic Dialect Content (Hindi / Bhojpuri)', 'Contract & Usage Rights Included'],
    metrics: 'Up to 24% Higher Local Trust',
  },
  {
    id: 'sourcing',
    inquiryId: 'makhana-sample',
    name: 'Bihar B2B Sourcing Hub',
    tagline: 'Direct-from-producer procurement of GI Mithila Makhana and biodegradable Banana Fibre Bags.',
    icon: PackageCheck,
    accentColor: '#10B981',
    points: ['Farm-Gate Wholesale Pricing', 'Free Sample Boxes for Buyers', 'Zero Middlemen Verification'],
    metrics: 'Export Compliant & ESG Certified',
  },
  {
    id: 'displays',
    inquiryId: 'digital-standee',
    name: 'Digital Standees & Event Tech',
    tagline: 'Commercial 4K smart digital kiosks for expos, retail stores, hospitals, and showrooms in Bihar.',
    icon: Tv,
    accentColor: '#F59E0B',
    points: ['Ultra-Bright Commercial Panels', 'Cloud Content Scheduling', 'Delivery & Installation in Bihar'],
    metrics: 'Available for Rent & Purchase',
  },
];

interface ServicesShowcaseProps {
  onInquire: (serviceId: string) => void;
}

export default function ServicesShowcase({ onInquire }: ServicesShowcaseProps) {
  const [selectedCat, setSelectedCat] = useState<string>('all');

  const filteredServices = selectedCat === 'all' 
    ? SERVICES 
    : SERVICES.filter(s => s.id === selectedCat);

  return (
    <section className={`${styles.section} reveal`} id="commercial-services">
      <div className={styles.header}>
        <div className={styles.badge}>
          <Sparkles size={14} color="#1D6FD8" />
          <span>Commercial Solutions & Media Network</span>
        </div>
        <h2>Services Designed to Scale Your Brand in Bihar</h2>
        <p className={styles.subtext}>
          From founder story features and regional performance marketing to bulk agro-sourcing and digital display kiosks.
        </p>

        {/* Filter Pills */}
        <div className={styles.filterPills}>
          <button
            className={`${styles.pill} ${selectedCat === 'all' ? styles.activePill : ''}`}
            onClick={() => setSelectedCat('all')}
          >
            All Services ({SERVICES.length})
          </button>
          {SERVICES.map((s) => (
            <button
              key={s.id}
              className={`${styles.pill} ${selectedCat === s.id ? styles.activePill : ''}`}
              onClick={() => setSelectedCat(s.id)}
            >
              {s.name}
            </button>
          ))}
        </div>
      </div>

      {/* Services Cards Grid */}
      <div className={styles.grid}>
        {filteredServices.map((service) => {
          const Icon = service.icon;
          return (
            <div key={service.id} className={styles.card}>
              {service.popular && (
                <div className={styles.popularBadge}>Most In-Demand</div>
              )}
              
              <div className={styles.iconWrap} style={{ backgroundColor: `${service.accentColor}15`, color: service.accentColor }}>
                <Icon size={26} />
              </div>

              <h3 className={styles.cardTitle}>{service.name}</h3>
              <p className={styles.cardTagline}>{service.tagline}</p>

              <div className={styles.pointsList}>
                {service.points.map((p, idx) => (
                  <div key={idx} className={styles.pointItem}>
                    <CheckCircle2 size={14} color={service.accentColor} />
                    <span>{p}</span>
                  </div>
                ))}
              </div>

              <div className={styles.cardFooter}>
                <div className={styles.metricBadge}>
                  <span>{service.metrics}</span>
                </div>

                <button
                  className={styles.inquireBtn}
                  onClick={() => onInquire(service.inquiryId)}
                >
                  <span>Inquire / Get Quote</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
