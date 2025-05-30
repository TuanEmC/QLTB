import { useEffect, useState } from 'react';
import {
    getThietBiById,
    getChiTietYeuCau,
    getYeuCauById,
    getTenDonViById,
    getViTriByThietBi,
    getMinhChungByChiTietId,
} from '../services/deviceDetailService';

export default function useDeviceDetailViewModel(thietBiId, yeuCauId = null) {
    const [thietBi, setThietBi] = useState(null);
    const [chiTietYeuCau, setChiTietYeuCau] = useState(null);
    const [yeuCau, setYeuCau] = useState(null);
    const [tenDonVi, setTenDonVi] = useState('');
    const [viTri, setViTri] = useState('');
    const [imageUris, setImageUris] = useState([]);
    const [videoUri, setVideoUri] = useState(null);
    const [loading, setLoading] = useState(true);

    // useEffect(() => {
    //     const fetchAll = async () => {
    //         setLoading(true);
    //         try {
    //             const tb = await getThietBiById(thietBiId);
    //             setThietBi(tb);
    //             const viTriStr = await getViTriByThietBi(tb);
    //             setViTri(viTriStr);

    //             if (yeuCauId) {
    //                 const chiTiet = await getChiTietYeuCau(yeuCauId, thietBiId);
    //                 setChiTietYeuCau(chiTiet);

    //                 if (chiTiet) {
    //                     const media = await getMinhChungByChiTietId(chiTiet.id);
    //                     setImageUris(media.images);
    //                     setVideoUri(media.video);
    //                 }

    //                 const yc = await getYeuCauById(yeuCauId);
    //                 setYeuCau(yc);

    //                 const donViTen = await getTenDonViById(yc?.donViId);
    //                 setTenDonVi(donViTen);
    //             }
    //         } catch (e) {
    //             console.error('❌ Lỗi trong useDeviceDetailViewModel:', e);
    //         }
    //         setLoading(false);
    //     };

    //     fetchAll();
    // }, [thietBiId, yeuCauId]);

    useEffect(() => {
        const fetchAll = async () => {
            setLoading(true);
            try {
                // console.log('🚀 Bắt đầu load chi tiết thiết bị');
                // console.log('📌 thietBiId =', thietBiId);
                const tb = await getThietBiById(thietBiId);
                if (!tb) throw new Error('Không tìm thấy thiết bị');
                // console.log('✅ Thiết bị:', tb);
                setThietBi(tb);

                const viTriStr = await getViTriByThietBi(tb);
                setViTri(viTriStr);

                if (yeuCauId) {
                    // console.log('📌 yeuCauId =', yeuCauId);
                    const chiTiet = await getChiTietYeuCau(yeuCauId, thietBiId);
                    // console.log('✅ Chi tiết yêu cầu:', chiTiet);
                    setChiTietYeuCau(chiTiet);

                    if (chiTiet) {
                        const media = await getMinhChungByChiTietId(chiTiet.id);
                        // console.log('🖼️ Media:', media);
                        setImageUris(media.images);
                        setVideoUri(media.video);
                    }

                    const yc = await getYeuCauById(yeuCauId);
                    // console.log('✅ Yêu cầu:', yc);
                    setYeuCau(yc);

                    const donViTen = await getTenDonViById(yc?.donViId);
                    // console.log('🏢 Đơn vị:', donViTen);
                    setTenDonVi(donViTen);
                }
            } catch (e) {
                // console.error('❌ Lỗi trong useDeviceDetailViewModel:', e);
            }
            setLoading(false);
        };

        fetchAll();
    }, [thietBiId, yeuCauId]);


    return {
        thietBi,
        chiTietYeuCau,
        yeuCau,
        tenDonVi,
        viTri,
        imageUris,
        videoUri,
        loading,
    };
}

//đối với phần thông tin yêu cầu thì còn chưa truy vấn đủ và còn báo lỗi trong log, còn đối với các thiết bị cũ thì truy vấn không ra, có thể do lỗi kiểu dữ liệu id 