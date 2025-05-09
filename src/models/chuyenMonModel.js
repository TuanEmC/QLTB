export const defaultChuyenMon = {
  tenChuyenMon: '',
  moTa: '',
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

export const createChuyenMon = (doc) => ({
  id: doc.id,
  ...defaultChuyenMon,
  ...doc.data(),
});
