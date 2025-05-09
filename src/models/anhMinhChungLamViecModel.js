export const defaultAnhMinhChungLamViec = {
  phanCongKTVId: 0,
  loaiAnh: '',
  urlAnh: '',
  type: '',
  thoiGianTaiLen: Date.now(),
  ghiChu: '',
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

export const createAnhMinhChungLamViec = (doc) => ({
  id: doc.id,
  ...defaultAnhMinhChungLamViec,
  ...doc.data(),
});
