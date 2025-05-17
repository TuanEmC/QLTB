// // src/components/ChiTietYeuCauFormSection.js
// import React, { useState } from 'react';
// import { View, Text, TextInput, Button, TouchableOpacity, StyleSheet, Image } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import * as ImagePicker from 'expo-image-picker';
// import useAppTheme from '../hooks/useAppTheme';
// import { LOAI_YEU_CAU_ALL } from '../constants/loaiYeuCau';
// import { Modal } from 'react-native';
// import { LOAI_YEU_CAU } from '../constants/loaiYeuCau';
// import { ScrollView } from 'react-native-gesture-handler';
// import {
//   saveChiTietYeuCauToFirestore,
//   updateChiTietYeuCauInFirestore
// } from '../services/chiTietYeuCauService';



// export default function ChiTietYeuCauFormSection({ onSubmit }) {
//     const { colors } = useAppTheme();
//     const [loaiYeuCau, setLoaiYeuCau] = useState(null);
//     const [moTa, setMoTa] = useState('');
//     //const [selectedImage, setSelectedImage] = useState(null);
//     const [selectedImages, setSelectedImages] = useState([]);

//     const [showLoaiSheet, setShowLoaiSheet] = useState(false);

//     const [isExistingDetail, setIsExistingDetail] = useState(false);
//     useEffect(() => {
//     if (chiTietYeuCauId) {
//         // gọi Firestore để load chi tiết yêu cầu + media
//         setIsExistingDetail(true);
//         // -> setLoaiYeuCau, moTa, selectedImages, selectedVideo từ Firestore
//     }
//     }, []);

//     const handleSave = async () => {
//     if (!loaiYeuCau || !moTa.trim()) return;

//     if (isExistingDetail) {
//         await updateChiTietYeuCau(chiTietYeuCauId, {
//         loaiYeuCau,
//         moTa,
//         images: selectedImages,
//         video: selectedVideo
//         });
//     } else {
//         await createChiTietYeuCau({
//         yeuCauId,
//         thietBiId,
//         loaiYeuCau,
//         moTa,
//         images: selectedImages,
//         video: selectedVideo
//         });
//     }

//     onSuccess?.();
//     };



//     const handleSubmit = () => {
//         if (!loaiYeuCau || !moTa.trim()) return;
//         //onSubmit({ loaiYeuCau, moTa, image: selectedImage });
//         onSubmit({ loaiYeuCau, moTa, images: selectedImages });

//     };

//     // const pickImage = async () => {
//     //     const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7 });
//     //     if (!result.canceled) {
//     //         setSelectedImage(result.assets[0]);
//     //     }
//     // };

//     // const takePhoto = async () => {
//     //     const result = await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7 });
//     //     if (!result.canceled) {
//     //         setSelectedImage(result.assets[0]);
//     //     }
//     // };
//     const pickImage = async () => {
//         const result = await ImagePicker.launchImageLibraryAsync({
//             mediaTypes: ImagePicker.MediaTypeOptions.Images,
//             quality: 0.7,
//             allowsMultipleSelection: true,
//             selectionLimit: 5 - selectedImages.length,
//         });
//         if (!result.canceled) {
//             const newAssets = result.assets.slice(0, 5 - selectedImages.length);
//             setSelectedImages([...selectedImages, ...newAssets]);
//         }
//     };

//     const takePhoto = async () => {
//         const result = await ImagePicker.launchCameraAsync({
//             mediaTypes: ImagePicker.MediaTypeOptions.Images,
//             quality: 0.7,
//         });
//         if (!result.canceled) {
//             if (selectedImages.length < 5) {
//                 setSelectedImages([...selectedImages, result.assets[0]]);
//             }
//         }
//     };


//     return (
//         <View style={styles.container}>
//             <Text style={[styles.label, { color: colors.onSurface }]}>Loại yêu cầu</Text>

//             <TouchableOpacity
//                 style={[styles.selectBox, { borderColor: colors.outlineVariant }]}
//                 onPress={() => setShowLoaiSheet(true)}
//             >
//                 <Text style={{ color: loaiYeuCau ? colors.onSurface : colors.onSurfaceVariant }}>
//                     {LOAI_YEU_CAU[loaiYeuCau] || 'Chọn loại yêu cầu'}
//                 </Text>

