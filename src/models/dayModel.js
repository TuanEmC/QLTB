export const defaultDay = {
  tenDay: '',
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

export const createDay = (doc) => ({
  id: doc.id,
  ...defaultDay,
  ...doc.data(),
});
