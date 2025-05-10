import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { createChiTietYeuCau } from '../models/chiTietYeuCauModel';
import { createAnhMinhChungBaoCao } from '../models/anhMinhChungBaoCaoModel';

export const getChiTietYeuCauWithDisplay = async (yeuCauId) => {
    const idAsString = String(yeuCauId);
    const idAsNumber = parseInt(yeuCauId);

    const queries = [
        getDocs(query(collection(db, 'chi_tiet_yeu_cau'), where('yeuCauId', '==', idAsString)))
    ];

    if (!isNaN(idAsNumber)) {
        queries.push(
            getDocs(query(collection(db, 'chi_tiet_yeu_cau'), where('yeuCauId', '==', idAsNumber)))
        );
    }

    const results = await Promise.all(queries);
    const chiTietDocs = results.flatMap(res => res.docs);

    // ===== Truy vấn các thiết bị liên quan =====
    const chiTietList = chiTietDocs.map(createChiTietYeuCau);
    const thietBiIds = Array.from(new Set(chiTietList.map(c => c.thietBiId)));

    const thietBiMap = {};
    for (let i = 0; i < thietBiIds.length; i += 10) {
        const batch = thietBiIds.slice(i, i + 10);
        const q = query(collection(db, 'thiet_bi'), where('id', 'in', batch));
        const snap = await getDocs(q);
        snap.docs.forEach(doc => {
            thietBiMap[doc.data().id] = doc.data(); // key = số id
        });
    }

    // ===== Xử lý kết quả =====
    const result = [];

    for (const chiTiet of chiTietList) {
        const mediaQ = query(collection(db, 'anh_minh_chung_bao_cao'), where('chiTietBaoCaoId', '==', chiTiet.id));
        const mediaSnap = await getDocs(mediaQ);
        const media = mediaSnap.docs.map(createAnhMinhChungBaoCao);

        const images = media.filter(m => m.type === 'image');
        const videos = media.filter(m => m.type === 'video');

        const thietBi = thietBiMap[chiTiet.thietBiId];

        result.push({
            chiTiet,
            tenThietBi: thietBi?.tenThietBi || '',
            tenLoaiThietBi: thietBi?.tenLoai || '',
            anhDaiDien: images[0]?.urlAnh || null,
            soAnh: images.length,
            soVideo: videos.length,
        });
    }

    return result;
};
