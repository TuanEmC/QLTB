// src/services/thietBiService.js
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from './firebaseConfig';

export const getThietBiWithChiTietDisplay = async (thietBiId) => {
    const snap = await getDoc(doc(db, 'thiet_bi', String(thietBiId)));
    if (!snap.exists()) return null;

    const tb = snap.data();
    const result = {
        id: snap.id,
        tenThietBi: tb.tenThietBi,
        trangThai: tb.trangThai,
        loaiThietBiId: tb.loaiThietBiId,
        phongId: tb.phongId,
        tenLoai: '',
        tenPhong: '',
        tenDay: '',
        tenTang: '',
    };

    // truy vấn loại thiết bị
    const loaiSnap = await getDoc(doc(db, 'loai_thiet_bi', String(tb.loaiThietBiId)));
    if (loaiSnap.exists()) result.tenLoai = loaiSnap.data().tenLoai;

    // truy vấn phòng và các thông tin liên quan
    const phongSnap = await getDoc(doc(db, 'phong', String(tb.phongId)));
    if (phongSnap.exists()) {
        const phong = phongSnap.data();
        result.tenPhong = phong.tenPhong;

        const tangSnap = await getDoc(doc(db, 'tang', String(phong.tangId)));
        if (tangSnap.exists()) result.tenTang = tangSnap.data().tenTang;

        const daySnap = await getDoc(doc(db, 'day', String(phong.dayId)));
        if (daySnap.exists()) result.tenDay = daySnap.data().tenDay;
    }

    return result;
};
