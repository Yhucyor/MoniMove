"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";

interface AdminGuardProps {
  children: React.ReactNode;
}

/**
 * AdminGuard — bảo vệ route chỉ cho Admin.
 * Redirect về /HomePage nếu không phải admin, về / nếu chưa đăng nhập.
 */
export default function AdminGuard({ children }: AdminGuardProps) {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/");
      return;
    }
    if (!isAdmin) {
      router.replace("/HomePage");
    }
  }, [user, loading, isAdmin, router]);

  if (loading || !user || !isAdmin) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-gradient-to-tr from-[#1e293b] via-[#1a2332] to-[#0f172a]">
        <div className="relative flex h-16 w-16 items-center justify-center">
          <div className="absolute h-full w-full rounded-full border-[4px] border-amber-400/20 border-t-amber-400 animate-spin" />
        </div>
        <p className="mt-4 text-xs font-semibold tracking-wider text-slate-400 uppercase">
          Đang xác thực quyền Admin...
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
