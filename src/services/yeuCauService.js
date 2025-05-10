import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { createYeuCau } from '../models/yeuCauModel';

export const getYeuCauByDonVi = async (donViId) => {
    const q = query(collection(db, 'yeu_cau'), where('donViId', '==', donViId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => createYeuCau(doc));
};

export const deleteYeuCau = async (id) => {
    await deleteDoc(doc(db, 'yeu_cau', id));
};
