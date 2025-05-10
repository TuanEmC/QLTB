export const TRANG_THAI_PHAN_CONG = {
    CHO_PHAN_HOI: 'Chờ Phản Hồi',
    DA_CHAP_NHAN: 'Đã Chấp Nhận',
    DA_TU_CHOI: 'Đã Từ Chối',
    DANG_THUC_HIEN: 'Đang Thực Hiện',
    TAM_NGHI: 'Tạm Nghỉ',
    HOAN_THANH: 'Hoàn Thành',
    BI_HUY: 'Bị Hủy',
};

export const TRANG_THAI_PHAN_CONG_ALL = Object.values(TRANG_THAI_PHAN_CONG);

export const getTrangThaiPhanCongColor = (trangThai) => {
    switch (trangThai) {
        case TRANG_THAI_PHAN_CONG.CHO_PHAN_HOI: return '#9E9E9E';
        case TRANG_THAI_PHAN_CONG.DA_CHAP_NHAN: return '#1976D2';
        case TRANG_THAI_PHAN_CONG.DA_TU_CHOI: return '#F44336';
        case TRANG_THAI_PHAN_CONG.DANG_THUC_HIEN: return '#FF9800';
        case TRANG_THAI_PHAN_CONG.TAM_NGHI: return '#FFC107';
        case TRANG_THAI_PHAN_CONG.HOAN_THANH: return '#4CAF50';
        case TRANG_THAI_PHAN_CONG.BI_HUY: return '#BDBDBD';
        default: return '#CCCCCC';
    }
};