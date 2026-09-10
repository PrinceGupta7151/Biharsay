'use client';

import React, { useState } from 'react';
import { Play, Video, X, Film, ExternalLink } from 'lucide-react';
import styles from './CommunityStrip.module.css';

export interface CommunityVideo {
  id: string;
  youtubeId: string;
  title: string;
  type: 'Podcast Episode' | 'Viral Short';
  duration: string;
  thumbnail: string;
  author: string;
  tag: string;
  url: string;
}

export const COMMUNITY_VIDEOS: CommunityVideo[] = [
  {
    id: 'patwatoli-iit',
    youtubeId: 'enVVDxvN16k',
    title: 'Secret of Patwatoli: IIT JEE Crack करना इतना आसान कैसे? | Chandrakant Pateshwari',
    type: 'Podcast Episode',
    duration: 'Full Podcast',
    thumbnail: 'https://i.ytimg.com/vi/enVVDxvN16k/hqdefault.jpg',
    author: 'BiharCast · Special Interview',
    tag: 'Education & Inspiration',
    url: 'https://youtu.be/enVVDxvN16k?si=ZQKU89H3NI4zYgHy',
  },
  {
    id: 'vaibhav-ipl',
    youtubeId: 'oZJ1Psapbik',
    title: 'Vaibhav ने जो किया, सरकार ₹2000 करोड़ खर्च करके भी नहीं कर सकती! Neeraj Jha',
    type: 'Podcast Episode',
    duration: 'Full Podcast',
    thumbnail: 'https://i.ytimg.com/vi/oZJ1Psapbik/hqdefault.jpg',
    author: 'BiharCast · Neeraj Jha',
    tag: 'Sports & Resurgence',
    url: 'https://youtu.be/oZJ1Psapbik?si=bCpfhDgbTAtYAQzD',
  },
  {
    id: 'zero-to-100cr',
    youtubeId: 'AplQJNwM7ZA',
    title: 'Zero to 100Cr Mindset: The Bihari Entrepreneurial Spirit',
    type: 'Viral Short',
    duration: 'Short · 1 Min',
    thumbnail: 'https://i.ytimg.com/vi/AplQJNwM7ZA/hqdefault.jpg',
    author: 'BiharCast',
    tag: 'Startups & Scale',
    url: 'https://youtube.com/shorts/AplQJNwM7ZA?si=IsnGCCV9YGbR33xo',
  },
  {
    id: 'bihar-rail-engine',
    youtubeId: 'FWJrVMVkXTU',
    title: 'Bihar Goes Global! Rail Engine Exported to Africa 🚂🌍',
    type: 'Viral Short',
    duration: 'Short · 1 Min',
    thumbnail: 'https://i.ytimg.com/vi/FWJrVMVkXTU/hqdefault.jpg',
    author: 'BiharCast',
    tag: 'Manufacturing & Tech',
    url: 'https://youtube.com/shorts/FWJrVMVkXTU?si=j4rqxKDltVHB903X',
  },
  {
    id: 'bihari-workforce',
    youtubeId: '0cW-pyrtfLI',
    title: 'Bihari Workforce: Backbone of India’s Top Companies 🔥',
    type: 'Viral Short',
    duration: 'Short · 1 Min',
    thumbnail: 'https://i.ytimg.com/vi/0cW-pyrtfLI/hqdefault.jpg',
    author: 'BiharCast',
    tag: 'Economy & Pride',
    url: 'https://youtube.com/shorts/0cW-pyrtfLI?si=dtj_a9d4sOjn9aF8',
  },
];

