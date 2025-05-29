import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import useAppTheme from '../../hooks/useAppTheme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';
import { Card, Title, Paragraph } from 'react-native-paper';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

const screenWidth = Dimensions.get('window').width;

export default function AdminDashboard() {
  const navigation = useNavigation();
  const { colors } = useAppTheme();
  const [stats, setStats] = useState({
    totalDevices: 0,
    maintenanceNeeded: 0,
    activeRequests: 0,
    onlineTechnicians: 0,
    totalUsers: 0,
    totalArticles: 0
  });

  const [requestData, setRequestData] = useState({
    labels: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
    datasets: [{
      data: [0, 0, 0, 0, 0, 0, 0]
    }]
  });

  const [deviceData, setDeviceData] = useState({
    labels: ['Máy lạnh', 'Quạt', 'Máy chiếu', 'Máy tính', 'Khác'],
    datasets: [{
      data: [0, 0, 0, 0, 0]
    }]
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch all collections
      const [devices, requests, technicians, users, articles] = await Promise.all([
        getDocs(collection(db, 'thiet_bi')),
        getDocs(collection(db, 'yeu_cau')),
        getDocs(collection(db, 'ky_thuat_vien')),
        getDocs(collection(db, 'tai_khoan')),
        getDocs(collection(db, 'bai_viet'))
      ]);

      // Calculate statistics
      const maintenanceNeeded = devices.docs.filter(doc => 
        doc.data().trangThai === 'Chờ Bảo Trì'
      ).length;

      const onlineTechnicians = technicians.docs.filter(doc => 
        doc.data().trangThaiHienTai === 'Đang Làm Việc'
      ).length;

      setStats({
        totalDevices: devices.size,
        maintenanceNeeded,
        activeRequests: requests.size,
        onlineTechnicians,
        totalUsers: users.size,
        totalArticles: articles.size
      });

      // Process request data for chart
      const requestCounts = Array(7).fill(0);
      requests.docs.forEach(doc => {
        const date = new Date(doc.data().thoiGianTao);
        const dayOfWeek = date.getDay();
        requestCounts[dayOfWeek]++;
      });
      setRequestData({
        ...requestData,
        datasets: [{ data: requestCounts }]
      });

      // Process device data for chart
      const deviceTypes = {};
      devices.docs.forEach(doc => {
        const type = doc.data().loaiThietBiId;
        deviceTypes[type] = (deviceTypes[type] || 0) + 1;
      });
      setDeviceData({
        ...deviceData,
        datasets: [{ data: Object.values(deviceTypes) }]
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const renderQuickActions = () => (
    <View style={styles.quickActions}>
      <TouchableOpacity 
        style={[styles.actionCard, { backgroundColor: colors.surface }]}
        onPress={() => navigation.navigate('UserManagement')}
      >
        <MaterialCommunityIcons name="account-group" size={32} color={colors.primary} />
        <Text style={[styles.actionText, { color: colors.onSurface }]}>Quản lý tài khoản</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.actionCard, { backgroundColor: colors.surface }]}
        onPress={() => navigation.navigate('RequestManagement')}
      >
        <MaterialCommunityIcons name="clipboard-list" size={32} color={colors.primary} />
        <Text style={[styles.actionText, { color: colors.onSurface }]}>Quản lý yêu cầu</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.actionCard, { backgroundColor: colors.surface }]}
        onPress={() => navigation.navigate('DeviceManagement')}
      >
        <MaterialCommunityIcons name="devices" size={32} color={colors.primary} />
        <Text style={[styles.actionText, { color: colors.onSurface }]}>Quản lý thiết bị</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.actionCard, { backgroundColor: colors.surface }]}
        onPress={() => navigation.navigate('TechnicianList')}
      >
        <MaterialCommunityIcons name="account-hard-hat" size={32} color={colors.primary} />
        <Text style={[styles.actionText, { color: colors.onSurface }]}>Danh sách KTV</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.actionCard, { backgroundColor: colors.surface }]}
        onPress={() => navigation.navigate('DeviceSearch')}
      >
        <MaterialCommunityIcons name="magnify" size={32} color={colors.primary} />
        <Text style={[styles.actionText, { color: colors.onSurface }]}>Tra cứu thiết bị</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.actionCard, { backgroundColor: colors.surface }]}
        onPress={() => navigation.navigate('NewsManagement')}
      >
        <MaterialCommunityIcons name="newspaper" size={32} color={colors.primary} />
        <Text style={[styles.actionText, { color: colors.onSurface }]}>Quản lý tin tức</Text>
      </TouchableOpacity>
    </View>
  );

  const renderCharts = () => (
    <View style={styles.chartsContainer}>
      <Card style={[styles.chartCard, { backgroundColor: colors.surface }]}>
        <Card.Content>
          <Title style={{ color: colors.onSurface }}>Yêu cầu theo ngày</Title>
          <LineChart
            data={requestData}
            width={screenWidth - 48}
            height={220}
            chartConfig={{
              backgroundColor: colors.surface,
              backgroundGradientFrom: colors.surface,
              backgroundGradientTo: colors.surface,
              decimalPlaces: 0,
              color: (opacity = 1) => colors.primary,
              style: {
                borderRadius: 16
              }
            }}
            bezier
            style={styles.chart}
          />
        </Card.Content>
      </Card>

      <Card style={[styles.chartCard, { backgroundColor: colors.surface }]}>
        <Card.Content>
          <Title style={{ color: colors.onSurface }}>Phân bố thiết bị</Title>
          <BarChart
            data={deviceData}
            width={screenWidth - 48}
            height={220}
            chartConfig={{
              backgroundColor: colors.surface,
              backgroundGradientFrom: colors.surface,
              backgroundGradientTo: colors.surface,
              decimalPlaces: 0,
              color: (opacity = 1) => colors.primary,
              style: {
                borderRadius: 16
              }
            }}
            style={styles.chart}
          />
        </Card.Content>
      </Card>
    </View>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.onSurface }]}>Bảng điều khiển</Text>
      </View>

      <View style={styles.statsGrid}>
        <Card style={[styles.statCard, { backgroundColor: colors.surface }]}>
          <Card.Content>
            <MaterialCommunityIcons name="devices" size={24} color={colors.primary} />
            <Text style={[styles.statNumber, { color: colors.onSurface }]}>{stats.totalDevices}</Text>
            <Text style={[styles.statLabel, { color: colors.onSurface }]}>Tổng thiết bị</Text>
          </Card.Content>
        </Card>

        <Card style={[styles.statCard, { backgroundColor: colors.surface }]}>
          <Card.Content>
            <MaterialCommunityIcons name="tools" size={24} color={colors.primary} />
            <Text style={[styles.statNumber, { color: colors.onSurface }]}>{stats.maintenanceNeeded}</Text>
            <Text style={[styles.statLabel, { color: colors.onSurface }]}>Cần bảo trì</Text>
          </Card.Content>
        </Card>

        <Card style={[styles.statCard, { backgroundColor: colors.surface }]}>
          <Card.Content>
            <MaterialCommunityIcons name="clipboard-list" size={24} color={colors.primary} />
            <Text style={[styles.statNumber, { color: colors.onSurface }]}>{stats.activeRequests}</Text>
            <Text style={[styles.statLabel, { color: colors.onSurface }]}>Yêu cầu đang xử lý</Text>
          </Card.Content>
        </Card>

        <Card style={[styles.statCard, { backgroundColor: colors.surface }]}>
          <Card.Content>
            <MaterialCommunityIcons name="account-group" size={24} color={colors.primary} />
            <Text style={[styles.statNumber, { color: colors.onSurface }]}>{stats.onlineTechnicians}</Text>
            <Text style={[styles.statLabel, { color: colors.onSurface }]}>KTV đang làm việc</Text>
          </Card.Content>
        </Card>
      </View>

      {renderCharts()}
      {renderQuickActions()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
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
  chartsContainer: {
    padding: 16,
    gap: 16,
  },
  chartCard: {
    marginBottom: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
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
});
