import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { createThietBi } from '../models/thietBiModel';
import { createPhong } from '../models/phongModel';
import { createLoaiThietBi } from '../models/loaiThietBiModel'; // bạn cần tạo thêm file này

export const getDevicesByDonVi = async (donViId) => {
    // 1. Lấy tất cả phòng của đơn vị
    const phongSnap = await getDocs(query(
        collection(db, 'phong'),
        where('donViId', '==', donViId)
    ));

    const phongMap = {};
    const phongIds = [];
    phongSnap.docs.forEach(doc => {
        const phong = createPhong(doc);
        phongMap[phong.id] = phong;
        phongIds.push(phong.id);
    });

    if (phongIds.length === 0) return [];

    // 2. Lấy thiết bị thuộc các phòng đó
    const tbDocs = [];
    for (let i = 0; i < phongIds.length; i += 10) {
        const q = query(collection(db, 'thiet_bi'), where('phongId', 'in', phongIds.slice(i, i + 10)));
        const snap = await getDocs(q);
        tbDocs.push(...snap.docs);
    }

    const thietBiList = tbDocs.map(doc => createThietBi(doc));
    const loaiIds = Array.from(new Set(
        thietBiList.map(tb => String(tb.loaiThietBiId))  // ép về string
    ));


    // 3. Lấy loại thiết bị theo ID
    const loaiMap = {};
    for (let i = 0; i < loaiIds.length; i += 10) {
        const q = query(collection(db, 'loai_thiet_bi'), where('__name__', 'in', loaiIds.slice(i, i + 10)));
        const snap = await getDocs(q);
        snap.docs.forEach(doc => {
            const loai = createLoaiThietBi(doc);
            loaiMap[doc.id] = loai;
        });
    }

    // 4. Gộp kết quả và trả về đúng kiểu `ThietBiWithDetails`
    return thietBiList.map(tb => {
        const phong = phongMap[tb.phongId] || {};
        const loai = loaiMap[tb.loaiThietBiId] || {};

        return {
            id: tb.id,
            tenThietBi: tb.tenThietBi,
            trangThai: tb.trangThai,
            tenLoai: loai.tenLoai || '',
            tenPhong: phong.tenPhong || '',
            tenDay: phong.tenDay || '',
            tenTang: phong.tenTang || '',
        };
    });
};
