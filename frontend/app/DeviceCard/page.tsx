'use client';

import { useState } from 'react';
import Sidebar from '../../src/component/layout/Sidebar';
import Header from '../../src/component/layout/Header';

// Import các Tabs từ thư mục features
import MonitorTab from '../../src/features/dashboard/MonitorTab';
import ListDevicesTab from '../../src/features/dashboard/ListDevicesTab';
import SettingsTab from '../../src/features/dashboard/SettingsTab';
import AboutTab from '../../src/features/dashboard/AboutTab';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('monitor');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Hàm render nội dung linh hoạt dựa vào Tab đang chọn
  const renderContent = () => {
    switch (activeTab) {
      case 'monitor':
        return <MonitorTab />;
      case 'list_devices':
        return <ListDevicesTab />;
      case 'settings':
        return <SettingsTab />;
      case 'about':
        return <AboutTab />;
      default:
        return <MonitorTab />;
    }
  };

  return (
    <div className="h-screen w-screen flex bg-slate-50 overflow-hidden font-sans text-slate-800 relative">
      
      {/* Overlay Mờ khi mở Sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 backdrop-blur-sm transition-opacity"
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
      <main className="flex-1 h-full overflow-y-auto w-full relative">
        <Header onOpenSidebar={() => setIsSidebarOpen(true)} />
        
        <div className="px-4 md:px-8 pb-10 pt-2">
          {renderContent()}
        </div>
      </main>

    </div>
  );
}