'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../src/contexts/AuthContext';
// useOfflineSync đã được mount trong layout qua OfflineSyncProvider
import AdminSidebar from '../../src/component/layout/AdminSidebar';
import Header from '../../src/component/layout/Header';
import AdminOverviewTab from '../../src/features/admin/AdminOverviewTab';
import UsersManagementTab from '../../src/features/admin/UsersManagementTab';
import DevicesOverviewTab from '../../src/features/admin/DevicesOverviewTab';
import AdminSettingsTab from '../../src/features/admin/AdminSettingsTab';

export default function AdminPage() {
  const router = useRouter();
  const { user, loading, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push('/');
      return;
    }

    if (!isAdmin) {
      router.push('/HomePage');
    }
  }, [user, loading, isAdmin, router]);

  if (loading || !user || !isAdmin) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-gradient-to-tr from-[#1e293b] via-[#1a2332] to-[#0f172a]">
        <div className="relative flex h-16 w-16 items-center justify-center">
          <div className="absolute h-full w-full rounded-full border-[4px] border-amber-400/20 border-t-amber-400 animate-spin" />
        </div>
        <p className="mt-4 text-xs font-semibold tracking-wider text-slate-400 uppercase">Đang xác thực quyền Admin...</p>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <AdminOverviewTab />;
      case 'users':
        return <UsersManagementTab />;
      case 'devices':
        return <DevicesOverviewTab />;
      case 'settings':
        return <AdminSettingsTab />;
      default:
        return <AdminOverviewTab />;
    }
  };

  return (
    <div className="h-screen w-screen flex bg-slate-50 overflow-hidden font-sans text-slate-800 relative">
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-transparent"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <AdminSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <main className="flex-1 h-full w-full relative overflow-hidden bg-slate-50">
        <Header onOpenSidebar={() => setIsSidebarOpen(true)} title="Bảng điều khiển Admin" />

        <div className="h-full w-full pt-[76px] px-4 md:px-8 pb-10 overflow-y-auto overflow-x-hidden relative z-20">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
