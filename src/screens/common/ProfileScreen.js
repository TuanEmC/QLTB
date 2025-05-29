import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Image,
} from 'react-native';
import useAppTheme from '../../hooks/useAppTheme';
import { useSession } from '../../context/SessionContext';
import AppLayout from '../../components/layout/AppLayout';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { collection, query, where, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';
import { createKyThuatVien } from '../../models/kyThuatVienModel';
import { createChuyenMon } from '../../models/chuyenMonModel';
import { Card, Title, Paragraph, Chip, Button } from 'react-native-paper';

export default function ProfileScreen() {
  const { colors } = useAppTheme();
  const { currentUser } = useSession();
  const [loading, setLoading] = useState(true);
  const [kyThuatVien, setKyThuatVien] = useState(null);
  const [chuyenMon, setChuyenMon] = useState([]);
  const [allChuyenMon, setAllChuyenMon] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (currentUser?.vaiTroId === 2) {
      loadKtvData();
    } else {
      setLoading(false);
    }
  }, [currentUser]);

  const loadKtvData = async () => {
    try {
      const ktvQuery = query(
        collection(db, 'kyThuatVien'),
        where('taiKhoanId', '==', currentUser.uid)
      );
      const ktvSnapshot = await getDocs(ktvQuery);
      
      if (!ktvSnapshot.empty) {
        const ktvData = createKyThuatVien(ktvSnapshot.docs[0]);
        setKyThuatVien(ktvData);

        const allChuyenMonSnapshot = await getDocs(collection(db, 'chuyenMon'));
        const allChuyenMonData = allChuyenMonSnapshot.docs.map(doc => ({
          ...createChuyenMon(doc),
          isChecked: false
        }));
        setAllChuyenMon(allChuyenMonData);

        const chuyenMonQuery = query(
          collection(db, 'chuyenMonKtv'),
          where('kyThuatVienId', '==', ktvData.id)
        );
        const chuyenMonSnapshot = await getDocs(chuyenMonQuery);
        const selectedIds = chuyenMonSnapshot.docs.map(doc => doc.data().chuyenMonId);
        
        setAllChuyenMon(prev => 
          prev.map(item => ({
            ...item,
            isChecked: selectedIds.includes(item.id)
          }))
        );
        setChuyenMon(allChuyenMonData.filter(item => selectedIds.includes(item.id)));
      }
    } catch (error) {
      console.error('Error loading KTV data:', error);
    } finally {
      setLoading(false);
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
      setLoading(true);
      
      // Get current selections
      const newSelectedIds = allChuyenMon
        .filter(item => item.isChecked)
        .map(item => item.id);

      // Remove unselected items
      const toRemove = chuyenMon
        .filter(item => !newSelectedIds.includes(item.id))
        .map(item => item.id);

      for (const id of toRemove) {
        const querySnapshot = await getDocs(
          query(
            collection(db, 'chuyenMonKtv'),
            where('kyThuatVienId', '==', kyThuatVien.id),
            where('chuyenMonId', '==', id)
          )
        );
        if (!querySnapshot.empty) {
          await deleteDoc(doc(db, 'chuyenMonKtv', querySnapshot.docs[0].id));
        }
      }

      // Add new selections
      const toAdd = newSelectedIds.filter(id => 
        !chuyenMon.some(item => item.id === id)
      );

      for (const id of toAdd) {
        const newDoc = doc(collection(db, 'chuyenMonKtv'));
        await setDoc(newDoc, {
          kyThuatVienId: kyThuatVien.id,
          chuyenMonId: id,
          createdAt: Date.now(),
          updatedAt: Date.now()
        });
      }

      // Update local state
      setChuyenMon(allChuyenMon.filter(item => item.isChecked));
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving expertise changes:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AppLayout showBottomBar={true}>
        <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </AppLayout>
    );
  }

  if (!currentUser) {
    return (
      <AppLayout showBottomBar={true}>
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          <Text style={[styles.errorText, { color: colors.error }]}>
            Vui lòng đăng nhập để xem thông tin
          </Text>
        </View>
      </AppLayout>
    );
  }

  return (
    <AppLayout showBottomBar={true}>
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.primary }]}>
          <View style={styles.avatarContainer}>
            <View style={[styles.avatar, { backgroundColor: colors.surface }]}>
              <MaterialCommunityIcons name="account" size={60} color={colors.primary} />
            </View>
          </View>
          <Text style={[styles.name, { color: colors.onPrimary }]}>{currentUser.tenTaiKhoan}</Text>
          <Text style={[styles.role, { color: colors.onPrimaryVariant }]}>Kỹ thuật viên</Text>
        </View>

        <Card style={[styles.infoCard, { backgroundColor: colors.surface }]}>
          <Card.Content>
            <Title style={{ color: colors.onSurface }}>Thông tin cá nhân</Title>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="email" size={24} color={colors.primary} />
              <Text style={[styles.infoText, { color: colors.onSurface }]}>{currentUser.email}</Text>
            </View>
            {kyThuatVien && (
              <>
                <View style={styles.infoRow}>
                  <MaterialCommunityIcons name="phone" size={24} color={colors.primary} />
                  <Text style={[styles.infoText, { color: colors.onSurface }]}>{kyThuatVien.soDienThoai}</Text>
                </View>
                <View style={styles.infoRow}>
                  <MaterialCommunityIcons name="map-marker" size={24} color={colors.primary} />
                  <Text style={[styles.infoText, { color: colors.onSurface }]}>{kyThuatVien.diaChi}</Text>
                </View>
              </>
            )}
          </Card.Content>
        </Card>

        {kyThuatVien && (
          <Card style={[styles.infoCard, { backgroundColor: colors.surface }]}>
            <Card.Content>
              <Title style={{ color: colors.onSurface }}>Chuyên môn</Title>
              <View style={styles.specializationsContainer}>
                {chuyenMon.map((spec, index) => (
                  <Chip
                    key={index}
                    style={[styles.chip, { backgroundColor: colors.primaryContainer }]}
                    textStyle={{ color: colors.onPrimaryContainer }}
                    icon={() => <MaterialCommunityIcons name="certificate" size={16} color={colors.onPrimaryContainer} />}
                  >
                    {spec.tenChuyenMon}
                  </Chip>
                ))}
              </View>
            </Card.Content>
          </Card>
        )}

        <Card style={[styles.infoCard, { backgroundColor: colors.surface }]}>
          <Card.Content>
            <Title style={{ color: colors.onSurface }}>Thống kê</Title>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <MaterialCommunityIcons name="clipboard-check" size={24} color={colors.primary} />
                <Text style={[styles.statNumber, { color: colors.onSurface }]}>0</Text>
                <Text style={[styles.statLabel, { color: colors.onSurfaceVariant }]}>Công việc đã hoàn thành</Text>
              </View>
              <View style={styles.statItem}>
                <MaterialCommunityIcons name="clock-outline" size={24} color={colors.primary} />
                <Text style={[styles.statNumber, { color: colors.onSurface }]}>0</Text>
                <Text style={[styles.statLabel, { color: colors.onSurfaceVariant }]}>Công việc đang thực hiện</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        <Button
          mode="contained"
          onPress={() => setIsEditing(!isEditing)}
          style={[styles.editButton, { backgroundColor: colors.primary }]}
          labelStyle={{ color: colors.onPrimary }}
        >
          {isEditing ? 'Lưu thay đổi' : 'Chỉnh sửa thông tin'}
        </Button>
      </ScrollView>
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  role: {
    fontSize: 16,
  },
  infoCard: {
    margin: 16,
    marginTop: 8,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  infoText: {
    marginLeft: 12,
    fontSize: 16,
  },
  specializationsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 8,
  },
  chip: {
    marginRight: 8,
    marginBottom: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  statLabel: {
    fontSize: 14,
    textAlign: 'center',
  },
  editButton: {
    margin: 16,
    marginTop: 8,
    paddingVertical: 8,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    margin: 16,
  },
});
