import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebaseConfig'; // dùng storage đã khởi tạo đúng bucket

import * as FileSystem from 'expo-file-system';

/**
 * Upload file từ local URI lên Firebase Storage
 * @param {string} uri - đường dẫn file local (ví dụ: từ ImagePicker)
 * @param {string} filePath - đường dẫn đầy đủ trong Firebase (ví dụ: 'bao_cao/image_123.jpg')
 * @returns {Promise<string|null>} - trả về link tải hoặc null nếu lỗi
 */
export const uploadToFirebase = async (uri, filePath) => {
    try {
        const reference = ref(storage, filePath);
        console.log('Uploading file:', uri);

        let blob;
        try {
            const res = await fetch(uri);
            const rawBlob = await res.blob();

            blob = rawBlob.type && rawBlob.type.startsWith('image/')
                ? rawBlob
                : rawBlob.slice(0, rawBlob.size, 'image/jpeg');
        } catch (e) {
            console.error(' Lỗi khi fetch file local:', uri, e);
            throw new Error('Không thể truy cập file ảnh. Có thể thiếu quyền hệ thống.');
        }

        await uploadBytes(reference, blob);
        const downloadURL = await getDownloadURL(reference);
        return downloadURL;
    } catch (e) {
        console.error('Upload failed:', e.message);
        console.log('🔥 Full error object:', e);
        return null;
    }
};


/**
 * Xóa file từ Firebase Storage theo đường dẫn URL
 * @param {string} fileUrl - URL file cần xóa (https://firebasestorage.googleapis.com/...)
 * @returns {Promise<void>}
 */
export const deleteFromFirebase = async (fileUrl) => {
    try {
        const refPath = getStoragePathFromUrl(fileUrl);
        if (!refPath) throw new Error('Invalid file URL');
        const reference = ref(storage, refPath);
        await deleteObject(reference);
        console.log('🗑️ File deleted from Firebase Storage:', fileUrl);
    } catch (error) {
        console.error('❌ Failed to delete from Firebase Storage:', error.message);
    }
};


/**
 * Lấy đường dẫn Firebase Storage từ URL
 * @param {string} url
 * @returns {string|null}
 */
const getStoragePathFromUrl = (url) => {
    try {
        const decoded = decodeURIComponent(url);
        const matches = decoded.match(/\/o\/(.*?)\?alt/);
        return matches?.[1].replaceAll('%2F', '/') || null;
    } catch (e) {
        return null;
    }
};
