'use client';

import React from 'react';
import Link from 'next/link';
import { Mail, MapPin, Heart, Facebook, Instagram, Linkedin, Youtube } from 'lucide-react';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className="wrap">
        <div className={styles.grid}>
          {/* Column 1: About */}
          <div className={styles.about}>
            <div className={styles.brandTitle}>
              Bihar<em>Say</em>
            </div>
            <p className={styles.aboutText}>
              Empowering Bihar and Biharis across the world with stories of innovation, cultural pride, economic resurgence, and inspiring change.
            </p>
            <div className={styles.madeWith}>
              <span>Documenting Bihar with pride</span>
              <Heart size={14} fill="#8FC6FF" color="#8FC6FF" />
            </div>
          </div>

          {/* Column 2: Explore */}
          <div className={styles.col}>
            <h5>Explore Stories</h5>
            <ul className={styles.links}>
              <li><Link href="/#culture-heritage">Culture & Heritage</Link></li>
              <li><Link href="/#education-social">Education & Social</Link></li>
              <li><Link href="/#entrepreneurship-startups">Startups & Founders</Link></li>
              <li><Link href="/#industry-innovation">Industry & Tech</Link></li>
              <li><Link href="/#sports">Sports & Athletes</Link></li>
              <li><Link href="/#investments-economic">Economy & Capital</Link></li>
              <li><Link href="/#commercial-services">Commercial Solutions & Ads</Link></li>
              <li><Link href="/#about-us">About & Media Reach</Link></li>
            </ul>
          </div>

          {/* Column 3: Contact */}
          <div className={styles.col}>
            <h5>Reach Bihar Say</h5>
            <ul className={styles.contactList}>
              <li>
                <Mail size={15} color="#8FC6FF" />
                <a href="mailto:ask@biharsay.com">ask@biharsay.com</a>
              </li>
              <li>
                <MapPin size={15} color="#8FC6FF" />
                <span>
                  14A, Kailash Enclave, Shivpuri,<br />
                  Boring Road, Patna – 800023, Bihar
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className={styles.bottomBar}>
          <div className={styles.copy} suppressHydrationWarning>
            © {new Date().getFullYear()} Bihar Say Media Network. All rights reserved.
          </div>
          <div className={styles.socialRow}>
            <a href="https://www.facebook.com/BsayBihar?mibextid=LQQJ4d" target="_blank" rel="noreferrer" aria-label="Facebook">
              <Facebook size={13} /> <span>Facebook</span>
            </a>
            <span>·</span>
            <a href="https://www.instagram.com/bihar_say?igsh=MWRoMng4czJ1ZTFodA%3D%3D&utm_source=qr" target="_blank" rel="noreferrer" aria-label="Instagram">
              <Instagram size={13} /> <span>Instagram</span>
            </a>
            <span>·</span>
            <a href="https://www.linkedin.com/company/bihar-say/" target="_blank" rel="noreferrer" aria-label="LinkedIn">
              <Linkedin size={13} /> <span>LinkedIn</span>
            </a>
            <span>·</span>
            <a href="https://x.com/bsaybihar" target="_blank" rel="noreferrer" aria-label="X">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 24.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              <span>X</span>
            </a>
            <span>·</span>
            <a href="https://www.youtube.com/@biharsay5322" target="_blank" rel="noreferrer" aria-label="YouTube">
              <Youtube size={13} /> <span>YouTube</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
