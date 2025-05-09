export const defaultBaiViet = {
  tieuDe: '',
  moTa: '',
  anhDaiDien: '',
  link: '',
  noiDungHtml: '',
  thoiGianTao: Date.now(),
  nguoiTaoId: null,
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

export const createBaiViet = (doc) => ({
  id: doc.id,
  ...defaultBaiViet,
  ...doc.data(),
});
