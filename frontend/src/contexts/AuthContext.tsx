"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "../core/config/firebase";
import { verifyAuthToken } from "../services/api";

export interface UserSession {
  email: string;
  name: string;
  avatar: string;
  role: "user" | "admin";
  deviceIds: string[];
}

interface AuthContextType {
  user: UserSession | null;
  loading: boolean;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  syncSession: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const AUTH_KEYS = [
  "firebase_token",
  "user_role",
  "user_name",
  "user_email",
  "user_avatar",
  "user_device_ids",
];

function loadUserFromStorage(): UserSession | null {
  if (typeof window === "undefined") return null;

  const token = localStorage.getItem("firebase_token");
  const email = localStorage.getItem("user_email");
  if (!token || !email) return null;

  let deviceIds: string[] = [];
  try {
    const stored = localStorage.getItem("user_device_ids");
    if (stored) deviceIds = JSON.parse(stored);
  } catch {
    deviceIds = [];
  }

  return {
    email,
    name: localStorage.getItem("user_name") || "Người dùng",
    avatar: localStorage.getItem("user_avatar") || "",
    role: (localStorage.getItem("user_role") as "user" | "admin") || "user",
    deviceIds,
  };
}

function saveUserToStorage(user: UserSession, token: string) {
  localStorage.setItem("firebase_token", token);
  localStorage.setItem("user_role", user.role);
  localStorage.setItem("user_name", user.name);
  localStorage.setItem("user_email", user.email);
  localStorage.setItem("user_avatar", user.avatar);
  localStorage.setItem("user_device_ids", JSON.stringify(user.deviceIds));

  if (typeof document !== "undefined") {
    document.cookie = `monimove_auth=1; path=/; max-age=${7 * 86400}; SameSite=Lax`;
    document.cookie = `monimove_role=${user.role}; path=/; max-age=${7 * 86400}; SameSite=Lax`;
  }
}

function clearAuthCookies() {
  if (typeof document !== "undefined") {
    document.cookie = "monimove_auth=; path=/; max-age=0";
    document.cookie = "monimove_role=; path=/; max-age=0";
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const syncSession = useCallback(() => {
    setUser(loadUserFromStorage());
    setLoading(false);
  }, []);

  const refreshUser = useCallback(async () => {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) {
      setUser(null);
      return;
    }

    const idToken = await firebaseUser.getIdToken(true);
    const authResponse = await verifyAuthToken(idToken);

    if (authResponse.success && authResponse.user) {
      const session: UserSession = {
        email: authResponse.user.email,
        name: authResponse.user.name,
        avatar: authResponse.user.avatar,
        role: authResponse.user.role,
        deviceIds: authResponse.user.deviceIds || [],
      };
      saveUserToStorage(session, idToken);
      setUser(session);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await signOut(auth);
    } catch {
      // ignore
    }
    AUTH_KEYS.forEach((key) => localStorage.removeItem(key));
    clearAuthCookies();
    setUser(null);
    router.push("/");
  }, [router]);

  useEffect(() => {
    const token = localStorage.getItem("firebase_token");
    if (!token) {
      setLoading(false);
      return;
    }

    setUser(loadUserFromStorage());

    if (typeof document !== "undefined") {
      const role = localStorage.getItem("user_role") || "user";
      document.cookie = `monimove_auth=1; path=/; max-age=${7 * 86400}; SameSite=Lax`;
      document.cookie = `monimove_role=${role}; path=/; max-age=${7 * 86400}; SameSite=Lax`;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Luôn lấy token mới từ Firebase (tự động refresh nếu sắp hết hạn)
          const freshToken = await firebaseUser.getIdToken(true);
          localStorage.setItem("firebase_token", freshToken);
        } catch {
          // Nếu không refresh được, giữ nguyên token cũ
        }
        setLoading(false);
      } else {
        // Firebase session thực sự hết — kiểm tra localStorage
        const currentToken = localStorage.getItem("firebase_token");
        if (!currentToken) {
          setUser(null);
          setLoading(false);
          return;
        }
        setLoading(false);
      }
    });

    // Auto-refresh token mỗi 45 phút (token Firebase hết hạn sau 60 phút)
    const refreshInterval = setInterval(
      async () => {
        const firebaseUser = auth.currentUser;
        if (firebaseUser) {
          try {
            const freshToken = await firebaseUser.getIdToken(true);
            localStorage.setItem("firebase_token", freshToken);
          } catch {
            // ignore
          }
        }
      },
      45 * 60 * 1000,
    );

    return () => {
      unsubscribe();
      clearInterval(refreshInterval);
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        logout,
        refreshUser,
        syncSession,
        isAdmin: user?.role === "admin",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth phải được dùng trong AuthProvider");
  }
  return context;
}

export function getDashboardPath(role: "user" | "admin") {
  return role === "admin" ? "/admin" : "/HomePage";
}
