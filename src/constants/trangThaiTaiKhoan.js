export const TRANG_THAI_TAI_KHOAN = {
    TRUC_TUYEN: 'Trực Tuyến',
    NGOAI_TUYEN: 'Ngoại Tuyến',
    BI_KHOA: 'Bị Khóa',
    CHO_XAC_THUC: 'Chờ Xác Thực',
    TU_CHOI_XAC_THUC: 'Từ Chối Xác Thực',
};

export const getTrangThaiTaiKhoanColor = (trangThai) => {
    switch (trangThai) {
        case TRANG_THAI_TAI_KHOAN.TRUC_TUYEN: return '#4CAF50';
        case TRANG_THAI_TAI_KHOAN.NGOAI_TUYEN: return '#BDBDBD';
        case TRANG_THAI_TAI_KHOAN.BI_KHOA: return '#F44336';
        case TRANG_THAI_TAI_KHOAN.CHO_XAC_THUC: return '#2196F3';
        case TRANG_THAI_TAI_KHOAN.TU_CHOI_XAC_THUC: return '#FF9800';
        default: return '#9E9E9E';
    }
};