import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Text, TouchableOpacity, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import useAppTheme from '../../hooks/useAppTheme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';
import { useSession } from '../../context/SessionContext';
import AppLayout from '../../components/layout/AppLayout';
import { Card, Title, Paragraph, Chip, Button, Searchbar, Modal, Portal, Divider, List, ActivityIndicator, Badge, Tab, useTheme } from 'react-native-paper';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { TabView, SceneMap } from 'react-native-tab-view';

const initialLayout = { width: Dimensions.get('window').width };

export default function TaskList() {
  const navigation = useNavigation();
  const { colors } = useAppTheme();
  const paperTheme = useTheme(); // Use Paper theme for tabs
  const { currentUser } = useSession();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // State for Tabs
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'all', title: 'Tất cả' },
    { key: 'new', title: 'Việc mới' },
    { key: 'doing', title: 'Đang làm' },
    { key: 'completed', title: 'Đã hoàn thành' },
    { key: 'cancelled', title: 'Bị hủy' },
  ]);

  // Map tab keys to status filter keys
  const tabKeyToFilterKey = {
      'all': 'all',
      'new': 'Việc mới',
      'doing': 'Đang làm',
      'completed': 'Đã hoàn thành',
      'cancelled': 'Bị hủy',
  };

  const [sortOption, setSortOption] = useState('Mới Nhất'); // 'Mức Độ', 'Thời Lượng', 'Mới Nhất'
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    loadTasks();
  }, [currentUser]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const phanCongKTVRef = collection(db, 'phan_cong_ktv');
      const phanCongRef = collection(db, 'phan_cong');
      const thietBiRef = collection(db, 'thiet_bi');

      const ktvTasksSnapshot = await getDocs(
        query(phanCongKTVRef, where('taiKhoanKTVId', '==', currentUser.id))
      );

      const tasksData = [];
      for (const doc of ktvTasksSnapshot.docs) {
        const phanCongKtvData = doc.data();
        
        const phanCongSnapshot = await getDocs(
          query(phanCongRef, where('id', '==', phanCongKtvData.phanCongId))
        );
        
        if (!phanCongSnapshot.empty) {
          const phanCongData = phanCongSnapshot.docs[0].data();
          
          const thietBiSnapshot = await getDocs(
            query(thietBiRef, where('id', '==', phanCongData.thietBiId))
          );
          
          if (!thietBiSnapshot.empty) {
            tasksData.push({
              id: doc.id, 
              ...phanCongKtvData, 
              phanCong: phanCongData, 
              thietBi: thietBiSnapshot.docs[0].data(),
              docId: doc.id
            });
          }
        }
      }

      setTasks(tasksData);
      console.log('Fetched tasks data:', tasksData);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadTasks();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Chờ Phản Hồi':
        return colors.warning; // Việc mới
      case 'Đang Thực Hiện':
        return colors.info; // Đang làm
      case 'Tạm Nghỉ':
         return colors.info; // Tạm nghỉ (nhóm vào Đang làm)
      case 'Đã Chấp Nhận':
        return colors.info; // Đã chấp nhận (nhóm vào Đang làm)
      case 'Hoàn Thành':
        return colors.success; // Đã hoàn thành
      case 'Bị Hủy':
        return colors.error; // Bị hủy
      case 'Đã Từ Chối':
         return colors.error; // Đã từ chối (nhóm vào Bị hủy)
      default:
        return colors.onSurfaceVariant;
    }
  };

  // Map display status to actual status values or groups
  const statusFilterMap = {
    'all': ['Chờ Phản Hồi', 'Đang Thực Hiện', 'Tạm Nghỉ', 'Đã Chấp Nhận', 'Hoàn Thành', 'Bị Hủy', 'Đã Từ Chối'], // All relevant statuses
    'Việc mới': ['Chờ Phản Hồi'],
    'Đang làm': ['Đang Thực Hiện', 'Tạm Nghỉ', 'Đã Chấp Nhận'],
    'Đã hoàn thành': ['Hoàn Thành'],
    'Bị hủy': ['Bị Hủy', 'Đã Từ Chối'],
  };

  const filterTasksByTab = (tabKey) => {
      const filterKey = tabKeyToFilterKey[tabKey];
      const targetStatuses = statusFilterMap[filterKey];
      
      return tasks.filter(task => {
          const matchesSearch = searchQuery === '' || 
                               (task.thietBi.tenThietBi && task.thietBi.tenThietBi.toLowerCase().includes(searchQuery.toLowerCase())) ||
                               (task.phanCong.moTa && task.phanCong.moTa.toLowerCase().includes(searchQuery.toLowerCase())) ||
                               (task.moTaCongViec && task.moTaCongViec.toLowerCase().includes(searchQuery.toLowerCase()));
                               
          const matchesStatus = targetStatuses.includes(task.trangThai);
          return matchesSearch && matchesStatus;
      }).sort((a, b) => {
          switch (sortOption) {
              case 'Mức Độ':
                  return (b.phanCong.mucDoUuTien || 0) - (a.phanCong.mucDoUuTien || 0);
              case 'Thời Lượng':
                  return (a.thoiGianDuKien || 0) - (b.thoiGianDuKien || 0);
              case 'Mới Nhất':
                  return (b.phanCong.thoiGianTaoPhanCong || 0) - (a.phanCong.thoiGianTaoPhanCong || 0);
              default:
                  return 0; // Default sort (e.g., by original order)
          }
      });
  };

  const renderTaskCard = (task) => {
    const getTaskTypeIcon = (loai) => {
      switch (loai) {
        case 'Sửa Chữa':
          return 'wrench';
        case 'Bảo Dưỡng':
          return 'tools'; 
        case 'Kiểm Tra': 
          return 'magnify';
         case 'Tháo Dỡ':
            return 'package-variant';
        default:
          return 'clipboard-list'; 
      }
    };

    const displayStatus = (status) => {
      switch (status) {
        case 'Chờ Phản Hồi': return 'Việc mới';
        case 'Đang Thực Hiện': return 'Đang làm';
        case 'Hoàn Thành': return 'Đã hoàn thành';
        case 'Bị Hủy': return 'Bị hủy'; 
        case 'Tạm Nghỉ': return 'Tạm nghỉ';
        case 'Đã Chấp Nhận': return 'Đã chấp nhận';
        case 'Đã Từ Chối': return 'Đã từ chối';
        case 'Chưa Bắt Đầu': return 'Chưa bắt đầu';
        default: return status;
      }
    };

    const statusColor = getStatusColor(task.trangThai);
    const maxPriorityLevel = 3;
    // Ensure priority is treated as a number, default to 0 if null/undefined
    const priority = task.phanCong.mucDoUuTien != null ? Number(task.phanCong.mucDoUuTien) : 0;
    const priorityBarWidth = (priority / maxPriorityLevel) * 100;

    console.log('Task ID:', task.id, 'Priority:', priority, 'Priority Bar Width:', priorityBarWidth);

    let remainingTimeFormatted = 'N/A';
    let isOverdue = false;

    const dangLamStatuses = statusFilterMap['Đang làm'];

    if (dangLamStatuses.includes(task.trangThai) && task.thoiGianBatDau && task.thoiGianDuKien !== null && task.thoiGianDuKien !== undefined) {
      const startTimeMillis = task.thoiGianBatDau.seconds ? task.thoiGianBatDau.seconds * 1000 : task.thoiGianBatDau;
      const plannedDurationMillis = task.thoiGianDuKien * 60 * 1000;
      const dueTimeMillis = startTimeMillis + plannedDurationMillis;
      const nowMillis = Date.now();

      if (nowMillis > dueTimeMillis) {
        isOverdue = true;
      } else {
        const remainingMillis = dueTimeMillis - nowMillis;
        const remainingMinutes = Math.ceil(remainingMillis / (60 * 1000));
        remainingTimeFormatted = `Còn lại: ${formatDuration(remainingMinutes)}`;
      }
    } else if (task.thoiGianDuKien !== null && task.thoiGianDuKien !== undefined) {
      remainingTimeFormatted = `Hạn: ${formatDuration(task.thoiGianDuKien)}`;
      isOverdue = false; 
    }

    const handleCardPress = () => {
      setSelectedTask(task);
      setModalVisible(true);
    };

     const canAccessWorkSession = ['Đã Chấp Nhận', 'Đang Thực Hiện', 'Tạm Nghỉ'].includes(task.trangThai);

    return (
      <Card
        key={task.id}
        style={[styles.taskCard, { backgroundColor: colors.surface, borderColor: colors.outline, borderWidth: 1, elevation: 4 }]} 
        onPress={() => {
          setSelectedTask(task);
          setModalVisible(true);
        }}
      >
        <Card.Content style={styles.cardContent}>
          {/* Row 1: Task Type and Status Chip */}
          <View style={styles.rowBetween}>
            <View style={styles.taskTypeContainer}>
              <MaterialCommunityIcons name={getTaskTypeIcon(task.phanCong.loaiPhanCong)} size={20} color={colors.primary} />
              <Text style={[styles.taskType, { color: colors.primary, fontWeight: 'bold' }]}>
                {task.phanCong.loaiPhanCong}
              </Text>
            </View>
            <View style={[styles.statusChip, { 
              backgroundColor: statusColor, 
              height: 28, 
              borderRadius: 14, 
              justifyContent: 'center',
              paddingHorizontal: 8,
              paddingVertical: 4,
            }]}>
              <Text style={{ color: colors.onPrimary, fontSize: 12, fontWeight: 'bold' }}>
                {displayStatus(task.trangThai)}
              </Text>
            </View>
          </View>

          {/* Row 2: Device Name */}
          <Text style={[styles.deviceName, { color: colors.onSurface }]}>
            {task.thietBi.tenThietBi}
          </Text>

          {/* Row 3: Priority */}
          {/* Render priority section if priority is greater than 0 */}
          {priority > 0 && ( 
            <View style={styles.priorityContainer}>
              <View style={[styles.priorityIconContainer, { backgroundColor: paperTheme.colors.primaryContainer }]}> 
                <MaterialCommunityIcons name="fire" size={16} color={paperTheme.colors.onPrimaryContainer} /> 
              </View>
              <View style={[styles.priorityBarBackground, { backgroundColor: colors.outline + '60'}]}> 
                <View style={[styles.priorityBarFill, { width: priorityBarWidth + '%', backgroundColor: 'red', height: 8 }]} /> 
              </View>
              <Text style={[styles.priorityLevel, { color: colors.onSurfaceVariant }]}>
                Lv {priority}
              </Text>
            </View>
          )}

          {/* Row 4: Creation Time and Due/Overdue Indicator */}
          <View style={styles.rowBetween}>
            <View style={styles.creationTimeContainer}>
              <MaterialCommunityIcons name="clock-outline" size={16} color={colors.onSurfaceVariant} /> 
              <Text style={[styles.creationTime, { color: colors.onSurfaceVariant }]}>
                Tạo: {formatTimestamp(task.phanCong.thoiGianTaoPhanCong)}
              </Text>
            </View>
            {isOverdue ? (
              <View style={[styles.overdueContainer, { backgroundColor: colors.error + '20'}]}> 
                <MaterialCommunityIcons name="alert-circle-outline" size={16} color={colors.error} /> 
                <Text style={[styles.overdueText, { color: colors.error}]}>Đã trễ</Text> 
              </View>
            ) : remainingTimeFormatted !== 'N/A' ? (
              <View style={styles.dueDateContainer}> 
                <MaterialCommunityIcons name="timer-outline" size={16} color={colors.primary} /> 
                <Text style={[styles.dueDateText, { color: colors.primary, fontWeight: 'bold' }]}>
                  {remainingTimeFormatted}
                </Text> 
              </View>
            ) : null}
          </View>
        </Card.Content>
      </Card>
    );
  };

  const formatTimestamp = (timestamp) => {
      if (!timestamp) return 'N/A';
      // Firestore timestamps can be seconds or milliseconds
      const date = new Date(timestamp.seconds ? timestamp.seconds * 1000 : timestamp);
      if (isNaN(date.getTime())) return 'N/A';
      
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      // Format as dd/MM/yyyy HH:mm
      return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

    const formatDuration = (minutes) => {
      if (minutes === null || minutes === undefined) return 'N/A';
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      if (hours > 0 && remainingMinutes > 0) {
        return `${hours}h ${remainingMinutes}p`;
      } else if (hours > 0) {
         return `${hours}h`;
      } else if (remainingMinutes > 0){
        return `${remainingMinutes}p`;
      } else if (minutes === 0) { // Explicitly handle 0 minutes
        return '0p';
      } else { // Handle negative or other unexpected values
        return 'N/A';
      }
    };

  const TaskListContent = ({ tasks, renderTaskCard, refreshing, onRefresh, loading, colors }) => (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      contentContainerStyle={styles.scrollViewContent}
    >
      {tasks.length === 0 && !loading ? (
        <View style={styles.emptyListContainer}>
          <MaterialCommunityIcons name="clipboard-outline" size={48} color={colors.onSurfaceVariant} />
          <Text style={[styles.emptyListText, { color: colors.onSurfaceVariant }]}>
            Không có công việc nào trong mục này.
          </Text>
        </View>
      ) : (
        tasks.map(renderTaskCard)
      )}
    </ScrollView>
  );

  // Define scenes for TabView
  const renderScene = ({ route }) => {
    const renderContent = () => {
      switch (route.key) {
        case 'all':
          return (
            <TaskListContent 
              tasks={filterTasksByTab('all')} 
              renderTaskCard={renderTaskCard} 
              refreshing={refreshing} 
              onRefresh={onRefresh} 
              loading={loading} 
              colors={colors} 
            />
          );
        case 'new':
          return (
            <TaskListContent 
              tasks={filterTasksByTab('new')} 
              renderTaskCard={renderTaskCard} 
              refreshing={refreshing} 
              onRefresh={onRefresh} 
              loading={loading} 
              colors={colors} 
            />
          );
        case 'doing':
          return (
            <TaskListContent 
              tasks={filterTasksByTab('doing')} 
              renderTaskCard={renderTaskCard} 
              refreshing={refreshing} 
              onRefresh={onRefresh} 
              loading={loading} 
              colors={colors} 
            />
          );
        case 'completed':
          return (
            <TaskListContent 
              tasks={filterTasksByTab('completed')} 
              renderTaskCard={renderTaskCard} 
              refreshing={refreshing} 
              onRefresh={onRefresh} 
              loading={loading} 
              colors={colors} 
            />
          );
        case 'cancelled':
          return (
            <TaskListContent 
              tasks={filterTasksByTab('cancelled')} 
              renderTaskCard={renderTaskCard} 
              refreshing={refreshing} 
              onRefresh={onRefresh} 
              loading={loading} 
              colors={colors} 
            />
          );
        default:
          return null;
      }
    };

    return (
      <View style={{ flex: 1 }}>
        {renderContent()}
      </View>
    );
  };

  return (
    <AppLayout showBottomBar={true}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Filter container with Searchbar and Sort Chips */}
        <View style={styles.filterContainer}> 
          {/* Search Bar */}
          <Searchbar
            placeholder="Tìm kiếm công việc..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={[styles.searchBar, { backgroundColor: colors.surface, elevation: 2 }]} 
            iconColor={colors.primary}
            inputStyle={{ color: colors.onSurface }}
          />
          
          {/* Status Filter Tabs (Custom TabBar) */}
          <View style={styles.tabBarContainer}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              contentContainerStyle={styles.statusFilterContent}
              style={{
                flexGrow: 0,
                flexShrink: 0,
              }}
            >
              {routes.map((route, i) => {
                const tasksInTab = filterTasksByTab(route.key);
                return (
                  <TouchableOpacity
                    key={route.key}
                    style={[
                      styles.tabItem,
                      { 
                        borderBottomColor: index === i ? paperTheme.colors.primary : 'transparent',
                        backgroundColor: index === i ? colors.primaryContainer : 'transparent'
                      },
                    ]}
                    onPress={() => setIndex(i)}
                  >
                    <Text style={[
                      styles.tabText,
                      { 
                        color: index === i ? paperTheme.colors.primary : colors.onSurfaceVariant,
                        fontWeight: index === i ? 'bold' : 'normal'
                      }
                    ]}>
                      {route.title}
                    </Text>
                    {tasksInTab.length > 0 && (
                      <View style={[
                        styles.badge,
                        { backgroundColor: index === i ? paperTheme.colors.primary : colors.error }
                      ]}>
                        <Text style={{ color: 'white', fontSize: 12 }}>{tasksInTab.length}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <Divider style={[styles.divider, { backgroundColor: colors.outline }]} />
          </View>

          {/* Sort Filter Chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sortFilter}>
            {['Mức Độ', 'Thời Lượng', 'Mới Nhất'].map(sortKey => (
              <TouchableOpacity
                key={sortKey}
                onPress={() => setSortOption(sortKey)}
                style={[styles.filterChip, { 
                  backgroundColor: sortOption === sortKey ? colors.primary : colors.surface,
                  borderWidth: 1,
                  borderColor: sortOption === sortKey ? colors.primary : colors.outline,
                  height: 36,
                  justifyContent: 'center',
                  paddingHorizontal: 12,
                  borderRadius: 18,
                  marginRight: 8,
                }]}
              >
                <Text style={{ 
                  color: sortOption === sortKey ? colors.onPrimary : colors.onSurface,
                  fontWeight: sortOption === sortKey ? 'bold' : 'normal'
                }}>
                  {sortKey}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Task List Content */}
        <View style={styles.tabViewContainer}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.loadingText, { color: colors.onSurfaceVariant }]}>
                Đang tải công việc...
              </Text>
            </View>
          ) : (
            <TabView
              navigationState={{ index, routes }}
              renderScene={renderScene}
              onIndexChange={setIndex}
              initialLayout={initialLayout}
              renderTabBar={() => null}
              style={styles.tabViewContent}
            />
          )}
        </View>
      </View>

      {/* Modal for Task Actions */}
      <Portal>
        <Modal 
          visible={modalVisible} 
          onDismiss={() => setModalVisible(false)} 
          contentContainerStyle={[styles.modalContainer, { backgroundColor: colors.surface }]}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            {selectedTask && (
              <>
                <List.Item
                  title={<Text style={{ color: colors.onSurface }}>Xem chi tiết</Text>}
                  left={props => <List.Icon {...props} icon="information-outline" color={colors.primary} />}
                  onPress={() => {
                    setModalVisible(false);
                    navigation.navigate('TaskDetail', { task: selectedTask, taskDocId: selectedTask.docId });
                  }}
                />
                {['Đã Chấp Nhận', 'Đang Thực Hiện', 'Tạm Nghỉ'].includes(selectedTask.trangThai) && (
                  <List.Item
                    title={<Text style={{ color: colors.onSurface }}>Vào phiên làm việc</Text>}
                    left={props => <List.Icon {...props} icon="play-circle-outline" color={colors.primary} />}
                    onPress={() => {
                      setModalVisible(false);
                      navigation.navigate('KtvLamViec', { task: selectedTask, phanCongKtvId: selectedTask.id });
                    }}
                  />
                )}
              </>
            )}
          </View>
        </Modal>
      </Portal>
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filterContainer: {
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#ffffff',
    elevation: 4,
    marginBottom: 8,
  },
  searchBar: {
    marginBottom: 16,
    borderRadius: 8,
  },
  tabBarContainer: {
    marginBottom: 12,
    width: '100%',
  },
  statusFilter: {
    flexDirection: 'row',
  },
  sortFilter: {
    flexDirection: 'row',
  },
  filterChip: {
    marginRight: 8,
    borderRadius: 18,
    paddingHorizontal: 12,
    height: 36,
    justifyContent: 'center',
  },
  scrollViewContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    flexGrow: 1,
  },
  taskCard: {
    marginTop: 8,
    marginBottom: 8,
    borderRadius: 12,
    marginHorizontal: 0,
    elevation: 4,
    borderColor: '#e0e0e0',
    borderWidth: 1,
  },
  cardContent: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 8,
  },
  taskTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskType: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusChip: {
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 4,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  deviceName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 4,
    marginBottom: 12,
  },
  priorityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  priorityIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  priorityBarBackground: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 8,
    overflow: 'hidden',
    elevation: 1,
    justifyContent: 'center',
  },
  priorityBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  priorityLevel: {
    fontSize: 14,
    marginLeft: 4,
  },
  creationTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  creationTime: {
    fontSize: 12,
    marginLeft: 4,
  },
  overdueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  overdueText: {
    fontSize: 12,
    marginLeft: 4,
    fontWeight: 'bold',
  },
  dueDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dueDateText: {
    fontSize: 12,
    marginLeft: 4,
  },
  modalContainer: {
    padding: 0,
    margin: 20,
    borderRadius: 8,
  },
  modalContent: {
    padding: 0,
  },
  tabBar: {
    backgroundColor: 'white',
  },
  tabItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  tabText: {
    fontSize: 14,
  },
  badge: {
    marginLeft: 6,
    height: 20,
    minWidth: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyListText: {
    marginTop: 8,
    fontSize: 16,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 16,
  },
  divider: {
    height: 1,
    marginVertical: 0,
  },
  tabViewContent: {
    flex: 1,
  },
  tabViewContainer: {
    flex: 1,
  },
  statusFilterContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'nowrap',
  },
});