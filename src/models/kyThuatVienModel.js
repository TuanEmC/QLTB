export const defaultKyThuatVien = {
  taiKhoanId: 0,
  kinhNghiem: null,
  ngayBatDauLam: null,
  trangThaiHienTai: 'Đang Nghỉ',
  ghiChu: '',
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

export const createKyThuatVien = (doc) => ({
  id: doc.id,
  ...defaultKyThuatVien,
  ...doc.data(),
});
