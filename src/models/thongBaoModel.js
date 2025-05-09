export const defaultThongBao = {
  nguoiNhanId: 0,
  tieuDe: '',
  noiDung: '',
  loai: 'he_thong',
  thoiGian: Date.now(),
  daDoc: false,
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

export const createThongBao = (doc) => ({
  id: doc.id,
  ...defaultThongBao,
  ...doc.data(),
});

  