export const defaultPhong = {
  tenPhong: '',
  tangId: 0,
  dayId: 0,
  loaiPhongId: null,
  donViId: null,
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

export const createPhong = (doc) => ({
  id: doc.id,
  ...defaultPhong,
  ...doc.data(),
});
