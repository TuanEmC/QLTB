export const TRANG_THAI_THIET_BI = {
    DANG_HOAT_DONG: 'Đang Hoạt Động',
    DANG_BAO_TRI: 'Đang Bảo Trì',
    CHO_BAO_TRI: 'Chờ Bảo Trì',
    DA_NGUNG_SU_DUNG: 'Đã Ngừng Sử Dụng',
};

export const getTrangThaiThietBiColor = (trangThai) => {
    switch (trangThai) {
        case TRANG_THAI_THIET_BI.DANG_HOAT_DONG: return '#4CAF50';
        case TRANG_THAI_THIET_BI.DANG_BAO_TRI: return '#FF9800';
        case TRANG_THAI_THIET_BI.CHO_BAO_TRI: return '#FFC107';
        case TRANG_THAI_THIET_BI.DA_NGUNG_SU_DUNG: return '#F44336';
        default: return '#9E9E9E';
    }
};