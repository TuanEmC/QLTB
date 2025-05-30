// import { useEffect, useState } from 'react';
// import { getDoc, doc, collection, getDocs } from 'firebase/firestore';
// import { db } from '../services/firebaseConfig';
// import { defaultYeuCau } from '../models/yeuCauModel';

// export default function useAdminRequestDetailViewModel(yeuCauId) {
//     console.log('🔥 useAdminRequestDetailViewModel khởi tạo với yeuCauId:', yeuCauId);
//     const [yeuCau, setYeuCau] = useState(null);
//     const [allChiTiet, setAllChiTiet] = useState([]);
//     const [isLoading, setIsLoading] = useState(true);

//     const reload = async () => {
//         try {
//             setIsLoading(true);
//             console.log('📥 Đang tải yêu cầu từ yeu_cau với ID:', yeuCauId);

//             const ycRef = doc(db, 'yeu_cau', String(yeuCauId));
//             const ycSnap = await getDoc(ycRef);

//             if (!ycSnap.exists()) {
//                 throw new Error(`Không tìm thấy yeu_cau với ID: ${yeuCauId}`);
//             }

//             const ycData = { id: ycSnap.id, ...ycSnap.data() };
//             setYeuCau(ycData);
//             console.log('✅ Tải yêu cầu thành công:', ycData);

//             console.log('📥 Đang tải toàn bộ chi_tiet_yeu_cau...');
//             const ctSnap = await getDocs(collection(db, 'chi_tiet_yeu_cau'));
//             const all = ctSnap.docs.map(doc => ({ id: doc.id, chiTiet: doc.data() }));

//             console.log('🔎 Tổng số chi tiết load được:', all.length);
//             console.log('🔍 Lọc theo yeuCauId ==', yeuCauId);

//             const list = all.filter(x => x.chiTiet.yeuCauId == yeuCauId);
//             console.log('✅ Danh sách chi tiết sau lọc:', list);

