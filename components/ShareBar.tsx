'use client';

import React, { useState, useEffect } from 'react';
import { Share2, Check, Copy, MessageCircle } from 'lucide-react';
import styles from './ShareBar.module.css';

interface ShareBarProps {
  title: string;
  url?: string;
}

export default function ShareBar({ title, url }: ShareBarProps) {
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState<string>(url || '');
  const [canNativeShare, setCanNativeShare] = useState<boolean>(false);

  useEffect(() => {
    // Safely sync window.location and navigator capabilities after hydration
    if (!url && typeof window !== 'undefined') {
      setShareUrl(window.location.href);
    }
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      setCanNativeShare(true);
    }
  }, [url]);

  const shareText = `Check out this story on Bihar Say: "${title}"`;

  const handleCopyLink = async () => {
    const linkToCopy = shareUrl || (typeof window !== 'undefined' ? window.location.href : '');
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(linkToCopy);
      } else {
        throw new Error('Clipboard API unavailable');
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      window.prompt('Copy this link:', linkToCopy);
    }
  };

  const handleNativeShare = async () => {
    const activeUrl = shareUrl || (typeof window !== 'undefined' ? window.location.href : '');
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title,
          text: shareText,
          url: activeUrl,
        });
      } catch {
        // User cancelled or share dismissed
      }
    } else {
      handleCopyLink();
    }
  };

  const activeUrl = shareUrl || '';
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText}\n${activeUrl}`)}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(activeUrl)}&via=biharsay`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(activeUrl)}`;

  return (
    <div className={styles.shareBar}>
      <span className={styles.shareLabel}>
        <Share2 size={15} />
        <span>Share:</span>
      </span>

      <div className={styles.btnRow}>
        {/* WhatsApp Button */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`${styles.shareBtn} ${styles.whatsappBtn}`}
          title="Share on WhatsApp"
        >
          <MessageCircle size={15} />
          <span>WhatsApp</span>
        </a>

        {/* X / Twitter Button */}
        <a
          href={twitterUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`${styles.shareBtn} ${styles.twitterBtn}`}
          title="Share on X"
        >
          <span>𝕏 Post</span>
        </a>

        {/* LinkedIn Button */}
        <a
          href={linkedinUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`${styles.shareBtn} ${styles.linkedinBtn}`}
          title="Share on LinkedIn"
        >
          <span>LinkedIn</span>
        </a>

        {/* Copy Link Button */}
        <button
          type="button"
          className={`${styles.shareBtn} ${styles.copyBtn}`}
          onClick={handleCopyLink}
          title="Copy article link"
        >
          {copied ? <Check size={14} color="#10B981" /> : <Copy size={14} />}
          <span>{copied ? 'Copied!' : 'Copy Link'}</span>
        </button>

        {/* Mobile Native Share Trigger (Only shown after client hydration confirms support) */}
        {canNativeShare && (
          <button
            type="button"
            className={`${styles.shareBtn} ${styles.nativeBtn}`}
            onClick={handleNativeShare}
            title="More share options"
          >
            <Share2 size={14} />
            <span>More</span>
          </button>
        )}
      </div>

      {copied && (
        <div className={styles.toast}>
          Link copied to clipboard!
        </div>
      )}
    </div>
  );
}
