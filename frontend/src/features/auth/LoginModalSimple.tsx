'use client';

interface LoginModalSimpleProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModalSimple({ isOpen, onClose }: LoginModalSimpleProps) {
  console.log('🔍 LoginModalSimple - isOpen:', isOpen);

  if (!isOpen) {
    console.log('❌ Modal không render vì isOpen = false');
    return null;
  }

  console.log('✅ Modal đang render!');

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={onClose}
    >
      <div 
        className="bg-white p-8 rounded-lg max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          🎉 Modal Test Thành Công!
        </h2>
        
        <p className="text-gray-600 mb-4">
          Nếu bạn thấy cái này, nghĩa là modal đang hoạt động bình thường!
        </p>

        <div className="space-y-2 text-sm text-gray-500 mb-6">
          <p>✅ State management hoạt động</p>
          <p>✅ Click handler hoạt động</p>
          <p>✅ CSS z-index đúng</p>
          <p>✅ Modal render đúng</p>
        </div>

        <button 
          onClick={onClose}
          className="w-full px-4 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold rounded-lg hover:brightness-110 transition-all"
        >
          Đóng Modal
        </button>

        <p className="text-xs text-gray-400 mt-4 text-center">
          Nếu hoạt động, bạn có thể quay lại dùng LoginModal gốc
        </p>
      </div>
    </div>
  );
}
