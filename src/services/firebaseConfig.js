// firebaseConfig.js
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDFGz9osgFH_Lt9rPGexD3o8imxAeFZgdw",
  authDomain: "qltbapp.firebaseapp.com",
  projectId: "qltbapp",
  storageBucket: "qltbapp.firebasestorage.app",
  messagingSenderId: "216834475114",
  appId: "1:216834475114:web:430ce8aca90db443577613",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

const db = getFirestore(app);
const storage = getStorage(app);

export { app, db, storage };
