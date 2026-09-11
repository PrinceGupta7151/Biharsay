'use client';

import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, MessageSquare, Sparkles, Send, Phone, Building, Mail, User } from 'lucide-react';
import { saveBusinessInquiry } from '@/lib/db';
import styles from './BusinessInquiryModal.module.css';

export const BUSINESS_SERVICES = [
  { id: 'makhana-sample', label: 'Makhana Sample (Bulk Buy)', category: 'Sourcing' },
  { id: 'banana-fibre', label: 'Banana Fibre Bags', category: 'Eco-Packaging' },
  { id: 'digital-standee', label: 'Digital Standee Display', category: 'Event & Retail Tech' },
  { id: 'performance-marketing', label: 'Performance Marketing & Google Ads', category: 'Growth & Ads' },
  { id: 'influencer-marketing', label: 'Influencer & Creator Marketing', category: 'Branding' },
  { id: 'founder-story', label: 'Feature My Brand / Founder Story', category: 'Editorial' },
];

interface BusinessInquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultService?: string;
}

export default function BusinessInquiryModal({
  isOpen,
  onClose,
  defaultService = 'makhana-sample',
}: BusinessInquiryModalProps) {
  const [selectedService, setSelectedService] = useState(defaultService);
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (defaultService) {
      setSelectedService(defaultService);
    }
  }, [defaultService]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !email.trim()) return;

    setIsSubmitting(true);
    try {
      const activeServiceLabel = BUSINESS_SERVICES.find(s => s.id === selectedService)?.label || selectedService;
      await saveBusinessInquiry({
        service: activeServiceLabel,
        name: name.trim(),
        company: company.trim() || 'Not specified',
        email: email.trim(),
        phone: phone.trim(),
        message: message.trim(),
      });
      setIsSuccess(true);
    } catch (err) {
      console.error('Inquiry submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setIsSuccess(false);
    setName('');
    setCompany('');
    setEmail('');
    setPhone('');
    setMessage('');
    onClose();
  };

  const activeServiceObj = BUSINESS_SERVICES.find(s => s.id === selectedService) || BUSINESS_SERVICES[0];

  const handleWhatsAppDirect = () => {
    const text = encodeURIComponent(
      `Hi Bihar Say Team! I would like to inquire about *${activeServiceObj.label}*.\n\nMy Name: ${name || '[My Name]'}\nCompany: ${company || '[My Brand]'}\nContact: ${phone || '[My Phone]'}`
    );
    window.open(`https://api.whatsapp.com/send?phone=918050083233&text=${text}`, '_blank');
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close modal">
          <X size={20} />
        </button>

        {isSuccess ? (
          <div className={styles.successView}>
            <div className={styles.successIconWrap}>
              <CheckCircle2 size={54} color="#10B981" />
            </div>
            <h3>Inquiry Received!</h3>
            <p>
              Thank you for reaching out regarding <strong>{activeServiceObj.label}</strong>. Our business development team will contact you within <strong>4 business hours</strong>.
            </p>
            <div className={styles.successActions}>
              <button className={styles.btnWhatsApp} onClick={handleWhatsAppDirect}>
                <MessageSquare size={16} />
                <span>Connect Instantly on WhatsApp</span>
              </button>
              <button className={styles.btnSecondary} onClick={handleReset}>
                Done
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className={styles.header}>
              <div className={styles.badge}>
                <Sparkles size={13} color="#1D6FD8" />
                <span>Bihar Say Commercial & Partnerships</span>
              </div>
              <h2>Partner With Bihar Say</h2>
              <p>
                Reach 2.4M+ monthly impressions or source authentic Bihar-manufactured products directly.
              </p>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              {/* Service Selection Chips */}
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Select Service / Product</label>
                <div className={styles.servicesGrid}>
                  {BUSINESS_SERVICES.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      className={`${styles.serviceChip} ${selectedService === s.id ? styles.activeChip : ''}`}
                      onClick={() => setSelectedService(s.id)}
                    >
                      <span className={styles.serviceName}>{s.label}</span>
                      <span className={styles.serviceTag}>{s.category}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.inputRow}>
                <div className={styles.fieldGroup}>
                  <label className={styles.label} htmlFor="inq-name">
                    <User size={13} /> Full Name *
                  </label>
                  <input
                    id="inq-name"
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={styles.input}
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.label} htmlFor="inq-company">
                    <Building size={13} /> Brand / Organization
                  </label>
                  <input
                    id="inq-company"
                    type="text"
                    placeholder="e.g. Mithila Naturals / AgriCorp"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className={styles.input}
                  />
                </div>
              </div>

              <div className={styles.inputRow}>
                <div className={styles.fieldGroup}>
                  <label className={styles.label} htmlFor="inq-email">
                    <Mail size={13} /> Business Email *
                  </label>
                  <input
                    id="inq-email"
                    type="email"
                    required
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={styles.input}
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.label} htmlFor="inq-phone">
                    <Phone size={13} /> Mobile / WhatsApp *
                  </label>
                  <input
                    id="inq-phone"
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={styles.input}
                  />
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="inq-notes">
                  Project Details / Quantity / Budget
                </label>
                <textarea
                  id="inq-notes"
                  rows={3}
                  placeholder="Share details (e.g. Need 500kg Makhana samples for export / Interested in Digital Standees for 3 store locations in Patna)..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className={styles.textarea}
                />
              </div>

              <div className={styles.formFooter}>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={styles.submitBtn}
                >
                  <Send size={15} />
                  <span>{isSubmitting ? 'Submitting Inquiry...' : 'Submit Business Inquiry'}</span>
                </button>

                <button
                  type="button"
                  className={styles.whatsAppQuickBtn}
                  onClick={handleWhatsAppDirect}
                  title="Chat directly on WhatsApp"
                >
                  <MessageSquare size={15} />
                  <span>Chat on WhatsApp</span>
                </button>
              </div>

              <div className={styles.directContactFooter}>
                <span>Or reach us directly:</span>
                <a href="https://wa.me/918050083233" target="_blank" rel="noopener noreferrer">
                  Chat on WhatsApp
                </a>
                <span className={styles.sepDot}>•</span>
                <a href="mailto:neehar@biharsay.com">
                  neehar@biharsay.com
                </a>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