//                 <Ionicons name="chevron-down" size={18} color={colors.onSurfaceVariant} />
//             </TouchableOpacity>

//             <Text style={[styles.label, { color: colors.onSurface, marginTop: 16 }]}>Mô tả chi tiết</Text>
//             <TextInput
//                 style={[styles.input, { borderColor: colors.outlineVariant, color: colors.onSurface }]}
//                 multiline
//                 numberOfLines={4}
//                 placeholder="Nhập mô tả..."
//                 placeholderTextColor={colors.onSurfaceVariant}
//                 value={moTa}
//                 onChangeText={setMoTa}
//             />

//             <View style={styles.imageActions}>
//                 <Button title="Chọn ảnh" onPress={pickImage} />
//                 <View style={{ width: 12 }} />
//                 <Button title="Chụp ảnh" onPress={takePhoto} />
//             </View>


//             {selectedImages.length > 0 && (
//                 <View style={styles.previewListWrapper}>
//                     <ScrollView horizontal showsHorizontalScrollIndicator={false}>
//                         {selectedImages.map((img, index) => (
//                             <View key={index} style={styles.previewItem}>
//                                 <Image source={{ uri: img.uri }} style={styles.previewImage} />
//                                 <TouchableOpacity
//                                     onPress={() => {
//                                         const newImages = selectedImages.filter((_, i) => i !== index);
//                                         setSelectedImages(newImages);
//                                     }}
//                                     style={styles.removeIcon}
//                                 >
//                                     <Ionicons name="close-circle" size={20} color={colors.error} />
//                                 </TouchableOpacity>
//                             </View>
//                         ))}
//                     </ScrollView>
//                 </View>
//             )}



//             <View style={{ marginTop: 20 }}>
//                 <Button title="Thêm thiết bị vào yêu cầu" onPress={handleSubmit} disabled={!loaiYeuCau || !moTa.trim()} />
//             </View>

//             {/* Bottom Sheet Loại yêu cầu */}
//             <Modal
//                 visible={showLoaiSheet}
//                 animationType="slide"
//                 transparent
//                 onRequestClose={() => setShowLoaiSheet(false)}
//             >
//                 <View style={styles.sheetOverlay}>
//                     <View style={[styles.sheet, { backgroundColor: colors.surface }]}>
//                         {Object.entries(LOAI_YEU_CAU).map(([key, label]) => (
//                             <TouchableOpacity
//                                 key={key}
//                                 style={styles.sheetItem}
//                                 onPress={() => {
//                                     setLoaiYeuCau(key); // Lưu key chuẩn như 'SUA_CHUA'
//                                     setShowLoaiSheet(false);
//                                 }}
//                             >
//                                 <Text style={{ color: colors.onSurface }}>{label}</Text>
//                             </TouchableOpacity>
//                         ))}

//                         <TouchableOpacity onPress={() => setShowLoaiSheet(false)}>
//                             <Text style={{ color: colors.primary, marginTop: 12 }}>Đóng</Text>
//                         </TouchableOpacity>
//                     </View>
//                 </View>
//             </Modal>


//         </View>
//     );
// }

// const styles = StyleSheet.create({
//     previewListWrapper: {
//         marginTop: 12,
//         flexDirection: 'row',
//         height: 140,
//     },
//     previewItem: {
//         marginRight: 12,
//         width: 120,
//         height: 120,
//         borderRadius: 8,
//         overflow: 'hidden',
//         position: 'relative',
//     },
//     previewImage: {
//         width: '100%',
//         height: '100%',
//         borderRadius: 8,
//     },
//     removeIcon: {
//         position: 'absolute',
//         top: 4,
//         right: 4,
//         backgroundColor: 'rgba(0,0,0,0.5)',
//         borderRadius: 12,
//         padding: 4,
//     },

