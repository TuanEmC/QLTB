import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, Dimensions, Alert, Image, Linking } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import useAppTheme from '../../hooks/useAppTheme';
import AppLayout from '../../components/layout/AppLayout';
import { Card, Title, Paragraph, Chip, Button, Searchbar, Modal, Portal, Divider, List, ActivityIndicator, Badge, TextInput, Dialog, Menu, IconButton } from 'react-native-paper';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { doc, getDoc, collection, getDocs, query, where, updateDoc, arrayUnion, onSnapshot } from 'firebase/firestore';
import { db,storage } from '../../services/firebaseConfig';
import * as ImagePicker from 'expo-image-picker';
import { Camera } from 'expo-camera';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { intervalToDuration, formatDuration } from 'date-fns';

const initialLayout = { width: Dimensions.get('window').width };

// Export individual tab components
export function TabCongViec({ task, onTaskUpdated }) {
  const { colors } = useAppTheme();
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState('');
  const [dialogVisible, setDialogVisible] = useState(false);
  const [uploadingPauseImage, setUploadingPauseImage] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isOverdue, setIsOverdue] = useState(false);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [capturedImageUri, setCapturedImageUri] = useState(null);
  const [extensionCount, setExtensionCount] = useState(task?.phanCong?.soLanGiaHan || 0);
  const [isPaused, setIsPaused] = useState(false);
  const [showExtendDialog, setShowExtendDialog] = useState(false);
  const [extensionMinutes, setExtensionMinutes] = useState('60');
  const [extensionReason, setExtensionReason] = useState('');
  const [submittingExtension, setSubmittingExtension] = useState(false);
  const [showPauseDialog, setShowPauseDialog] = useState(false);
  const [pauseNote, setPauseNote] = useState('');
  const [pauseImageUri, setPauseImageUri] = useState(null);
  const [showExtensionSuggestionDialog, setShowExtensionSuggestionDialog] = useState(false);
  const [isCapturingProgressPhoto, setIsCapturingProgressPhoto] = useState(false);
  const [isUploadingCheckInOrResume, setIsUploadingCheckInOrResume] = useState(false);
  const [remainingTimeMillis, setRemainingTimeMillis] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    if (task) {
      console.log('TabCongViec - Task data received:', JSON.stringify(task, null, 2));
      setIsCheckedIn(task?.trangThai === 'Đang Thực Hiện');
      setExtensionCount(task?.phanCong?.soLanGiaHan || 0);
      setIsPaused(task?.trangThai === 'Tạm Nghỉ');
    }
  }, [task]);

  useEffect(() => {
    // Calculate total elapsed time and remaining time based on tienTrinh
    const calculateTime = () => {
      if (!task?.tienTrinh || task.tienTrinh.length === 0) {
        setRemainingTimeMillis(task?.thoiGianDuKien ? task.thoiGianDuKien * 60 * 1000 : 0);
        setIsOverdue(false);
        return;
      }

      const relevantEvents = task.tienTrinh
        .filter(event => ['Đang Thực Hiện', 'Tạm Nghỉ'].includes(event.trangThai))
        .sort((a, b) => new Date(a.thoiGian).getTime() - new Date(b.thoiGian).getTime());

      let totalElapsedTime = 0;
      let lastCheckInTime = null;

      for (const event of relevantEvents) {
        const eventTime = new Date(event.thoiGian).getTime();
        if (event.trangThai === 'Đang Thực Hiện') {
          lastCheckInTime = eventTime;
        } else if (event.trangThai === 'Tạm Nghỉ' && lastCheckInTime !== null) {
          totalElapsedTime += (eventTime - lastCheckInTime);
          lastCheckInTime = null; // Reset after pairing
        }
      }

      // If the last event was 'Đang Thực Hiện' and not followed by 'Tạm Nghỉ'
      if (lastCheckInTime !== null) {
         totalElapsedTime += (new Date().getTime() - lastCheckInTime);
      }

      const plannedDurationMillis = (task?.thoiGianDuKien || 0) * 60 * 1000;
      const calculatedRemaining = plannedDurationMillis - totalElapsedTime; // Allow negative for overdue

      setRemainingTimeMillis(calculatedRemaining);
      setIsOverdue(calculatedRemaining < 0 && (task?.trangThai === 'Đang Thực Hiện' || task?.trangThai === 'Tạm Nghỉ'));
    };

    calculateTime();

    // Set up interval to update remaining time
    if (task?.trangThai === 'Đang Thực Hiện') {
      timerRef.current = setInterval(() => {
        setRemainingTimeMillis(prev => {
          const newRemaining = prev - 1000;
          setIsOverdue(newRemaining < 0);
          return newRemaining;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    // Update currentTime state every second regardless of task status for accurate calculations
    const globalTimer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timerRef.current);
      clearInterval(globalTimer);
    };

  }, [task?.tienTrinh, task?.thoiGianDuKien, task?.trangThai]); // Depend on tienTrinh, thoiGianDuKien and trangThai

  const calculateDisplayTime = () => {
    if (remainingTimeMillis === null) return 'Loading...';

    const totalSeconds = Math.abs(Math.round(remainingTimeMillis / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    if (remainingTimeMillis < 0) {
       return `+${formattedTime}`;
    } else {
       return formattedTime;
    }
  };

  const formatDurationInMinutes = (minutes) => {
    if (minutes === null || minutes === undefined) return 'N/A';
    const totalSeconds = minutes * 60;
    const hours = Math.floor(totalSeconds / 3600);
    const remainingSeconds = totalSeconds % 3600;
    const mins = Math.floor(remainingSeconds / 60);
    const secs = remainingSeconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
  };

  const calculateProgress = () => {
    // Progress is based on total planned duration vs elapsed time
    if (!task?.thoiGianDuKien) return 0;

    const plannedDurationMillis = task.thoiGianDuKien * 60 * 1000;
    if (plannedDurationMillis <= 0) return 0;

    // Calculate total elapsed time (same logic as in calculateTime but without remaining)
    let totalElapsedTime = 0;
    let lastCheckInTime = null;

    if (task?.tienTrinh) {
      const relevantEvents = task.tienTrinh
        .filter(event => ['Đang Thực Hiện', 'Tạm Nghỉ'].includes(event.trangThai))
        .sort((a, b) => new Date(a.thoiGian).getTime() - new Date(b.thoiGian).getTime());

      for (const event of relevantEvents) {
        const eventTime = new Date(event.thoiGian).getTime();
        if (event.trangThai === 'Đang Thực Hiện') {
          lastCheckInTime = eventTime;
        } else if (event.trangThai === 'Tạm Nghỉ' && lastCheckInTime !== null) {
          totalElapsedTime += (eventTime - lastCheckInTime);
          lastCheckInTime = null; // Reset after pairing
        }
      }
    }

    // If the last event was 'Đang Thực Hiện' and not followed by 'Tạm Nghỉ'
    if (lastCheckInTime !== null) {
      totalElapsedTime += (new Date().getTime() - lastCheckInTime);
    }

    const progress = (totalElapsedTime / plannedDurationMillis) * 100;
    return Math.min(progress, 100);
  };

  const progress = calculateProgress();
  const progressColor = progress < 100 ? colors.primary : colors.error;

  const handleExtendRequest = () => {
    setShowExtendDialog(true);
  };

  const handleCompleteTask = async () => {
    Alert.alert(
      'Hoàn tất công việc',
      'Xác nhận hoàn thành công việc này?',
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Xác nhận', 
          onPress: async () => {
            try {
              setLoading(true);
              const taskRef = doc(db, 'phan_cong_ktv', task.docId);
              await updateDoc(taskRef, {
                trangThai: 'Hoàn Thành',
                thoiGianHoanThien: new Date().toISOString(),
                thoiGianCapNhat: Date.now(),
                updatedAt: Date.now(),
                 tienTrinh: arrayUnion({
                  thoiGian: new Date().toISOString(),
                  trangThai: 'Hoàn Thành',
                  ghiChu: 'Hoàn thành công việc',
                })
              });
              Alert.alert('Thành công', 'Đã hoàn thành công việc');
              onTaskUpdated?.();
            } catch (error) {
              console.error('Error completing task:', error);
              Alert.alert('Lỗi', 'Không thể hoàn thành công việc');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handlePauseTask = async () => {
    if (!pauseImageUri) {
      Alert.alert('Lỗi', 'Vui lòng chụp ảnh trước khi tạm nghỉ');
      return;
    }

    try {
      setLoading(true);
      setUploadingPauseImage(true);
      const response = await fetch(pauseImageUri);
      const blob = await response.blob();
      const storageRef = ref(storage, `pause_images/${task.id}/${Date.now()}.jpg`);
      const uploadTask = uploadBytesResumable(storageRef, blob);

      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log('Upload is ' + progress + '% done');
        },
        (error) => {
          console.error('Image upload failed:', error);
          Alert.alert('Lỗi', 'Không thể tải ảnh lên');
          setLoading(false);
          setUploadingPauseImage(false);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          const taskRef = doc(db, 'phan_cong_ktv', task.docId);
          await updateDoc(taskRef, {
            trangThai: 'Tạm Nghỉ',
            thoiGianCapNhat: Date.now(),
            updatedAt: Date.now(),
            tienTrinh: arrayUnion({
              thoiGian: new Date().toISOString(),
              trangThai: 'Tạm Nghỉ',
              ghiChu: pauseNote,
              hinhAnh: downloadURL
            })
          });
          setShowPauseDialog(false);
          setPauseNote('');
          setPauseImageUri(null);
          Alert.alert('Thành công', 'Đã tạm nghỉ công việc');
          onTaskUpdated?.();
          setLoading(false);
          setUploadingPauseImage(false);
        }
      );
    } catch (error) {
      console.error('Error pausing task:', error);
      Alert.alert('Lỗi', 'Không thể tạm nghỉ công việc');
      setLoading(false);
      setUploadingPauseImage(false);
    }
  };

  const handleSubmitExtensionRequest = async () => {
    if (!extensionMinutes || isNaN(parseInt(extensionMinutes))) {
      Alert.alert('Lỗi', 'Vui lòng nhập số phút gia hạn hợp lệ.');
      return;
    }

    try {
      setSubmittingExtension(true);
      const taskRef = doc(db, 'phan_cong_ktv', task.docId);
      const requestedMinutes = parseInt(extensionMinutes, 10);

      // Add extension request to tienTrinh
      await updateDoc(taskRef, {
        thoiGianCapNhat: Date.now(),
        updatedAt: Date.now(),
        tienTrinh: arrayUnion({
          thoiGian: new Date().toISOString(),
          trangThai: 'Yêu cầu gia hạn', // Or a specific status for requests
          ghiChu: `Yêu cầu gia hạn thêm ${requestedMinutes} phút. Lý do: ${extensionReason || 'Không có lý do'}`,
        }),
        // Optional: Update total requested extension count/minutes on the task itself
        // This might require restructuring task document or creating a subcollection for extensions
        // 'phanCong.soLanGiaHan': (task?.phanCong?.soLanGiaHan || 0) + 1,
        // You might need another field for total requested minutes if you track that
      });

      Alert.alert('Thành công', 'Đã gửi yêu cầu gia hạn.');
      setShowExtendDialog(false);
      setExtensionMinutes('60'); // Reset to default
      setExtensionReason('');
      onTaskUpdated?.(); // Trigger update in parent
    } catch (error) {
      console.error('Error submitting extension request:', error);
      Alert.alert('Lỗi', 'Không thể gửi yêu cầu gia hạn.');
    } finally {
      setSubmittingExtension(false);
    }
  };

  const handleCaptureProgressPhoto = async () => {
    const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
    const { status: mediaLibraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (cameraStatus !== 'granted' || mediaLibraryStatus !== 'granted') {
      Alert.alert(
        'Quyền truy cập bị từ chối',
        'Cần cấp quyền truy cập camera và thư viện ảnh để thực hiện chức năng này.'
      );
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setIsCapturingProgressPhoto(true);
      try {
        const response = await fetch(uri);
        const blob = await response.blob();
        const storageRef = ref(storage, `progress_images/${task.id}/${Date.now()}.jpg`);
        const uploadTask = uploadBytesResumable(storageRef, blob);

        uploadTask.on('state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log('Progress photo upload is ' + progress + '% done');
          },
          (error) => {
            console.error('Progress photo upload failed:', error);
            Alert.alert('Lỗi', 'Không thể tải ảnh tiến độ.');
            setIsCapturingProgressPhoto(false);
          },
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            const taskRef = doc(db, 'phan_cong_ktv', task.docId);
            
            // Add entry to tienTrinh without changing main task status
            await updateDoc(taskRef, {
              tienTrinh: arrayUnion({
                thoiGian: new Date().toISOString(),
                trangThai: 'Cập nhật tiến độ', // Or a suitable status
                ghiChu: '', // Optional: could add a dialog later for a note
                hinhAnh: downloadURL
              })
            });

            Alert.alert('Thành công', 'Đã lưu ảnh tiến độ!');
            setIsCapturingProgressPhoto(false);
          }
        );
      } catch (error) {
        console.error('Error during progress photo capture/upload:', error);
        Alert.alert('Lỗi', 'Đã xảy ra lỗi khi chụp hoặc tải ảnh tiến độ.');
        setIsCapturingProgressPhoto(false);
      }
    } else {
      console.log('Progress photo capture cancelled');
    }
  };

  const handleCheckIn = async () => {
    const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();

    if (cameraStatus !== 'granted') {
      Alert.alert(
        'Quyền truy cập bị từ chối',
        'Cần cấp quyền truy cập camera để thực hiện chức năng này.'
      );
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setIsUploadingCheckInOrResume(true);
      try {
        const response = await fetch(uri);
        const blob = await response.blob();
        const storageRef = ref(storage, `checkin_images/${task.id}/${Date.now()}.jpg`);
        const uploadTask = uploadBytesResumable(storageRef, blob);

        uploadTask.on('state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log('Upload is ' + progress + '% done');
          },
          (error) => {
            console.error('Image upload failed:', error);
            Alert.alert('Lỗi', 'Không thể tải ảnh lên.');
            setIsUploadingCheckInOrResume(false);
          },
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              const taskRef = doc(db, 'phan_cong_ktv', task.docId);
              const now = new Date();
              
            const isResumingFromPause = task?.trangThai === 'Tạm Nghỉ';

            const updateData = {
                trangThai: 'Đang Thực Hiện',
                thoiGianCapNhat: Date.now(),
                updatedAt: Date.now(),
              tienTrinh: arrayUnion({
                thoiGian: now.toISOString(),
                trangThai: 'Đang Thực Hiện',
                ghiChu: isResumingFromPause ? 'Tiếp tục công việc' : 'Bắt đầu công việc',
                hinhAnh: downloadURL
              })
            };

            // Only update start and end time on initial check-in
            if (!task?.thoiGianBatDau) {
              const plannedDurationMillis = (task.thoiGianDuKien || 0) * 60 * 1000;
              const predictedEndTime = new Date(now.getTime() + plannedDurationMillis);
               updateData.thoiGianBatDau = now.toISOString();
               updateData.thoiGianKetThuc = predictedEndTime.toISOString();
               console.log('Setting start time:', now.toISOString());
               console.log('Setting end time:', predictedEndTime.toISOString());
               console.log('Planned duration (minutes):', task.thoiGianDuKien);
            }

            await updateDoc(taskRef, updateData);

            setIsUploadingCheckInOrResume(false);
            Alert.alert('Thành công', isResumingFromPause ? 'Đã tiếp tục công việc!' : 'Đã check-in và bắt đầu công việc!');
            onTaskUpdated?.();
          }
        );
      } catch (error) {
        console.error('Error during check-in/resume process:', error);
        Alert.alert('Lỗi', 'Đã xảy ra lỗi trong quá trình check-in/tiếp tục.');
        setIsUploadingCheckInOrResume(false);
      }
    } else {
      console.log('Check-in/Resume photo capture cancelled');
    }
  };

  if (!task) return null;

  const expectedDuration = formatDurationInMinutes(task?.thoiGianDuKien);

  // Determine which UI to show based on task status
  const showInitialUI = !isCheckedIn || isPaused; // Show initial UI if not checked in or if paused

  return (
    <ScrollView style={styles.tabContentScroll} contentContainerStyle={styles.tabCongViecContent}>
      {/* Conditionally render UI based on task status */}
      {showInitialUI ? (
        // Initial or Paused states UI
        <>
      <Card style={[styles.checkinCard, { backgroundColor: colors.surface }]}>
        <Card.Content style={styles.checkinCardContent}>
              <MaterialCommunityIcons name="briefcase" size={60} color={colors.primary} style={styles.checkinIcon} />
              <Text style={[styles.checkinPromptText, { color: colors.onSurfaceVariant }]}>
                {isPaused ? 'Đã tạm nghỉ công việc.' : 'Kiểm tra thời gian và chuẩn bị check-in nhé!'}
              </Text>

              <View style={styles.timeInfoContainer}>
                <Text style={[styles.timeInfoLabel, { color: colors.onSurfaceVariant }]}>Dự kiến:</Text>
                 <Text style={[styles.timeInfoValue, { color: colors.onSurface }]}>{expectedDuration}</Text>
                 <IconButton
                   icon="information-outline"
                   size={20}
                   iconColor={colors.onSurfaceVariant}
                   onPress={() => setShowExtensionSuggestionDialog(true)}
                 />
              </View>

              {/* Placeholder for the progress bar */}
               {/* In initial/paused state, show total duration as if no time has passed */}
               <View style={styles.progressBarContainer}>
                 <View style={[styles.progressBar, { width: '0%', backgroundColor: colors.primary }]} />
               </View>


            </Card.Content>
          </Card>

          <TouchableOpacity
            style={[styles.checkInButton, { backgroundColor: colors.primary }]}
            onPress={handleCheckIn} // handleCheckIn now handles both initial check-in and resuming
            disabled={isUploadingCheckInOrResume}
          >
              {isUploadingCheckInOrResume ? (
                  <ActivityIndicator size="small" color={colors.onPrimary} />
              ) : (
                  <>
                     <MaterialCommunityIcons name="camera" size={24} color={colors.onPrimary} style={{ marginRight: 8 }}/>
                     <Text style={[styles.checkInButtonText, { color: colors.onPrimary }]}>
                        {isPaused ? 'Chụp ảnh để tiếp tục' : 'Bắt đầu Check-in'}
                     </Text>
                  </>
              )}
          </TouchableOpacity>
        </>
      ) : (
        // 'Đang Thực Hiện' state UI
        <>
          <Card style={[styles.checkinCard, { backgroundColor: colors.surface }]}>
            <Card.Content style={styles.checkinCardContent}>
              {/* Image preview or default icon */}
              {capturedImageUri ? ( // capturedImageUri is currently not used for check-in photo display
            <Image 
              source={{ uri: capturedImageUri }} 
              style={styles.capturedImage}
              resizeMode="cover"
            />
          ) : (
            <MaterialCommunityIcons name="briefcase" size={60} color={colors.primary} style={styles.checkinIcon} />
          )}

          <View style={styles.circularTimerContainer}>
                {/* Circular timer placeholder - consider using a library for actual circular progress */}
                <View style={[styles.circularProgressPlaceholder, { borderColor: isOverdue ? colors.error : colors.primary }]}>
                  <Text style={[styles.displayTimeText, { color: isOverdue ? colors.error : colors.onSurface }]}>
                      {calculateDisplayTime()}
                  </Text>
                  {/* Extend button */}
                  <TouchableOpacity 
                    style={[styles.extendButton, { backgroundColor: colors.primary }]} 
                    onPress={handleExtendRequest}
                  >
                      <MaterialCommunityIcons name="plus" size={24} color={colors.onPrimary} />
                  </TouchableOpacity>
                </View>
                 {/* Simple linear progress bar under the circular timer */}
                 <View style={styles.progressBarContainer}>
                   <View style={[styles.progressBar, { width: `${progress}%`, backgroundColor: progressColor }]} />
              </View>
          </View>

              {/* Info buttons */}
          <View style={styles.infoButtonsContainer}>
              <TouchableOpacity 
                style={[styles.infoButton, { borderColor: colors.outline }]} 
                onPress={handleExtendRequest}
              >
                  <MaterialCommunityIcons name="history" size={18} color={colors.onSurfaceVariant} />
                  <Text style={[styles.infoButtonText, { color: colors.onSurfaceVariant }]}>
                      Gia hạn: {extensionCount} lần
                  </Text>
              </TouchableOpacity>

                {/* Elapsed time display - now redundant with calculated remaining time */}
                {/* Keeping it for now, but consider removing if remaining time is sufficient */}
              <View style={[styles.infoButton, { borderColor: colors.outline }]}>
                  <MaterialCommunityIcons name="clock-outline" size={18} color={colors.onSurfaceVariant} />
                  <Text style={[styles.infoButtonText, { color: colors.onSurfaceVariant }]}>
                     Dự kiến: {expectedDuration}
                  </Text>
              </View>
          </View>
        </Card.Content>
      </Card>

          {/* Action buttons */}
      <View style={styles.actionButtonsContainer}>
            {/* Pause Button */}
          <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: colors.errorContainer }]}
              onPress={handlePauseTask} // This button is only shown in 'Đang Thực Hiện' state now
              disabled={loading} // Disable if general loading is true
            >
               {loading && !uploadingPauseImage ? ( // Show general loading if not specifically image uploading
                  <ActivityIndicator size="small" color={colors.onErrorContainer} />
              ) : (
              <MaterialCommunityIcons 
                  name="pause"
                size={30} 
                  color={colors.onErrorContainer}
              />
               )}
          </TouchableOpacity>

            {/* Capture Progress Photo Button */}
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: colors.surfaceVariant }]} 
              onPress={handleCaptureProgressPhoto}
              disabled={isCapturingProgressPhoto || loading} // Disable if capturing photo or general loading
          >
              {isCapturingProgressPhoto ? (
                  <ActivityIndicator size="small" color={colors.onSurfaceVariant} />
              ) : (
                  <MaterialCommunityIcons name="camera" size={30} color={colors.onSurfaceVariant} />
              )}
          </TouchableOpacity>

            {/* Complete Task Button */}
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.successContainer }]}
              onPress={handleCompleteTask}
              disabled={loading} // Disable if general loading is true
            >
              {loading && !isCapturingProgressPhoto && !uploadingPauseImage ? ( // Show general loading if not other specific loadings
                 <ActivityIndicator size="small" color={colors.onSuccessContainer} />
              ) : (
              <MaterialCommunityIcons name="check" size={30} color={colors.onSuccessContainer} />
              )}
          </TouchableOpacity>
      </View>
        </>
      )}

      {/* Dialogs are always in the tree but visible prop controls display */}
      <Portal>
        {/* Pause Dialog */}
      <Dialog visible={showPauseDialog} onDismiss={() => setShowPauseDialog(false)}>
        <Dialog.Title>
          <Text style={{ color: colors.onSurface }}>Tạm nghỉ</Text>
        </Dialog.Title>
        <Dialog.Content>
          <View style={styles.photoUploadContainer}>
              <Text style={{ color: colors.onSurfaceVariant }}>Ảnh: {pauseImageUri ? '1/1' : '0/1'}</Text>
            <IconButton
              icon="camera"
              size={24}
                onPress={async () => {
                  const result = await ImagePicker.launchCameraAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                    allowsEditing: true,
                    aspect: [4, 3],
                    quality: 1,
                  });
                  if (!result.canceled) {
                    setPauseImageUri(result.assets[0].uri);
                  }
                }}
              iconColor={colors.onSurfaceVariant}
                disabled={uploadingPauseImage} // Disable camera icon while uploading
            />
          </View>
            {uploadingPauseImage ? (
              <View style={styles.dialogLoadingContainer}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={[styles.dialogLoadingText, { color: colors.onSurfaceVariant }]}>Đang tải ảnh...</Text>
              </View>
            ) : pauseImageUri && (
              <Image
                source={{ uri: pauseImageUri }}
                style={styles.pauseImage}
                resizeMode="cover"
              />
            )}
            <TextInput
              label="Ghi chú"
              value={pauseNote}
              onChangeText={setPauseNote}
              mode="outlined"
              multiline
              numberOfLines={3}
              style={{ marginTop: 16 }}
              editable={!uploadingPauseImage} // Disable input while uploading
            />
        </Dialog.Content>
        <Dialog.Actions>
            <Button onPress={() => setShowPauseDialog(false)} disabled={submittingExtension || uploadingPauseImage}>
            <Text style={{ color: colors.primary }}>Hủy</Text>
          </Button>
            <Button
               onPress={handlePauseTask}
               loading={loading && uploadingPauseImage} // Only show loading on button if it's related to this specific upload
               disabled={!pauseImageUri || loading || uploadingPauseImage} // Disable if no image, or any loading is true
            >
            <Text style={{ color: colors.primary }}>Xác nhận</Text>
          </Button>
        </Dialog.Actions>
      </Dialog>

        {/* Extend Request Dialog */}
      <Dialog visible={showExtendDialog} onDismiss={() => setShowExtendDialog(false)}>
            <Dialog.Title>
              <Text style={{ color: colors.onSurface }}>Yêu cầu gia hạn</Text>
            </Dialog.Title>
            <Dialog.Content>
               <TextInput
                 label="Số phút gia hạn"
                 value={extensionMinutes}
                 onChangeText={setExtensionMinutes}
                 mode="outlined"
                 keyboardType="number-pad"
                 style={{ marginBottom: 16 }}
                 editable={!submittingExtension} // Disable input while submitting
               />
               <TextInput
                 label="Lý do gia hạn"
                 value={extensionReason}
                 onChangeText={setExtensionReason}
                 mode="outlined"
                 multiline
                 numberOfLines={4}
                 editable={!submittingExtension} // Disable input while submitting
               />
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setShowExtendDialog(false)} disabled={submittingExtension}>
                <Text style={{ color: colors.primary }}>Hủy</Text>
              </Button>
              <Button
                onPress={handleSubmitExtensionRequest}
                loading={submittingExtension} // Show loading specifically for extension submission
                disabled={submittingExtension} // Disable button while submitting
              >
                <Text style={{ color: colors.primary }}>Gửi yêu cầu</Text>
              </Button>
            </Dialog.Actions>
        </Dialog>

         {/* Extension Suggestion Dialog */}
         <Dialog visible={showExtensionSuggestionDialog} onDismiss={() => setShowExtensionSuggestionDialog(false)}>
            <Dialog.Title>
              <Text style={{ color: colors.onSurface }}>Gợi ý gia hạn</Text>
            </Dialog.Title>
            <Dialog.Content>
              <Text style={{ color: colors.onSurfaceVariant }}>
                Bạn có thể xin gia hạn thêm thời gian sau khi đã check-in nếu cần thêm thời gian để hoàn thành công việc.
            </Text>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setShowExtensionSuggestionDialog(false)}>
                <Text style={{ color: colors.primary }}>Đã hiểu</Text>
              </Button>
            </Dialog.Actions>
          </Dialog>

      </Portal>
    </ScrollView>
  );
}

