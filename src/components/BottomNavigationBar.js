import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import useAppTheme from '../hooks/useAppTheme';
import { Alert } from 'react-native';
import { useSession } from '../context/SessionContext';

export default function BottomNavigationBar() {
  const navigation = useNavigation();
  const route = useRoute();
  const { colors } = useAppTheme();
  const isActive = (routeName) => route.name === routeName;
    
  const { currentUser } = useSession();

  const handleNavigate = (target) => {
    if (!currentUser) {
      Alert.alert(
        "Chưa đăng nhập",
        "Bạn cần đăng nhập để truy cập tính năng này.",
        [
          { text: "Hủy", style: "cancel" },
          { text: "Đăng nhập", onPress: () => navigation.navigate('Login') }
        ]
      );
      return;
    }
  
    if (target === 'Dashboard') {
      switch (currentUser.vaiTroId) {
        case 1:
          navigation.navigate('AdminDashboard');
          break;
        case 2:
          navigation.navigate('KtvDashboard');
          break;
        case 3:
          navigation.navigate('DonViDashboard');
          break;
        default:
          Alert.alert("Lỗi", "Không xác định được vai trò.");
      }
    } else {
      navigation.navigate(target);
    }
  };
  

  return (
    <View style={styles.wrapper}>
      {/* Bar nền */}
      <View style={[styles.container, {
        backgroundColor: colors.surface,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 8,
      }]}>
        <TouchableOpacity style={styles.item} onPress={() => handleNavigate('Dashboard')}>
          <Ionicons
            name="grid"
            size={24}
            color={isActive('Dashboard') ? colors.primary : colors.onSurfaceVariant}
          />
          <Text style={{ color: isActive('Dashboard') ? colors.primary : colors.onSurfaceVariant, fontSize: 12 }}>Dashboard</Text>
        </TouchableOpacity>

        <View style={styles.spacer} /> {/* chừa chỗ cho FAB */}

        <TouchableOpacity style={styles.item} onPress={() => handleNavigate('Profile')}>
          <Ionicons
            name="person"
            size={24}
            color={isActive('Profile') ? colors.primary : colors.onSurfaceVariant}
          />
          <Text style={{ color: isActive('Profile') ? colors.primary : colors.onSurfaceVariant, fontSize: 12 }}>Hồ sơ</Text>
        </TouchableOpacity>
      </View>

      {/* Nền dưới nút nổi */}
      <View style={[styles.fabHole, { backgroundColor: colors.surface }]} />

      {/* FAB Home */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => navigation.navigate('Home')}
      >
        <Ionicons name="home" size={30} color={colors.onPrimary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    height: 84,
    backgroundColor: 'transparent',
  },
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 64,
    paddingHorizontal: 36,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  item: {
    alignItems: 'center',
  },
  spacer: {
    width: 72, // chừa chỗ cho FAB
  },
  fab: {
    position: 'absolute',
    top: 0,
    left: '50%',
    transform: [{ translateX: -36 }],
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 6,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  fabHole: {
    position: 'absolute',
    top: 4,
    left: '50%',
    transform: [{ translateX: -40 }],
    width: 80,
    height: 80,
    borderRadius: 40,
    zIndex: 5,
  },
});
