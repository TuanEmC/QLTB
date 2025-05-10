import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { createYeuCau } from '../models/yeuCauModel';
import { TRANG_THAI_YEU_CAU } from '../constants/trangThaiYeuCau';
import { doc, getDoc } from 'firebase/firestore';
import { updateDoc } from 'firebase/firestore';


export const updateYeuCauStatus = async (id, status) => {
    await updateDoc(doc(db, 'yeu_cau', id), {
        trangThai: status,
        updatedAt: Date.now(),
    });
};


export const getYeuCauById = async (id) => {
    const snap = await getDoc(doc(db, 'yeu_cau', String(id)));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};



export const createYeuCauRecord = async (taiKhoanId, donViId, moTa) => {
    const docRef = await addDoc(collection(db, 'yeu_cau'), {
        taiKhoanId,
        donViId,
        moTa,
        trangThai: TRANG_THAI_YEU_CAU.NHAP,
        createdAt: Date.now(),
        updatedAt: Date.now(),
    });
    return docRef.id;
};


export const getYeuCauByDonVi = async (donViId) => {
    const q = query(collection(db, 'yeu_cau'), where('donViId', '==', donViId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => createYeuCau(doc));
};

export const deleteYeuCau = async (id) => {
    await deleteDoc(doc(db, 'yeu_cau', id));
};
