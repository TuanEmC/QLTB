import { collection, getDocs, updateDoc, doc, deleteField } from 'firebase/firestore';
import { db } from './firebaseConfig';

/**
 * Chuẩn hóa một collection Firestore theo defaultModel.
 * @param {string} collectionName
 * @param {object} defaultModel
 * @param {boolean} strict Nếu true thì sẽ xóa các field thừa không có trong defaultModel
 */
export const normalizeCollection = async (collectionName, defaultModel, strict = false) => {
  const snap = await getDocs(collection(db, collectionName));

  for (const docSnap of snap.docs) {
    const data = docSnap.data();
    const docRef = doc(db, collectionName, docSnap.id);

    const updateFields = {};
    const deleteFields = {};

    // Thêm field bị thiếu
    for (const key in defaultModel) {
      if (!(key in data)) {
        updateFields[key] = defaultModel[key];
      }
    }

    // Nếu strict, xóa các field không có trong defaultModel
    if (strict) {
      for (const key in data) {
        if (!(key in defaultModel)) {
          deleteFields[key] = deleteField();
        }
      }
    }

    const finalUpdate = { ...updateFields, ...deleteFields };

    if (Object.keys(finalUpdate).length > 0) {
      await updateDoc(docRef, finalUpdate);
      console.log(`✅ Cập nhật ${collectionName}/${docSnap.id}`);
    }
  }

  console.log(`🎉 Đã chuẩn hóa xong collection: ${collectionName}`);
};
