import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image, Alert, Dimensions, TouchableOpacity, StatusBar, Linking } from 'react-native'; // Added StatusBar and TouchableOpacity
import { useRoute, useNavigation } from '@react-navigation/native';
import useAppTheme from '../../hooks/useAppTheme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { storage } from '../../services/firebaseConfig';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { doc, updateDoc, arrayUnion, getDoc, arrayRemove, deleteDoc, collection, query, where, getDocs } from 'firebase/firestore'; // Corrected import path if necessary, assuming firebase SDK v9
import { db } from '../../services/firebaseConfig';
import AppLayout from '../../components/layout/AppLayout';
import { Card, Text, Title, Paragraph, Chip, Button, Divider, Portal, Dialog, TextInput, ActivityIndicator, IconButton, Menu, FAB, List, RadioButton } from 'react-native-paper'; // Added Text
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view'; // Added TabBar
import { useSession } from '../../context/SessionContext';
import WorkProgress from './WorkProgress';

const initialLayout = { width: Dimensions.get('window').width };

const TASK_STATUSES = [
  { value: 'Chưa Bắt Đầu', label: 'Chưa Bắt Đầu' },
  { value: 'Đang Thực Hiện', label: 'Đang Thực Hiện' },
  { value: 'Đang Tạm Nghỉ', label: 'Đang Tạm Nghỉ' },
  { value: 'Đã Hoàn Thành', label: 'Đã Hoàn Thành' },
];

