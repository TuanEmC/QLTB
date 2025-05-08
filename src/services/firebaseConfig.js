// firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDFGz9osgFH_Lt9rPGexD3o8imxAeFZgdw",
  authDomain: "qltbapp.firebaseapp.com",
  projectId: "qltbapp",
  storageBucket: "qltbapp.appspot.com", 
  messagingSenderId: "216834475114",
  appId: "1:216834475114:web:430ce8aca90db443577613",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