export default function CommunityStrip() {
  const [selectedVideo, setSelectedVideo] = useState<CommunityVideo>(COMMUNITY_VIDEOS[0]);
  const [isPlayingModal, setIsPlayingModal] = useState(false);
  const [modalVideo, setModalVideo] = useState<CommunityVideo>(COMMUNITY_VIDEOS[0]);

  const handlePlayVideo = (video: CommunityVideo) => {
    setModalVideo(video);
    setIsPlayingModal(true);
  };

  return (
    <>
      <section className={`${styles.communityStrip} reveal`} id="video-series">
        {/* Top Header Row */}
        <div className={styles.sectionHeader}>
          <div className={styles.headerLeft}>
            <div className={styles.badge}>
              <Video size={13} />
              <span>ORIGINAL VIDEO SERIES · BIHARCAST &amp; BIHAR SAY</span>
            </div>
            <h2 className={styles.sectionTitle}>
              Watch Stories From Bihar&apos;s Changemakers &amp; Innovators
            </h2>
            <p className={styles.sectionDesc}>
              Deep-dive podcasts, grassroots success stories, and inspiring episodes documenting modern Bihar.
            </p>
          </div>
          <div className={styles.headerRight}>
            <a 
              href="https://www.youtube.com/@BiharCastYT" 
              target="_blank" 
              rel="noopener noreferrer"
              className={styles.channelBtn}
            >
              <span>Watch on YouTube</span>
              <ExternalLink size={14} />
            </a>
          </div>
        </div>

        {/* Video Showcase Layout: Big Hero + Playlist Sidebar */}
        <div className={styles.showcaseGrid}>
          {/* Main Featured Video Player */}
          <div className={styles.featuredSlot}>
            <div 
              className={styles.featuredThumbWrap}
              onClick={() => handlePlayVideo(selectedVideo)}
            >
              <img 
                src={selectedVideo.thumbnail} 
                alt={selectedVideo.title}
                className={styles.featuredImg}
              />
              <div className={styles.videoOverlay} />
              
              <button 
                className={styles.playButton} 
                aria-label={`Play ${selectedVideo.title}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handlePlayVideo(selectedVideo);
                }}
              >
                <Play size={24} fill="#0F172A" color="#0F172A" />
              </button>

              <div className={styles.featuredBadges}>
                <span className={styles.videoTypeBadge}>{selectedVideo.type}</span>
                <span className={styles.videoDurationBadge}>{selectedVideo.duration}</span>
              </div>
            </div>

            <div className={styles.featuredMeta}>
              <span className={styles.metaCategory}>{selectedVideo.tag} · {selectedVideo.author}</span>
              <h3 className={styles.metaTitle} onClick={() => handlePlayVideo(selectedVideo)}>
                {selectedVideo.title}
              </h3>
              <div className={styles.metaActionRow}>
                <button 
                  className={styles.btnWatchNow}
                  onClick={() => handlePlayVideo(selectedVideo)}
                >
                  <Play size={14} fill="#FFFFFF" />
                  <span>Play Episode</span>
                </button>
                <a 
                  href={selectedVideo.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={styles.metaDirectLink}
                >
                  Open on YouTube ↗
                </a>
              </div>
            </div>
          </div>

          {/* Playlist Column (All 5 videos) */}
          <div className={styles.playlistCol}>
            <div className={styles.playlistHeader}>
              <Film size={14} />
              <span>Episodes &amp; Shorts ({COMMUNITY_VIDEOS.length})</span>
            </div>

            <div className={styles.playlistItems}>
              {COMMUNITY_VIDEOS.map((video) => {
                const isSelected = video.id === selectedVideo.id;
                return (
                  <div 
                    key={video.id}
                    className={`${styles.playlistItem} ${isSelected ? styles.playlistItemActive : ''}`}
                    onClick={() => {
                      setSelectedVideo(video);
                      handlePlayVideo(video);
                    }}
                  >
                    <div className={styles.itemThumbBox}>
                      <img 
                        src={video.thumbnail} 
                        alt={video.title}
                        className={styles.itemThumb}
                      />
                      <div className={styles.itemPlayOverlay}>
                        <Play size={12} fill="#FFFFFF" color="#FFFFFF" />
                      </div>
                    </div>

                    <div className={styles.itemDetails}>
                      <div className={styles.itemTypeRow}>
                        <span className={styles.itemType}>{video.type}</span>
                        <span className={styles.itemDuration}>{video.duration}</span>
                      </div>
                      <h4 className={styles.itemTitle}>
                        {video.title}
                      </h4>
                      <span className={styles.itemAuthor}>{video.author}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Video Modal Player */}
      {isPlayingModal && (
        <div className="modal-backdrop" onClick={() => setIsPlayingModal(false)}>
          <div className={styles.videoModalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalTopBar}>
              <div className={styles.modalTitleText}>
                <span className={styles.modalBadge}>{modalVideo.type}</span>
                <span className={styles.modalHeading}>{modalVideo.title}</span>
              </div>
              <button 
                className={styles.modalCloseBtn}
                onClick={() => setIsPlayingModal(false)}
                aria-label="Close video player"
              >
                <X size={20} />
              </button>
            </div>
            <div className={styles.iframeWrap}>
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${modalVideo.youtubeId}?autoplay=1&rel=0`}
                title={modalVideo.title}
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
