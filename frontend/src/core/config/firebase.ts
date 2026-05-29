// frontend/src/config/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // 1. Thêm dòng này để gọi dịch vụ Auth

const firebaseConfig = {
  apiKey: "AIzaSyAQGHnSICLu-1QpOItRIYen0y5AxPbIMtc",
  authDomain: "monimove-6cd1d.firebaseapp.com",
  projectId: "monimove-6cd1d",
  storageBucket: "monimove-6cd1d.firebasestorage.app",
  messagingSenderId: "924125576856",
  appId: "1:924125576856:web:853fae140460e139de1aed"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// 2. Xuất biến auth ra ngoài để component LoginModal có thể sử dụng
export const auth = getAuth(app);