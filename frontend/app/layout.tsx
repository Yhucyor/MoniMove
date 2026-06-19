import type { Metadata } from "next";
import "./globals.css";
import BackendStatus from "../src/component/BackendStatus";
import { AuthProvider } from "../src/contexts/AuthContext";
import { NotificationProvider } from "../src/contexts/NotificationContext";
import { OfflineSyncProvider } from "../src/contexts/OfflineSyncContext";

export const metadata: Metadata = {
  title: "MoveMonitor — IoT Tracking",
  description: "Hệ thống giám sát hành trình và phát hiện va chạm thời gian thực",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <NotificationProvider>
            {/* OfflineSyncProvider — singleton, chạy 1 lần toàn app */}
            <OfflineSyncProvider>
              {children}
            </OfflineSyncProvider>
            <BackendStatus />
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
