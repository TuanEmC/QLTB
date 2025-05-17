import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { createChiTietYeuCau } from '../models/chiTietYeuCauModel';
import { createAnhMinhChungBaoCao } from '../models/anhMinhChungBaoCaoModel';
import { uploadToFirebase, deleteFromFirebase } from './firebaseHelper';

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
            thietBiMap[String(doc.data().id)] = doc.data();
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

        const thietBi = thietBiMap[String(chiTiet.thietBiId)];


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

export const saveChiTietYeuCauToFirestore = async ({ yeuCauId, thietBiId, loaiYeuCau, moTa, images }) => {
    const uploadedImageUrls = [];

    // 1. Upload ảnh
    for (const img of images) {
        const url = await uploadToFirebase(img.uri, `bao_cao/image_${Date.now()}.jpg`);
        if (!url) throw new Error('Upload ảnh thất bại');
        uploadedImageUrls.push(url);
    }

    // 2. Sau khi thành công hết mới tạo chi tiết
    const docRef = await addDoc(collection(db, 'chi_tiet_yeu_cau'), {
        yeuCauId,
        thietBiId,
        loaiYeuCau,
        moTa,
        createdAt: Date.now(),
    });

    const chiTietId = docRef.id;

    // 3. Lưu metadata ảnh
    for (const url of uploadedImageUrls) {
        await addDoc(collection(db, 'anh_minh_chung_bao_cao'), {
            chiTietBaoCaoId: chiTietId,
            urlAnh: url,
            type: 'image'
        });
    }


    return chiTietId;
};


export const updateChiTietYeuCauInFirestore = async (id, { loaiYeuCau, moTa, images }) => {
    // 1. Load ảnh hiện tại từ Firestore
    const mediaSnap = await getDocs(
        query(collection(db, 'anh_minh_chung_bao_cao'), where('chiTietId', '==', id))
    );

    const oldImages = mediaSnap.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(item => item.type === 'image');

    const oldUrls = oldImages.map(i => i.urlAnh);
    const newUrls = images.map(i => i.uri);

    // 2. Tìm ảnh cần xoá
    for (const old of oldImages) {
        if (!newUrls.includes(old.urlAnh)) {
            await deleteDoc(doc(db, 'anh_minh_chung_bao_cao', old.id));
            await deleteFromFirebase(old.urlAnh);
        }
    }

    // 3. Upload ảnh mới (chỉ ảnh chưa có URL trong hệ thống)
    const uploadedUrls = [];

    for (const img of images) {
        const isExisting = oldUrls.includes(img.uri);
        if (!isExisting) {
            const url = await uploadToFirebase(img.uri, `bao_cao/image_${Date.now()}.jpg`);
            if (!url) throw new Error('Upload ảnh mới thất bại');
            uploadedUrls.push(url);
        } else {
            uploadedUrls.push(img.uri);
        }
    }

    // 4. Cập nhật metadata mới nếu có ảnh mới
    for (const url of uploadedUrls) {
        if (!oldUrls.includes(url)) {
            await addDoc(collection(db, 'anh_minh_chung_bao_cao'), {
                chiTietBaoCaoId: id,
                urlAnh: url,
                type: 'image'
            });
        }
    }

    // 5. Cuối cùng, cập nhật chi tiết yêu cầu
    await updateDoc(doc(db, 'chi_tiet_yeu_cau', id), {
        loaiYeuCau,
        moTa,
        updatedAt: Date.now()
    });
};