export function TabChiTietPhanCong({ task }) {
  const { colors } = useAppTheme();
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'thongtin', title: 'Thông tin' },
    { key: 'thietbi', title: 'Thiết bị' },
    { key: 'minhchung', title: 'Minh chứng' },
    { key: 'ktvthamgia', title: 'KTV tham gia' },
  ]);

  const renderScene = SceneMap({
    thongtin: () => <TabThongTin task={task} />,
    thietbi: () => <TabThietBi task={task} />,
    minhchung: () => <TabMinhChung task={task} />,
    ktvthamgia: () => <TabKtvThamGia task={task} />,
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

  return (
    <View style={styles.container}>
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={initialLayout}
        renderTabBar={renderTabBar}
        style={styles.tabView}
      />
    </View>
  );
}

export function TabThongTin({ task }) {
  const { colors } = useAppTheme();
  
  if (!task?.phanCong) return null;

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return 'N/A';
    return format(date, 'dd/MM/yyyy HH:mm', { locale: vi });
  };

  return (
    <ScrollView style={styles.tabContentScroll}>
      <Card style={[styles.infoCard, { backgroundColor: colors.surface }]}>
        <Card.Content>
          <Title style={{ color: colors.onSurface }}>Thông tin phân công</Title>
          <Divider style={{ marginVertical: 8 }} />
          
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.onSurfaceVariant }]}>Mã phân công:</Text>
            <Text style={[styles.infoValue, { color: colors.onSurface }]}>{task.phanCong.id}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.onSurfaceVariant }]}>Loại phân công:</Text>
            <Text style={[styles.infoValue, { color: colors.onSurface }]}>{task.phanCong.loaiPhanCong}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.onSurfaceVariant }]}>Trạng thái:</Text>
            <Chip 
              style={{ backgroundColor: getStatusColor(task.phanCong.trangThai, colors) }}
              textStyle={{ color: colors.onPrimary }}
            >
              {task.phanCong.trangThai}
            </Chip>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.onSurfaceVariant }]}>Mức độ ưu tiên:</Text>
            <Text style={[styles.infoValue, { color: colors.onSurface }]}>{task.phanCong.mucDoUuTien}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.onSurfaceVariant }]}>Số lượng KTV tham gia:</Text>
            <Text style={[styles.infoValue, { color: colors.onSurface }]}>{task.phanCong.soLuongKTVThamGia}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.onSurfaceVariant }]}>Thời gian tạo:</Text>
            <Text style={[styles.infoValue, { color: colors.onSurface }]}>
              {formatTimestamp(task.phanCong.thoiGianTaoPhanCong)}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.onSurfaceVariant }]}>Ghi chú:</Text>
            <Text style={[styles.infoValue, { color: colors.onSurface }]}>{task.phanCong.ghiChu || 'Không có'}</Text>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

