import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { collection, query, where, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import { createChuyenMon } from '../models/chuyenMonModel';

const EditExpertise = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { ktvId } = route.params;
  
  const [loading, setLoading] = useState(true);
  const [allChuyenMon, setAllChuyenMon] = useState([]);
  const [selectedChuyenMon, setSelectedChuyenMon] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Load all chuyên môn
      const chuyenMonSnapshot = await getDocs(collection(db, 'chuyen_mon'));
      const allChuyenMonData = chuyenMonSnapshot.docs.map(doc => ({
        ...doc.data(),
        id: String(doc.data().id),
        isChecked: false
      }));
      // Load selected chuyên môn
      const selectedQuery = query(
        collection(db, 'chuyen_mon_ktv'),
        where('kyThuatVienId', '==', Number(ktvId))
      );
      const selectedSnapshot = await getDocs(selectedQuery);
      const selectedIds = selectedSnapshot.docs.map(doc => String(doc.data().chuyenMonId));
      setAllChuyenMon(
        allChuyenMonData.map(item => ({
          ...item,
          isChecked: selectedIds.includes(String(item.id))
        }))
      );
      setSelectedChuyenMon(selectedIds);
    } catch (error) {
      console.error('Error loading expertise data:', error);
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
      const newSelectedIds = allChuyenMon.filter(item => item.isChecked).map(item => String(item.id));
      // Remove unselected items
      const toRemove = selectedChuyenMon.filter(id => !newSelectedIds.includes(String(id)));
      for (const id of toRemove) {
        const querySnapshot = await getDocs(
          query(
            collection(db, 'chuyen_mon_ktv'),
            where('kyThuatVienId', '==', Number(ktvId)),
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
          kyThuatVienId: Number(ktvId),
          chuyenMonId: Number(id),
          createdAt: Date.now(),
          updatedAt: Date.now()
        });
      }
      await loadData();
      navigation.goBack();
    } catch (error) {
      console.error('Error saving expertise changes:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Chỉnh sửa chuyên môn</Text>
        <TouchableOpacity onPress={saveChanges} style={styles.saveButton} disabled={loading}>
          <Text style={styles.saveButtonText}>{loading ? 'Đang lưu...' : 'Lưu'}</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={allChuyenMon}
        keyExtractor={(item) => item.id}
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    elevation: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  itemText: {
    fontSize: 16,
    marginLeft: 12,
  },
});

export default EditExpertise; 