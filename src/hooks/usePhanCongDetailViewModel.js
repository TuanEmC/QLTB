import { useEffect, useState } from 'react';
import useDeviceDetailViewModel from './useDeviceDetailViewModel';
import { getPhanCongById, getPhanCongKtvList } from '../services/phanCongService';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';

export default function usePhanCongDetailViewModel(phanCongId) {
    const [phanCong, setPhanCong] = useState(null);
    const [ktvList, setKtvList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tbId, setTbId] = useState(null);
    const [yeuCauId, setYeuCauId] = useState(null);

    useEffect(() => {
        const fetchPhanCongData = async () => {
            if (!phanCongId) return;
            setLoading(true);

            try {
                const pc = await getPhanCongById(phanCongId);
                setPhanCong(pc);

                if (pc?.thietBiId && pc?.yeuCauId) {
                    setTbId(pc.thietBiId);
                    setYeuCauId(pc.yeuCauId);
                } else if (pc?.chiTietYeuCauId) {
                    const chiTietRef = doc(db, 'chi_tiet_yeu_cau', pc.chiTietYeuCauId.toString());
                    const chiTietSnap = await getDoc(chiTietRef);
                    if (chiTietSnap.exists()) {
                        const data = chiTietSnap.data();
                        setTbId(data.thietBiId || null);
                        setYeuCauId(data.yeuCauId || null);
                    }
                }

                if (pc?.id) {
                    const ktvs = await getPhanCongKtvList(pc.id);
                    setKtvList(ktvs);
                }
            } catch (error) {
                console.error('❌ Lỗi khi load phân công:', error);
            }

            setLoading(false);
        };

        fetchPhanCongData();
    }, [phanCongId]);

    // 👉 Gọi hook luôn với giá trị an toàn
    const safeTbId = tbId ?? '__invalid__';
    const safeYeuCauId = yeuCauId ?? '__invalid__';

    const {
        thietBi,
        chiTietYeuCau,
        yeuCau,
        tenDonVi,
        viTri,
        imageUris,
        videoUri,
    } = useDeviceDetailViewModel(tbId, yeuCauId);


    return {
        loading,
        phanCong,
        ktvList,
        thietBi,
        chiTietYeuCau,
        yeuCau,
        tenDonVi,
        viTri,
        imageUris,
        videoUri,
    };
}
