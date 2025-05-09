export const defaultYeuCau = {
  ngayYeuCau: Date.now(),
  taiKhoanId: 0,
  trangThai: 'Bản Nháp',
  donViId: 0,
  moTa: '',
  lyDoTuChoi: '',
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

export const createYeuCau = (doc) => ({
  id: doc.id,
  ...defaultYeuCau,
  ...doc.data(),
});
