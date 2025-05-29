import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, ActivityIndicator, TouchableOpacity, Text, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import useAppTheme from '../../hooks/useAppTheme';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { collection, query, where, getDocs, deleteDoc, doc, setDoc } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';
import { useSession } from '../../context/SessionContext';
import AppLayout from '../../components/layout/AppLayout';
import { Card, Title, Paragraph, Chip, Button, FAB, Portal, Dialog, TextInput } from 'react-native-paper';

export default function Specializations() {
  const navigation = useNavigation();
  const { colors } = useAppTheme();
  const { currentUser } = useSession();
  const [specializations, setSpecializations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [newSpecialization, setNewSpecialization] = useState('');
  const [kyThuatVien, setKyThuatVien] = useState(null);
  const [allChuyenMon, setAllChuyenMon] = useState([]);
  const [selectedChuyenMon, setSelectedChuyenMon] = useState([]);
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    loadKtvData();
  }, [currentUser]);

  const loadKtvData = async () => {
    try {
      console.log('DEBUG: currentUser', currentUser);
      // Lấy thông tin KTV từ Firestore nếu chưa đủ
      let ktvData = null;
      if (currentUser?.id) {
        console.log('DEBUG: Querying KTV with id:', currentUser.id);
        const ktvQuery = query(
          collection(db, 'ky_thuat_vien'),
          where('taiKhoanId', '==', currentUser.id)
        );
        const ktvSnapshot = await getDocs(ktvQuery);
        console.log('DEBUG: KTV query result empty?', ktvSnapshot.empty);
        if (!ktvSnapshot.empty) {
          const docData = ktvSnapshot.docs[0].data();
          ktvData = { id: docData.id || ktvSnapshot.docs[0].id, ...docData };
          setKyThuatVien(ktvData);
          console.log('DEBUG: Found KTV data:', ktvData);
        }
      }
      // Lấy chuyên môn
      if (ktvData?.id) {
        console.log('DEBUG: Querying chuyenMonKtv with ktvId:', ktvData.id);
        // Lấy danh sách liên kết chuyên môn của KTV
        const chuyenMonKtvQuery = query(
          collection(db, 'chuyen_mon_ktv'),
          where('kyThuatVienId', '==', ktvData.id)
        );
        const chuyenMonKtvSnapshot = await getDocs(chuyenMonKtvQuery);
        console.log('DEBUG: chuyenMonKtv query result empty?', chuyenMonKtvSnapshot.empty);
        const chuyenMonKtvList = chuyenMonKtvSnapshot.docs.map(doc => doc.data());
        const selectedIds = chuyenMonKtvList.map(item => String(item.chuyenMonId));
        console.log('DEBUG: chuyenMonKtvList', chuyenMonKtvList);
        console.log('DEBUG: selectedIds', selectedIds);

        // Lấy tất cả chuyên môn
        const allChuyenMonSnapshot = await getDocs(collection(db, 'chuyen_mon'));
        console.log('DEBUG: allChuyenMon query result empty?', allChuyenMonSnapshot.empty);
        const allChuyenMonData = allChuyenMonSnapshot.docs.map(doc => {
          const data = doc.data();
          return { id: String(data.id), ...data };
        });
        console.log('DEBUG: allChuyenMonData', allChuyenMonData);

        // Lọc ra các chuyên môn mà KTV có
        const filtered = allChuyenMonData.filter(item => selectedIds.includes(String(item.id)));
        console.log('DEBUG: filtered specializations', filtered);
        setSpecializations(filtered);
        // Cập nhật allChuyenMon để các chuyên môn đã có được đánh dấu isChecked = true
        setAllChuyenMon(
          allChuyenMonData.map(item => ({
            ...item,
            isChecked: selectedIds.includes(String(item.id))
          }))
        );
        setSelectedChuyenMon(selectedIds);
      } else {
        console.log('DEBUG: No KTV data found, cannot load specializations');
      }

      // DEBUG: Lấy toàn bộ danh sách kỹ thuật viên để kiểm tra dữ liệu
      const allKtvSnapshot = await getDocs(collection(db, 'ky_thuat_vien'));
      const allKtvList = allKtvSnapshot.docs.map(doc => doc.data());
      console.log('DEBUG: ALL kyThuatVien', allKtvList);
    } catch (error) {
      console.error('Error loading KTV data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadKtvData();
  };

  const handleAddSpecialization = () => {
    setDialogVisible(true);
  };

  const handleSaveSpecialization = async () => {
    if (!newSpecialization.trim()) return;

    try {
      // Add new specialization logic here
      setDialogVisible(false);
      setNewSpecialization('');
      loadKtvData();
    } catch (error) {
      console.error('Error adding specialization:', error);
    }
  };

  const toggleChuyenMon = (id) => {
    setAllChuyenMon(prev =>
      prev.map(item =>
        item.id === id ? { ...item, isChecked: !item.isChecked } : item
      )
    );
  };

  const saveChanges = async () => {
    try {
      setEditLoading(true);
      const newSelectedIds = allChuyenMon.filter(item => item.isChecked).map(item => String(item.id));
      // Remove unselected items
      const toRemove = selectedChuyenMon.filter(id => !newSelectedIds.includes(String(id)));
      for (const id of toRemove) {
        const querySnapshot = await getDocs(
          query(
            collection(db, 'chuyen_mon_ktv'),
            where('kyThuatVienId', '==', Number(kyThuatVien.id)),
            where('chuyenMonId', '==', Number(id))
          )
        );
        for (const docSnap of querySnapshot.docs) {
          await deleteDoc(doc(db, 'chuyen_mon_ktv', docSnap.id));
        }
      }
      // Add new selections
      const toAdd = newSelectedIds.filter(id => !selectedChuyenMon.includes(String(id)));
      for (const id of toAdd) {
        const newDoc = doc(collection(db, 'chuyen_mon_ktv'));
        await setDoc(newDoc, {
          kyThuatVienId: Number(kyThuatVien.id),
          chuyenMonId: Number(id),
          createdAt: Date.now(),
          updatedAt: Date.now()
        });
      }
      await loadKtvData();
      setDialogVisible(false);
    } catch (error) {
      console.error('Error saving expertise changes:', error);
    } finally {
      setEditLoading(false);
    }
  };

  if (loading) {
    return (
      <AppLayout showBottomBar={true}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#2a4d8f" />
        </View>
      </AppLayout>
    );
  }

  return (
    <AppLayout showBottomBar={true}>
      <ScrollView style={{ flex: 1, backgroundColor: '#f5f7fa' }} contentContainerStyle={{ padding: 0 }}>
        <View style={styles.profileCard}>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarCircle}>
              <MaterialCommunityIcons name="account" size={60} color="#b0b0b0" />
            </View>
            <View style={styles.statusDotWrapper}>
              <View style={[styles.statusDot, { backgroundColor: kyThuatVien?.trangThai === 'Đang Nghỉ' ? '#FFC107' : '#4CAF50' }]} />
            </View>
          </View>
          <Text style={styles.profileName}>{kyThuatVien?.hoTen || currentUser?.tenTaiKhoan || '---'}</Text>
          <Text style={styles.profileEmail}>{currentUser?.email || '---'}</Text>
        </View>
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>Họ tên: {kyThuatVien?.hoTen || currentUser?.tenTaiKhoan || '---'}</Text>
          <Text style={styles.infoText}>Kinh nghiệm: {kyThuatVien?.kinhNghiem ?? 'Chưa cập nhật'}</Text>
          <Text style={styles.infoText}>Trạng thái: {kyThuatVien?.trangThaiHienTai || '---'}</Text>
        </View>
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Chuyên môn hiện có</Text>
          {specializations.length === 0 && <Text style={styles.infoText}>Chưa có chuyên môn</Text>}
          {specializations.map((item, idx) => (
            <View key={item.id} style={styles.specializationRow}>
              <MaterialCommunityIcons name="check-circle" size={20} color="#2a4d8f" style={{ marginRight: 8 }} />
              <Text style={styles.specializationText}>{item.tenChuyenMon}</Text>
            </View>
          ))}
        </View>
        <TouchableOpacity style={styles.editButton} onPress={() => setDialogVisible(true)}>
          <MaterialCommunityIcons name="pencil" size={20} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.editButtonText}>Chỉnh sửa chuyên môn</Text>
        </TouchableOpacity>
      </ScrollView>

      <Portal>
        <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)}>
          <Dialog.Title>Chỉnh sửa chuyên môn</Dialog.Title>
          <Dialog.Content style={{ maxHeight: '66%' }}>
            <FlatList
              data={allChuyenMon}
              keyExtractor={(item) => item.id}
              style={{ flexGrow: 0 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.item, item.isChecked && { backgroundColor: '#e3f2fd' }]}
                  onPress={() => toggleChuyenMon(item.id)}
                >
                  <MaterialIcons
                    name={item.isChecked ? 'check-box' : 'check-box-outline-blank'}
                    size={24}
                    color={item.isChecked ? '#2196F3' : '#666'}
                  />
                  <Text style={styles.itemText}>{item.tenChuyenMon}</Text>
                </TouchableOpacity>
              )}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialogVisible(false)}>Hủy</Button>
            <Button onPress={saveChanges} loading={editLoading} disabled={editLoading}>
              {editLoading ? 'Đang lưu...' : 'Lưu'}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  profileCard: {
    alignItems: 'center',
    backgroundColor: '#2a4d8f',
    paddingTop: 24,
    paddingBottom: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 8,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusDotWrapper: {
    position: 'absolute',
    right: 4,
    bottom: 4,
  },
  statusDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#fff',
  },
  profileName: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 20,
    marginTop: 4,
  },
  profileEmail: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 8,
  },
  infoBox: {
    backgroundColor: '#e9eef6',
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
  },
  infoText: {
    fontSize: 15,
    color: '#222',
    marginBottom: 4,
  },
  infoTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#2a4d8f',
    marginBottom: 8,
  },
  specializationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  specializationText: {
    fontSize: 15,
    color: '#222',
  },
  editButton: {
    flexDirection: 'row',
    backgroundColor: '#2a4d8f',
    borderRadius: 8,
    marginHorizontal: 32,
    marginTop: 32,
    marginBottom: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  editButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  item: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  itemText: {
    fontSize: 16,
  },
}); 