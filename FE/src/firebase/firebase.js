import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from "firebase/auth";
// Chìa khóa Firebase của bạn
const firebaseConfig = {
  apiKey: "AIzaSyD6558E6Wi7ROHppZRxZEs1gGU-VmNBOdU",
  authDomain: "homecare-80a6b.firebaseapp.com",
  projectId: "homecare-80a6b",
  storageBucket: "homecare-80a6b.firebasestorage.app",
  messagingSenderId: "122208551161",
  appId: "1:122208551161:web:6d33316b1dfe239a956228"
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);

// Khởi tạo công cụ Xác thực (Auth) và Nhà cung cấp (Google)
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();