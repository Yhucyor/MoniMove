'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../src/core/config/firebase';
import Sidebar from '../../src/component/layout/Sidebar';
import Header from '../../src/component/layout/Header';
import StarParticlesBg from '../../src/component/StarParticlesBg';

// Import các Tabs từ thư mục features
import MonitorTab from '../../src/features/dashboard/MonitorTab';
import ListDevicesTab from '../../src/features/dashboard/ListDevicesTab';
import AlertsHistoryTab from '../../src/features/dashboard/AlertsHistoryTab';
import SettingsTab from '../../src/features/dashboard/SettingsTab';
import AboutTab from '../../src/features/dashboard/AboutTab';

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

  // Hàm render nội dung linh hoạt dựa vào Tab đang chọn
  const renderContent = () => {
    switch (activeTab) {
      case 'monitor':
        return <MonitorTab isSidebarOpen={isSidebarOpen} onOpenSidebar={() => setIsSidebarOpen(true)} />;
      case 'list_devices':
        return <ListDevicesTab />;
      case 'alerts_history':
        return <AlertsHistoryTab />;
      case 'settings':
        return <SettingsTab />;
      case 'about':
        return <AboutTab />;
      default:
        return <MonitorTab isSidebarOpen={isSidebarOpen} onOpenSidebar={() => setIsSidebarOpen(true)} />;
    }
  };

  return (
    <div className="h-screen w-screen flex bg-slate-50 overflow-hidden font-sans text-slate-800 relative">
      
      {/* Transparent overlay so the map remains visible while sidebar is open */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-transparent transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

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
        
        <div className={activeTab === 'monitor' ? 'absolute inset-0 w-full h-full z-10' : 'h-full w-full pt-[76px] px-4 md:px-8 pb-10 overflow-y-auto overflow-x-hidden relative z-20'}>
          {renderContent()}
        </div>
      </main>

    </div>
  );
}