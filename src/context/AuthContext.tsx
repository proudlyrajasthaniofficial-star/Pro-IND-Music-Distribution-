import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, User, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, getDoc, getDocFromServer } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

interface AuthContextType {
  user: User | null;
  profile: any | null;
  loading: boolean;
  isAdmin: boolean;
  signOut: () => Promise<void>;
  connectionError: string | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  isAdmin: false,
  signOut: async () => {},
  connectionError: null,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const MASTER_ADMIN = ["musicdistributionindia.in@gmail.com", "summyskji@gmail.com"];

  useEffect(() => {
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, 'system', 'status'));
        setConnectionError(null);
      } catch (error: any) {
        if (error.message?.includes('client is offline')) {
          setConnectionError("Please check your Firebase configuration or wait for provisioning.");
        }
      }
    };
    testConnection();

    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      setUser(authUser);
      if (authUser) {
        try {
          const docRef = doc(db, 'users', authUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setProfile(docSnap.data());
          } else {
            console.log("No profile found for user:", authUser.uid);
            setProfile(null);
          }
        } catch (err: any) {
          console.error("Profile fetch error:", err.code, err.message);
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  const isAdmin = (user?.email && MASTER_ADMIN.includes(user.email)) || profile?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, profile, loading, isAdmin, signOut, connectionError }}>
      {children}
    </AuthContext.Provider>
  );
};
