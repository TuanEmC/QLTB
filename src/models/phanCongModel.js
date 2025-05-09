export const defaultPhanCong = {
  chiTietYeuCauId: 0,
  thietBiId: 0,
  loaiPhanCong: '',
  ghiChu: '',
  mucDoUuTien: 1,
  nguoiTaoPhanCong: null,
  thoiGianTaoPhanCong: Date.now(),
  trangThai: '',
  soLuongKTVThamGia: null,
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

export const createPhanCong = (doc) => ({
  id: doc.id,
  ...defaultPhanCong,
  ...doc.data(),
});
