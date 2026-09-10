import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, FileText, CheckCircle2 } from 'lucide-react';
import styles from '../legal.module.css';

export const metadata: Metadata = {
  title: 'Terms of Service — Bihar Say Media',
  description: 'Terms and conditions governing the use of Bihar Say storytelling and community platform.',
};

export default function TermsOfServicePage() {
  return (
    <main className={styles.legalContainer}>
      <div className={styles.backRow}>
        <Link href="/" className={styles.backBtn}>
          <ArrowLeft size={16} />
          <span>Back to Home</span>
        </Link>
      </div>

      <article className={styles.legalCard}>
        <header className={styles.header}>
          <div className={styles.badge}>
            <FileText size={14} />
            <span>Community Agreement</span>
          </div>
          <h1 className={styles.title}>Terms of Service</h1>
          <div className={styles.meta}>
            Last Updated: September 2026 · Version 2.0
          </div>
        </header>

        <div className={styles.content}>
          <p>
            Welcome to Bihar Say (<strong>biharsay.com</strong>). By accessing or using our website, submitting stories, commenting, or interacting with our digital publications, you agree to be bound by these Terms of Service.
          </p>

          <h2>1. Community Submissions &amp; Editorial Moderation</h2>
          <p>
            Bihar Say is committed to high journalistic integrity and uplifting stories of innovation, grassroots enterprise, and heritage.
          </p>
          <ul>
            <li>All story submissions are subject to pre-publication editorial moderation and verification.</li>
            <li>Submitting a story does not guarantee publication on the platform. Bihar Say editors reserve the right to review, edit for clarity, or decline submissions that do not adhere to community standards.</li>
            <li>You warrant that all content you submit is your original work or you have acquired necessary rights and permissions to publish it.</li>
          </ul>

          <h2>2. Prohibited Conduct</h2>
          <p>Users agree not to engage in any activity that:</p>
          <ul>
            <li>Promotes hate speech, defamation, harassment, or unlawful content.</li>
            <li>Impersonates individuals or entities, or provides fraudulent business claims.</li>
            <li>Attempts to exploit, scrape, reverse-engineer, or compromise the security of Bihar Say or its underlying Firebase infrastructure.</li>
            <li>Spams promotional content, affiliate links, or unverified commercial advertisements without authorization.</li>
          </ul>

          <h2>3. Intellectual Property Rights</h2>
          <p>
            Bihar Say Media Network and its licensors retain ownership of all editorial designs, brand marks, logos, visual assets, and original published reports. Contributors retain copyright over their original submitted text, while granting Bihar Say a non-exclusive, worldwide, royalty-free license to display, syndicate, and archive the contribution.
          </p>

          <h2>4. Commercial &amp; MSME Services</h2>
          <p>
            Commercial inquiries, brand spotlight packages, and marketplace features (such as connections to the FrooteX seller ecosystem) are subject to specific commercial agreements and mutual service terms. Bihar Say is not liable for external third-party transactional disputes.
          </p>

          <h2>5. Disclaimers &amp; Limitation of Liability</h2>
          <p>
            Our content is provided for informational, cultural, and inspirational purposes &quot;as is&quot;. While we strive for factual accuracy, Bihar Say makes no warranties regarding the absolute completeness or timeliness of community-contributed pieces.
          </p>

          <div className={styles.contactBox}>
            <h4>Questions or Legal Notices</h4>
            <p>For inquiries regarding these Terms of Service or copyright licensing, reach out to:</p>
            <p>
              <strong>Editorial Director:</strong> Neehar R<br />
              <strong>Email:</strong> <a href="mailto:neehar@biharsay.com">neehar@biharsay.com</a><br />
              <strong>Office:</strong> 14A, Kailash Enclave, Shivpuri, Boring Road, Patna – 800023, Bihar, India
            </p>
          </div>
        </div>
      </article>
    </main>
  );
}
