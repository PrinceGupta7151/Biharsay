'use client';

import React from 'react';
import Image from 'next/image';
import styles from './PartnerBrandsTicker.module.css';

export interface BrandPartner {
  id: string;
  name: string;
  category: string;
  url?: string;
  logoUrl?: string;
  accentBg: string;
  accentColor: string;
  iconSvg?: React.ReactNode;
}

export const PARTNER_BRANDS: BrandPartner[] = [
  {
    id: 'frootex',
    name: 'Frootex',
    category: 'B2B Agro Supply & Commerce',
    logoUrl: '/logos/frootex.png',
    accentBg: '#E0F2FE',
    accentColor: '#0284C7',
  },
  {
    id: 'biharsay',
    name: 'Bihar Say',
    category: 'Digital Media & Storytelling',
    logoUrl: '/logos/biharsay.webp',
    accentBg: '#FEE2E2',
    accentColor: '#DC2626',
  },
  {
    id: 'bihariceo',
    name: 'Bihari CEO Club',
    category: 'Founders & Leadership Network',
    logoUrl: '/logos/bihariceo.png',
    accentBg: '#FFEDE5',
    accentColor: '#D97757',
  },
  {
    id: 'mithila-naturals',
    name: 'Mithila Naturals',
    category: 'GI Mithila Makhana Exporters',
    logoUrl: '/logos/mithila-naturals.svg',
    accentBg: '#DCFCE7',
    accentColor: '#16A34A',
  },
  {
    id: 'dehaat',
    name: 'DeHaat',
    category: 'Agritech & Market Linkages',
    logoUrl: '/logos/dehaat.svg',
    accentBg: '#D1FAE5',
    accentColor: '#059669',
  },
  {
    id: 'bihar-angels',
    name: 'Bihar Angels',
    category: 'Seed & Early Capital Network',
    logoUrl: '/logos/biharangels.svg',
    accentBg: '#EEF2FF',
    accentColor: '#4F46E5',
  },
  {
    id: 'patna-startups',
    name: 'Patna Startups Hub',
    category: 'Incubation & Co-Working',
    logoUrl: '/logos/patnastartups.svg',
    accentBg: '#FFEDD5',
    accentColor: '#EA580C',
  },
  {
    id: 'zoff-foods',
    name: 'Zoff Spices',
    category: 'Modern FMCG Manufacturing',
    logoUrl: '/logos/zoff.svg',
    accentBg: '#FFE4E6',
    accentColor: '#E11D48',
  },
  {
    id: 'agastya-farm',
    name: 'Agastya Biofarms',
    category: 'Sustainable Farm-To-Fork',
    logoUrl: '/logos/agastya.svg',
    accentBg: '#ECFCCB',
    accentColor: '#65A30D',
  },
  {
    id: 'super-30',
    name: 'Super 30 Network',
    category: 'Education & Mentorship',
    logoUrl: '/logos/super30.svg',
    accentBg: '#DBEAFE',
    accentColor: '#2563EB',
  },
];

export default function PartnerBrandsTicker() {
  // Render a brand item as an unclickable display badge
  const renderBrand = (brand: BrandPartner, keySuffix: string) => {
    return (
      <div key={`${brand.id}-${keySuffix}`} className={styles.brandCard}>
        <div 
          className={styles.logoBox} 
          style={{ backgroundColor: brand.accentBg, color: brand.accentColor }}
        >
          {brand.logoUrl ? (
            <img 
              src={brand.logoUrl} 
              alt={`${brand.name} logo`} 
              className={styles.logoImg}
            />
          ) : (
            brand.iconSvg || brand.name.charAt(0)
          )}
        </div>
        <div className={styles.brandDetails}>
          <div className={styles.brandNameRow}>
            <span className={styles.brandName}>{brand.name}</span>
          </div>
          <span className={styles.brandCategory}>{brand.category}</span>
        </div>
      </div>
    );
  };

  return (
    <section className={styles.tickerSection} id="partner-brands">
      {/* Edge gradient masks for seamless infinite blend */}
      <div className={styles.maskLeft} aria-hidden="true" />
      <div className={styles.maskRight} aria-hidden="true" />

      {/* Top Header Row (Styled cleanly like bihariceo.club) */}
      <div className={styles.headerRow}>
        <span className={styles.accentLine} />
        <span className={styles.sectionLabel}>
          <span className={styles.labelDot} />
          Associated Brands &amp; Ecosystem Partners
        </span>
        <span className={styles.accentLine} />
      </div>

      {/* Continuous Marquee Ticker Track */}
      <div className={styles.marqueeContainer}>
        <div className={styles.marqueeTrack}>
          {/* Primary Group */}
          <div className={styles.brandGroup}>
            {PARTNER_BRANDS.map((brand) => renderBrand(brand, 'group-1'))}
          </div>
          {/* Duplicate Group for seamless infinite looping */}
          <div className={styles.brandGroup} aria-hidden="true">
            {PARTNER_BRANDS.map((brand) => renderBrand(brand, 'group-2'))}
          </div>
        </div>
      </div>
    </section>
  );
}
