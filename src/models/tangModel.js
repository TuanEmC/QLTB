export const defaultTang = {
  tenTang: '',
  dayId: 0,
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

export const createTang = (doc) => ({
  id: doc.id,
  ...defaultTang,
  ...doc.data(),
});