//             setAllChiTiet(list);
//         } catch (e) {
//             console.error('❌ Lỗi khi load dữ liệu:', e.message || e);
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     const duyetYeuCau = () => {
//         console.log('✅ Gọi hàm duyệt yêu cầu cho:', yeuCauId);
//     };

//     const tuChoiYeuCau = (reason) => {
//         console.log('❌ Từ chối yêu cầu với lý do:', reason);
//     };

//     return {
//         yeuCau,
//         isLoading,
//         trangThai: yeuCau?.trangThai,
//         daPhanCongList: allChiTiet.filter(x => x.chiTiet.phanCongId),
//         chuaPhanCongList: allChiTiet.filter(x => !x.chiTiet.phanCongId),
//         duyetYeuCau,
//         tuChoiYeuCau,
//         reload
//     };
// }

import { useEffect, useState } from 'react';
import { Alert } from 'react-native';

import {
    getDoc, doc, collection, getDocs, query, where, updateDoc,
} from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import { defaultYeuCau } from '../models/yeuCauModel';
import { TRANG_THAI_PHAN_CONG } from '../constants/trangThaiPhanCong';
import { TRANG_THAI_YEU_CAU } from '../constants/trangThaiYeuCau';

export default function useAdminRequestDetailViewModel(yeuCauId) {
    console.log('🔥 useAdminRequestDetailViewModel khởi tạo với yeuCauId:', yeuCauId);
    const [yeuCau, setYeuCau] = useState(null);
    const [allChiTiet, setAllChiTiet] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const reload = async () => {
        try {
            setIsLoading(true);
            console.log('📥 Đang tải yêu cầu từ yeu_cau với ID:', yeuCauId);

            const ycRef = doc(db, 'yeu_cau', String(yeuCauId));
            const ycSnap = await getDoc(ycRef);

            if (!ycSnap.exists()) {
                throw new Error(`Không tìm thấy yeu_cau với ID: ${yeuCauId}`);
            }

            const ycData = { id: ycSnap.id, ...ycSnap.data() };
            setYeuCau(ycData);
            console.log('✅ Tải yêu cầu thành công:', ycData);

            const ctSnap = await getDocs(query(
                collection(db, 'chi_tiet_yeu_cau'),
                where('yeuCauId', 'in', [yeuCauId, Number(yeuCauId)])
            ));
            const chiTietList = ctSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            const thietBiSnap = await getDocs(collection(db, 'thiet_bi'));
            const thietBiMap = new Map();
            thietBiSnap.docs.forEach(doc => {
                const id = doc.id;
                thietBiMap.set(id, doc.data());
                thietBiMap.set(Number(id), doc.data());
            });

            const loaiSnap = await getDocs(collection(db, 'loai_thiet_bi'));
            const loaiMap = new Map();
            loaiSnap.docs.forEach(doc => {
                const id = doc.id;
                loaiMap.set(id, doc.data());
                loaiMap.set(Number(id), doc.data());
            });

            const anhSnap = await getDocs(collection(db, 'anh_minh_chung_bao_cao'));
            const anhList = anhSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            const phanCongSnap = await getDocs(collection(db, 'phan_cong'));
            const phanCongMap = new Map();
            phanCongSnap.docs.forEach(doc => {
                const data = doc.data();
                if (data.chiTietYeuCauId)
                    phanCongMap.set(data.chiTietYeuCauId, { id: doc.id, ...data });
            });

            const pcktvSnap = await getDocs(collection(db, 'phan_cong_ktv'));
            const pcKtvByPhanCongId = {};
            pcktvSnap.docs.forEach(doc => {
                const data = doc.data();
                if (!pcKtvByPhanCongId[data.phanCongId]) pcKtvByPhanCongId[data.phanCongId] = [];
                pcKtvByPhanCongId[data.phanCongId].push(data);
            });

            const finalList = chiTietList.map(chiTiet => {
                const thietBi = thietBiMap.get(chiTiet.thietBiId);
                const loaiThietBi = thietBi ? loaiMap.get(thietBi.loaiThietBiId) : null;
                const anh = anhList.filter(a => a.chiTietBaoCaoId == chiTiet.id);
                const soAnh = anh.filter(a => a.type === 'image').length;
                const soVideo = anh.filter(a => a.type === 'video').length;
                const anhDaiDien = anh.find(a => a.type === 'image')?.urlAnh || null;
                const phanCong = phanCongMap.get(chiTiet.id);
                const pcList = phanCong ? pcKtvByPhanCongId[phanCong.id] || [] : [];
                const totalDoing = pcList.filter(x =>
                    [TRANG_THAI_PHAN_CONG.DA_CHAP_NHAN, TRANG_THAI_PHAN_CONG.DANG_THUC_HIEN, TRANG_THAI_PHAN_CONG.TAM_NGHI, TRANG_THAI_PHAN_CONG.HOAN_THANH].includes(x.trangThai)
                ).length;

                const totalResponsible = pcList.filter(x =>
                    [TRANG_THAI_PHAN_CONG.CHO_PHAN_HOI, TRANG_THAI_PHAN_CONG.DA_CHAP_NHAN, TRANG_THAI_PHAN_CONG.DANG_THUC_HIEN, TRANG_THAI_PHAN_CONG.TAM_NGHI, TRANG_THAI_PHAN_CONG.HOAN_THANH, TRANG_THAI_PHAN_CONG.DA_TU_CHOI].includes(x.trangThai)
                ).length;


                const item = {
                    id: chiTiet.id,
                    chiTiet: {
                        ...chiTiet,
                        tenThietBi: thietBi?.tenThietBi || null,
                        tenLoaiThietBi: loaiThietBi?.tenLoai || null,
                        soAnh,
                        soVideo,
                        anhDaiDien,
                        phanCongId: phanCong?.id || null,
                        totalDoingTechnicians: totalDoing,
                        totalResponsibleTechnicians: totalResponsible
                    }
                };

                console.log(`📦 [${item.id}]`, {
                    tenThietBi: item.chiTiet.tenThietBi,
                    tenLoaiThietBi: item.chiTiet.tenLoaiThietBi,
                    soAnh: item.chiTiet.soAnh,
                    soVideo: item.chiTiet.soVideo,
                    anhDaiDien: item.chiTiet.anhDaiDien,
                    phanCongId: item.chiTiet.phanCongId,
                    totalDoingTechnicians: item.chiTiet.totalDoingTechnicians,
                    totalResponsibleTechnicians: item.chiTiet.totalResponsibleTechnicians,
                });

                return item;
            });

            setAllChiTiet(finalList);
        } catch (e) {
            console.error('❌ Lỗi khi load dữ liệu:', e);
        } finally {
            setIsLoading(false);
        }
    };

    // const duyetYeuCau = () => {
    //     console.log('✅ Gọi hàm duyệt yêu cầu cho:', yeuCauId);
    // };

    // const tuChoiYeuCau = (reason) => {
    //     console.log('❌ Từ chối yêu cầu với lý do:', reason);
    // };

    const duyetYeuCau = async () => {
        try {
            await updateDoc(doc(db, 'yeu_cau', String(yeuCauId)), {
                trangThai: TRANG_THAI_YEU_CAU.DA_XAC_NHAN,
                updatedAt: Date.now(),
            });
            console.log('✅ Đã duyệt yêu cầu');
            Alert.alert('Thành công', 'Yêu cầu đã được duyệt');
            reload();
        } catch (e) {
            console.error('❌ Lỗi duyệt yêu cầu:', e);
            Alert.alert('Lỗi', 'Không thể duyệt yêu cầu');
        }
    };

    const tuChoiYeuCau = async (lyDo) => {
        try {
            await updateDoc(doc(db, 'yeu_cau', String(yeuCauId)), {
                trangThai: TRANG_THAI_YEU_CAU.TU_CHOI,
                lyDoTuChoi: lyDo,
                updatedAt: Date.now(),
            });
            console.log('❌ Đã từ chối yêu cầu');
            Alert.alert('Thành công', 'Yêu cầu đã bị từ chối');
            reload();
        } catch (e) {
            console.error('❌ Lỗi từ chối yêu cầu:', e);
            Alert.alert('Lỗi', 'Không thể từ chối yêu cầu');
        }
    };


    return {
        yeuCau,
        isLoading,
        trangThai: yeuCau?.trangThai,
        daPhanCongList: allChiTiet.filter(x => x.chiTiet.phanCongId),
        chuaPhanCongList: allChiTiet.filter(x => !x.chiTiet.phanCongId),
        duyetYeuCau,
        tuChoiYeuCau,
        reload
    };
}
