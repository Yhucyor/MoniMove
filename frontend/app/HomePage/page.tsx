'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
<<<<<<< HEAD
import { useAuth } from '../../src/contexts/AuthContext';
import { useDeviceStatusMonitor } from '../../src/hooks/useDeviceStatusMonitor';
// useOfflineSync đã được mount trong layout qua OfflineSyncProvider — không cần gọi lại ở đây
=======
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../src/core/config/firebase';
>>>>>>> f72d72325236dd648406a88ee667af6334effd3a
import Sidebar from '../../src/component/layout/Sidebar';
import Header from '../../src/component/layout/Header';
import StarParticlesBg from '../../src/component/StarParticlesBg';

<<<<<<< HEAD
import DashboardOverviewTab from '../../src/features/dashboard/DashboardOverviewTab';
=======
// Import các Tabs từ thư mục features
>>>>>>> f72d72325236dd648406a88ee667af6334effd3a
import MonitorTab from '../../src/features/dashboard/MonitorTab';
import ListDevicesTab from '../../src/features/dashboard/ListDevicesTab';
import AlertsHistoryTab from '../../src/features/dashboard/AlertsHistoryTab';
import SettingsTab from '../../src/features/dashboard/SettingsTab';
import AboutTab from '../../src/features/dashboard/AboutTab';

<<<<<<< HEAD
import AnalyticsTab from '../../src/features/dashboard/AnalyticsTab';

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useDeviceStatusMonitor();
  // OfflineSync đã chạy toàn cục qua OfflineSyncProvider trong layout

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push('/');
      return;
    }
    if (isAdmin) {
      router.push('/admin');
    }
  }, [user, loading, isAdmin, router]);

  const handleNavigate = (tab: string) => {
    setActiveTab(tab);
  };

  if (loading || !user || isAdmin) {
=======
export default function DashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('monitor');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('firebase_token');
    if (!token) {
      router.push('/');
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        // Fallback check: if firebase state is logged out but token is also deleted
        const currentToken = localStorage.getItem('firebase_token');
        if (!currentToken) {
          router.push('/');
          return;
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
>>>>>>> f72d72325236dd648406a88ee667af6334effd3a
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-gradient-to-tr from-[#eef7f8] via-[#f4f3f8] to-[#fbeff5]">
        <div className="relative flex h-16 w-16 items-center justify-center">
          <div className="absolute h-full w-full rounded-full border-[4px] border-[#00b494]/20 border-t-[#00b494] animate-spin" />
          <div className="h-6 w-6 rounded-full bg-gradient-to-br from-[#12a1c0] to-[#00b494] animate-pulse" />
        </div>
        <p className="mt-4 text-xs font-semibold tracking-wider text-slate-500 uppercase animate-pulse">Đang kiểm tra quyền truy cập...</p>
      </div>
    );
  }

<<<<<<< HEAD
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardOverviewTab onNavigate={handleNavigate} />;
=======
  // Hàm render nội dung linh hoạt dựa vào Tab đang chọn
  const renderContent = () => {
    switch (activeTab) {
>>>>>>> f72d72325236dd648406a88ee667af6334effd3a
      case 'monitor':
        return <MonitorTab isSidebarOpen={isSidebarOpen} onOpenSidebar={() => setIsSidebarOpen(true)} />;
      case 'list_devices':
        return <ListDevicesTab />;
      case 'alerts_history':
        return <AlertsHistoryTab />;
<<<<<<< HEAD

      case 'analytics':
        return <AnalyticsTab />;
=======
>>>>>>> f72d72325236dd648406a88ee667af6334effd3a
      case 'settings':
        return <SettingsTab />;
      case 'about':
        return <AboutTab />;
      default:
<<<<<<< HEAD
        return <DashboardOverviewTab onNavigate={handleNavigate} />;
=======
        return <MonitorTab isSidebarOpen={isSidebarOpen} onOpenSidebar={() => setIsSidebarOpen(true)} />;
>>>>>>> f72d72325236dd648406a88ee667af6334effd3a
    }
  };

  return (
    <div className="h-screen w-screen flex bg-slate-50 overflow-hidden font-sans text-slate-800 relative">
<<<<<<< HEAD
      {isSidebarOpen && (
        <div
=======
      
      {/* Transparent overlay so the map remains visible while sidebar is open */}
      {isSidebarOpen && (
        <div 
>>>>>>> f72d72325236dd648406a88ee667af6334effd3a
          className="fixed inset-0 z-40 bg-transparent transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

<<<<<<< HEAD
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <main className={`flex-1 h-full w-full relative overflow-hidden transition-all duration-700 ${activeTab === 'about' ? 'bg-gradient-to-tr from-[#eef7f9] via-[#f2fafb] to-[#edf8fa]' : 'bg-slate-50'
        }`}>
        {activeTab === 'about' && <StarParticlesBg />}
        {activeTab !== 'monitor' && <Header onOpenSidebar={() => setIsSidebarOpen(true)} onNavigate={setActiveTab} />}

=======
      {/* Sidebar Component */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />

      {/* Vùng Main Content */}
      <main className={`flex-1 h-full w-full relative overflow-hidden transition-all duration-700 ${
        activeTab === 'about' ? 'bg-gradient-to-tr from-[#eef7f9] via-[#f2fafb] to-[#edf8fa]' : 'bg-slate-50'
      }`}>
        {activeTab === 'about' && <StarParticlesBg />}
        {activeTab !== 'monitor' && <Header onOpenSidebar={() => setIsSidebarOpen(true)} />}
        
>>>>>>> f72d72325236dd648406a88ee667af6334effd3a
        <div className={activeTab === 'monitor' ? 'absolute inset-0 w-full h-full z-10' : 'h-full w-full pt-[76px] px-4 md:px-8 pb-10 overflow-y-auto overflow-x-hidden relative z-20'}>
          {renderContent()}
        </div>
      </main>
<<<<<<< HEAD
    </div>
  );
}
=======

    </div>
  );
}
>>>>>>> f72d72325236dd648406a88ee667af6334effd3a
