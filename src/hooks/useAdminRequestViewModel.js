import { useEffect, useState } from 'react';
import {
    getAllYeuCau,
    getChiTietCountMap,
    buildPhanCongPerYeuCau,
} from '../services/adminRequestService';
import { getAllDonVi } from '../services/donViService';
import { TRANG_THAI_YEU_CAU_ALL, TRANG_THAI_YEU_CAU_MAP, TRANG_THAI_YEU_CAU } from '../constants/trangThaiYeuCau';

export default function useAdminRequestViewModel() {
    const [originalYeuCauList, setOriginalYeuCauList] = useState([]);
    const [filteredList, setFilteredList] = useState([]);
    const [donViList, setDonViList] = useState([]);

    const [chiTietCountMap, setChiTietCountMap] = useState({});
    const [phanCongCountMap, setPhanCongCountMap] = useState({});

    const [filters, setFilters] = useState({
        trangThai: null,
        donViId: null,
    });

    const [isLoading, setIsLoading] = useState(false);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [yeuCaus, chiTietMap, phanCongMap, donVis] = await Promise.all([
                getAllYeuCau(),
                getChiTietCountMap(),
                buildPhanCongPerYeuCau(),
                getAllDonVi(),
            ]);

            console.log('✅ Tải dữ liệu thành công:', yeuCaus.length, 'yêu cầu');

            const filteredYeuCaus = yeuCaus.filter(y => y.trangThai !== TRANG_THAI_YEU_CAU.NHAP); // <-- lọc bỏ "nháp"

            setOriginalYeuCauList(filteredYeuCaus);
            setChiTietCountMap(chiTietMap);
            setPhanCongCountMap(phanCongMap);
            setDonViList(donVis);
            setFilters({ trangThai: null, donViId: null }); // reset filter
        } catch (e) {
            console.error('❌ Lỗi khi tải dữ liệu yêu cầu:', e);
        } finally {
            setIsLoading(false);
        }
    };


    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        const filtered = originalYeuCauList.filter((item) => {
            const matchTrangThai = !filters.trangThai || item.trangThai === filters.trangThai;
            const matchDonVi = !filters.donViId || item.donViId === Number(filters.donViId);
            return matchTrangThai && matchDonVi;
        });

        console.log('🔍 Áp dụng filter:', filters, `(${filtered.length} kết quả)`);
        setFilteredList(filtered);
    }, [originalYeuCauList, filters]);

    const normalize = (str) => str?.toLowerCase().trim();


    const applyFilter = (key, value) => {
        let realKey = key;
        let realValue = value;

        if (key === 'trangThai') {
            const found = Object.entries(TRANG_THAI_YEU_CAU_MAP).find(
                ([k, v]) => v === value
            );
            realValue = found?.[0];
        }

        if (key === 'donVi') {
            realKey = 'donViId'; // ✅ Đây là dòng bạn cần thêm
        }

        const newFilters = { ...filters, [realKey]: realValue };
        console.log('🎯 Đặt filter:', realKey, '=', realValue);
        setFilters(newFilters);
    };



    const clearFilters = () => {
        console.log('🧹 Xóa tất cả bộ lọc');
        setFilters({ trangThai: null, donViId: null });
    };

    return {
        yeuCauList: filteredList,
        donViList,
        filters,
        applyFilter,
        clearFilters,
        chiTietCountMap,
        phanCongCountMap,
        isLoading,
        refresh: loadData,
    };
}


