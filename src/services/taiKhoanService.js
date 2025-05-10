import { collection, getDocs } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import { createTaiKhoan } from '../models/taiKhoanModel';

export const getAllTaiKhoan = async () => {
  const querySnapshot = await getDocs(collection(db, 'tai_khoan'));
  return querySnapshot.docs.map((doc) => createTaiKhoan(doc));
};
