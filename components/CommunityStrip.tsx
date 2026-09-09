'use client';

import React, { useState } from 'react';
import { Play, Video, X } from 'lucide-react';
import styles from './CommunityStrip.module.css';

export default function CommunityStrip() {
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);

  return (
    <>
      <div className={`${styles.communityStrip} reveal`}>
        <div className={styles.copy}>
          <div className={styles.badge}>
            <Video size={14} />
            <span>ORIGINAL SERIES</span>
          </div>
          <h2>Watch stories from Bihar&apos;s changemakers</h2>
          <p>
            Video spotlights on the visionary founders, progressive farmers, and grassroots creators shaping Bihar&apos;s modern growth — new episodes premiering weekly.
          </p>
          <div className={styles.btnRow}>
            <button 
              className="btn-join"
              onClick={() => setIsPlayingVideo(true)}
            >
              <Play size={14} fill="#FFFFFF" />
              <span>Watch Latest Episode</span>
            </button>
            <a 
              href="https://www.youtube.com/@biharsay" 
              target="_blank" 
              rel="noopener noreferrer"
              className={styles.channelLink}
            >
              Subscribe on YouTube ↗
            </a>
          </div>
        </div>

        <div className={styles.videoSlot} onClick={() => setIsPlayingVideo(true)}>
          <div className={styles.videoOverlay} />
          <button className={styles.playButton} aria-label="Play video teaser">
            <Play size={22} fill="#0F172A" color="#0F172A" />
          </button>
          <span className={styles.videoBadge}>EPISODE 14 · 12 MIN</span>
        </div>
      </div>

      {/* Video Modal */}
      {isPlayingVideo && (
        <div className="modal-backdrop" onClick={() => setIsPlayingVideo(false)}>
          <div className={styles.videoModalCard} onClick={(e) => e.stopPropagation()}>
            <button 
              className={styles.modalCloseBtn}
              onClick={() => setIsPlayingVideo(false)}
            >
              <X size={20} />
            </button>
            <div className={styles.iframeWrap}>
              <iframe
                src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1"
                title="Bihar Say Changemakers Video Series"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