export function TabThietBi({ task }) {
  const { colors } = useAppTheme();
  
  if (!task?.thietBi) return null;

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return 'N/A';
    return format(date, 'dd/MM/yyyy', { locale: vi });
  };

  const renderDeviceInfo = () => {
    const info = task.thietBi.moTa.split('\n');
    return info.map((line, index) => {
      const [label, value] = line.split(':').map(s => s.trim());
      if (!label || !value) return null;
      return (
        <View key={index} style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: colors.onSurfaceVariant }]}>{label}:</Text>
          <Text style={[styles.infoValue, { color: colors.onSurface }]}>{value}</Text>
        </View>
      );
    });
  };

  return (
    <ScrollView style={styles.tabContentScroll}>
      <Card style={[styles.infoCard, { backgroundColor: colors.surface }]}>
        <Card.Content>
          <Title style={{ color: colors.onSurface }}>Thông tin thiết bị</Title>
          <Divider style={{ marginVertical: 8 }} />
          
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.onSurfaceVariant }]}>Tên thiết bị:</Text>
            <Text style={[styles.infoValue, { color: colors.onSurface }]}>{task.thietBi.tenThietBi}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.onSurfaceVariant }]}>Trạng thái:</Text>
            <Chip 
              style={{ backgroundColor: getStatusColor(task.thietBi.trangThai, colors) }}
              textStyle={{ color: colors.onPrimary }}
            >
              {task.thietBi.trangThai}
            </Chip>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.onSurfaceVariant }]}>Ngày bảo dưỡng gần nhất:</Text>
            <Text style={[styles.infoValue, { color: colors.onSurface }]}>
              {formatTimestamp(task.thietBi.ngayBaoDuongGanNhat)}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.onSurfaceVariant }]}>Ngày bảo dưỡng tiếp theo:</Text>
            <Text style={[styles.infoValue, { color: colors.onSurface }]}>
              {formatTimestamp(task.thietBi.ngayBaoDuongTiepTheo)}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.onSurfaceVariant }]}>Chu kỳ bảo dưỡng:</Text>
            <Text style={[styles.infoValue, { color: colors.onSurface }]}>
              {task.thietBi.baoDuongDinhKy} ngày
            </Text>
          </View>

          <Divider style={{ marginVertical: 8 }} />
          <Title style={[styles.sectionTitle, { color: colors.onSurface }]}>Thông số kỹ thuật</Title>
          {renderDeviceInfo()}

          <Divider style={{ marginVertical: 8 }} />
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.onSurfaceVariant }]}>Ghi chú bảo dưỡng:</Text>
            <Text style={[styles.infoValue, { color: colors.onSurface }]}>
              {task.thietBi.ghiChuBaoDuong || 'Không có'}
            </Text>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

