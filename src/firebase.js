// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Firebase 설정
const firebaseConfig = {
  apiKey: "AIzaSyAmuh3ixHpuf_Df6ob41u8dIONPrf9sQhU",
  authDomain: "bomnal-welfare-app.firebaseapp.com",
  projectId: "bomnal-welfare-app",
  storageBucket: "bomnal-welfare-app.appspot.com",
  messagingSenderId: "130233537136",
  appId: "1:130233537136:web:124de662de8721898e5ab5",
  measurementId: "G-KYKXL35NGJ4"
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);

// Firestore 인스턴스
const db = getFirestore(app);

// db를 export
export { db };
