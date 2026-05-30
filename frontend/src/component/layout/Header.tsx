import { Menu } from 'lucide-react';

// Khai báo kiểu dữ liệu cho props của component
interface HeaderProps {
  onOpenSidebar: () => void;
}

export default function Header({ onOpenSidebar }: HeaderProps) {
  return (
    <div className="sticky top-0 z-30 flex items-center p-4 md:px-8 bg-slate-50/80 backdrop-blur-md">
      <button 
        onClick={onOpenSidebar}
        className="p-2.5 bg-white border border-slate-200/60 rounded-xl shadow-sm text-slate-600 hover:text-[#00b494] hover:border-[#00b494]/30 transition-all active:scale-95"
      >
        <Menu className="w-5 h-5" />
      </button>
    </div>
  );
}