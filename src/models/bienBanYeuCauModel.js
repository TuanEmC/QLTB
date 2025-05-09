export const defaultBienBanYeuCau = {
  yeuCauId: 0,
  ngayLap: Date.now(),
  noiDung: '',
  fileDinhKem: '',
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

export const createBienBanYeuCau = (doc) => ({
  id: doc.id,
  ...defaultBienBanYeuCau,
  ...doc.data(),
});
