import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { createYeuCau } from '../models/yeuCauModel';
import { TRANG_THAI_YEU_CAU } from '../constants/trangThaiYeuCau';
import { doc, getDoc } from 'firebase/firestore';
import { updateDoc, deleteDoc } from 'firebase/firestore';
import { deleteFromFirebase } from './firebaseHelper';



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


export const deleteYeuCauWithCascade = async (id) => {
    console.log(`🗑️ Bắt đầu xoá yêu cầu với ID: ${id}`);

    const yeuCauDoc = await getDoc(doc(db, 'yeu_cau', id));
    if (!yeuCauDoc.exists()) {
        console.warn(`❌ Không tìm thấy yêu cầu với ID: ${id}`);
        return;
    }

    const yeuCauData = yeuCauDoc.data();
    console.log(`ℹ️ Trạng thái yêu cầu: ${yeuCauData.trangThai}`);

    if (yeuCauData.trangThai !== 'Bản Nháp') {
        console.warn('❌ Không được phép xoá yêu cầu vì không ở trạng thái "Bản Nháp"');
        return;
    }

    // 1. Truy vấn chi tiết yêu cầu
    const chiTietSnap = await getDocs(query(
        collection(db, 'chi_tiet_yeu_cau'),
        where('yeuCauId', '==', id)
    ));
    console.log(`🔍 Tìm thấy ${chiTietSnap.docs.length} chi tiết yêu cầu`);

    for (const chiTiet of chiTietSnap.docs) {
        const chiTietId = chiTiet.id;
        console.log(`➡️ Xử lý chi tiết yêu cầu: ${chiTietId}`);

        // 2. Truy vấn ảnh liên quan
        const anhSnap = await getDocs(query(
            collection(db, 'anh_minh_chung_bao_cao'),
            where('chiTietBaoCaoId', '==', chiTietId)
        ));
        console.log(`📷 Tìm thấy ${anhSnap.docs.length} ảnh minh chứng`);

        for (const anh of anhSnap.docs) {
            const url = anh.data().urlAnh;
            console.log('⏳ Đang xoá ảnh:', url);
            await deleteFromFirebase(url);
            await deleteDoc(doc(db, 'anh_minh_chung_bao_cao', anh.id));
            console.log(`🧾 Đã xoá metadata ảnh: ${anh.id}`);
        }

        // 3. Xoá chi tiết yêu cầu
        await deleteDoc(doc(db, 'chi_tiet_yeu_cau', chiTietId));
        console.log(`✅ Đã xoá chi tiết yêu cầu: ${chiTietId}`);
    }

    // 4. Xoá yêu cầu chính
    await deleteDoc(doc(db, 'yeu_cau', id));
    console.log(`🎉 Đã xoá yêu cầu chính: ${id}`);
};


