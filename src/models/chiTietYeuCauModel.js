export const defaultChiTietYeuCau = {
  yeuCauId: 0,
  thietBiId: null,
  loaiYeuCau: '',
  moTa: '',
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

export const createChiTietYeuCau = (doc) => ({
  id: doc.id,
  ...defaultChiTietYeuCau,
  ...doc.data(),
});