//     previewWrapper: {
//         marginTop: 12,
//         width: '100%',
//         height: 240,
//         borderRadius: 8,
//         overflow: 'hidden',
//     },
//     container: {
//         padding: 16,
//     },
//     label: {
//         fontWeight: '600',
//         marginBottom: 4,
//     },
//     selectBox: {
//         borderWidth: 1,
//         borderRadius: 8,
//         padding: 10,
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//     },
//     input: {
//         borderWidth: 1,
//         borderRadius: 8,
//         padding: 10,
//         textAlignVertical: 'top',
//     },
//     imageActions: {
//         marginTop: 16,
//         flexDirection: 'row',
//     },
//     previewImage: {
//         width: '100%',
//         height: '100%',
//         borderRadius: 8,
//     },
//     removeIcon: {
//         position: 'absolute',
//         top: 6,
//         right: 6,
//         backgroundColor: 'gray',
//         borderRadius: 10,
//         padding: 10,
//     },
//     sheetOverlay: {
//         position: 'absolute',
//         top: 0,
//         bottom: 0,
//         left: 0,
//         right: 0,
//         backgroundColor: 'rgba(0,0,0,0.4)',
//         justifyContent: 'flex-end',
//         paddingTop: 100,
//         zIndex: 1000,
//     },

//     sheet: {
//         padding: 16,
//         borderTopLeftRadius: 12,
//         borderTopRightRadius: 12,
//     },
//     sheetItem: {
//         paddingVertical: 12,
//     },
// });


// src/components/ChiTietYeuCauFormSection.js
import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, TouchableOpacity, StyleSheet, Image, Modal, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import useAppTheme from '../hooks/useAppTheme';
import { LOAI_YEU_CAU } from '../constants/loaiYeuCau';
import { db } from '../services/firebaseConfig';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { saveChiTietYeuCauToFirestore, updateChiTietYeuCauInFirestore } from '../services/chiTietYeuCauService';
import { useNavigation } from '@react-navigation/native';
import { ActivityIndicator } from 'react-native';



