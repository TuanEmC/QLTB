import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const WorkProgress = ({ taskId }) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [progressData, setProgressData] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [sortDesc, setSortDesc] = useState(true);

  useEffect(() => {
    fetchProgressData();
  }, [taskId]);

  const fetchProgressData = async () => {
    try {
      setLoading(true);
      // TODO: Implement API call to fetch progress data
      // For now using mock data
      const mockData = [
        {
          id: 1,
          type: 'CHECK_IN',
          time: new Date().getTime(),
          images: [
            { url: 'https://example.com/image1.jpg', note: 'Check-in image' }
          ]
        },
        {
          id: 2,
          type: 'MINH_CHUNG',
          time: new Date().getTime() - 3600000,
          images: [
            { url: 'https://example.com/image2.jpg', note: 'Progress image' }
          ]
        }
      ];
      setProgressData(mockData);
    } catch (error) {
      console.error('Error fetching progress data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'CHECK_IN':
        return 'Bắt đầu làm việc';
      case 'CHECK_OUT':
        return 'Kết thúc làm việc';
      case 'TAM_NGHI':
        return 'Tạm nghỉ';
      case 'XIN_GIA_HAN':
        return 'Yêu cầu gia hạn';
      case 'MINH_CHUNG':
        return 'Minh chứng';
      default:
        return type;
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'CHECK_IN':
        return 'login';
      case 'CHECK_OUT':
        return 'logout';
      case 'TAM_NGHI':
        return 'pause';
      case 'XIN_GIA_HAN':
        return 'schedule';
      case 'MINH_CHUNG':
        return 'photo-camera';
      default:
        return 'help';
    }
  };

  const formatTime = (timestamp) => {
    return format(new Date(timestamp), 'dd/MM/yyyy HH:mm', { locale: vi });
  };

  const ProgressGroup = ({ group }) => (
    <TouchableOpacity
      style={styles.groupCard}
      onPress={() => setSelectedGroup(group)}
    >
      <View style={styles.groupHeader}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: group.images[0].url }}
            style={styles.thumbnail}
          />
          <View style={styles.imageCount}>
            <Text style={styles.imageCountText}>{group.images.length}</Text>
          </View>
        </View>
        <View style={styles.groupInfo}>
          <Text style={styles.groupType}>{getTypeLabel(group.type)}</Text>
          <Text style={styles.groupTime}>{formatTime(group.time)}</Text>
        </View>
        <Icon
          name={getTypeIcon(group.type)}
          size={24}
          color={theme.colors.primary}
          style={styles.groupIcon}
        />
      </View>
    </TouchableOpacity>
  );

  const ImageDialog = ({ group, onClose }) => (
    <View style={styles.dialogContainer}>
      <View style={styles.dialogContent}>
        <Text style={styles.dialogTitle}>{getTypeLabel(group.type)}</Text>
        <ScrollView horizontal style={styles.imageScroll}>
          {group.images.map((image, index) => (
            <View key={index} style={styles.imageCard}>
              <Image source={{ uri: image.url }} style={styles.dialogImage} />
              {image.note && (
                <Text style={styles.imageNote}>{image.note}</Text>
              )}
            </View>
          ))}
        </ScrollView>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>Đóng</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setFilterType(filterType === 'all' ? 'MINH_CHUNG' : 'all')}
        >
          <Icon name="filter-list" size={20} color={theme.colors.primary} />
          <Text style={styles.filterText}>
            {filterType === 'all' ? 'Tất cả' : getTypeLabel(filterType)}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.sortButton}
          onPress={() => setSortDesc(!sortDesc)}
        >
          <Icon name="schedule" size={20} color={theme.colors.primary} />
          <Text style={styles.sortText}>
            {sortDesc ? 'Mới nhất' : 'Cũ nhất'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.progressList}>
        {progressData.map((group) => (
          <ProgressGroup key={group.id} group={group} />
        ))}
      </ScrollView>

      {selectedGroup && (
        <ImageDialog
          group={selectedGroup}
          onClose={() => setSelectedGroup(null)}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  filterText: {
    marginLeft: 8,
    fontSize: 14,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  sortText: {
    marginLeft: 8,
    fontSize: 14,
  },
  progressList: {
    flex: 1,
    padding: 16,
  },
  groupCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  groupHeader: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
  },
  imageContainer: {
    width: 56,
    height: 56,
    borderRadius: 8,
    overflow: 'hidden',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  imageCount: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  imageCountText: {
    color: '#fff',
    fontSize: 12,
  },
  groupInfo: {
    flex: 1,
    marginLeft: 12,
  },
  groupType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  groupTime: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  groupIcon: {
    marginLeft: 12,
  },
  dialogContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialogContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    width: '90%',
    maxHeight: '80%',
  },
  dialogTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  imageScroll: {
    flexDirection: 'row',
  },
  imageCard: {
    width: 300,
    marginRight: 12,
  },
  dialogImage: {
    width: '100%',
    height: 300,
    borderRadius: 8,
  },
  imageNote: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
  closeButton: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#333',
  },
});

export default WorkProgress; 