export const TRANG_THAI_YEU_CAU = {
    NHAP: 'Bản Nháp',
    CHO_XAC_NHAN: 'Chờ Xác Nhận',
    DA_XAC_NHAN: 'Đã Xác Nhận',
    DANG_XU_LY: 'Đang Xử Lý',
    DA_XU_LY: 'Đã Xử Lý',
    TU_CHOI: 'Đã Từ Chối',
    DA_HUY: 'Đã Hủy Bỏ',
    DA_NGHIEM_THU: 'Đã Nghiệm Thu',
};

export const TRANG_THAI_YEU_CAU_ALL = Object.values(TRANG_THAI_YEU_CAU);

export const TRANG_THAI_YEU_CAU_MAP = Object.entries(TRANG_THAI_YEU_CAU).reduce(
    (acc, [key, label]) => ({ ...acc, [label]: key }),
    {}
);


export const getTrangThaiYeuCauColor = (trangThai) => {
    switch (trangThai) {
        case TRANG_THAI_YEU_CAU.CHO_XAC_NHAN:
            return '#FFC107'; // vàng
        case TRANG_THAI_YEU_CAU.DA_XAC_NHAN:
            return '#1976D2'; // xanh dương đậm
        case TRANG_THAI_YEU_CAU.DANG_XU_LY:
            return '#FF9800'; // cam
        case TRANG_THAI_YEU_CAU.DA_XU_LY:
            return '#4CAF50'; // xanh lá
        case TRANG_THAI_YEU_CAU.TU_CHOI:
            return '#F44336'; // đỏ
        case TRANG_THAI_YEU_CAU.DA_HUY:
            return '#9E9E9E'; // xám
        case TRANG_THAI_YEU_CAU.DA_NGHIEM_THU:
            return '#009688'; // teal
        case TRANG_THAI_YEU_CAU.NHAP:
            return '#BDBDBD'; // xám nhạt
        default:
            return '#CCCCCC'; // fallback
    }
};
