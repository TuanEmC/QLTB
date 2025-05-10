export const TRANG_THAI_KTV = {
    DANG_LAM_VIEC: 'Đang Làm Việc',
    DANG_NGHI: 'Đang Nghỉ',
    DA_THOI_VIEC: 'Đã Thôi Việc',
    CHO_XAC_NHAN: 'Chờ Xác Nhận',
};

export const getTrangThaiKtvColor = (trangThai) => {
    switch (trangThai) {
        case TRANG_THAI_KTV.DANG_LAM_VIEC: return '#4CAF50';
        case TRANG_THAI_KTV.DANG_NGHI: return '#FFC107';
        case TRANG_THAI_KTV.DA_THOI_VIEC: return '#9E9E9E';
        case TRANG_THAI_KTV.CHO_XAC_NHAN: return '#2196F3';
        default: return '#BDBDBD';
    }
};