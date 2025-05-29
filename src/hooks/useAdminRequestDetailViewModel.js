import { useEffect, useState } from 'react';
import { getDoc, doc, collection, getDocs } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import { defaultYeuCau } from '../models/yeuCauModel';

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

            console.log('📥 Đang tải toàn bộ chi_tiet_yeu_cau...');
            const ctSnap = await getDocs(collection(db, 'chi_tiet_yeu_cau'));
            const all = ctSnap.docs.map(doc => ({ id: doc.id, chiTiet: doc.data() }));

            console.log('🔎 Tổng số chi tiết load được:', all.length);
            console.log('🔍 Lọc theo yeuCauId ==', yeuCauId);

            const list = all.filter(x => x.chiTiet.yeuCauId == yeuCauId);
            console.log('✅ Danh sách chi tiết sau lọc:', list);

            setAllChiTiet(list);
        } catch (e) {
            console.error('❌ Lỗi khi load dữ liệu:', e.message || e);
        } finally {
            setIsLoading(false);
        }
    };

    const duyetYeuCau = () => {
        console.log('✅ Gọi hàm duyệt yêu cầu cho:', yeuCauId);
    };

    const tuChoiYeuCau = (reason) => {
        console.log('❌ Từ chối yêu cầu với lý do:', reason);
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
