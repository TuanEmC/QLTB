// src/services/deviceDetailService.js
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebaseConfig';

// 🔹 Lấy thông tin thiết bị
export async function getThietBiById(id) {
    try {
        // console.log('🔍 Đang truy vấn thiết bị với id:', id);

        // Ưu tiên string (chuẩn nhất)
        let snap = await getDoc(doc(db, 'thiet_bi', id.toString()));
        if (snap.exists()) {
            const data = snap.data();
            console.log('✅ Thiết bị tìm thấy (string id):', data);
            return { id: snap.id, ...data };
        }

        // Fallback nếu truyền nhầm dạng số → thử lại với số
        if (!isNaN(id)) {
            snap = await getDoc(doc(db, 'thiet_bi', Number(id)));
            if (snap.exists()) {
                const data = snap.data();
                console.log('✅ Thiết bị tìm thấy (numeric id):', data);
                return { id: snap.id, ...data };
            }
        }

        console.warn('⚠️ Không tìm thấy thiết bị với id:', id);
        return null;
    } catch (e) {
        console.error('❌ Lỗi trong getThietBiById:', e);
        return null;
    }
}


// 🔹 Lấy chi tiết yêu cầu theo yêuCauId và thietBiId
export async function getChiTietYeuCau(yeuCauId, thietBiId) {
    const q = query(
        collection(db, 'chi_tiet_yeu_cau'),
        where('yeuCauId', '==', yeuCauId),
        where('thietBiId', '==', thietBiId)
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    const data = snapshot.docs[0].data();
    return { id: snapshot.docs[0].id, ...data };
}

// 🔹 Lấy yêu cầu
// export async function getYeuCauById(id) {
//     const snap = await getDoc(doc(db, 'yeu_cau', id));
//     if (!snap.exists()) return null;
//     return { id: snap.id, ...snap.data() };
// }

export async function getYeuCauById(id) {
    try {
        const stringId = id.toString();
        // console.log('📄 Bắt đầu getYeuCauById với id:', stringId);

        let snap = await getDoc(doc(db, 'yeu_cau', stringId));
        if (snap.exists()) {
            const data = snap.data();
            // console.log('✅ Tìm thấy yêu cầu theo docId:', data);
            return { id: snap.id, ...data };
        }

        // Fallback nếu cần (không nên cần, nhưng cứ thêm cho chắc)
        const q = query(collection(db, 'yeu_cau'), where('id', '==', Number(id)));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
            const data = snapshot.docs[0].data();
            // console.log('✅ Tìm thấy yêu cầu theo field id:', data);
            return { id: snapshot.docs[0].id, ...data };
        }

        throw new Error(`❌ Không tìm thấy yêu cầu với id = ${id}`);
    } catch (e) {
        console.error('❌ Lỗi trong getYeuCauById:', e);
        return null;
    }
}


// 🔹 Lấy tên đơn vị từ yêu cầu
export async function getTenDonViById(donViId) {
    try {
        // console.log('🏢 Bắt đầu getTenDonViById với donViId:', donViId);

        if (donViId === undefined || donViId === null) {
            throw new Error('❌ donViId không hợp lệ (undefined hoặc null)');
        }

        const docId = donViId.toString();
        const snap = await getDoc(doc(db, 'don_vi', docId));

        if (snap.exists()) {
            const data = snap.data();
            // console.log('✅ Tìm thấy đơn vị theo docId:', data);
            return data.tenDonVi || 'Không rõ';
        }

        console.warn(`⚠️ Không tìm thấy docId "${docId}", thử fallback theo field id`);
        const q = query(collection(db, 'don_vi'), where('id', '==', Number(donViId)));
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
            const data = snapshot.docs[0].data();
            // console.log('✅ Tìm thấy đơn vị theo field id:', data);
            return data.tenDonVi || 'Không rõ';
        }

        throw new Error(`❌ Không tìm thấy đơn vị với id = ${donViId}`);
    } catch (e) {
        console.error('❌ Lỗi trong getTenDonViById:', e);
        return 'Không rõ';
    }
}



// 🔹 Lấy vị trí chuỗi từ thiết bị → phòng → tầng → dãy
export async function getViTriByThietBi(thietBi) {
    try {
        console.log('▶️ START getViTriByThietBi');
        console.log('📌 Input thietBi:', thietBi);

        if (!thietBi?.phongId) {
            throw new Error('❌ Thiết bị không có phongId');
        }

        // console.log('🔍 Đang lấy phongId =', thietBi.phongId);
        const phongSnap = await getDoc(doc(db, 'phong', thietBi.phongId.toString()));
        if (!phongSnap.exists()) {
            throw new Error(`❌ Không tìm thấy phòng với id = ${thietBi.phongId}`);
        }

        const phong = phongSnap.data();
        // console.log('✅ Tìm được phòng:', phong);

        const tangId = phong?.tangId?.toString();
        const dayId = phong?.dayId?.toString();

        // console.log('📌 tangId =', tangId);
        // console.log('📌 dayId =', dayId);

        if (!tangId) throw new Error('❌ phong.tangId không hợp lệ');
        if (!dayId) throw new Error('❌ phong.dayId không hợp lệ');

        const tangSnap = await getDoc(doc(db, 'tang', tangId));
        if (!tangSnap.exists()) throw new Error(`❌ Không tìm thấy tầng với id = ${tangId}`);
        const tang = tangSnap.data();
        // console.log('✅ Tìm được tầng:', tang);

        const daySnap = await getDoc(doc(db, 'day', dayId));
        if (!daySnap.exists()) throw new Error(`❌ Không tìm thấy dãy với id = ${dayId}`);
        const day = daySnap.data();
        // console.log('✅ Tìm được dãy:', day);

        const result = [day?.tenDay, tang?.tenTang, phong?.tenPhong].filter(Boolean).join(' > ');
        // console.log('📌 Chuỗi vị trí trả về:', result);
        return result || 'Không rõ';
    } catch (e) {
        console.error('❌ Lỗi khi load vị trí thiết bị:', e);
        return 'Không rõ';
    }
}



// 🔹 Lấy ảnh và video minh chứng của chi tiết yêu cầu
export async function getMinhChungByChiTietId(chiTietYeuCauId) {
    try {
        const stringId = chiTietYeuCauId.toString();
        const numberId = Number(chiTietYeuCauId);

        const results = [];

        console.log('📸 Tìm minh chứng với ID:', stringId);

        // Truy theo string ID
        const q1 = query(
            collection(db, 'anh_minh_chung_bao_cao'),
            where('chiTietBaoCaoId', '==', stringId)
        );
        const snap1 = await getDocs(q1);
        snap1.forEach(doc => results.push(doc.data()));

        // Nếu chưa có kết quả, thử theo number
        if (results.length === 0 && !isNaN(numberId)) {
            console.warn('📛 Không tìm thấy ảnh theo string, thử theo số:', numberId);
            const q2 = query(
                collection(db, 'anh_minh_chung_bao_cao'),
                where('chiTietBaoCaoId', '==', numberId)
            );
            const snap2 = await getDocs(q2);
            snap2.forEach(doc => results.push(doc.data()));
        }

        console.log('✅ Số ảnh lấy được:', results.length);

        const images = results
            .filter(d => d.type?.toLowerCase() === 'image')
            .map(d => d.urlAnh);
        const video = results.find(d => d.type?.toLowerCase() === 'video')?.urlAnh || null;

        return { images, video };
    } catch (e) {
        console.error('❌ Lỗi khi load ảnh minh chứng:', e);
        return { images: [], video: null };
    }
}