'use client';

export default function Home() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: 'Arial, sans-serif',
      color: 'white',
      padding: '20px'
    }}>
      <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>
        ✅ MoniMove Hoạt Động!
      </h1>
      
      <p style={{ fontSize: '20px', marginBottom: '30px', textAlign: 'center', maxWidth: '600px' }}>
        Nếu bạn thấy trang này, nghĩa là Next.js đang chạy bình thường!
      </p>

      <div style={{
        background: 'white',
        color: '#333',
        padding: '30px',
        borderRadius: '15px',
        maxWidth: '500px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
      }}>
        <h2 style={{ marginBottom: '15px' }}>Bước tiếp theo:</h2>
        <ol style={{ textAlign: 'left', lineHeight: '2' }}>
          <li>Trang này hoạt động ✅</li>
          <li>Vấn đề nằm ở trang chủ phức tạp</li>
          <li>Tôi sẽ sửa lỗi cho bạn</li>
        </ol>
      </div>

      <button
        onClick={() => alert('Button hoạt động!')}
        style={{
          marginTop: '30px',
          padding: '15px 30px',
          fontSize: '18px',
          background: '#00b494',
          color: 'white',
          border: 'none',
          borderRadius: '25px',
          cursor: 'pointer',
          boxShadow: '0 4px 15px rgba(0,180,148,0.4)'
        }}
      >
        Test Button
      </button>
    </div>
  );
}