export function TabTienTrinhLamViec({ task }) {
  const { colors } = useAppTheme();
  const [progressEvents, setProgressEvents] = useState([]);
  const [loadingProgress, setLoadingProgress] = useState(true);
  
  if (!task) return null;

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    // Check if timestamp is a Firestore Timestamp object or a string/number
    const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
    if (isNaN(date.getTime())) return 'N/A';
    return format(date, 'dd/MM/yyyy HH:mm', { locale: vi });
  };

  useEffect(() => {
    if (!task?.docId) {
      setProgressEvents([]);
      setLoadingProgress(false);
      return;
    }

    setLoadingProgress(true);
    const unsubscribe = onSnapshot(collection(db, 'anh_minh_chung_lam_viec'), (snapshot) => {
      const imageEvents = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(event => event.phanCongKTVId?.toString() === task.docId && event.type === 'image')
        .map(image => ({
          thoiGian: image.thoiGianTaiLen, // Use upload time for sorting
          trangThai: 'Ảnh tiến độ', // Or a suitable status string for images
          ghiChu: image.ghiChu || '', // Use ghiChu from image doc if exists
          hinhAnh: image.urlAnh,
          type: 'image'
        }));

      // Combine with task.tienTrinh (status updates)
      const statusEvents = task.tienTrinh || [];

      // Merge and sort all events by time
      const allEvents = [...imageEvents, ...statusEvents];
      allEvents.sort((a, b) => {
        const timeA = a.thoiGian?.toDate ? a.thoiGian.toDate().getTime() : new Date(a.thoiGian).getTime();
        const timeB = b.thoiGian?.toDate ? b.thoiGian.toDate().getTime() : new Date(b.thoiGian).getTime();
        return timeB - timeA; // Sort descending (latest first)
      });

      console.log('TabTienTrinhLamViec - Combined and sorted events:', allEvents);
      setProgressEvents(allEvents);
      setLoadingProgress(false);
    }, (error) => {
      console.error('TabTienTrinhLamViec - Error fetching progress events:', error);
      setLoadingProgress(false);
    });

    // Clean up the listener on component unmount
    return () => unsubscribe();

  }, [task?.docId, task?.tienTrinh]); // Re-run effect if task docId or tienTrinh array changes

  return (
    <ScrollView style={styles.tabContentScroll}>
      <Card style={[styles.infoCard, { backgroundColor: colors.surface }]}>
        <Card.Content>
          <Title style={{ color: colors.onSurface }}>Tiến trình làm việc</Title>
          <Divider style={{ marginVertical: 8 }} />
          
          {loadingProgress ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.loadingText, { color: colors.onSurfaceVariant }]}>
                Đang tải tiến trình...
              </Text>
            </View>
          ) : progressEvents.length === 0 ? (
            <Text style={[styles.noPhotos, { color: colors.onSurfaceVariant }]}>Chưa có tiến trình</Text>
          ) : (
            progressEvents.map((event, index) => (
            <View key={index} style={styles.tienTrinhItem}>
              <View style={styles.tienTrinhHeader}>
                <Text style={[styles.tienTrinhTime, { color: colors.onSurfaceVariant }]}>
                    {formatTimestamp(event.thoiGian)}
                </Text>
                <Chip 
                    style={{ backgroundColor: getStatusColor(event.trangThai, colors) }}
                  textStyle={{ color: colors.onPrimary }}
                >
                    {event.trangThai}
                </Chip>
              </View>
              <Text style={[styles.tienTrinhNote, { color: colors.onSurface }]}>
                  {event.ghiChu}
              </Text>
                {event.hinhAnh && (
                  <Image
                    source={{ uri: event.hinhAnh }}
                    style={styles.tienTrinhImage}
                    resizeMode="cover"
                  />
                )}
                {index < progressEvents.length - 1 && (
                <Divider style={{ marginVertical: 8 }} />
              )}
            </View>
            ))
          )}
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

