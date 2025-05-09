export const defaultLoaiThietBi = {
  tenLoai: '',
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

export const createLoaiThietBi = (doc) => ({
  id: doc.id,
  ...defaultLoaiThietBi,
  ...doc.data(),
});
