import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import useAppTheme from '../../hooks/useAppTheme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';
import { useSession } from '../../context/SessionContext';
import AppLayout from '../../components/layout/AppLayout';
import { Card, Title, Paragraph, Chip, Button } from 'react-native-paper';

const COLUMN_TITLES = {
  'Chờ Phản Hồi': 'Chờ phản hồi',
  'Đang Thực Hiện': 'Đang thực hiện',
  'Hoàn Thành': 'Hoàn thành'
};

export default function TaskBoard() {
  const navigation = useNavigation();
  const { colors } = useAppTheme();
  const { currentUser } = useSession();
  const [tasks, setTasks] = useState({
    'Chờ Phản Hồi': [],
    'Đang Thực Hiện': [],
    'Hoàn Thành': []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTasks();
  }, [currentUser]);

  const loadTasks = async () => {
    try {
      const phanCongKTVRef = collection(db, 'phan_cong_ktv');
      const phanCongRef = collection(db, 'phan_cong');
      const thietBiRef = collection(db, 'thiet_bi');

      const ktvTasks = await getDocs(
        query(phanCongKTVRef, where('taiKhoanKTVId', '==', currentUser.id))
      );

      const tasksByStatus = {
        'Chờ Phản Hồi': [],
        'Đang Thực Hiện': [],
        'Hoàn Thành': []
      };

      for (const doc of ktvTasks.docs) {
        const phanCongDoc = await getDocs(
          query(phanCongRef, where('id', '==', doc.data().phanCongId))
        );
        
        if (!phanCongDoc.empty) {
          const phanCongData = phanCongDoc.docs[0].data();
          const thietBiDoc = await getDocs(
            query(thietBiRef, where('id', '==', phanCongData.thietBiId))
          );
          
          if (!thietBiDoc.empty) {
            const task = {
              id: doc.id,
              ...doc.data(),
              phanCong: phanCongData,
              thietBi: thietBiDoc.docs[0].data()
            };
            tasksByStatus[phanCongData.trangThai].push(task);
          }
        }
      }

      setTasks(tasksByStatus);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderTaskCard = (task) => (
    <Card key={task.id} style={[styles.taskCard, { backgroundColor: colors.surface }]}>
      <Card.Content>
        <Title style={{ color: colors.onSurface }} numberOfLines={1}>
          {task.thietBi.tenThietBi}
        </Title>
        
        <Paragraph style={[styles.taskDescription, { color: colors.onSurfaceVariant }]} numberOfLines={2}>
          {task.phanCong.moTa}
        </Paragraph>

        <View style={styles.taskFooter}>
          <View style={styles.taskInfo}>
            <MaterialCommunityIcons name="map-marker" size={16} color={colors.primary} />
            <Paragraph style={[styles.taskInfoText, { color: colors.onSurface }]} numberOfLines={1}>
              {task.thietBi.viTri}
            </Paragraph>
          </View>
          
          <View style={styles.taskInfo}>
            <MaterialCommunityIcons name="calendar" size={16} color={colors.primary} />
            <Paragraph style={[styles.taskInfoText, { color: colors.onSurface }]}>
              {new Date(task.phanCong.ngayTao).toLocaleDateString()}
            </Paragraph>
          </View>
        </View>

        <Button
          mode="contained"
          onPress={() => navigation.navigate('TaskDetail', { task })}
          style={[styles.detailButton, { backgroundColor: colors.primary }]}
          labelStyle={{ color: colors.onPrimary }}
        >
          Xem chi tiết
        </Button>
      </Card.Content>
    </Card>
  );

  const renderColumn = (status) => (
    <View key={status} style={styles.column}>
      <View style={[styles.columnHeader, { backgroundColor: colors.surface }]}>
        <Title style={{ color: colors.onSurface }}>{COLUMN_TITLES[status]}</Title>
        <Chip style={[styles.countChip, { backgroundColor: colors.primaryContainer }]}>
          {tasks[status].length}
        </Chip>
      </View>
      
      <ScrollView style={styles.columnContent}>
        {tasks[status].map(renderTaskCard)}
      </ScrollView>
    </View>
  );

  return (
    <AppLayout showBottomBar={true}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {Object.keys(tasks).map(renderColumn)}
        </ScrollView>
      </View>
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  column: {
    width: Dimensions.get('window').width * 0.85,
    height: '100%',
    padding: 8,
  },
  columnHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    elevation: 2,
  },
  countChip: {
    height: 24,
  },
  columnContent: {
    flex: 1,
  },
  taskCard: {
    marginBottom: 8,
    elevation: 2,
  },
  taskDescription: {
    marginTop: 8,
    marginBottom: 12,
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  taskInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  taskInfoText: {
    marginLeft: 4,
    fontSize: 12,
  },
  detailButton: {
    marginTop: 8,
  },
}); 