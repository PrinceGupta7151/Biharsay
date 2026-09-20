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
  const normalized = email.toLowerCase().trim();
  return ADMIN_EMAILS.some(adminEmail => adminEmail.toLowerCase().trim() === normalized);
}

// ------- Collection Names -------
const SUBMISSIONS = 'submissions';
const ALT_SUBMISSIONS = 'story_submissions';
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
    const subsMap = new Map<string, StorySubmission>();

    // 1. Query primary 'submissions' collection
    try {
      const snap1 = await getDocs(collection(db, SUBMISSIONS));
      snap1.docs.forEach((d) => {
        const data = d.data();
        subsMap.set(d.id, {
          id: d.id,
          ...data,
          createdAt: typeof data.createdAt === 'string'
            ? data.createdAt
            : data.serverTimestamp?.toDate?.()?.toISOString() || new Date().toISOString(),
        } as StorySubmission);
      });
    } catch (err) {
      console.warn('Error querying primary submissions:', err);
    }

    // 2. Query legacy/alternate 'story_submissions' collection
    try {
      const snap2 = await getDocs(collection(db, ALT_SUBMISSIONS));
      snap2.docs.forEach((d) => {
        if (!subsMap.has(d.id)) {
          const data = d.data();
          subsMap.set(d.id, {
            id: d.id,
            ...data,
            createdAt: typeof data.createdAt === 'string'
              ? data.createdAt
              : data.serverTimestamp?.toDate?.()?.toISOString() || new Date().toISOString(),
          } as StorySubmission);
        }
      });
    } catch (err) {
      console.warn('Error querying alt story_submissions:', err);
    }

    const result = Array.from(subsMap.values());
    // Sort in memory by createdAt descending (avoids composite index requirement)
    result.sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return timeB - timeA;
    });

    return result;
  } catch (err) {
    console.error('getAllSubmissions error:', err);
    return [];
  }
}

export async function getPendingSubmissions(): Promise<StorySubmission[]> {
  const all = await getAllSubmissions();
  return all.filter((s) => s.status === 'pending');
}

export async function approveSubmission(submissionId: string): Promise<boolean> {
  if (!firestoreReady() || !db) return false;
  try {
    // Check both collections for the submission
    let subSnap = await getDoc(doc(db, SUBMISSIONS, submissionId));
    let targetCollection = SUBMISSIONS;
    if (!subSnap.exists()) {
      subSnap = await getDoc(doc(db, ALT_SUBMISSIONS, submissionId));
      targetCollection = ALT_SUBMISSIONS;
    }
    if (!subSnap.exists()) return false;

    const data = subSnap.data() as StorySubmission;
    const storyId = `story-${submissionId}`;

    // Mark submission approved
    await updateDoc(doc(db, targetCollection, submissionId), { status: 'approved' });
    try {
      await updateDoc(doc(db, targetCollection === SUBMISSIONS ? ALT_SUBMISSIONS : SUBMISSIONS, submissionId), { status: 'approved' });
    } catch {}

    // Publish to stories collection with featured & hero flags for top card placement
    const defaultImage =
      (data as any).imageUrl ||
      'https://images.unsplash.com/photo-1571508601891-ca5e7a713859?auto=format&fit=crop&w=800&q=80';

    const now = new Date();
    await setDoc(doc(db, STORIES, storyId), {
      id: storyId,
      title: data.title,
      summary: data.content ? data.content.slice(0, 160) + '...' : '',
      content: data.content,
      category: data.category || 'Culture & Heritage',
      categorySlug: data.categorySlug || 'culture-heritage',
      date: now.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      author: data.authorName || 'Community Contributor',
      readTime: '3 min read',
      views: 1,
      imageUrl: defaultImage,
      isFeatured: true,
      isHero: true,
      featuredOrder: 0,
      createdAt: now.toISOString(),
      publishedAt: now.toISOString(),
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
    const updateData = {
      status: 'rejected',
      ...(reason ? { rejectionReason: reason } : {}),
    };
    try {
      await updateDoc(doc(db, SUBMISSIONS, submissionId), updateData);
    } catch {}
    try {
      await updateDoc(doc(db, ALT_SUBMISSIONS, submissionId), updateData);
    } catch {}
    return true;
  } catch (err) {
    console.error('rejectSubmission error:', err);
    return false;
  }
}

export async function deleteSubmission(submissionId: string): Promise<boolean> {
  if (!firestoreReady() || !db) return false;
  try {
    try {
      await deleteDoc(doc(db, SUBMISSIONS, submissionId));
    } catch {}
    try {
      await deleteDoc(doc(db, ALT_SUBMISSIONS, submissionId));
    } catch {}
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
    const [storiesSnap, subs, commentsSnap, subscribersSnap, inquiriesSnap] =
      await Promise.all([
        getDocs(collection(db, STORIES)).catch(() => null),
        getAllSubmissions().catch(() => []),
        getDocs(collection(db, COMMENTS)).catch(() => null),
        getDocs(collection(db, SUBSCRIBERS)).catch(() => null),
        getDocs(collection(db, INQUIRIES)).catch(() => null),
      ]);

    stats.totalStories = storiesSnap?.size ?? 0;
    stats.pendingSubmissions = subs.filter((s) => s.status === 'pending').length;
    stats.totalComments = commentsSnap?.size ?? 0;
    stats.totalSubscribers = subscribersSnap?.size ?? 0;
    stats.totalInquiries = inquiriesSnap?.size ?? 0;
  } catch (err) {
    console.error('getSiteStats error:', err);
  }

  return stats;
}
