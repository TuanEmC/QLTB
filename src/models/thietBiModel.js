export const defaultThietBi = {
  tenThietBi: '',
  loaiThietBiId: 0,
  phongId: null,
  tangId: null,
  trangThai: 'Đang Hoạt Động',
  ngayDaCat: null,
  ngayDungSuDung: null,
  ghiChu: '',
  ngayBaoDuongGanNhat: null,
  ngayBaoDuongTiepTheo: null,
  baoDuongDinhKy: null,
  loaiBaoDuong: '',
  ghiChuBaoDuong: '',
  moTa: '',
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

export const createThietBi = (doc) => ({
  ...defaultThietBi,
  ...doc.data(),
  id: doc.id,
});
