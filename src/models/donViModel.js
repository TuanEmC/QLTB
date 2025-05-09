export const defaultDonVi = {
  tenDonVi: '',
  moTa: '',
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

export const createDonVi = (doc) => ({
  id: doc.id,
  ...defaultDonVi,
  ...doc.data(),
});

  