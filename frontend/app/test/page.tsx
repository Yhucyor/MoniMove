import Link from 'next/link';

export default function TestPage() {
  return (
    <div style={{ 
      padding: '40px', 
      fontFamily: 'Arial', 
      backgroundColor: '#f0f0f0',
      minHeight: '100vh'
    }}>
      <h1 style={{ color: '#00b494', fontSize: '48px' }}>
        ✅ TEST THÀNH CÔNG!
      </h1>
      
      <div style={{ 
        backgroundColor: 'white', 
        padding: '20px', 
        borderRadius: '10px',
        marginTop: '20px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <h2>Nếu bạn thấy trang này, nghĩa là:</h2>
        <ul style={{ fontSize: '18px', lineHeight: '2' }}>
          <li>✅ Server đang chạy bình thường</li>
          <li>✅ Next.js hoạt động đúng</li>
          <li>✅ Browser kết nối được</li>
          <li>✅ Routing hoạt động</li>
        </ul>
        
        <hr style={{ margin: '20px 0' }} />
        
        <h3>Bước tiếp theo:</h3>
        <ol style={{ fontSize: '16px', lineHeight: '1.8' }}>
          <li>Quay lại trang chủ: <Link href="/" style={{ color: '#00b494' }}>http://localhost:3000</Link></li>
          <li>Nếu trang chủ không hiển thị, có thể có lỗi ở component</li>
          <li>Mở Console (F12) để xem lỗi chi tiết</li>
        </ol>
        
        <div style={{ 
          marginTop: '30px', 
          padding: '15px', 
          backgroundColor: '#fff3cd',
          borderLeft: '4px solid #ffc107',
          borderRadius: '5px'
        }}>
          <strong>⚠️ Lưu ý:</strong> Nếu trang test này hiển thị nhưng trang chủ không hiển thị,
          vấn đề nằm ở component trang chủ (page.tsx hoặc LoginModal.tsx)
        </div>
      </div>
      
      <div style={{ marginTop: '30px', fontSize: '14px', color: '#666' }}>
        <p>Thời gian: {new Date().toLocaleString('vi-VN')}</p>
        <p>URL hiện tại: {typeof window !== 'undefined' ? window.location.href : 'N/A'}</p>
      </div>
    </div>
  );
}