export default function ChiTietYeuCauFormSection({ yeuCauId, thietBiId, chiTietYeuCauId = null, onSuccess = () => { } }) {
    const { colors } = useAppTheme();
    const [loaiYeuCau, setLoaiYeuCau] = useState(null);
    const [moTa, setMoTa] = useState('');
    const [selectedImages, setSelectedImages] = useState([]);
    const [showLoaiSheet, setShowLoaiSheet] = useState(false);
    const [isExistingDetail, setIsExistingDetail] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigation = useNavigation();


    useEffect(() => {
        const fetchData = async () => {
            if (chiTietYeuCauId) {
                setIsExistingDetail(true);
                const docSnap = await getDoc(doc(db, 'chi_tiet_yeu_cau', chiTietYeuCauId));
                const data = docSnap.data();
                setLoaiYeuCau(data?.loaiYeuCau || null);
                setMoTa(data?.moTa || '');

                const mediaSnap = await getDocs(query(
                    collection(db, 'anh_minh_chung'),
                    where('chiTietId', '==', chiTietYeuCauId)
                ));

                const images = mediaSnap.docs
                    .map(doc => doc.data())
                    .filter(m => m.type === 'image')
                    .map(m => ({ uri: m.urlAnh }));

                setSelectedImages(images);
            }
        };

        fetchData();
    }, [chiTietYeuCauId]);

    const pickImage = async () => {

        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Quyền bị từ chối', 'Ứng dụng cần quyền truy cập thư viện ảnh để hoạt động.');
            return;
        }


        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.7,
            allowsMultipleSelection: true,
            selectionLimit: 5 - selectedImages.length,
        });
        if (!result.canceled) {
            const newAssets = result.assets.slice(0, 5 - selectedImages.length);
            setSelectedImages([...selectedImages, ...newAssets]);
        }
    };

    const takePhoto = async () => {
        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.7,
        });
        if (!result.canceled) {
            if (selectedImages.length < 5) {
                setSelectedImages([...selectedImages, result.assets[0]]);
            }
        }
    };

    const handleSave = async () => {
        if (!loaiYeuCau || !moTa.trim()) return;

        setIsLoading(true);

        try {
            if (isExistingDetail) {
                await updateChiTietYeuCauInFirestore(chiTietYeuCauId, {
                    loaiYeuCau,
                    moTa,
                    images: selectedImages,
                });
            } else {
                await saveChiTietYeuCauToFirestore({
                    yeuCauId,
                    thietBiId,
                    loaiYeuCau,
                    moTa,
                    images: selectedImages,
                });
            }

            onSuccess?.();         // callback gọi từ `ThietBiDetailScreen`
            //navigation.goBack();
        } catch (e) {
            console.error('❌ Lỗi khi lưu chi tiết yêu cầu:', e);
            Alert.alert(
                'Lỗi',
                'Không thể lưu chi tiết yêu cầu. Vui lòng kiểm tra lại ảnh hoặc kết nối mạng.'
            );
        } finally {
            setIsLoading(false); // 👉 Tắt loading
        }
    };


    // return (
    //     <View style={[styles.container, { flex: 1 }]}>
    //         <Text style={[styles.label, { color: colors.onSurface }]}>Loại yêu cầu</Text>

    //         <TouchableOpacity
    //             style={[styles.selectBox, { borderColor: colors.outlineVariant }]}
    //             onPress={() => setShowLoaiSheet(true)}
    //         >
    //             <Text style={{ color: loaiYeuCau ? colors.onSurface : colors.onSurfaceVariant }}>
    //                 {LOAI_YEU_CAU[loaiYeuCau] || 'Chọn loại yêu cầu'}
    //             </Text>
    //             <Ionicons name="chevron-down" size={18} color={colors.onSurfaceVariant} />
    //         </TouchableOpacity>

    //         <Text style={[styles.label, { color: colors.onSurface, marginTop: 16 }]}>Mô tả chi tiết</Text>
    //         <TextInput
    //             style={[styles.input, { borderColor: colors.outlineVariant, color: colors.onSurface }]}
    //             multiline
    //             numberOfLines={4}
    //             placeholder="Nhập mô tả..."
    //             placeholderTextColor={colors.onSurfaceVariant}
    //             value={moTa}
    //             onChangeText={setMoTa}
    //         />

    //         <View style={styles.imageActions}>
    //             <Button title="Chọn ảnh" onPress={pickImage} />
    //             <View style={{ width: 12 }} />
    //             <Button title="Chụp ảnh" onPress={takePhoto} />
    //         </View>

    //         {selectedImages.length > 0 && (
    //             <View style={styles.previewListWrapper}>
    //                 <ScrollView horizontal showsHorizontalScrollIndicator={false}>
    //                     {selectedImages.map((img, index) => (
    //                         <View key={index} style={styles.previewItem}>
    //                             <Image source={{ uri: img.uri }} style={styles.previewImage} />
    //                             <TouchableOpacity
    //                                 onPress={() => setSelectedImages(selectedImages.filter((_, i) => i !== index))}
    //                                 style={styles.removeIcon}
    //                             >
    //                                 <Ionicons name="close-circle" size={20} color={colors.error} />
    //                             </TouchableOpacity>
    //                         </View>
    //                     ))}
    //                 </ScrollView>
    //             </View>
    //         )}

    //         <View style={{ marginTop: 20 }}>
    //             <Button
    //                 title={isExistingDetail ? 'Cập nhật chi tiết yêu cầu' : 'Thêm thiết bị vào yêu cầu'}
    //                 onPress={handleSave}
    //                 disabled={!loaiYeuCau || !moTa.trim()}
    //             />
    //         </View>

    //         <Modal visible={showLoaiSheet} animationType="slide" transparent onRequestClose={() => setShowLoaiSheet(false)}>
    //             <View style={styles.sheetOverlay}>
    //                 <View style={[styles.sheet, { backgroundColor: colors.surface }]}>
    //                     {Object.entries(LOAI_YEU_CAU).map(([key, label]) => (
    //                         <TouchableOpacity
    //                             key={key}
    //                             style={styles.sheetItem}
    //                             onPress={() => {
    //                                 setLoaiYeuCau(key);
    //                                 setShowLoaiSheet(false);
    //                             }}
    //                         >
    //                             <Text style={{ color: colors.onSurface }}>{label}</Text>
    //                         </TouchableOpacity>
    //                     ))}
    //                     <TouchableOpacity onPress={() => setShowLoaiSheet(false)}>
    //                         <Text style={{ color: colors.primary, marginTop: 12 }}>Đóng</Text>
    //                     </TouchableOpacity>
    //                 </View>
    //             </View>
    //         </Modal>
    //     </View>
    // );
    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={{ marginTop: 12 }}>Đang lưu chi tiết và tải ảnh...</Text>
            </View>

        );
    }


    return (
        <ScrollView
            contentContainerStyle={{
                flexGrow: 1,
                justifyContent: 'space-between',

            }}
            keyboardShouldPersistTaps="handled"
        >
            <View>
                <View style={[styles.container, { flex: 1 }]}>
                    <Text style={[styles.label, { color: colors.onSurface }]}>Loại yêu cầu</Text>

                    <TouchableOpacity
                        style={[styles.selectBox, { borderColor: colors.outlineVariant }]}
                        onPress={() => setShowLoaiSheet(true)}
                    >
                        <Text style={{ color: loaiYeuCau ? colors.onSurface : colors.onSurfaceVariant }}>
                            {LOAI_YEU_CAU[loaiYeuCau] || 'Chọn loại yêu cầu'}
                        </Text>
                        <Ionicons name="chevron-down" size={18} color={colors.onSurfaceVariant} />
                    </TouchableOpacity>

                    <Text style={[styles.label, { color: colors.onSurface, marginTop: 16 }]}>Mô tả chi tiết</Text>
                    <TextInput
                        style={[styles.input, { borderColor: colors.outlineVariant, color: colors.onSurface }]}
                        multiline
                        numberOfLines={4}
                        placeholder="Nhập mô tả..."
                        placeholderTextColor={colors.onSurfaceVariant}
                        value={moTa}
                        onChangeText={setMoTa}
                    />

                    <View style={styles.imageActions}>
                        <Button title="Chọn ảnh" onPress={pickImage} />
                        <View style={{ width: 12 }} />
                        <Button title="Chụp ảnh" onPress={takePhoto} />
                    </View>

                    {selectedImages.length > 0 && (
                        <View style={styles.previewListWrapper}>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                {selectedImages.map((img, index) => (
                                    <View key={index} style={styles.previewItem}>
                                        <Image source={{ uri: img.uri }} style={styles.previewImage} />
                                        <TouchableOpacity
                                            onPress={() => setSelectedImages(selectedImages.filter((_, i) => i !== index))}
                                            style={styles.removeIcon}
                                        >
                                            <Ionicons name="close-circle" size={20} color={colors.error} />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </ScrollView>
                        </View>
                    )}


                    <Modal visible={showLoaiSheet} animationType="slide" transparent onRequestClose={() => setShowLoaiSheet(false)}>
                        <View style={styles.sheetOverlay}>
                            <View style={[styles.sheet, { backgroundColor: colors.surface }]}>
                                {Object.entries(LOAI_YEU_CAU).map(([key, label]) => (
                                    <TouchableOpacity
                                        key={key}
                                        style={styles.sheetItem}
                                        onPress={() => {
                                            setLoaiYeuCau(key);
                                            setShowLoaiSheet(false);
                                        }}
                                    >
                                        <Text style={{ color: colors.onSurface }}>{label}</Text>
                                    </TouchableOpacity>
                                ))}
                                <TouchableOpacity onPress={() => setShowLoaiSheet(false)}>
                                    <Text style={{ color: colors.primary, marginTop: 12 }}>Đóng</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Modal>
                </View>
            </View>

            <View style={{ marginTop: 20, padding: 16 }}>
                <Button
                    title={isExistingDetail ? 'Cập nhật chi tiết yêu cầu' : 'Thêm thiết bị vào yêu cầu'}
                    onPress={handleSave}
                    disabled={!loaiYeuCau || !moTa.trim()}
                />
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { padding: 16 },
    label: { fontWeight: '600', marginBottom: 4 },
    selectBox: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    input: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 10,
        textAlignVertical: 'top',
    },
    imageActions: { marginTop: 16, flexDirection: 'row' },
    previewListWrapper: { marginTop: 12, flexDirection: 'row', height: 140 },
    previewItem: {
        marginRight: 12,
        width: 120,
        height: 120,
        borderRadius: 8,
        overflow: 'hidden',
        position: 'relative',
    },
    previewImage: { width: '100%', height: '100%', borderRadius: 8 },
    removeIcon: {
        position: 'absolute',
        top: 4,
        right: 4,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 12,
        padding: 4,
    },
    sheetOverlay: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'flex-end',
        paddingTop: 100,
        zIndex: 1000,
    },
    sheet: {
        padding: 16,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
    },
    sheetItem: { paddingVertical: 12 },
});
