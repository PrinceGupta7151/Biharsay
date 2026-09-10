import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Mail, Lock } from 'lucide-react';
import styles from '../legal.module.css';

export const metadata: Metadata = {
  title: 'Privacy Policy — Bihar Say Media',
  description: 'Learn how Bihar Say collects, protects, and handles your personal information when using our platform.',
};

export default function PrivacyPolicyPage() {
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
            <ShieldCheck size={14} />
            <span>Legal &amp; Compliance</span>
          </div>
          <h1 className={styles.title}>Privacy Policy</h1>
          <div className={styles.meta}>
            Last Updated: September 2026 · Effective Date: September 2026
          </div>
        </header>

        <div className={styles.content}>
          <p>
            Bihar Say Media Network (&quot;Bihar Say&quot;, &quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how your personal information is collected, used, and disclosed by Bihar Say when you visit our website (<strong>biharsay.com</strong>) or use our digital storytelling and community services.
          </p>

          <h2>1. Information We Collect</h2>
          <p>We collect information that you provide directly to us, including:</p>
          <ul>
            <li><strong>Account &amp; Authentication Information:</strong> When you sign in using Google SSO (Firebase Authentication), we receive your name, email address, profile photo URL, and authenticated user ID.</li>
            <li><strong>Community Contributions:</strong> Stories, comments, reaction metrics, and multimedia you submit through our editorial forms.</li>
            <li><strong>Newsletter &amp; Briefing Subscriptions:</strong> Email addresses or WhatsApp numbers provided when subscribing to The Bihar Brief.</li>
            <li><strong>Business Inquiries:</strong> Contact details, organization name, and service interests submitted via commercial inquiry forms.</li>
          </ul>

          <h2>2. How We Use Your Information</h2>
          <p>We use collected data for legitimate operational and community purposes, including:</p>
          <ul>
            <li>Displaying verified author attributions on published stories and comments.</li>
            <li>Delivering our weekly intelligence newsletter and community alerts.</li>
            <li>Responding to commercial partnership, sponsorship, and story pitch requests.</li>
            <li>Protecting the platform against spam, abusive submissions, and security vulnerabilities.</li>
            <li>Analyzing aggregate readership trends to curate more impactful coverage across Bihar&apos;s districts.</li>
          </ul>

          <h2>3. Data Protection &amp; Security</h2>
          <p>
            We implement industry-standard administrative, physical, and technical security safeguards. User authentication and database records are managed via Google Firebase / Cloud Firestore with strict security access rules. Sensitive keys and tokens are restricted and monitored.
          </p>

          <h2>4. Third-Party Services &amp; Advertising</h2>
          <p>
            Our website may integrate third-party tools such as Google AdSense, Firebase Analytics, and embedded media players (YouTube). These providers may use cookies or web beacons to serve contextually relevant advertisements and metrics. You may manage cookie preferences in your browser settings.
          </p>

          <h2>5. Your Rights</h2>
          <p>
            You have the right to request access to, correction of, or deletion of your personal account data at any time. You can also unsubscribe from email digests or WhatsApp broadcasts by clicking the unsubscribe link or contacting our privacy desk.
          </p>

          <div className={styles.contactBox}>
            <h4>Contact Our Privacy Desk</h4>
            <p>If you have any questions or data requests regarding this Privacy Policy, please contact:</p>
            <p>
              <strong>Email:</strong> <a href="mailto:neehar@biharsay.com">neehar@biharsay.com</a><br />
              <strong>Address:</strong> 14A, Kailash Enclave, Shivpuri, Boring Road, Patna – 800023, Bihar, India
            </p>
          </div>
        </div>
      </article>
    </main>
  );
}