export function TabMinhChung({ task }) {
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

      const taskRef = doc(db, 'phan_cong_ktv', task.docId);
      const taskDoc = await getDoc(taskRef);
      
      if (!taskDoc.exists()) {
        console.error('❌ Không tìm thấy tài liệu công việc');
        return;
      }

      const taskData = taskDoc.data();
      console.log('📄 Dữ liệu task từ Firestore:', JSON.stringify(taskData, null, 2));

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

    } catch (error) {
      console.error('❌ Lỗi khi tải ảnh:', error);
      setError(error.message || 'Không thể tải ảnh');
    } finally {
      setLoadingPhotos(false);
    }
  };

  if (!task) return null;

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return 'N/A';
    return format(date, 'dd/MM/yyyy HH:mm', { locale: vi });
  };

  return (
    <ScrollView style={styles.tabContentScroll}>
      <Card style={[styles.infoCard, { backgroundColor: colors.surface }]}>
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
              photos.map((photo, index) => (
                <View key={photo.id} style={styles.photoContainer}>
                  <View style={styles.photoHeader}>
                    <Text style={[styles.photoTime, { color: colors.onSurfaceVariant }]}>
                      {formatTimestamp(photo.thoiGianTaiLen)}
                    </Text>
                  </View>
                  <Image 
                    source={{ uri: photo.urlAnh }} 
                    style={styles.photoImage}
                    resizeMode="cover"
                  />
                  {index < photos.length - 1 && (
                    <Divider style={{ marginVertical: 8 }} />
                  )}
                </View>
              ))
            )}
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

