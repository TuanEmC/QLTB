import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from './firebaseConfig'; // nếu bạn đặt cấu hình firebase ở đây
import { getDonViById } from './donViService'; // cần tạo đơn giản

// Lấy tất cả yêu cầu
export const getAllYeuCau = async () => {
    const snap = await getDocs(collection(db, 'yeu_cau'));
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Đếm tổng chi tiết theo yêu cầu
export const getChiTietCountMap = async () => {
    const snap = await getDocs(collection(db, 'chi_tiet_yeu_cau'));
    const map = {};

    snap.docs.forEach(doc => {
        const { yeuCauId } = doc.data();
        if (!map[yeuCauId]) map[yeuCauId] = 0;
        map[yeuCauId]++;
    });

    return map;
};

// Đếm số chi tiết đã có phân công
export const getPhanCongCountMap = async () => {
    const snap = await getDocs(collection(db, 'phan_cong'));
    const map = {};

    snap.docs.forEach(doc => {
        const { chiTietYeuCauId } = doc.data();
        if (!chiTietYeuCauId) return;

        // Tạm thời cần map từ chiTiet → yeuCau (chưa hiệu quả, sẽ tối ưu sau)
        if (!map[chiTietYeuCauId]) map[chiTietYeuCauId] = 0;
        map[chiTietYeuCauId]++;
    });

    return map;
};

// Optional: Tạo 1 map từ yeuCauId → số đã phân công (nếu cần gộp)
export const buildPhanCongPerYeuCau = async () => {
    const chiTietSnap = await getDocs(collection(db, 'chi_tiet_yeu_cau'));
    const phanCongSnap = await getDocs(collection(db, 'phan_cong'));

    const mapChiTietToYeuCau = {};
    chiTietSnap.docs.forEach(doc => {
        const { yeuCauId } = doc.data();
        mapChiTietToYeuCau[doc.id] = yeuCauId;
    });

    const mapYeuCauToPhanCongCount = {};
    phanCongSnap.docs.forEach(doc => {
        const { chiTietYeuCauId } = doc.data();
        const yeuCauId = mapChiTietToYeuCau[chiTietYeuCauId];
        if (!yeuCauId) return;

        if (!mapYeuCauToPhanCongCount[yeuCauId]) mapYeuCauToPhanCongCount[yeuCauId] = 0;
        mapYeuCauToPhanCongCount[yeuCauId]++;
    });

    return mapYeuCauToPhanCongCount;
};
