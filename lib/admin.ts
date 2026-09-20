'use client';

import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  setDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '@/lib/firebase';
import {
  StorySubmission,
  Story,
  StoryComment,
  BusinessInquiry,
  NewsletterSubscriber,
} from '@/types';

// ------- Admin Authorization -------
const ADMIN_EMAILS: string[] = [
  'neehar@biharsay.com',
  'guptaprince202004@gmail.com',
  // Add more admin emails here
];

export function isAdminUser(email: string | null | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

// ------- Collection Names -------
const SUBMISSIONS = 'story_submissions';
const STORIES = 'stories';
const COMMENTS = 'comments';
const SUBSCRIBERS = 'newsletter_subscribers';
const INQUIRIES = 'business_queries';

// ------- Helper: Firestore ready -------
function firestoreReady(): boolean {
  return isFirebaseConfigured() && db !== null;
}

// ------- Submissions -------
export async function getAllSubmissions(): Promise<StorySubmission[]> {
  if (!firestoreReady() || !db) return [];
  try {
    const q = query(collection(db, SUBMISSIONS), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as StorySubmission));
  } catch (err) {
    console.error('getAllSubmissions error:', err);
    return [];
  }
}

export async function getPendingSubmissions(): Promise<StorySubmission[]> {
  if (!firestoreReady() || !db) return [];
  try {
    const q = query(
      collection(db, SUBMISSIONS),
      where('status', '==', 'pending'),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as StorySubmission));
  } catch (err) {
    console.error('getPendingSubmissions error:', err);
    return [];
  }
}

export async function approveSubmission(submissionId: string): Promise<boolean> {
  if (!firestoreReady() || !db) return false;
  try {
    const subRef = doc(db, SUBMISSIONS, submissionId);
    const subSnap = await getDoc(subRef);
    if (!subSnap.exists()) return false;

    const data = subSnap.data() as StorySubmission;
    const storyId = `story-${submissionId}`;

    // Mark submission approved
    await updateDoc(subRef, { status: 'approved' });

    // Publish to stories collection
    await setDoc(doc(db, STORIES, storyId), {
      id: storyId,
      title: data.title,
      summary: data.content.slice(0, 160) + '...',
      content: data.content,
      category: data.category,
      categorySlug: data.categorySlug,
      date: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      author: data.authorName,
      readTime: '3 min read',
      views: 1,
      imageUrl: '',
      createdAt: new Date().toISOString(),
      serverTimestamp: serverTimestamp(),
    });

    return true;
  } catch (err) {
    console.error('approveSubmission error:', err);
    return false;
  }
}

export async function rejectSubmission(
  submissionId: string,
  reason?: string
): Promise<boolean> {
  if (!firestoreReady() || !db) return false;
  try {
    const subRef = doc(db, SUBMISSIONS, submissionId);
    await updateDoc(subRef, {
      status: 'rejected',
      ...(reason ? { rejectionReason: reason } : {}),
    });
    return true;
  } catch (err) {
    console.error('rejectSubmission error:', err);
    return false;
  }
}

export async function deleteSubmission(submissionId: string): Promise<boolean> {
  if (!firestoreReady() || !db) return false;
  try {
    await deleteDoc(doc(db, SUBMISSIONS, submissionId));
    return true;
  } catch (err) {
    console.error('deleteSubmission error:', err);
    return false;
  }
}

// ------- Comments -------
export async function getAllComments(): Promise<(StoryComment & { id: string })[]> {
  if (!firestoreReady() || !db) return [];
  try {
    const q = query(collection(db, COMMENTS), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as StoryComment & { id: string }));
  } catch (err) {
    console.error('getAllComments error:', err);
    return [];
  }
}

export async function deleteComment(commentId: string): Promise<boolean> {
  if (!firestoreReady() || !db) return false;
  try {
    await deleteDoc(doc(db, COMMENTS, commentId));
    return true;
  } catch (err) {
    console.error('deleteComment error:', err);
    return false;
  }
}

// ------- Newsletter Subscribers -------
export async function getNewsletterSubscribers(): Promise<NewsletterSubscriber[]> {
  if (!firestoreReady() || !db) return [];
  try {
    const q = query(collection(db, SUBSCRIBERS), orderBy('subscribedAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as NewsletterSubscriber));
  } catch (err) {
    // If ordering by subscribedAt fails (index not created), fall back
    try {
      const snap = await getDocs(collection(db!, SUBSCRIBERS));
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as NewsletterSubscriber));
    } catch {
      return [];
    }
  }
}

export async function deleteSubscriber(subscriberId: string): Promise<boolean> {
  if (!firestoreReady() || !db) return false;
  try {
    await deleteDoc(doc(db, SUBSCRIBERS, subscriberId));
    return true;
  } catch (err) {
    console.error('deleteSubscriber error:', err);
    return false;
  }
}

// ------- Business Inquiries -------
export async function getBusinessInquiries(): Promise<BusinessInquiry[]> {
  if (!firestoreReady() || !db) return [];
  try {
    const q = query(collection(db, INQUIRIES), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as BusinessInquiry));
  } catch (err) {
    try {
      const snap = await getDocs(collection(db!, INQUIRIES));
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as BusinessInquiry));
    } catch {
      return [];
    }
  }
}

export async function markInquiryResolved(inquiryId: string): Promise<boolean> {
  if (!firestoreReady() || !db) return false;
  try {
    await updateDoc(doc(db, INQUIRIES, inquiryId), { status: 'resolved' });
    return true;
  } catch (err) {
    console.error('markInquiryResolved error:', err);
    return false;
  }
}

export async function deleteInquiry(inquiryId: string): Promise<boolean> {
  if (!firestoreReady() || !db) return false;
  try {
    await deleteDoc(doc(db, INQUIRIES, inquiryId));
    return true;
  } catch (err) {
    console.error('deleteInquiry error:', err);
    return false;
  }
}

// ------- Site Stats -------
export interface SiteStats {
  totalStories: number;
  pendingSubmissions: number;
  totalComments: number;
  totalSubscribers: number;
  totalInquiries: number;
}

export async function getSiteStats(): Promise<SiteStats> {
  const stats: SiteStats = {
    totalStories: 0,
    pendingSubmissions: 0,
    totalComments: 0,
    totalSubscribers: 0,
    totalInquiries: 0,
  };

  if (!firestoreReady() || !db) return stats;

  try {
    const [storiesSnap, subsSnap, commentsSnap, subscribersSnap, inquiriesSnap] =
      await Promise.all([
        getDocs(collection(db, STORIES)),
        getDocs(query(collection(db, SUBMISSIONS), where('status', '==', 'pending'))),
        getDocs(collection(db, COMMENTS)),
        getDocs(collection(db, SUBSCRIBERS)),
        getDocs(collection(db, INQUIRIES)),
      ]);

    stats.totalStories = storiesSnap.size;
    stats.pendingSubmissions = subsSnap.size;
    stats.totalComments = commentsSnap.size;
    stats.totalSubscribers = subscribersSnap.size;
    stats.totalInquiries = inquiriesSnap.size;
  } catch (err) {
    console.error('getSiteStats error:', err);
  }

  return stats;
}
