import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, User, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';

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

  const MASTER_ADMIN = [
    "musicdistributionindia.in@gmail.com", 
    "summyskji@gmail.com",
    "admin@musicdistributionindia.in"
  ];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      setUser(authUser);
      if (authUser) {
        try {
          const docRef = doc(db, 'users', authUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setProfile(docSnap.data());
          } else {
            if (MASTER_ADMIN.includes(authUser.email || "")) {
               console.log("Master Admin detected, initial profile sync required.");
            }
            setProfile(null);
          }
          setConnectionError(null);
        } catch (err: any) {
          console.error("Profile fetch error:", err.code, err.message);
          if (err.code === 'unavailable' || err.message.includes('offline')) {
            setConnectionError("Firestore is unreachable. Operating in offline mode.");
          }
          setProfile(null);
          // Catch and rethrow with JSON Context for system diagnostics
          try {
            handleFirestoreError(err, OperationType.GET, `users/${authUser.uid}`);
          } catch (e) {
            // Error logged by handleFirestoreError
          }
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
