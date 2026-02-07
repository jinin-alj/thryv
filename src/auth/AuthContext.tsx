import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { User } from "firebase/auth";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { auth } from "../firebase/firebase";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function mapFirebaseError(code?: string): string {
  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
      return "Incorrect email or password.";

    case "auth/user-not-found":
      return "No account found with this email.";

    case "auth/email-already-in-use":
      return "An account already exists with this email.";

    case "auth/weak-password":
      return "Password must be at least 6 characters.";

    case "auth/invalid-email":
      return "Please enter a valid email address.";

    case "auth/missing-password":
      return "Please enter your password.";

    default:
      return "Something went wrong. Please try again.";
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,

      async signIn(email, password) {
        try {
          await signInWithEmailAndPassword(
            auth,
            email.trim().toLowerCase(),
            password
          );
        } catch (error: any) {
          const message = mapFirebaseError(error?.code);
          throw new Error(message);
        }
      },

      async signUp(email, password) {
        try {
          await createUserWithEmailAndPassword(
            auth,
            email.trim().toLowerCase(),
            password
          );
        } catch (error: any) {
          const message = mapFirebaseError(error?.code);
          throw new Error(message);
        }
      },

      async signOut() {
        await firebaseSignOut(auth);
      },
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
