export const defaultLoaiPhong = {
  tenLoaiPhong: '',
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

export const createLoaiPhong = (doc) => ({
  id: doc.id,
  ...defaultLoaiPhong,
  ...doc.data(),
});
