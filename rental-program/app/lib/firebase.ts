import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyAGxDW92i_UXR6t9TjGUTQ39sdnMUgUdY',
  authDomain: 'bomnal-welfare-app-c3895.firebaseapp.com',
  projectId: 'bomnal-welfare-app-c3895',
  storageBucket: 'bomnal-welfare-app-c3895.appspot.com',
  messagingSenderId: '481878150445',
  appId: '1:481878150445:web:44b8053c153e2922871a4b',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
