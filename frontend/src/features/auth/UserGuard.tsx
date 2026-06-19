"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";

interface UserGuardProps {
  children: React.ReactNode;
}

/**
 * UserGuard — bảo vệ route chỉ cho User đã đăng nhập.
 * Redirect về / nếu chưa đăng nhập.
 * Redirect về /admin nếu là admin.
 */
export default function UserGuard({ children }: UserGuardProps) {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/");
      return;
    }
    if (isAdmin) {
      router.replace("/admin");
    }
  }, [user, loading, isAdmin, router]);

  if (loading || !user || isAdmin) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-gradient-to-tr from-[#eef7f8] via-[#f4f3f8] to-[#fbeff5]">
        <div className="relative flex h-16 w-16 items-center justify-center">
          <div className="absolute h-full w-full rounded-full border-[4px] border-[#00b494]/20 border-t-[#00b494] animate-spin" />
          <div className="h-6 w-6 rounded-full bg-gradient-to-br from-[#12a1c0] to-[#00b494] animate-pulse" />
        </div>
        <p className="mt-4 text-xs font-semibold tracking-wider text-slate-500 uppercase animate-pulse">
          Đang kiểm tra quyền truy cập...
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
