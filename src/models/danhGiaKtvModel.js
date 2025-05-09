export const defaultDanhGiaKtv = {
  phanCongKtvId: 0,
  nguoiDanhGiaId: 0,
  diem: 0,
  nhanXet: '',
  thoiGian: Date.now(),
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

export const createDanhGiaKtv = (doc) => ({
  id: doc.id,
  ...defaultDanhGiaKtv,
  ...doc.data(),
});