export default function TaskDetail() {
  const route = useRoute();
  const navigation = useNavigation();
  const { colors } = useAppTheme();
  const { currentUser } = useSession();
  const { task, ktvId } = route.params;
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loadingPhotos, setLoadingPhotos] = useState(true);
  const [note, setNote] = useState('');
  const [dialogVisible, setDialogVisible] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [editPhoto, setEditPhoto] = useState(null);
  const [editDialogVisible, setEditDialogVisible] = useState(false);
  const [editNote, setEditNote] = useState('');
  const [menuVisible, setMenuVisible] = useState(null);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState(null);
  const [editTaskDialogVisible, setEditTaskDialogVisible] = useState(false);
  const [statusDialogVisible, setStatusDialogVisible] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');

  // State for Tabs
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'thongtin', title: 'Thông tin' },
    { key: 'thietbi', title: 'Thiết bị' },
    { key: 'minhchung', title: 'Minh chứng' },
    { key: 'ktvthamgia', title: 'KTV tham gia' },
    { key: 'tieptrinh', title: 'Tiến trình' },
  ]);

  // State for task response
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  // Access control
  const activeKtvId = ktvId || currentUser?.id;
  
  console.log('Debug Info:', {
    activeKtvId,
    currentUser,
    task,
    taiKhoanKTVId: task?.taiKhoanKTVId
  });

  // Kiểm tra xem KTV có được phân công vào công việc này không
  const isKtvAssigned = task?.taiKhoanKTVId === Number(activeKtvId);

  // Kiểm tra xem người dùng có phải là người tạo phân công không
  const isTaskCreator = task?.phanCong?.nguoiTaoPhanCong === Number(activeKtvId);

  // Kiểm tra xem người dùng có phải là admin không (vaiTroId === 1)
  const isAdmin = currentUser?.vaiTroId === 1;

  console.log('Access Control:', {
    isKtvAssigned,
    isTaskCreator,
    isAdmin,
    activeKtvId,
    taskKtvId: task?.taiKhoanKTVId
  });

  // Cho phép truy cập nếu là KTV được phân công, người tạo phân công hoặc admin
  const isCurrentUserAllowed = isKtvAssigned || isTaskCreator || isAdmin;

  // Lấy thông tin phân công của KTV hiện tại
  const currentPhanCongKtv = task;

  const isChoPhanHoi = currentPhanCongKtv?.trangThai === 'Chờ Phản Hồi' && !ktvId;

  // Handle task response
  const handleAcceptTask = async () => {
    try {
      setLoading(true);
      const taskRef = doc(db, 'phan_cong_ktv', task.docId);
      await updateDoc(taskRef, {
        trangThai: 'Đã Chấp Nhận',
        daChapNhan: true,
        thoiGianBatDau: new Date().toISOString(),
        thoiGianCapNhat: Date.now(),
        updatedAt: Date.now(),
        trangThaiCuoiCung: 'Đã Chấp Nhận'
      });

      Alert.alert('Thành công', 'Đã chấp nhận công việc');
      navigation.goBack();
    } catch (error) {
      console.error('Error accepting task:', error);
      Alert.alert('Lỗi', 'Không thể chấp nhận công việc. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleRejectConfirm = async () => {
    try {
      setLoading(true);
      const taskRef = doc(db, 'phan_cong_ktv', task.docId);
      await updateDoc(taskRef, {
        trangThai: 'Đã Từ Chối',
        lyDoTuChoi: rejectReason || '',
        thoiGianTuChoi: new Date().toISOString(),
        thoiGianCapNhat: Date.now(),
        updatedAt: Date.now(),
        trangThaiCuoiCung: 'Đã Từ Chối'
      });

      setShowRejectDialog(false);
      setRejectReason('');
      Alert.alert('Thành công', 'Đã từ chối công việc');
      navigation.goBack();
    } catch (error) {
      console.error('Error rejecting task:', error);
      Alert.alert('Lỗi', 'Không thể từ chối công việc. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    setEditedTask(task);
  }, [task]);

  const handleEditTask = () => {
    setEditTaskDialogVisible(true);
  };

  const saveTaskChanges = async () => {
    try {
      setLoading(true);
      // Assuming task.id is the doc id for phan_cong_ktv
      const taskRef = doc(db, 'phan_cong_ktv', task.docId); // Use task.docId from TaskList
      await updateDoc(taskRef, {
        // Update fields in phan_cong (nested) and thiet_bi (nested)
        'phanCong.moTa': editedTask?.phanCong?.moTa || '',
        'phanCong.ghiChu': editedTask?.phanCong?.ghiChu || '',
        'thietBi.viTri': editedTask?.thietBi?.viTri || '',
      });
      setEditTaskDialogVisible(false);
      Alert.alert('Thành công', 'Đã cập nhật thông tin công việc');
       // Optionally refresh task data after saving
      // loadTaskDetails();
    } catch (error) {
      console.error('Error updating task:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật thông tin. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Chưa Bắt Đầu':
        return colors.warning;
      case 'Đang Thực Hiện':
        return colors.info;
      case 'Đang Tạm Nghỉ':
        return colors.error;
      case 'Đã Hoàn Thành':
        return colors.success;
      default:
        return colors.onSurfaceVariant;
    }
  };

  const loadPhotos = async () => {
    try {
      setLoadingPhotos(true);
      setError(null);

        if (!task?.docId) {
            console.error('❌ Không tìm thấy ID công việc');
            return;
        }

        console.log('📸 Bắt đầu tải ảnh cho task:', task.docId);
        console.log('🔍 Đang tìm ảnh cho task:', {
            taskId: task.docId,
            taskStatus: task.trangThai,
            taskType: task.loaiCongViec,
            assignedKTV: task.taiKhoanKTVId,
            currentUser: currentUser?.id,
            phanCongId: task.phanCongId
        });

        // Get task document from Firestore
        const taskRef = doc(db, 'phan_cong_ktv', task.docId);
      const taskDoc = await getDoc(taskRef);
      
      if (!taskDoc.exists()) {
            console.error('❌ Không tìm thấy tài liệu công việc');
            return;
      }

      const taskData = taskDoc.data();
        console.log('📄 Dữ liệu task từ Firestore:', JSON.stringify(taskData, null, 2));

        // Get phan_cong document to get chiTietYeuCauId
        const phanCongRef = doc(db, 'phan_cong', task.phanCongId.toString());
        const phanCongDoc = await getDoc(phanCongRef);
        
        if (!phanCongDoc.exists()) {
            console.error('❌ Không tìm thấy tài liệu phân công');
        return;
      }

        const phanCongData = phanCongDoc.data();
        console.log('📄 Dữ liệu phân công từ Firestore:', JSON.stringify(phanCongData, null, 2));

        // Get images from anh_minh_chung_bao_cao collection
        const anhMinhChungRef = collection(db, 'anh_minh_chung_bao_cao');
        
        // Query for both numeric and string chiTietBaoCaoId
        const q1 = query(
            anhMinhChungRef,
            where('type', '==', 'image'),
            where('chiTietBaoCaoId', '==', phanCongData.chiTietYeuCauId)
        );
        const q2 = query(
            anhMinhChungRef,
            where('type', '==', 'image'),
            where('chiTietBaoCaoId', '==', phanCongData.chiTietYeuCauId.toString())
        );

        const [snapshot1, snapshot2] = await Promise.all([
            getDocs(q1),
            getDocs(q2)
        ]);
        
        const baoCaoImages = [];
        const processedIds = new Set(); // To avoid duplicates

        // Process numeric chiTietBaoCaoId results
        snapshot1.forEach(doc => {
            if (!processedIds.has(doc.id)) {
                const data = doc.data();
                baoCaoImages.push({
                    id: doc.id,
                    ...data
                });
                processedIds.add(doc.id);
            }
        });

        // Process string chiTietBaoCaoId results
        snapshot2.forEach(doc => {
            if (!processedIds.has(doc.id)) {
                const data = doc.data();
                baoCaoImages.push({
                    id: doc.id,
                    ...data
                });
                processedIds.add(doc.id);
            }
        });

        console.log('🔍 Chi tiết mảng ảnh:', {
            baoCaoImages: {
                isArray: Array.isArray(baoCaoImages),
                length: baoCaoImages.length,
                items: baoCaoImages.map(img => ({
                    id: img.id,
                    chiTietBaoCaoId: img.chiTietBaoCaoId,
                    urlAnh: img.urlAnh,
                    type: img.type,
                    thoiGianTaiLen: img.thoiGianTaiLen
                }))
            }
        });

        // Filter and validate images
        const validPhotos = baoCaoImages.filter(photo => {
            const isValid = photo && 
                           photo.urlAnh && 
                           photo.type === 'image';
            
            if (!isValid) {
                console.log('❌ Ảnh không hợp lệ:', {
                    photo,
                    reason: !photo ? 'Không có dữ liệu ảnh' :
                            !photo.urlAnh ? 'Không có URL ảnh' :
                            photo.type !== 'image' ? 'Không phải ảnh' : 'Lý do khác'
                });
            }
            return isValid;
      });

        // Sort photos by upload time
        const sortedPhotos = validPhotos.sort((a, b) => b.thoiGianTaiLen - a.thoiGianTaiLen);

        console.log('✅ Kết quả lấy ảnh:', {
            tongSoAnhBaoCao: baoCaoImages.length,
            soAnhHopLe: validPhotos.length,
            danhSachAnh: sortedPhotos.map(img => ({
                id: img.id,
                chiTietBaoCaoId: img.chiTietBaoCaoId,
                urlAnh: img.urlAnh,
                type: img.type,
                thoiGianTaiLen: img.thoiGianTaiLen
            }))
        });

      setPhotos(sortedPhotos);
        console.log('📸 Ảnh cuối cùng sẽ hiển thị:', sortedPhotos);

    } catch (error) {
        console.error('❌ Lỗi khi tải ảnh:', error);
        setError(error.message || 'Không thể tải ảnh');
    } finally {
      setLoadingPhotos(false);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Cần quyền truy cập', 'Ứng dụng cần quyền truy cập vào thư viện ảnh của bạn.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      handleImageUpload(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Cần quyền truy cập', 'Ứng dụng cần quyền truy cập vào camera của bạn.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      handleImageUpload(result.assets[0].uri);
    }
  };

  const handleImageUpload = async (uri) => {
    try {
      setUploading(true);
      setError(null);
        
        console.log('=== START DEBUG UPLOAD IMAGE ===');
        console.log('1. Task ID:', task.docId);
        
        // Create blob from image URI
      const response = await fetch(uri);
      const blob = await response.blob();
        console.log('2. Created blob from image');
        
        // Create filename with timestamp
        const timestamp = Date.now();
        const filename = `bao_cao/image_${timestamp}.jpg`;
        console.log('3. Generated filename:', filename);
        
        // Upload to Firebase Storage
      const storageRef = ref(storage, filename);
      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);
        console.log('4. Image uploaded to Storage:', downloadURL);
        
        // Get current task document
        const taskRef = doc(db, 'phan_cong_ktv', task.docId);
        const taskDoc = await getDoc(taskRef);
        const taskData = taskDoc.data();
        
        // Create new photo object
        const newPhoto = {
            chiTietBaoCaoId: task.phanCong?.chiTietYeuCauId || task.phanCongId,
            createdAt: timestamp,
            ghiChu: note,
            id: timestamp,
            loaiAnh: "bao_cao",
            phanCongKTVId: task.phanCongId,
            thoiGianCapNhat: timestamp,
            thoiGianTaiLen: timestamp,
            type: "image",
            updatedAt: timestamp,
            urlAnh: downloadURL
        };
        
        console.log('5. Dữ liệu ảnh sẽ lưu vào Firestore:', newPhoto);
        
        // Get current photos array or initialize if not exists
        const currentPhotos = taskData.anh_minh_chung_bao_cao || [];
        console.log('6. Mảng ảnh hiện tại:', currentPhotos);
        
        // Add new photo to array
        const updatedPhotos = [...currentPhotos, newPhoto];
        console.log('7. Mảng ảnh sau khi thêm:', updatedPhotos);
        
        // Update Firestore with new array
      await updateDoc(taskRef, {
            anh_minh_chung_bao_cao: updatedPhotos,
            thoiGianCapNhat: timestamp,
            updatedAt: timestamp
        });

        console.log('8. Đã lưu ảnh vào Firestore thành công');
        console.log('=== END DEBUG UPLOAD IMAGE ===');

      setNote('');
      setDialogVisible(false);
      await loadPhotos(); // Reload photos after upload
      Alert.alert('Thành công', 'Đã cập nhật tiến độ công việc');
    } catch (error) {
        console.error('❌ Lỗi khi upload ảnh:', error);
      setError(error.message || 'Không thể tải lên hình ảnh');
      Alert.alert(
        'Lỗi',
        `Không thể tải lên hình ảnh: ${error.message || 'Vui lòng thử lại sau'}`
      );
    } finally {
      setUploading(false);
    }
  };

  const formatDate = (timestamp) => {
      if (!timestamp) return 'N/A';
      let date;
      // Check if it's a Firestore Timestamp object
      if (timestamp.seconds) {
          date = new Date(timestamp.seconds * 1000);
      } else {
          // Assume it's a string
          date = new Date(timestamp);
      }

      if (isNaN(date.getTime())) return 'N/A';

      try {
    return format(date, "HH:mm - dd/MM/yyyy", { locale: vi });
      } catch (e) {
          console.warn('Error formatting date:', e);
          return date.toLocaleString('vi-VN'); // Fallback
      }
  };


  const renderInfoSectionItem = (title, content) => (
    <View style={styles.sectionItem}>
      <Text style={[styles.sectionItemTitle, { color: colors.onSurface }]}>{title}:</Text>
      <Text style={[styles.sectionItemContent, { color: colors.onSurfaceVariant }]}>
        {content}
      </Text>
    </View>
  );

  const handleDeletePhoto = async (photo) => {
    try {
      setLoading(true);
      setError(null);
      
      // Delete from storage
      const photoRef = ref(storage, photo.url);
      await deleteObject(photoRef);

      // Update Firestore
      const taskRef = doc(db, 'phan_cong_ktv', task.docId); // Use task.docId
      await updateDoc(taskRef, {
        anh_minh_chung_bao_cao: arrayRemove(photo),
        anh_minh_chung_lam_viec: arrayRemove({
          ...photo,
          chiTietBaoCaoId: task.phanCong?.chiTietYeuCauId || 0
        })
      });

      await loadPhotos(); // Reload photos after deletion
      Alert.alert('Thành công', 'Đã xóa hình ảnh');
    } catch (error) {
      console.error('Error deleting photo:', error);
      setError(error.message || 'Không thể xóa hình ảnh');
      Alert.alert(
        'Lỗi',
        `Không thể xóa hình ảnh: ${error.message || 'Vui lòng thử lại sau'}`
      );
    } finally {
      setLoading(false);
      setMenuVisible(null);
    }
  };

  const handleEditPhoto = (photo) => {
    setEditPhoto(photo);
    setEditNote(photo.note || '');
    setEditDialogVisible(true);
    setMenuVisible(null);
  };

  const saveEditPhoto = async () => {
    try {
      setLoading(true);
      const taskRef = doc(db, 'phan_cong_ktv', task.docId); // Use task.docId

      // Fetch the current document to ensure we have the latest array state
      const taskDoc = await getDoc(taskRef);
      const taskData = taskDoc.data();
      const currentPhotos = Array.isArray(taskData.anh_minh_chung_bao_cao) ? taskData.anh_minh_chung_bao_cao : [];

      // Find the index of the photo to update based on URL or timestamp
      const photoIndex = currentPhotos.findIndex(p => p.urlAnh === editPhoto.url);

      if (photoIndex > -1) {
          // Create a new array with the updated photo
          const updatedPhotosArray = [...currentPhotos];
          updatedPhotosArray[photoIndex] = {
              ...updatedPhotosArray[photoIndex],
              note: editNote
          };

           // Update the entire anh_minh_chung_bao_cao array
           await updateDoc(taskRef, {
              anh_minh_chung_bao_cao: updatedPhotosArray
           });
      } else {
          // Fallback: if photo not found by URL, try removing and re-adding (less efficient/safe)
      await updateDoc(taskRef, {
        anh_minh_chung_bao_cao: arrayRemove(editPhoto)
      });
      await updateDoc(taskRef, {
        anh_minh_chung_bao_cao: arrayUnion({
          ...editPhoto,
          note: editNote
        })
      });
      }

      await loadPhotos(); // Reload photos after editing
      setEditDialogVisible(false);
      Alert.alert('Thành công', 'Đã cập nhật ghi chú');
    } catch (error) {
      console.error('Error updating photo note:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật ghi chú. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };


  const renderProgressPhotos = () => {
    if (loadingPhotos) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.onSurfaceVariant }]}>
            Đang tải hình ảnh...
          </Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons name="alert-circle" size={24} color={colors.error} />
          <Text style={[styles.errorText, { color: colors.error }]}>
            {error}
          </Text>
          <Button
            mode="contained"
            onPress={loadPhotos}
            style={{ marginTop: 8 }}
          >
            <Text style={{ color: colors.onPrimary }}>Thử lại</Text>
          </Button>
        </View>
      );
    }

    if (!photos || photos.length === 0) {
      return (
        <Text style={[styles.noPhotos, { color: colors.onSurfaceVariant }]}>
          Chưa có hình ảnh cập nhật tiến độ
        </Text>
      );
    }

    return (
      <View style={styles.photoContainer}>
        {photos.map((photo, index) => (
          <Card key={index} style={[styles.photoCard, { backgroundColor: colors.surface }]}>
            <Card.Cover 
              source={{ uri: photo.urlAnh }} 
              style={styles.photo}
              resizeMode="cover"
            />
            <Card.Content>
              <View style={styles.photoHeader}>
                <View style={styles.photoInfo}>
                  <MaterialCommunityIcons name="clock-outline" size={16} color={colors.primary} />
                  <Text style={[styles.photoDate, { color: colors.onSurfaceVariant }]}>
                    {formatDate(photo.thoiGianTaiLen)}
                  </Text>
                </View>
                <View style={styles.photoActions}>
                  <IconButton
                    icon="pencil"
                    size={20}
                    onPress={() => handleEditPhoto(photo)}
                    style={styles.actionButton}
                  />
                  <Menu
                    visible={menuVisible === index}
                    onDismiss={() => setMenuVisible(null)}
                    anchor={
                      <IconButton
                        icon="dots-vertical"
                        size={20}
                        onPress={() => setMenuVisible(index)}
                      />
                    }
                  >
                    <Menu.Item
                      onPress={() => {
                        Alert.alert(
                          'Xác nhận xóa',
                          'Bạn có chắc chắn muốn xóa hình ảnh này?',
                          [
                            {
                              text: 'Hủy',
                              style: 'cancel'
                            },
                            {
                              text: 'Xóa',
                              style: 'destructive',
                              onPress: () => handleDeletePhoto(photo)
                            }
                          ]
                        );
                      }}
                      title="Xóa"
                      leadingIcon="delete"
                      titleStyle={{ color: colors.error }}
                    />
                  </Menu>
                </View>
              </View>
              {photo.ghiChu && (
                <Text style={[styles.photoNote, { color: colors.onSurfaceVariant }]}>
                  {photo.ghiChu}
                </Text>
              )}
            </Card.Content>
          </Card>
        ))}
      </View>
    );
  };

  const handleStatusChange = async (newStatus) => {
    try {
      setLoading(true);
      const taskRef = doc(db, 'phan_cong_ktv', task.docId); // Use task.docId
      const updateData = {
        trangThai: newStatus 
      };

      // Nếu hoàn thành, thêm thời gian hoàn thành
      if (newStatus === 'Đã Hoàn Thành') {
        updateData.thoiGianHoanThien = new Date().toISOString(); // Store as ISO string
      } else {
          // If status is not complete, remove completion time if it exists
           if (task?.thoiGianHoanThien) {
              updateData.thoiGianHoanThien = null; // Or delete field: firebase.firestore.FieldValue.delete()
           }
      }


      await updateDoc(taskRef, updateData);
      setStatusDialogVisible(false);
      Alert.alert('Thành công', 'Đã cập nhật trạng thái công việc');
      // Refresh task data locally to reflect the change immediately
      navigation.setParams({
        task: {
          ...task,
          trangThai: newStatus, // Update trangThai in the task object
          thoiGianHoanThien: newStatus === 'Đã Hoàn Thành' ? new Date().toISOString() : null // Update completion time
        }
      });
    } catch (error) {
      console.error('Error updating status:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật trạng thái. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    console.log('🔄 Component mounted/updated with task:', {
      taskId: task?.docId,
      taskStatus: task?.trangThai,
      taskData: task
    });
    
    // Load photos when component mounts or task changes
    if (task?.docId) {
      console.log('📸 Bắt đầu tải ảnh cho task:', task.docId);
      loadPhotos();
    } else {
      console.log('❌ Không có task ID để tải ảnh');
    }
  }, [task?.docId]); // Reload if task.docId changes


  // Define scenes for TabView
  const ThongTinScene = () => {
    const { colors } = useAppTheme();
    const [requesterInfo, setRequesterInfo] = useState(null);
    const [loadingRequester, setLoadingRequester] = useState(true);
    const [creatorInfo, setCreatorInfo] = useState(null);
    const [loadingCreator, setLoadingCreator] = useState(true);

    useEffect(() => {
      console.log('Task object structure:', {
        task,
        phanCong: task?.phanCong,
        loaiPhanCong: task?.phanCong?.loaiPhanCong,
        thoiGianTaoPhanCong: task?.phanCong?.thoiGianTaoPhanCong,
        soLuongKTVThamGia: task?.phanCong?.soLuongKTVThamGia,
        mucDoUuTien: task?.phanCong?.mucDoUuTien,
        ghiChu: task?.phanCong?.ghiChu,
        nguoiTaoPhanCong: task?.phanCong?.nguoiTaoPhanCong
      });
    }, [task]);

    useEffect(() => {
      const fetchCreatorInfo = async () => {
        try {
          setLoadingCreator(true);
          
          if (!task?.phanCong?.nguoiTaoPhanCong) {
            console.error('❌ Không có thông tin người tạo phân công');
            return;
          }

          // Get tai_khoan document for creator
          const taiKhoanRef = doc(db, 'tai_khoan', task.phanCong.nguoiTaoPhanCong.toString());
          const taiKhoanDoc = await getDoc(taiKhoanRef);
          
          if (!taiKhoanDoc.exists()) {
            console.error('❌ Không tìm thấy thông tin người tạo');
            return;
          }

          const taiKhoanData = taiKhoanDoc.data();
          console.log('📄 Dữ liệu người tạo:', taiKhoanData);

          setCreatorInfo({
            hoTen: taiKhoanData.hoTen || 'Chưa cập nhật',
            soDienThoai: taiKhoanData.soDienThoai || 'Chưa cập nhật'
          });

        } catch (error) {
          console.error('❌ Lỗi khi lấy thông tin người tạo:', error);
        } finally {
          setLoadingCreator(false);
        }
      };

      fetchCreatorInfo();
    }, [task?.phanCong?.nguoiTaoPhanCong]);

    useEffect(() => {
      const fetchRequesterInfo = async () => {
        try {
          setLoadingRequester(true);
          
          if (!task?.phanCong?.chiTietYeuCauId) {
            console.error('❌ Không có chiTietYeuCauId');
            return;
          }

          // Get chi_tiet_yeu_cau document
          const chiTietYeuCauRef = doc(db, 'chi_tiet_yeu_cau', task.phanCong.chiTietYeuCauId.toString());
          const chiTietYeuCauDoc = await getDoc(chiTietYeuCauRef);
          
          if (!chiTietYeuCauDoc.exists()) {
            console.error('❌ Không tìm thấy thông tin chi tiết yêu cầu');
            return;
          }

          const chiTietYeuCauData = chiTietYeuCauDoc.data();
          console.log('📄 Dữ liệu chi tiết yêu cầu:', chiTietYeuCauData);

          if (!chiTietYeuCauData?.yeuCauId) {
            console.error('❌ Không có yeuCauId trong chi tiết yêu cầu');
            return;
          }

          // Get yeu_cau document
          const yeuCauRef = doc(db, 'yeu_cau', chiTietYeuCauData.yeuCauId.toString());
          const yeuCauDoc = await getDoc(yeuCauRef);

          if (!yeuCauDoc.exists()) {
            console.error('❌ Không tìm thấy thông tin yêu cầu');
            return;
          }

          const yeuCauData = yeuCauDoc.data();
          console.log('📄 Dữ liệu yêu cầu:', yeuCauData);

          if (!yeuCauData?.taiKhoanId) {
            console.error('❌ Không có taiKhoanId trong yêu cầu');
            return;
          }

          // Get tai_khoan document (người yêu cầu)
          const taiKhoanRef = doc(db, 'tai_khoan', yeuCauData.taiKhoanId.toString());
          const taiKhoanDoc = await getDoc(taiKhoanRef);

          if (!taiKhoanDoc.exists()) {
            console.error('❌ Không tìm thấy thông tin người yêu cầu');
            return;
          }

          const taiKhoanData = taiKhoanDoc.data();
          console.log('📄 Dữ liệu tài khoản:', taiKhoanData);

          if (!yeuCauData?.donViId) {
            console.error('❌ Không có donViId trong yêu cầu');
            return;
          }

          // Get don_vi document
          const donViRef = doc(db, 'don_vi', yeuCauData.donViId.toString());
          const donViDoc = await getDoc(donViRef);

          if (!donViDoc.exists()) {
            console.error('❌ Không tìm thấy thông tin đơn vị');
            return;
          }

          const donViData = donViDoc.data();
          console.log('📄 Dữ liệu đơn vị:', donViData);

          // Combine all information
          setRequesterInfo({
            hoTen: taiKhoanData.hoTen || 'Chưa cập nhật',
            soDienThoai: taiKhoanData.soDienThoai || 'Chưa cập nhật',
            tenDonVi: donViData.tenDonVi || 'Chưa cập nhật',
            moTa: chiTietYeuCauData.moTa || yeuCauData.moTa || 'Không có mô tả',
            email: taiKhoanData.email || 'Chưa cập nhật',
            tenTaiKhoan: taiKhoanData.tenTaiKhoan || 'Chưa cập nhật',
            trangThai: taiKhoanData.trangThai || 'Chưa cập nhật'
          });

          console.log('✅ Thông tin người yêu cầu:', {
            hoTen: taiKhoanData.hoTen,
            soDienThoai: taiKhoanData.soDienThoai,
            email: taiKhoanData.email,
            tenTaiKhoan: taiKhoanData.tenTaiKhoan,
            trangThai: taiKhoanData.trangThai
          });

        } catch (error) {
          console.error('❌ Lỗi khi lấy thông tin người yêu cầu:', error);
          console.error('Chi tiết lỗi:', {
            chiTietYeuCauId: task?.phanCong?.chiTietYeuCauId,
            phanCongData: task?.phanCong,
            error: error.message
          });
        } finally {
          setLoadingRequester(false);
        }
      };

      fetchRequesterInfo();
    }, [task?.phanCong?.chiTietYeuCauId]);

    return (
    <ScrollView contentContainerStyle={styles.tabSceneScrollContent}>
      <Card style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.outline, borderWidth: 1 }]}>
        <Card.Content style={{paddingHorizontal: 0, paddingBottom: 0}}>
            <View style={[styles.sectionHeader, { backgroundColor: colors.primary }]}>
               <MaterialCommunityIcons name="clipboard-list-outline" size={20} color={colors.onPrimary} />
               <Text style={[styles.sectionCardTitle, { color: colors.onPrimary }]}>Thông tin chung</Text>
            </View>
            <View style={styles.sectionContentContainer}>
                 <View style={styles.sectionItemRow}>
                     <Text style={{ color: colors.onSurface, fontSize: 18, fontWeight: 'bold', flex: 1 }}>
                       {task.thietBi.tenThietBi || 'N/A'}
                     </Text>
                     <View style={styles.headerActions}>
                       <Chip
                         style={[styles.statusChip, { backgroundColor: getStatusColor(task.trangThai) }]}
                         textStyle={{ color: colors.onPrimary }}
                         onPress={() => {
                           setSelectedStatus(task.trangThai);
                           setStatusDialogVisible(true);
                         }}
                       >
                         <Text style={{ color: colors.onPrimary, fontSize: 12, fontWeight: 'bold' }}>
                           {task.trangThai || 'N/A'}
                         </Text>
                       </Chip>
                       <IconButton
                         icon="pencil"
                         size={20}
                         onPress={handleEditTask}
                         style={styles.editButton}
                         iconColor={colors.primary}
                       />
                     </View>
                   </View>
                   <Divider style={[styles.divider, { backgroundColor: colors.outline }]} />
                   <View style={styles.sectionItem}>
                     <Text style={[styles.sectionItemTitle, { color: colors.onSurface }]}>Thời gian dự kiến:</Text>
                     <Text style={[styles.sectionItemContent, { color: colors.onSurfaceVariant }]}>
                       {task?.thoiGianDuKien !== undefined ? `${task.thoiGianDuKien} phút` : 'N/A'}
                     </Text>
                   </View>
                   {task?.thoiGianHoanThien && (
                     <View style={styles.sectionItem}>
                       <Text style={[styles.sectionItemTitle, { color: colors.onSurface }]}>Hoàn thành:</Text>
                       <Text style={[styles.sectionItemContent, { color: colors.onSurfaceVariant }]}>
                         {formatDate(task.thoiGianHoanThien)}
                       </Text>
                     </View>
                   )}
            </View>
        </Card.Content>
      </Card>

      <Card style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.outline, borderWidth: 1 }]}>
        <Card.Content style={{paddingHorizontal: 0, paddingBottom: 0}}>
           <View style={[styles.sectionHeader, { backgroundColor: colors.primary }]}>
              <MaterialCommunityIcons name="account-outline" size={20} color={colors.onPrimary} />
              <Text style={[styles.sectionCardTitle, { color: colors.onPrimary }]}>Người yêu cầu</Text>
           </View>
           <View style={styles.sectionContentContainer}>
             {loadingRequester ? (
               <View style={styles.loadingContainer}>
                 <ActivityIndicator size="small" color={colors.primary} />
                 <Text style={[styles.loadingText, { color: colors.onSurfaceVariant }]}>
                   Đang tải thông tin...
                 </Text>
               </View>
             ) : requesterInfo ? (
               <>
             <View style={styles.sectionItem}>
               <Text style={[styles.sectionItemTitle, { color: colors.onSurface }]}>Đơn vị:</Text>
               <Text style={[styles.sectionItemContent, { color: colors.onSurfaceVariant }]}>
                     {requesterInfo.tenDonVi}
               </Text>
             </View>
             <View style={styles.sectionItemRow}>
               <View style={styles.sectionItem}>
                 <Text style={[styles.sectionItemTitle, { color: colors.onSurface }]}>Họ tên:</Text>
                 <Text style={[styles.sectionItemContent, { color: colors.onSurfaceVariant }]}>
                       {requesterInfo.hoTen}
                 </Text>
               </View>
               <View style={styles.sectionItem}>
                 <Text style={[styles.sectionItemTitle, { color: colors.onSurface }]}>SĐT:</Text>
                 <Text style={[styles.sectionItemContent, { color: colors.onSurfaceVariant }]}>
                       {requesterInfo.soDienThoai}
                 </Text>
               </View>
             </View>
                 <View style={styles.sectionItem}>
                   <Text style={[styles.sectionItemTitle, { color: colors.onSurface }]}>Email:</Text>
                   <Text style={[styles.sectionItemContent, { color: colors.onSurfaceVariant }]}>
                     {requesterInfo.email}
                   </Text>
                 </View>
                 <View style={styles.sectionItem}>
                   <Text style={[styles.sectionItemTitle, { color: colors.onSurface }]}>Trạng thái:</Text>
                   <Text style={[styles.sectionItemContent, { color: colors.onSurfaceVariant }]}>
                     {requesterInfo.trangThai}
                   </Text>
             </View>
                 <View style={styles.sectionItem}>
                   <Text style={[styles.sectionItemTitle, { color: colors.onSurface }]}>Mô tả:</Text>
                   <Text style={[styles.sectionItemContent, { color: colors.onSurfaceVariant }]}>
                     {requesterInfo.moTa}
                   </Text>
                 </View>
               </>
             ) : (
               <Text style={[styles.errorText, { color: colors.error }]}>
                 Không thể tải thông tin người yêu cầu
               </Text>
             )}
             <View style={styles.sectionItem}>
               <Text style={[styles.sectionItemTitle, { color: colors.onSurface }]}>Mô tả:</Text>
               <Text style={[styles.sectionItemContent, { color: colors.onSurfaceVariant }]}>
                 {task?.phanCong?.chiTietYeuCau?.moTa || 'Không có mô tả'}
               </Text>
             </View>
           </View>
        </Card.Content>
      </Card>

      <Card style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.outline, borderWidth: 1 }]}>
         <Card.Content style={{paddingHorizontal: 0, paddingBottom: 0}}>
            <View style={[styles.sectionHeader, { backgroundColor: colors.primary }]}>
              <MaterialCommunityIcons name="information-outline" size={20} color={colors.onPrimary} />
              <Text style={[styles.sectionCardTitle, { color: colors.onPrimary }]}>Thông tin phân công</Text>
            </View>
            <View style={styles.sectionContentContainer}>
              <View style={styles.sectionItemRow}>
                <View style={styles.sectionItem}>
                  <Text style={[styles.sectionItemTitle, { color: colors.onSurface }]}>Loại phân công:</Text>
                  <Text style={[styles.sectionItemContent, { color: colors.onSurfaceVariant }]}>
                    {task?.phanCong?.loaiPhanCong || 'Đang cập nhật'}
                  </Text>
                </View>
                <View style={styles.sectionItem}>
                  <Text style={[styles.sectionItemTitle, { color: colors.onSurface }]}>Thời gian tạo:</Text>
                  <Text style={[styles.sectionItemContent, { color: colors.onSurfaceVariant }]}>
                    {task?.phanCong?.thoiGianTaoPhanCong ? formatDate(task.phanCong.thoiGianTaoPhanCong) : 'N/A'}
                  </Text>
                </View>
              </View>
              <View style={styles.sectionItemRow}>
                <View style={styles.sectionItem}>
                  <Text style={[styles.sectionItemTitle, { color: colors.onSurface }]}>Số lượng KTV:</Text>
                  <Text style={[styles.sectionItemContent, { color: colors.onSurfaceVariant }]}>
                    {task?.phanCong?.soLuongKTVThamGia !== undefined ? task?.phanCong?.soLuongKTVThamGia : 'Đang cập nhật'}
                  </Text>
                </View>
              </View>
              <View style={styles.priorityContainer}>
                <View style={[styles.priorityIconContainer, { backgroundColor: colors.primaryContainer }]}>
                  <MaterialCommunityIcons name="fire" size={16} color={colors.onPrimaryContainer} />
                </View>
                <Text style={[styles.sectionItemTitle, { color: colors.onSurface }]}>Mức độ ưu tiên:</Text>
                <View style={[styles.priorityBarBackground, { backgroundColor: colors.outline + '60'}]}>
                  <View style={[styles.priorityBarFill, { width: (((task?.phanCong?.mucDoUuTien || 0) / 3) * 100) + '%', backgroundColor: 'red', height: 8 }]} />
                </View>
                <Text style={[styles.sectionItemContent, { color: colors.onSurfaceVariant }]}>
                  Lv {task?.phanCong?.mucDoUuTien || 0}
                </Text>
              </View>
              <View style={styles.sectionItem}>
                <Text style={[styles.sectionItemTitle, { color: colors.onSurface }]}>Ghi chú:</Text>
                <Text style={[styles.sectionItemContent, { color: colors.onSurfaceVariant }]}>
                  {task?.phanCong?.ghiChu || 'Không có ghi chú'}
                </Text>
              </View>
              <View style={styles.sectionItemRow}>
                <View style={styles.sectionItem}>
                  <Text style={[styles.sectionItemTitle, { color: colors.onSurface }]}>Người tạo:</Text>
                  <Text style={[styles.sectionItemContent, { color: colors.onSurfaceVariant }]}>
                    {loadingCreator ? 'Đang tải...' : creatorInfo?.hoTen || 'Đang cập nhật'}
                  </Text>
                </View>
                <View style={styles.sectionItem}>
                  <Text style={[styles.sectionItemTitle, { color: colors.onSurface }]}>SĐT:</Text>
                  <Text style={[styles.sectionItemContent, { color: colors.onSurfaceVariant }]}>
                    {loadingCreator ? 'Đang tải...' : creatorInfo?.soDienThoai || 'Đang cập nhật'}
                  </Text>
                </View>
              </View>
            </View>
         </Card.Content>
      </Card>

      <Card style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.outline, borderWidth: 1 }]}>
         <Card.Content style={{paddingHorizontal: 0, paddingBottom: 0}}>
            <View style={[styles.sectionHeader, { backgroundColor: colors.primary }]}>
               <MaterialCommunityIcons name="star-outline" size={20} color={colors.onPrimary} />
               <Text style={[styles.sectionCardTitle, { color: colors.onPrimary }]}>Phân công dành riêng cho bạn</Text>
            </View>
            <View style={styles.sectionContentContainer}>
              <View style={styles.sectionItem}>
                <Text style={[styles.sectionItemTitle, { color: colors.onSurface }]}>Mô tả công việc:</Text>
                <Text style={[styles.sectionItemContent, { color: colors.onSurfaceVariant }]}>
                  {task?.moTaCongViec || 'Không có mô tả'}
                </Text>
              </View>
            </View>
         </Card.Content>
      </Card>
    </ScrollView>
  );
  };

  const ThietBiScene = () => {
    const { colors } = useAppTheme();
    return (
    <ScrollView contentContainerStyle={styles.tabSceneScrollContent}>
      {/* Thông tin Thiết bị chung */}
       <Card style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.outline, borderWidth: 1 }]}>
         <Card.Content style={styles.deviceInfoContent}>
            <View style={[styles.sectionHeader, { backgroundColor: colors.primary }]}>
               <MaterialCommunityIcons name="harddisk" size={20} color={colors.onPrimary} />
               <Text style={[styles.sectionCardTitle, { color: colors.onPrimary }]}>Thông tin thiết bị</Text>
                 {task?.thietBi?.trangThai && (
                     <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(task?.thietBi?.trangThai) }]} />
                 )}
            </View>
             <View style={styles.deviceDetailRow}>
                 <View style={[styles.deviceImagePlaceholder, { backgroundColor: colors.primaryContainer }]}>
                   <MaterialCommunityIcons name="harddisk" size={48} color={colors.onPrimaryContainer} />
                 </View>
                  <View style={styles.deviceTextInfo}>
                    <Text style={[styles.deviceMainText, { color: colors.onSurface }]}>
                  {task?.thietBi?.tenThietBi || 'Đang cập nhật'}
                    </Text>
                    <Text style={[styles.deviceSubText, { color: colors.onSurfaceVariant }]}>
                  {task?.thietBi?.maThietBi || 'Đang cập nhật'}
                    </Text>
                {task?.thietBi?.trangThai && (
                        <Chip
                          style={[styles.deviceStatusChip, { backgroundColor: getStatusColor(task?.thietBi?.trangThai) }]}>
                    <Text style={{ color: colors.onPrimary, fontSize: 12 }}>
                      {task?.thietBi?.trangThai || 'N/A'}
                    </Text>
                        </Chip>
                      )}
                  </View>
              </View>
         </Card.Content>
       </Card>

        {/* Mô tả thiết bị */}
        <Card style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.outline, borderWidth: 1 }]}>
           <Card.Content style={{paddingHorizontal: 0, paddingBottom: 0}}>
              <View style={[styles.sectionHeader, { backgroundColor: colors.primary }]}>
                 <MaterialCommunityIcons name="information-outline" size={20} color={colors.onPrimary} />
                 <Text style={[styles.sectionCardTitle, { color: colors.onPrimary }]}>Mô tả thiết bị</Text>
              </View>
              <View style={styles.sectionContentContainer}>
                 <Text style={[styles.sectionItemContent, { color: colors.onSurfaceVariant }]}>
                {task?.thietBi?.moTaChiTiet || task?.thietBi?.moTa || 'Không có mô tả chi tiết'}
                 </Text>
              </View>
           </Card.Content>
        </Card>

       {/* Vị trí */}
       <Card style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.outline, borderWidth: 1 }]}>
          <Card.Content style={styles.locationCardContent}>
            <View style={[styles.locationHeader, { backgroundColor: colors.surface }]}>
                <MaterialCommunityIcons name="map-marker" size={20} color={colors.primary} />
                <Text style={[styles.locationText, { color: colors.onSurface }]}>
                {task?.thietBi?.viTri || 'Đang cập nhật'}
                </Text>
            </View>
         </Card.Content>
       </Card>

       {/* Thông tin bảo dưỡng */}
       <Card style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.outline, borderWidth: 1 }]}>
         <Card.Content style={{paddingHorizontal: 0, paddingBottom: 0}}>
            <View style={[styles.sectionHeader, { backgroundColor: colors.primary }]}>
               <MaterialCommunityIcons name="wrench" size={20} color={colors.onPrimary} />
               <Text style={[styles.sectionCardTitle, { color: colors.onPrimary }]}>Thông tin bảo dưỡng</Text>
            </View>
            <View style={styles.sectionContentContainer}>
              <View style={styles.sectionItem}>
                <Text style={[styles.sectionItemTitle, { color: colors.onSurface }]}>Bảo dưỡng định kỳ (ngày):</Text>
                <Text style={[styles.sectionItemContent, { color: colors.onSurfaceVariant }]}>
                  {task?.thietBi?.baoDuongDinhKy !== undefined ? task.thietBi.baoDuongDinhKy : 'N/A'}
                </Text>
              </View>
              <View style={styles.sectionItem}>
                <Text style={[styles.sectionItemTitle, { color: colors.onSurface }]}>Ngày bảo dưỡng gần nhất:</Text>
                <Text style={[styles.sectionItemContent, { color: colors.onSurfaceVariant }]}>
                  {task?.thietBi?.ngayBaoDuongGanNhat ? formatDate(task.thietBi.ngayBaoDuongGanNhat) : 'N/A'}
                </Text>
              </View>
              <View style={styles.sectionItem}>
                <Text style={[styles.sectionItemTitle, { color: colors.onSurface }]}>Ngày bảo dưỡng tiếp theo:</Text>
                <Text style={[styles.sectionItemContent, { color: colors.onSurfaceVariant }]}>
                  {task?.thietBi?.ngayBaoDuongTiepTheo ? formatDate(task.thietBi.ngayBaoDuongTiepTheo) : 'N/A'}
                </Text>
              </View>
               <View style={styles.sectionItem}>
                <Text style={[styles.sectionItemTitle, { color: colors.onSurface }]}>Ghi chú bảo dưỡng:</Text>
                <Text style={[styles.sectionItemContent, { color: colors.onSurfaceVariant }]}>
                  {task?.thietBi?.ghiChuBaoDuong || 'Không có ghi chú'}
                </Text>
              </View>
            </View>
         </Card.Content>
       </Card>
    </ScrollView>
  );
  };

  const MinhChungScene = () => {
    const { colors } = useAppTheme();
    const [loadingPhotos, setLoadingPhotos] = useState(true);
    const [photos, setPhotos] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadPhotos();
    }, [task?.docId]);

    const loadPhotos = async () => {
        try {
            setLoadingPhotos(true);
            setError(null);

            if (!task?.docId) {
                console.error('❌ Không tìm thấy ID công việc');
                return;
            }

            console.log('📸 Bắt đầu tải ảnh cho task:', task.docId);

            // Get task document from Firestore
            const taskRef = doc(db, 'phan_cong_ktv', task.docId);
            const taskDoc = await getDoc(taskRef);
            
            if (!taskDoc.exists()) {
                console.error('❌ Không tìm thấy tài liệu công việc');
                return;
            }

            const taskData = taskDoc.data();
            console.log('📄 Dữ liệu task từ Firestore:', JSON.stringify(taskData, null, 2));

            // Get images from anh_minh_chung_bao_cao collection
            const anhMinhChungRef = collection(db, 'anh_minh_chung_bao_cao');
            const q = query(
                anhMinhChungRef,
                where('type', '==', 'image'),
                where('chiTietBaoCaoId', '==', task.phanCong?.chiTietYeuCauId || task.phanCongId)
            );
            const anhMinhChungSnapshot = await getDocs(q);
            
            const baoCaoImages = [];
            anhMinhChungSnapshot.forEach(doc => {
                const data = doc.data();
                baoCaoImages.push({
                    id: doc.id,
                    ...data
                });
            });

            console.log('🔍 Chi tiết mảng ảnh:', {
                baoCaoImages: {
                    isArray: Array.isArray(baoCaoImages),
                    length: baoCaoImages.length,
                    items: baoCaoImages.map(img => ({
                        id: img.id,
                        chiTietBaoCaoId: img.chiTietBaoCaoId,
                        urlAnh: img.urlAnh,
                        type: img.type,
                        thoiGianTaiLen: img.thoiGianTaiLen
                    }))
                }
            });

            // Filter and validate images
            const validPhotos = baoCaoImages.filter(photo => {
                const isValid = photo && 
                               photo.urlAnh && 
                               photo.type === 'image';
                
                if (!isValid) {
                    console.log('❌ Ảnh không hợp lệ:', {
                        photo,
                        expectedChiTietBaoCaoId: task.phanCong?.chiTietYeuCauId || task.phanCongId,
                        actualChiTietBaoCaoId: photo?.chiTietBaoCaoId
                    });
                }
                return isValid;
            });

            // Sort photos by upload time
            const sortedPhotos = validPhotos.sort((a, b) => b.thoiGianTaiLen - a.thoiGianTaiLen);

            console.log('✅ Kết quả lấy ảnh:', {
                tongSoAnhBaoCao: baoCaoImages.length,
                soAnhHopLe: validPhotos.length,
                danhSachAnh: sortedPhotos.map(img => ({
                    id: img.id,
                    chiTietBaoCaoId: img.chiTietBaoCaoId,
                    urlAnh: img.urlAnh,
                    type: img.type,
                    thoiGianTaiLen: img.thoiGianTaiLen
                }))
            });

            setPhotos(sortedPhotos);
            console.log('📸 Ảnh cuối cùng sẽ hiển thị:', sortedPhotos);

        } catch (error) {
            console.error('❌ Lỗi khi tải ảnh:', error);
            setError(error.message || 'Không thể tải ảnh');
        } finally {
            setLoadingPhotos(false);
        }
    };

    return (
    <ScrollView contentContainerStyle={styles.tabSceneScrollContent}>
      <Card style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.outline, borderWidth: 1 }]}>
         <Card.Content style={{paddingHorizontal: 0, paddingBottom: 0}}>
            <View style={[styles.sectionHeader, { backgroundColor: colors.primary }]}>
               <MaterialCommunityIcons name="image-multiple-outline" size={20} color={colors.onPrimary} />
               <Text style={[styles.sectionCardTitle, { color: colors.onPrimary }]}>Hình ảnh tiến độ</Text>
            </View>
            <View style={styles.sectionContentContainer}>
               {loadingPhotos ? (
                 <View style={styles.loadingContainer}>
                   <ActivityIndicator size="large" color={colors.primary} />
                   <Text style={[styles.loadingText, { color: colors.onSurfaceVariant }]}>
                     Đang tải hình ảnh...
                   </Text>
                 </View>
               ) : error ? (
                 <View style={styles.errorContainer}>
                   <MaterialCommunityIcons name="alert-circle" size={24} color={colors.error} />
                   <Text style={[styles.errorText, { color: colors.error }]}>
                     {error}
                   </Text>
                   <Button
                     mode="contained"
                     onPress={loadPhotos}
                     style={{ marginTop: 8 }}
                   >
                     <Text style={{ color: colors.onPrimary }}>Thử lại</Text>
                   </Button>
                 </View>
               ) : !photos || photos.length === 0 ? (
                 <Text style={[styles.noPhotos, { color: colors.onSurfaceVariant }]}>
                   Chưa có hình ảnh cập nhật tiến độ
                 </Text>
               ) : (
                 <View style={styles.photoContainer}>
                   {photos.map((photo, index) => (
                     <Card key={index} style={[styles.photoCard, { backgroundColor: colors.surface }]}>
                                        <Card.Cover 
                                            source={{ uri: photo.urlAnh }} 
                                            style={styles.photo}
                                            resizeMode="cover"
                                        />
                       <Card.Content>
                         <View style={styles.photoHeader}>
                           <View style={styles.photoInfo}>
                             <MaterialCommunityIcons name="clock-outline" size={16} color={colors.primary} />
                             <Text style={[styles.photoDate, { color: colors.onSurfaceVariant }]}>
                                                        {formatDate(photo.thoiGianTaiLen)}
                             </Text>
                           </View>
                           <View style={styles.photoActions}>
                             <IconButton
                               icon="pencil"
                               size={20}
                               onPress={() => handleEditPhoto(photo)}
                               style={styles.actionButton}
                             />
                             <Menu
                               visible={menuVisible === index}
                               onDismiss={() => setMenuVisible(null)}
                               anchor={
                                 <IconButton
                                   icon="dots-vertical"
                                   size={20}
                                   onPress={() => setMenuVisible(index)}
                                 />
                               }
                             >
                               <Menu.Item
                                 onPress={() => {
                                   Alert.alert(
                                     'Xác nhận xóa',
                                     'Bạn có chắc chắn muốn xóa hình ảnh này?',
                                     [
                                       {
                                         text: 'Hủy',
                                         style: 'cancel'
                                       },
                                       {
                                         text: 'Xóa',
                                         style: 'destructive',
                                         onPress: () => handleDeletePhoto(photo)
                                       }
                                     ]
                                   );
                                 }}
                                                            title="Xóa"
                                 leadingIcon="delete"
                                 titleStyle={{ color: colors.error }}
                               />
                             </Menu>
                           </View>
                         </View>
                                            {photo.ghiChu && (
                           <Text style={[styles.photoNote, { color: colors.onSurfaceVariant }]}>
                                                    {photo.ghiChu}
                           </Text>
                         )}
                       </Card.Content>
                     </Card>
                   ))}
                 </View>
               )}
               {['Đang Thực Hiện', 'Đang Tạm Nghỉ', 'Chưa Bắt Đầu'].includes(task?.trangThai) && (
                 <Button
                   mode="contained"
                   onPress={() => setDialogVisible(true)}
                   style={[styles.uploadButton, { backgroundColor: colors.primary, marginTop: 16 }]}
                   labelStyle={{ color: colors.onPrimary }}
                   icon="camera-plus"
                 >
                   <Text style={{ color: colors.onPrimary }}>Thêm hình ảnh</Text>
                 </Button>
               )}
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
  );
  };

  const KtvThamGiaCard = ({ item, currentUserId, navigation }) => {
    const { colors } = useAppTheme();
    const [expanded, setExpanded] = useState(false);
    const isCurrentUser = item.taiKhoanKTVId === currentUserId;

    const getStatusColor = (status) => {
      switch (status) {
        case 'Đã Chấp Nhận':
        case 'Hoàn Thành':
          return '#4CAF50';
        case 'Chờ Phản Hồi':
          return '#FFC107';
        case 'Đang Thực Hiện':
          return '#2196F3';
        case 'Đang Nghỉ':
          return '#FF9800';
        case 'Bị Hủy':
          return '#9E9E9E';
        case 'Đã Từ Chối':
          return '#F44336';
        default:
          return colors.outline;
      }
    };

    const borderColor = getStatusColor(item.trangThai);

    const handleCall = () => {
      const phoneNumber = item.taiKhoan?.soDienThoai;
      if (phoneNumber) {
        Linking.openURL(`tel:${phoneNumber}`);
      } else {
        Alert.alert('Thông báo', 'Số điện thoại không hợp lệ');
      }
    };

    return (
      <View style={styles.ktvCardContainer}>
        <Card
          style={[
            styles.ktvCard,
            { 
              backgroundColor: colors.surface,
              borderColor: borderColor,
            }
          ]}
        >
          <View style={[styles.ktvCardHeader, { backgroundColor: borderColor }]} />
          <Card.Content style={styles.ktvCardContent}>
            <View style={styles.ktvInfoContainer}>
              <View style={[styles.ktvAvatar, { backgroundColor: colors.surfaceVariant }]}>
                <Text style={[styles.ktvAvatarText, { color: colors.primary }]}>
                  {item.taiKhoan?.hoTen?.[0]?.toUpperCase() || '?'}
                </Text>
              </View>
              <View style={styles.ktvInfo}>
                <View style={styles.ktvNameContainer}>
                  <Text style={[styles.ktvName, { color: colors.onSurface }]}>
                    {item.taiKhoan?.hoTen || 'Không rõ'}
                  </Text>
                  {isCurrentUser && (
                    <Text style={[styles.ktvCurrentUser, { color: colors.onSurfaceVariant }]}>
                      (Bạn)
                    </Text>
                  )}
                </View>
                <Text style={[styles.ktvStatus, { color: borderColor }]}>
                  {item.trangThai}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        <Menu
          visible={expanded}
          onDismiss={() => setExpanded(false)}
          anchor={
            <IconButton
              icon="dots-vertical"
              size={20}
              onPress={() => setExpanded(true)}
              style={styles.ktvMenuButton}
            />
          }
        >
          <Menu.Item
            onPress={() => {
              setExpanded(false);
              handleCall();
            }}
            title="Gọi điện"
            leadingIcon="phone"
          />
        </Menu>
      </View>
    );
  };

  const KtvThamGiaScene = () => {
    const { colors } = useAppTheme();
    const [ktvList, setKtvList] = useState([]);
    const [loadingKtv, setLoadingKtv] = useState(true);

    useEffect(() => {
      const fetchKtvList = async () => {
        try {
          setLoadingKtv(true);
          
          if (!task?.phanCongId) {
            console.error('❌ Không có phanCongId');
            return;
          }

          // Get phan_cong document
          const phanCongRef = doc(db, 'phan_cong', task.phanCongId.toString());
          const phanCongDoc = await getDoc(phanCongRef);
          
          if (!phanCongDoc.exists()) {
            console.error('❌ Không tìm thấy thông tin phân công');
            return;
          }

          const phanCongData = phanCongDoc.data();
          console.log('📄 Dữ liệu phân công:', phanCongData);

          // Get phan_cong_ktv documents
          const phanCongKtvRef = collection(db, 'phan_cong_ktv');
          const q = query(
            phanCongKtvRef,
            where('phanCongId', '==', task.phanCongId)
          );
          const phanCongKtvSnapshot = await getDocs(q);
          
          const ktvData = [];
          for (const ktvDoc of phanCongKtvSnapshot.docs) {
            const data = ktvDoc.data();
            if (data.taiKhoanKTVId) {
              // Get tai_khoan document for each KTV
              const taiKhoanRef = doc(db, 'tai_khoan', data.taiKhoanKTVId.toString());
              const taiKhoanDoc = await getDoc(taiKhoanRef);
              
              if (taiKhoanDoc.exists()) {
                const taiKhoanData = taiKhoanDoc.data();
                ktvData.push({
                  ...data,
                  taiKhoan: taiKhoanData
                });
              }
            }
          }

          console.log('📄 Danh sách KTV tham gia:', ktvData);
          setKtvList(ktvData);

        } catch (error) {
          console.error('❌ Lỗi khi lấy danh sách KTV:', error);
        } finally {
          setLoadingKtv(false);
        }
      };

      fetchKtvList();
    }, [task?.phanCongId]);

    return (
      <ScrollView contentContainerStyle={styles.tabSceneScrollContent}>
        <Card style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.outline, borderWidth: 1 }]}>
          <Card.Content style={{paddingHorizontal: 0, paddingBottom: 0}}>
            <View style={[styles.sectionHeader, { backgroundColor: colors.primary }]}>
              <MaterialCommunityIcons name="account-group-outline" size={20} color={colors.onPrimary} />
              <Text style={[styles.sectionCardTitle, { color: colors.onPrimary }]}>KTV tham gia</Text>
            </View>
            <View style={styles.sectionContentContainer}>
              {loadingKtv ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={colors.primary} />
                  <Text style={[styles.loadingText, { color: colors.onSurfaceVariant }]}>
                    Đang tải thông tin...
                  </Text>
                </View>
              ) : ktvList.length > 0 ? (
                ktvList.map((ktv, index) => (
                  <KtvThamGiaCard
                    key={index}
                    item={ktv}
                    currentUserId={activeKtvId}
                    navigation={navigation}
                  />
                ))
              ) : (
                <Text style={[styles.noDataText, { color: colors.onSurfaceVariant }]}>
                  Chưa có KTV nào được phân công
                </Text>
              )}
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
    );
  };

  const renderScene = SceneMap({
    thongtin: ThongTinScene,
    thietbi: ThietBiScene,
    minhchung: MinhChungScene,
    ktvthamgia: KtvThamGiaScene,
    tieptrinh: WorkProgress,
  });

  const renderTabBar = props => (
    <TabBar
      {...props}
      indicatorStyle={{ backgroundColor: colors.primary }}
      style={[styles.tabBar, { backgroundColor: colors.surface }]}
      labelStyle={{ color: colors.onSurface }}
      activeColor={colors.primary}
      inactiveColor={colors.onSurfaceVariant}
      renderLabel={({ route, focused, color }) => (
        <Text style={{ color, fontWeight: focused ? 'bold' : 'normal' }}>
          {route.title}
        </Text>
      )}
    />
  );

  if (loading) {
    return (
      <AppLayout showBottomBar={true}>
        <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.onSurfaceVariant, marginTop: 16 }]}>
            Đang xử lý...
          </Text>
        </View>
      </AppLayout>
    );
  }

  if (!isCurrentUserAllowed) {
    console.log('Access Denied:', {
      isKtvAssigned,
      isTaskCreator,
      isAdmin,
      activeKtvId,
      taskId: task?.id,
      phanCongId: task?.phanCong?.id,
      taskKtvId: task?.taiKhoanKTVId
    });

  return (
    <AppLayout showBottomBar={true}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
          <View style={styles.accessDeniedContainer}>
            <MaterialCommunityIcons 
              name="shield-lock-outline" 
              size={64} 
              color={colors.error} 
            />
            <Text style={[styles.accessDeniedTitle, { color: colors.onSurface }]}>
              Truy cập bị từ chối
            </Text>
            <Text style={[styles.accessDeniedMessage, { color: colors.onSurfaceVariant }]}>
              {!task ? 'Không tìm thấy thông tin công việc' :
               !currentUser ? 'Vui lòng đăng nhập để xem nội dung này' :
               'Bạn không được phân công vào công việc này'}
            </Text>
            <Button
              mode="contained"
              onPress={() => navigation.goBack()}
              style={[styles.backButton, { backgroundColor: colors.primary }]}
            >
              Quay lại
            </Button>
          </View>
        </View>
      </AppLayout>
    );
  }

  return (
    <AppLayout showBottomBar={true}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <TabView
          navigationState={{ index, routes }}
          renderScene={renderScene}
          onIndexChange={setIndex}
          initialLayout={initialLayout}
          renderTabBar={renderTabBar}
          style={styles.tabView}
        />
      </View>

      {/* Bottom Bar for Task Response */}
      {isChoPhanHoi && (
        <View style={[styles.bottomBar, { backgroundColor: colors.surfaceVariant }]}>
          <Button
            mode="outlined"
            onPress={() => setShowRejectDialog(true)}
            style={styles.bottomBarButton}
            icon="close"
          >
            <Text style={{ color: colors.onSurface }}>Từ chối</Text>
          </Button>
          <Button
            mode="contained"
            onPress={handleAcceptTask}
            style={styles.bottomBarButton}
            icon="check"
          >
            <Text style={{ color: colors.onPrimary }}>Chấp nhận</Text>
          </Button>
      </View>
      )}

      {/* Reject Dialog */}
      <Portal>
        <Dialog visible={showRejectDialog} onDismiss={() => setShowRejectDialog(false)}>
          <Dialog.Title>
            <Text style={{ color: colors.onSurface }}>Xác nhận từ chối</Text>
          </Dialog.Title>
          <Dialog.Content>
            <Text style={{ color: colors.onSurface }}>Vui lòng nhập lý do từ chối:</Text>
            <TextInput
              value={rejectReason}
              onChangeText={setRejectReason}
              mode="outlined"
              multiline
              numberOfLines={3}
              style={{ marginTop: 8 }}
              placeholder="Nhập lý do..."
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowRejectDialog(false)}>
              <Text style={{ color: colors.primary }}>Hủy</Text>
            </Button>
            <Button onPress={handleRejectConfirm}>
              <Text style={{ color: colors.primary }}>Xác nhận</Text>
            </Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)}>
          <Dialog.Title>
            <Text style={{ color: colors.onSurface }}>Cập nhật tiến độ</Text>
          </Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Ghi chú"
              value={note}
              onChangeText={setNote}
              mode="outlined"
              multiline
              numberOfLines={3}
              style={{ marginBottom: 16 }}
              theme={{ colors: { primary: colors.primary, underlineColor: 'transparent' } }}
              outlineColor={colors.outline}
              activeOutlineColor={colors.primary}
              textColor={colors.onSurface}
            />
            <View style={styles.uploadButtons}>
              <Button
                mode="outlined"
                onPress={pickImage}
                style={[styles.uploadOption, { borderColor: colors.primary }]}
                labelStyle={{ color: colors.primary }}
                icon="image"
                loading={uploading}
                disabled={uploading}
              >
                <Text style={{ color: colors.primary }}>Chọn ảnh</Text>
              </Button>
              <Button
                mode="outlined"
                onPress={takePhoto}
                style={[styles.uploadOption, { borderColor: colors.primary }]}
                labelStyle={{ color: colors.primary }}
                icon="camera"
                loading={uploading}
                disabled={uploading}
              >
                <Text style={{ color: colors.primary }}>Chụp ảnh</Text>
              </Button>
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialogVisible(false)}>
              <Text style={{ color: colors.primary }}>Hủy</Text>
            </Button>
            <Button
              onPress={() => {
                if (!note) {
                  Alert.alert('Thông báo', 'Vui lòng nhập ghi chú.');
                  return;
                }
              }}
              disabled={uploading || !note}
            >
              <Text style={{ color: colors.primary }}>Tiếp tục</Text>
            </Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog visible={editDialogVisible} onDismiss={() => setEditDialogVisible(false)}>
          <Dialog.Title>
            <Text style={{ color: colors.onSurface }}>Chỉnh sửa ghi chú</Text>
          </Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Ghi chú"
              value={editNote}
              onChangeText={setEditNote}
              mode="outlined"
              multiline
              numberOfLines={3}
              style={{ marginBottom: 16 }}
              theme={{ colors: { primary: colors.primary, underlineColor: 'transparent' } }}
              outlineColor={colors.outline}
              activeOutlineColor={colors.primary}
              textColor={colors.onSurface}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setEditDialogVisible(false)}>
              <Text style={{ color: colors.primary }}>Hủy</Text>
            </Button>
            <Button 
              onPress={saveEditPhoto}
              loading={loading}
              disabled={loading || !editNote}
            >
              <Text style={{ color: colors.primary }}>Lưu</Text>
            </Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog visible={editTaskDialogVisible} onDismiss={() => setEditTaskDialogVisible(false)}>
          <Dialog.Title>
            <Text style={{ color: colors.onSurface }}>Chỉnh sửa thông tin công việc</Text>
          </Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Mô tả công việc"
              value={editedTask?.phanCong?.moTa}
              onChangeText={(text) => setEditedTask({
                ...editedTask,
                phanCong: { ...editedTask?.phanCong, moTa: text }
              })}
              mode="outlined"
              multiline
              numberOfLines={3}
              style={{ marginBottom: 16 }}
              theme={{ colors: { primary: colors.primary, underlineColor: 'transparent' } }}
              outlineColor={colors.outline}
              activeOutlineColor={colors.primary}
              textColor={colors.onSurface}
            />
            <TextInput
              label="Ghi chú (Phân công chung)"
              value={editedTask?.phanCong?.ghiChu}
              onChangeText={(text) => setEditedTask({
                ...editedTask,
                phanCong: { ...editedTask?.phanCong, ghiChu: text }
              })}
              mode="outlined"
              multiline
              numberOfLines={3}
              style={{ marginBottom: 16 }}
              theme={{ colors: { primary: colors.primary, underlineColor: 'transparent' } }}
              outlineColor={colors.outline}
              activeOutlineColor={colors.primary}
              textColor={colors.onSurface}
            />
            <TextInput
              label="Vị trí (Thiết bị)"
              value={editedTask?.thietBi?.viTri}
              onChangeText={(text) => setEditedTask({
                ...editedTask,
                thietBi: { ...editedTask?.thietBi, viTri: text }
              })}
              mode="outlined"
              style={{ marginBottom: 16 }}
              theme={{ colors: { primary: colors.primary, underlineColor: 'transparent' } }}
              outlineColor={colors.outline}
              activeOutlineColor={colors.primary}
              textColor={colors.onSurface}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setEditTaskDialogVisible(false)}>
              <Text style={{ color: colors.primary }}>Hủy</Text>
            </Button>
            <Button 
              onPress={saveTaskChanges}
              loading={loading}
              disabled={loading}
            >
              <Text style={{ color: colors.primary }}>Lưu</Text>
            </Button>
          </Dialog.Actions>
        </Dialog>

        {/* Status Selection Dialog */}
        <Dialog visible={statusDialogVisible} onDismiss={() => setStatusDialogVisible(false)}>
          <Dialog.Title>
            <Text style={{ color: colors.onSurface }}>Chọn trạng thái công việc</Text>
          </Dialog.Title>
          <Dialog.Content>
            <RadioButton.Group onValueChange={value => setSelectedStatus(value)} value={selectedStatus}>
              {TASK_STATUSES.map((status) => (
                <View key={status.value} style={styles.statusOption}>
                  <RadioButton
                    value={status.value}
                    color={colors.primary}
                  />
                  <View style={[styles.statusDisplay, { backgroundColor: getStatusColor(status.value) + '20' }]}>
                    <Text style={{color: colors.onSurface}}>{status.label}</Text>
                  </View>
                </View>
              ))}
            </RadioButton.Group>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setStatusDialogVisible(false)}>
              <Text style={{ color: colors.primary }}>Hủy</Text>
            </Button>
            <Button
              onPress={() => handleStatusChange(selectedStatus)}
              loading={loading}
              disabled={loading || !selectedStatus || selectedStatus === task?.trangThai}
            >
              <Text style={{ color: colors.primary }}>Cập nhật</Text>
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabView: {
     flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    // No paddingTop needed if using AppLayout
    elevation: 2, // Shadow on Android
    shadowColor: '#000', // Shadow on iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 1.5,
    backgroundColor: 'white', // Default background, will be overridden by theme
    borderBottomWidth: 1, // Separator line
    borderBottomColor: '#e0e0e0', // Separator color
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12, // Reduced padding
    borderBottomWidth: 2,
    justifyContent: 'center',
  },
  tabSceneScrollContent: {
    padding: 16,
    paddingTop: 0, // No top padding as card provides it
  },

  // Removed headerContainer, headerRow, headerActions, editButton styles
  // Header content is now inside ThongTinScene or handled by AppLayout


  infoCard: { // Style for the Card containing sections
    marginBottom: 16,
    borderRadius: 8, // Rounded corners for the card
    elevation: 2, // Add shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    overflow: 'hidden', // Ensures header background color is contained
    borderWidth: 1, // Add border
    borderColor: '#e0e0e0', // Default border color, will be overridden by theme
  },
  sectionHeader: { // Blue header inside the card
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 16, // Space between header and content
    marginHorizontal: -16, // Extend background to card edges
    marginTop: -16, // Extend background to card edges
    backgroundColor: '#007bff', // Default blue color, will be overridden by theme
  },
  sectionCardTitle: { // Title text in the blue header
    fontSize: 16,
    marginLeft: 8,
    fontWeight: 'bold',
    color: 'white', // Default white color, will be overridden by theme
  },
   sectionContentContainer: { // Padding for the content inside the card section
      paddingHorizontal: 16, // Add horizontal padding
      paddingBottom: 16, // Add bottom padding
   },
  sectionItem: { // Container for each info row (Title: Content)
    marginBottom: 8,
     flexDirection: 'row', // Align title and content horizontally
     alignItems: 'flex-start', // Align items to the start
     flexWrap: 'wrap', // Allow content to wrap
  },
  sectionItemRow: { // Container for items in the same row (e.g., Name and Phone)
    flexDirection: 'row',
     justifyContent: 'space-between',
     marginBottom: 8,
      width: '100%', // Take full width
  },
  sectionItemTitle: { // Style for the "Title:" part
      fontSize: 14,
      fontWeight: 'bold',
      marginRight: 4,
       // minWidth: 100, // Optional: ensure minimum width for titles
  },
  sectionItemContent: { // Style for the "Content" part
    fontSize: 14,
    flexShrink: 1, // Allow text to wrap
    flex: 1, // Take remaining space
  },
  priorityContainer: { // Container for priority bar row
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8, // Space after the priority row
       width: '100%', // Take full width
  },
   priorityIconContainer: { // Container for the fire icon
    width: 24, // Smaller size
    height: 24, // Smaller size
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8, // Space between icon and text
     backgroundColor: '#ffeb3b', // Default yellow color, will be overridden
  },
  priorityBarBackground: { // Grey background of the priority bar
      flex: 1, // Take remaining space
      height: 8,
      borderRadius: 4,
      overflow: 'hidden',
      marginHorizontal: 8, // Space around the bar
       backgroundColor: '#e0e0e0', // Default grey color, will be overridden
  },
  priorityBarFill: { // Red fill of the priority bar
      height: '100%',
      borderRadius: 4,
       backgroundColor: 'red', // Default red color, adjust if needed
  },

  // Keep existing styles that are still relevant or used inside scenes
  photoContainer: { marginTop: 8, }, // Adjusted margin
  photoCard: {
    marginBottom: 16,
    elevation: 2,
      borderRadius: 8, // Match card style
      borderWidth: 1, // Add border
      borderColor: '#e0e0e0', // Default border color
  },
  photo: {
    height: 200,
  },
  photoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  photoInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  photoActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    margin: 0,
  },
  photoDate: {
    marginLeft: 4,
    fontSize: 12,
  },
  photoNote: {
    marginTop: 4,
    fontSize: 14,
  },
  noPhotos: {
    textAlign: 'center',
    marginTop: 16,
  },
  uploadButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  uploadOption: {
    flex: 1,
    marginHorizontal: 4,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 8,
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    marginTop: 8,
    textAlign: 'center',
  },
  // Removed or adjusted styles related to the old layout (ScrollView only)
  buttonContainer: { marginTop: 16, }, // Adjusted margin top
  button: { marginTop: 0, }, // Adjusted margin top
  uploadButton: { marginLeft: 0, }, // Adjusted margin left

  // Keep or adjust dialog styles
  modalContainer: {
    padding: 20, // Add padding to the container
    margin: 20,
    borderRadius: 8,
  },
  modalContent: {
    padding: 0, // Padding moved to container
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusInput: { // Removed this style, using a simple View with Text instead
     display: 'none', // Hide the TextInput
  },
   statusDisplay: { // New style to display status like the chip
    flex: 1,
    marginLeft: 8,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 4, // Match input field border radius
      justifyContent: 'center',
   },
    divider: { // Added divider style
      height: 1,
      marginVertical: 12, // Adjust vertical margin as needed
      marginHorizontal: -16, // Extend to card edges
    },
     headerActions: { // Style for the container of status chip and edit button
        flexDirection: 'row',
        alignItems: 'center',
    },
    editButton: { // Style for the IconButton
        marginLeft: 4, // Adjust spacing if needed
    },
     statusChip: { // Style for the Chip
        height: 28, // Adjust chip height
        justifyContent: 'center', // Center content vertically
    },

  deviceInfoContent: {
    padding: 16,
  },
  deviceDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  deviceImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deviceTextInfo: {
    flex: 1,
  },
  deviceMainText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  deviceSubText: {
    fontSize: 14,
  },
  deviceStatusChip: {
    height: 28,
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  locationCardContent: {
    padding: 16,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  locationText: {
    fontSize: 14,
  },
  accessDeniedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  accessDeniedTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  accessDeniedMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  backButton: {
    minWidth: 120,
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
  },
  bottomBarButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  ktvCardContainer: {
    marginBottom: 16,
  },
  ktvCard: {
    borderWidth: 2,
    borderColor: 'transparent',
    borderRadius: 8,
    elevation: 2,
  },
  ktvCardHeader: {
    padding: 16,
    paddingBottom: 0,
  },
  ktvCardContent: {
    padding: 16,
  },
  ktvInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ktvAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ktvAvatarText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  ktvInfo: {
    flex: 1,
    marginLeft: 16,
  },
  ktvNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ktvName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  ktvCurrentUser: {
    fontSize: 12,
    color: 'gray',
  },
  ktvStatus: {
    fontSize: 14,
    color: 'gray',
  },
  ktvMenuButton: {
    margin: 0,
  },
  noDataText: {
    textAlign: 'center',
    marginTop: 16,
  },
}); 