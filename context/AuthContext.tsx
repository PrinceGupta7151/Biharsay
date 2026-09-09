'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  signInWithPopup, 
  updateProfile 
} from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from '@/lib/firebase';
import { UserProfile } from '@/types';

interface AuthContextType {
  user: UserProfile | null;
  firebaseUser: User | null;
  loading: boolean;
  isFirebaseLive: boolean;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  isSubmitModalOpen: boolean;
  openSubmitModal: () => void;
  closeSubmitModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const isFirebaseLive = isFirebaseConfigured();

  useEffect(() => {
    // Check if running live Firebase Auth or demo state
    if (isFirebaseLive && auth) {
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setFirebaseUser(currentUser);
        if (currentUser) {
          setUser({
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName || currentUser.email?.split('@')[0] || 'Bihari Member',
            photoURL: currentUser.photoURL,
          });
        } else {
          setUser(null);
        }
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      // Demo / fallback local auth persistence
      const savedUser = localStorage.getItem('biharsay_demo_user');
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch {
          setUser(null);
        }
      }
      setLoading(false);
    }
  }, [isFirebaseLive]);

  const signInWithEmail = async (email: string, pass: string) => {
    if (isFirebaseLive && auth) {
      await signInWithEmailAndPassword(auth, email, pass);
    } else {
      // Demo login
      const demoUser: UserProfile = {
        uid: 'demo-' + Date.now(),
        email,
        displayName: email.split('@')[0] || 'Community Voice',
        photoURL: null,
      };
      setUser(demoUser);
      localStorage.setItem('biharsay_demo_user', JSON.stringify(demoUser));
    }
    setIsAuthModalOpen(false);
  };

  const signUpWithEmail = async (email: string, pass: string, name: string) => {
    if (isFirebaseLive && auth) {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      if (cred.user) {
        await updateProfile(cred.user, { displayName: name });
        setUser({
          uid: cred.user.uid,
          email: cred.user.email,
          displayName: name,
          photoURL: cred.user.photoURL,
        });
      }
    } else {
      // Demo signup
      const demoUser: UserProfile = {
        uid: 'demo-' + Date.now(),
        email,
        displayName: name || email.split('@')[0],
        photoURL: null,
      };
      setUser(demoUser);
      localStorage.setItem('biharsay_demo_user', JSON.stringify(demoUser));
    }
    setIsAuthModalOpen(false);
  };

  const signInWithGoogle = async () => {
    if (isFirebaseLive && auth && googleProvider) {
      await signInWithPopup(auth, googleProvider);
    } else {
      // Demo Google login
      const demoUser: UserProfile = {
        uid: 'google-demo-' + Date.now(),
        email: 'bihari.creator@gmail.com',
        displayName: 'Aarav Kumar (Demo)',
        photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
      };
      setUser(demoUser);
      localStorage.setItem('biharsay_demo_user', JSON.stringify(demoUser));
    }
    setIsAuthModalOpen(false);
  };

  const logout = async () => {
    if (isFirebaseLive && auth) {
      await signOut(auth);
    } else {
      localStorage.removeItem('biharsay_demo_user');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        loading,
        isFirebaseLive,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        logout,
        isAuthModalOpen,
        openAuthModal: () => setIsAuthModalOpen(true),
        closeAuthModal: () => setIsAuthModalOpen(false),
        isSubmitModalOpen,
        openSubmitModal: () => setIsSubmitModalOpen(true),
        closeSubmitModal: () => setIsSubmitModalOpen(false),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
