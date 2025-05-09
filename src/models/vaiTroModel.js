export const defaultVaiTro = {
  tenVaiTro: '',
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

export const createVaiTro = (doc) => ({
  id: doc.id,
  ...defaultVaiTro,
  ...doc.data(),
});
