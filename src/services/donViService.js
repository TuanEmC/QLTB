import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { db } from './firebaseConfig';

// Lấy tất cả đơn vị (dùng cho filter)
export const getAllDonVi = async () => {
    const snap = await getDocs(collection(db, 'don_vi'));
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Lấy đơn vị theo ID
export const getDonViById = async (id) => {
    if (!id) return null;

    try {
        const ref = doc(db, 'don_vi', id);
        const snap = await getDoc(ref);
        return snap.exists() ? { id: snap.id, ...snap.data() } : null;
    } catch (e) {
        console.error('Lỗi khi lấy đơn vị:', e);
        return null;
    }
};
