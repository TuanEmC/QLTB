export const defaultTaiKhoan = {
  tenTaiKhoan: '',
  matKhau: '',
  vaiTroId: 0,
  soDienThoai: '',
  email: '',
  hoTen: '',
  trangThai: 'ngoai_tuyen',
  lastLogin: null,
  donViId: null,
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

export const createTaiKhoan = (doc) => ({
  id: doc.id,
  ...defaultTaiKhoan,
  ...doc.data(),
});
