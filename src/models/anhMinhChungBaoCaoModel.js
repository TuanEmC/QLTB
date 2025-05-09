export const defaultAnhMinhChungBaoCao = {
  chiTietBaoCaoId: 0,
  urlAnh: '',
  type: '',
  thoiGianTaiLen: Date.now(),
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

export const createAnhMinhChungBaoCao = (doc) => ({
  id: doc.id,
  ...defaultAnhMinhChungBaoCao,
  ...doc.data(),
});

  