export function KtvThamGiaCard({ item, currentUserId, navigation }) {
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
}

export function TabKtvThamGia({ task }) {
  const { colors } = useAppTheme();
  const [ktvList, setKtvList] = useState([]);
  const [loadingKtv, setLoadingKtv] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchKtvList = async () => {
      try {
        setLoadingKtv(true);
        
        if (!task?.phanCongId) {
          console.error('❌ Không có phanCongId');
          return;
        }

        const phanCongRef = doc(db, 'phan_cong', task.phanCongId.toString());
        const phanCongDoc = await getDoc(phanCongRef);
        
        if (!phanCongDoc.exists()) {
          console.error('❌ Không tìm thấy thông tin phân công');
          return;
        }

        const phanCongData = phanCongDoc.data();
        console.log('📄 Dữ liệu phân công:', phanCongData);

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

  if (!task) return null;

  return (
    <ScrollView style={styles.tabContentScroll}>
      <Card style={[styles.infoCard, { backgroundColor: colors.surface }]}>
        <Card.Content style={{paddingHorizontal: 0, paddingBottom: 0}}>
          <View style={[styles.sectionHeader, { backgroundColor: colors.primary }]}>
            <MaterialCommunityIcons name="account-group" size={20} color={colors.onPrimary} />
            <Text style={[styles.sectionCardTitle, { color: colors.onPrimary }]}>Kỹ thuật viên tham gia</Text>
          </View>
          <View style={styles.sectionContentContainer}>
            {loadingKtv ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={[styles.loadingText, { color: colors.onSurfaceVariant }]}>
                  Đang tải danh sách KTV...
                </Text>
              </View>
            ) : ktvList.length === 0 ? (
              <Text style={[styles.noPhotos, { color: colors.onSurfaceVariant }]}>
                Chưa có kỹ thuật viên nào được phân công
              </Text>
            ) : (
              ktvList.map((ktv, index) => (
                <KtvThamGiaCard
                  key={ktv.id}
                  item={ktv}
                  currentUserId={currentUserId}
                  navigation={navigation}
                />
              ))
            )}
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

function getStatusColor(status, colors) {
  switch (status) {
    case 'Chờ Phản Hồi':
      return colors.warning;
    case 'Đang Thực Hiện':
      return colors.info;
    case 'Tạm Nghỉ':
      return colors.info;
    case 'Đã Chấp Nhận':
      return colors.info;
    case 'Hoàn Thành':
      return colors.success;
    case 'Bị Hủy':
      return colors.error;
    case 'Đã Từ Chối':
      return colors.error;
    default:
      return colors.onSurfaceVariant;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  tabContainer: {
    flex: 1,
  },
  tabScrollView: {
    flexGrow: 0,
  },
  tabButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 4,
    borderRadius: 8,
  },
  selectedTabButton: {
    borderBottomWidth: 2,
    borderBottomColor: '#1976D2',
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  tabContent: {
    flex: 1,
  },
  tabContentScroll: {
    flex: 1,
    padding: 16,
  },
  infoCard: {
    marginBottom: 16,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
  },
  infoValue: {
    fontSize: 14,
    flex: 1,
    textAlign: 'right',
    marginLeft: 16,
  },
  sectionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  sectionItemTitle: {
    fontSize: 14,
  },
  sectionItemContent: {
    fontSize: 14,
    flex: 1,
    textAlign: 'right',
    marginLeft: 16,
  },
  tabBar: {
    backgroundColor: '#f8f8f8',
  },
  tabView: {
    flex: 1,
  },
  tienTrinhItem: {
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#eee',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  tienTrinhHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  tienTrinhTime: {
    fontSize: 12,
  },
  tienTrinhNote: {
    fontSize: 14,
  },
  tienTrinhImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginTop: 8,
  },
  minhChungItem: {
    marginBottom: 16,
  },
  minhChungHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  minhChungTime: {
    fontSize: 12,
  },
  minhChungImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  ktvItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ktvInfo: {
    flex: 1,
  },
  ktvName: {
    fontSize: 14,
    fontWeight: '500',
  },
  ktvRole: {
    fontSize: 12,
  },
  sectionTitle: {
    fontSize: 16,
    marginBottom: 8,
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyStateText: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  sectionCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  sectionContentContainer: {
    padding: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorText: {
    marginTop: 8,
    marginBottom: 8,
    fontSize: 14,
    textAlign: 'center',
  },
  noPhotos: {
    textAlign: 'center',
    fontSize: 14,
    padding: 24,
  },
  photoContainer: {
    marginBottom: 16,
  },
  photoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  photoTime: {
    fontSize: 12,
  },
  photoImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  ktvCardContainer: {
    marginBottom: 16,
    position: 'relative',
  },
  ktvCard: {
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  ktvCardHeader: {
    height: 4,
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
    marginRight: 12,
  },
  ktvAvatarText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  ktvInfo: {
    flex: 1,
  },
  ktvNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ktvCurrentUser: {
    fontSize: 14,
    marginLeft: 8,
  },
  ktvStatus: {
    fontSize: 14,
    marginTop: 4,
  },
  ktvMenuButton: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  tabCongViecContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  checkinCard: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    elevation: 4,
    marginBottom: 24,
  },
  checkinCardContent: {
    alignItems: 'center',
    padding: 24,
  },
  checkinIcon: {
    marginBottom: 16,
  },
  circularTimerContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 24,
  },
  circularProgressPlaceholder: {
      width: 200,
      height: 200,
      borderRadius: 100,
      borderWidth: 10,
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
  },
  displayTimeText: {
      fontSize: 48,
      fontWeight: 'bold',
  },
  extendButton: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 4,
  },
  infoButtonsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      width: '100%',
      marginBottom: 24,
  },
  infoButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 20,
      borderWidth: 1,
      marginHorizontal: 4,
  },
  infoButtonText: {
      marginLeft: 4,
      fontSize: 14,
  },
  actionButtonsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      width: '100%',
      paddingHorizontal: 16,
  },
  actionButton: {
      width: 60,
      height: 60,
      borderRadius: 30,
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 4,
  },
  capturedImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
  },
  photoUploadContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pauseImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginTop: 16,
  },
  checkinPromptText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  timeInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeInfoText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 4,
  },
  initialProgressBar: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    marginTop: 16,
  },
  checkInButton: {
    width: '100%',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkInButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 