import { db } from './firebaseConfig';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

// 🔍 1. Lấy phân công theo ID
export async function getPhanCongById(id) {
    const ref = doc(db, 'phan_cong', id.toString());
    const snap = await getDoc(ref);
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;

}

// 🔍 2. Lấy danh sách kỹ thuật viên của phân công
export async function getPhanCongKtvList(phanCongId) {
    const ref = collection(db, 'phan_cong_ktv');
    const q = query(ref, where('phanCongId', '==', phanCongId));
    const snap = await getDocs(q);

    const list = [];
    for (const docSnap of snap.docs) {
        const data = docSnap.data();
        let taiKhoan = null;

        try {
            if (data.taiKhoanId) {
                const tkRef = doc(db, 'tai_khoan', data.taiKhoanId.toString());
                const tkSnap = await getDoc(tkRef);
                taiKhoan = tkSnap.exists() ? { id: tkSnap.id, ...tkSnap.data() } : null;
            }
        } catch (err) {
            console.error('❌ Không lấy được tài khoản:', err);
        }


        list.push({ id: docSnap.id, ...data, taiKhoan });
    }

    return list;
}
