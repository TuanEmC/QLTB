// src/hooks/useCreateYeuCauViewModel.js
import { useState, useEffect } from 'react';
import { createYeuCauRecord, getYeuCauById, updateYeuCauStatus } from '../services/yeuCauService';
import { getChiTietYeuCauWithDisplay } from '../services/chiTietYeuCauService';

export default function useCreateYeuCauViewModel() {
    const [yeuCau, setYeuCau] = useState(null);
    const [yeuCauId, setYeuCauId] = useState(null);
    const [chiTietList, setChiTietList] = useState([]);
    const [snackbarMessage, setSnackbarMessage] = useState(null);

    const createNewYeuCau = async (taiKhoanId, donViId, moTa) => {
        const id = await createYeuCauRecord(taiKhoanId, donViId, moTa);
        setYeuCauId(id);
        return id;
    };


    const loadYeuCau = async (id) => {
        const yc = await getYeuCauById(id);
        if (yc) {
            setYeuCau(yc);
        }
    };


    const loadChiTietList = async (id) => {
        try {
            //console.log('✅ id yeu cau de load chi tiet:', id);
            const list = await getChiTietYeuCauWithDisplay(id);
            //console.log('✅ Danh sách chi tiết tải được:', list);
            setChiTietList(list);
        } catch (e) {
            console.error('❌ Lỗi khi load chi tiết yêu cầu:', e);
        }
    };



    const capNhatTrangThai = async (status) => {
        if (!yeuCauId) return;
        await updateYeuCauStatus(yeuCauId, status);
        setYeuCau(prev => ({ ...prev, trangThai: status }));
        setSnackbarMessage(`Đã cập nhật trạng thái yêu cầu: ${status}`);
    };

    const clearSnackbar = () => setSnackbarMessage(null);

    return {
        yeuCau,
        yeuCauId,
        chiTietList,
        snackbarMessage,
        setYeuCauId,
        createNewYeuCau,
        loadYeuCau,
        loadChiTietList,
        capNhatTrangThai,
        clearSnackbar
    };
}
