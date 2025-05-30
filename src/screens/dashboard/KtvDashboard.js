import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import useAppTheme from '../../hooks/useAppTheme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';
import { Card, Title, Paragraph, ProgressBar } from 'react-native-paper';
import { useSession } from '../../context/SessionContext';
import AppLayout from '../../components/layout/AppLayout';
import { PieChart } from 'react-native-gifted-charts';

export default function KTVDashboard() {
  const navigation = useNavigation();
  const { colors } = useAppTheme();
  const { currentUser } = useSession();
  const [stats, setStats] = useState({
    totalTasks: 0,
    pendingTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    specializations: []
  });

  // Add state for donut data and total tasks
  const [donutDataState, setDonutDataState] = useState([]);
  const [totalTasksState, setTotalTasksState] = useState(0);

  useEffect(() => {
    if (currentUser) {
      console.log('Fetching KTV data for user ID:', currentUser.id);
      fetchKTVData();
    }
    else {
      console.log('currentUser is null or undefined, not fetching data.');
    }
  }, [currentUser]);

  const fetchKTVData = async () => {
    try {
      // Fetch KTV's specializations
      const chuyenMonKTVRef = collection(db, 'chuyen_mon_ktv');
      const chuyenMonRef = collection(db, 'chuyen_mon');
      const phanCongKTVRef = collection(db, 'phan_cong_ktv');
      const phanCongRef = collection(db, 'phan_cong');

      // Get KTV's specializations
      const ktvSpecializations = await getDocs(
        query(chuyenMonKTVRef, where('kyThuatVienId', '==', currentUser.id))
      );

      const specializations = [];
      for (const doc of ktvSpecializations.docs) {
        const chuyenMonDoc = await getDocs(
          query(chuyenMonRef, where('id', '==', doc.data().chuyenMonId))
        );
        if (!chuyenMonDoc.empty) {
          specializations.push(chuyenMonDoc.docs[0].data());
        }
      }

      // Get KTV's tasks
      const ktvTasks = await getDocs(
        query(phanCongKTVRef, where('taiKhoanKTVId', '==', currentUser.id))
      );

      console.log('Firestore query for tasks returned:', ktvTasks.docs.length, 'documents.');
      const tasks = ktvTasks.docs.map(doc => doc.data());

      // Count tasks by status
      const taskCounts = tasks.reduce((counts, task) => {
        const status = task.trangThai;
        if (typeof status === 'string') {
            const normalizedStatus = status.trim().toLowerCase();
            counts[normalizedStatus] = (counts[normalizedStatus] || 0) + 1;
        }
        return counts;
      }, {});

      // Map counts to chart data structure and TASK_STATUS_LIST order
      const updatedDonutData = TASK_STATUS_LIST.map(statusInfo => {
        const normalizedLabel = statusInfo.label.trim().toLowerCase();
        return {
            value: taskCounts[normalizedLabel] || 0, // Use normalized label to look up count
            color: statusInfo.color,
        };
      });

      const totalTasksCount = tasks.length;

      setStats({
        totalTasks: totalTasksCount,
        // Update individual stats if still used elsewhere
        pendingTasks: taskCounts['Chờ Phản Hồi'] || 0,
        inProgressTasks: taskCounts['Đang Thực Hiện'] || 0,
        completedTasks: taskCounts['Hoàn Thành'] || 0,
        // Add other statuses to stats if needed
        pausedTasks: taskCounts['Tạm Nghỉ'] || 0,
        rejectedTasks: taskCounts['Đã Từ Chối'] || 0,
        acceptedTasks: taskCounts['Đã Chấp Nhận'] || 0,
        cancelledTasks: taskCounts['Bị Hủy'] || 0, // Assuming 'Bị Hủy' is a status
        specializations
      });

      // Set donut data state (assuming donutData should be state)
      setDonutDataState(updatedDonutData);
      setTotalTasksState(totalTasksCount);
      console.log('Updated stats:', { totalTasksCount, updatedDonutData });

    } catch (error) {
      console.error('Error fetching KTV data:', error);
    }
  };

  // Thêm mapping trạng thái và màu sắc
  const TASK_STATUS_LIST = [
    { key: 'completed', label: 'Hoàn Thành', color: '#4CAF50' },
    { key: 'paused', label: 'Tạm Nghỉ', color: '#FFA726' },
    { key: 'inProgress', label: 'Đang Thực Hiện', color: '#2196F3' },
    { key: 'rejected', label: 'Đã Từ Chối', color: '#F44336' },
    { key: 'accepted', label: 'Đã Chấp Nhận', color: '#1976D2' },
    { key: 'pending', label: 'Chờ Phản Hồi', color: '#FFEB3B' }, // Màu vàng nhạt
    { key: 'cancelled', label: 'Bị Hủy', color: '#9E9E9E' }, // Màu xám
  ];

  const renderSpecializations = () => (
    <Card style={[styles.card, { backgroundColor: colors.surface }]}>
      <Card.Content>
        <Title style={{ color: colors.onSurface }}>Chuyên môn</Title>
        <View style={styles.specializationsList}>
          {stats.specializations.map((spec, index) => (
            <View key={index} style={styles.specializationItem}>
              <MaterialCommunityIcons name="certificate" size={24} color={colors.primary} />
              <View style={styles.specializationInfo}>
                <Text style={[styles.specializationName, { color: colors.onSurface }]}>
                  {spec.tenChuyenMon}
                </Text>
                <Text style={[styles.specializationDesc, { color: colors.onSurfaceVariant }]}>
                  {spec.moTa}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </Card.Content>
    </Card>
  );

  const renderTaskStats = () => (
    <View style={styles.statsGrid}>
      <Card style={[styles.statCard, { backgroundColor: colors.surface }]}>
        <Card.Content>
          <MaterialCommunityIcons name="clipboard-list" size={24} color={colors.primary} />
          <Text style={[styles.statNumber, { color: colors.onSurface }]}>{stats.totalTasks}</Text>
          <Text style={[styles.statLabel, { color: colors.onSurface }]}>Tổng công việc</Text>
        </Card.Content>
      </Card>

      <Card style={[styles.statCard, { backgroundColor: colors.surface }]}>
        <Card.Content>
          <MaterialCommunityIcons name="clock-outline" size={24} color={colors.primary} />
          <Text style={[styles.statNumber, { color: colors.onSurface }]}>{stats.pendingTasks}</Text>
          <Text style={[styles.statLabel, { color: colors.onSurface }]}>Chờ phản hồi</Text>
        </Card.Content>
      </Card>

      <Card style={[styles.statCard, { backgroundColor: colors.surface }]}>
        <Card.Content>
          <MaterialCommunityIcons name="progress-clock" size={24} color={colors.primary} />
          <Text style={[styles.statNumber, { color: colors.onSurface }]}>{stats.inProgressTasks}</Text>
          <Text style={[styles.statLabel, { color: colors.onSurface }]}>Đang thực hiện</Text>
        </Card.Content>
      </Card>

      <Card style={[styles.statCard, { backgroundColor: colors.surface }]}>
        <Card.Content>
          <MaterialCommunityIcons name="check-circle" size={24} color={colors.primary} />
          <Text style={[styles.statNumber, { color: colors.onSurface }]}>{stats.completedTasks}</Text>
          <Text style={[styles.statLabel, { color: colors.onSurface }]}>Đã hoàn thành</Text>
        </Card.Content>
      </Card>
    </View>
  );

  const renderQuickActions = () => (
    <View style={styles.quickActions}>
      <TouchableOpacity 
        style={[styles.actionCard, { backgroundColor: colors.surface }]}
        onPress={() => navigation.navigate('TaskList')}
      >
        <MaterialCommunityIcons name="clipboard-list" size={32} color={colors.primary} />
        <Text style={[styles.actionText, { color: colors.onSurface }]}>Danh sách công việc</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.actionCard, { backgroundColor: colors.surface }]}
        onPress={() => navigation.navigate('TaskBoard')}
      >
        <MaterialCommunityIcons name="view-dashboard" size={32} color={colors.primary} />
        <Text style={[styles.actionText, { color: colors.onSurface }]}>Bảng công việc</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.actionCard, { backgroundColor: colors.surface }]}
        onPress={() => { console.log('Go to Specializations'); navigation.navigate('Specializations'); }}
      >
        <MaterialCommunityIcons name="certificate" size={32} color={colors.primary} />
        <Text style={[styles.actionText, { color: colors.onSurface }]}>Chuyên môn</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <AppLayout showBottomBar={true}>
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.dashboardCard}>
          <Text style={styles.dashboardTitle}>KTV Dashboard</Text>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>Tình hình công việc</Text>
          </View>
          <View style={styles.donutChartWrapper}>
            <PieChart
              data={donutDataState}
              donut
              showText={false}
              innerRadius={60}
              radius={80}
              strokeWidth={0}
              centerLabelComponent={() => (
                <View style={styles.donutCenterContainer}>
                  <Text style={styles.donutCenterText}>{totalTasksState}</Text>
                </View>
              )}
            />
          </View>
          <View style={styles.totalTasksBelowChart}>
            <Text style={styles.totalTasksLabel}>Tổng số công việc:</Text>
            <Text style={styles.totalTasksValue}>{totalTasksState}</Text>
          </View>
          <View style={styles.statusListWrapper}>
            {TASK_STATUS_LIST.map((item, idx) => (
              <View key={item.key} style={styles.statusRow}>
                <View style={[styles.statusDot, { backgroundColor: item.color }]} />
                <Text style={styles.statusLabel}>{item.label}</Text>
                <View style={styles.statusLine} />
                <Text style={styles.statusCount}>
                   {(donutDataState.find(dataPoint => TASK_STATUS_LIST[idx].color === dataPoint.color)?.value || 0)}
                </Text>
              </View>
            ))}
          </View>
          <TouchableOpacity style={styles.detailButton} onPress={() => navigation.navigate('TaskList')}>
            <Text style={styles.detailButtonText}>Xem chi tiết</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.quickActionSection}>
          <TouchableOpacity onPress={() => { console.log('Go to Specializations'); navigation.navigate('Specializations'); }} style={{backgroundColor: '#f5f7fa', padding: 20, margin: 12, borderRadius: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center'}}>
            <MaterialCommunityIcons name="lightbulb-on-outline" size={24} color={colors.primary} style={{ marginRight: 12 }} />
            <Text style={{color: '#2a4d8f', fontWeight: 'bold', fontSize: 18}}>Chuyên Môn</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionCard}>
            <MaterialCommunityIcons name="file-search-outline" size={24} color={colors.primary} />
            <Text style={styles.quickActionText}>Tra Cứu Nhanh TB</Text>
            <MaterialCommunityIcons name="magnify" size={20} color={colors.primary} style={{ position: 'absolute', right: 12, top: 16 }} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  dashboardCard: {
    margin: 12,
    borderRadius: 16,
    backgroundColor: '#fff',
    elevation: 3,
    padding: 0,
    overflow: 'hidden',
  },
  dashboardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2a4d8f',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 0,
  },
  sectionHeader: {
    backgroundColor: '#2a4d8f',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingVertical: 8,
    alignItems: 'center',
    marginBottom: 0,
  },
  sectionHeaderText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  donutChartWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  donutCenterContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  donutCenterText: {
    position: 'absolute',
    top: 70,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2a4d8f',
  },
  statusListWrapper: {
    marginTop: 8,
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusLabel: {
    fontSize: 15,
    minWidth: 110,
    color: '#222',
  },
  statusLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#bbb',
    marginHorizontal: 8,
  },
  statusCount: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#2a4d8f',
  },
  detailButton: {
    backgroundColor: '#2a4d8f',
    marginHorizontal: 32,
    marginVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    paddingVertical: 10,
  },
  detailButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  quickActionSection: {
    marginTop: 8,
    paddingHorizontal: 8,
  },
  quickActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f7fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    position: 'relative',
  },
  quickActionText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
    color: '#2a4d8f',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
    gap: 8,
  },
  statCard: {
    width: '47%',
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  statLabel: {
    fontSize: 14,
  },
  card: {
    margin: 16,
    elevation: 2,
  },
  specializationsList: {
    marginTop: 8,
  },
  specializationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  specializationInfo: {
    marginLeft: 12,
    flex: 1,
  },
  specializationName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  specializationDesc: {
    fontSize: 14,
    marginTop: 4,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
    gap: 8,
  },
  actionCard: {
    width: '47%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 8,
    elevation: 2,
  },
  actionText: {
    marginTop: 8,
    fontSize: 14,
    textAlign: 'center',
  },
  totalTasksBelowChart: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 12,
  },
  totalTasksLabel: {
    fontSize: 18,
    color: '#2a4d8f',
    marginRight: 8,
  },
  totalTasksValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2a4d8f',
  },
});
