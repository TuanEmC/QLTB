export const defaultChuyenMonKtv = {
  chuyenMonId: 0,
  kyThuatVienId: 0,
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

export const createChuyenMonKtv = (doc) => ({
  id: doc.id,
  ...defaultChuyenMonKtv,
  ...doc.data(),
});
