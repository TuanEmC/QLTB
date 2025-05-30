import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import useAppTheme from '../../hooks/useAppTheme';
import { useSession } from '../../context/SessionContext';
import AppLayout from '../../components/layout/AppLayout';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const { colors } = useAppTheme();
  const { currentUser } = useSession();

  if (!currentUser) {
    return (
      <AppLayout showBottomBar={true}>
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          <Text style={[styles.errorText, { color: colors.error }]}>Bạn chưa đăng nhập.</Text>
        </View>
      </AppLayout>
    );
  }

  const renderInfoItem = (icon, label, value) => (
    <View style={styles.infoItem}>
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons name={icon} size={24} color={colors.primary} />
      </View>
      <View style={styles.infoContent}>
        <Text style={[styles.infoLabel, { color: colors.onSurfaceVariant }]}>{label}</Text>
        <Text style={[styles.infoValue, { color: colors.onSurface }]}>{value}</Text>
      </View>
    </View>
  );

  return (
    <AppLayout showBottomBar={true}>
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <View style={[styles.avatarContainer, { backgroundColor: colors.primaryContainer }]}>
            <MaterialCommunityIcons 
              name="account-circle" 
              size={80} 
              color={colors.primary} 
            />
          </View>
          <Text style={[styles.userName, { color: colors.onSurface }]}>{currentUser.hoTen}</Text>
          <Text style={[styles.userRole, { color: colors.onSurfaceVariant }]}>
            {currentUser.vaiTroId === 1 ? 'Quản trị viên' : 
             currentUser.vaiTroId === 2 ? 'Kỹ thuật viên' : 'Đơn vị'}
          </Text>
        </View>

        <View style={styles.infoSection}>
          {renderInfoItem('account', 'Tên đăng nhập', currentUser.tenTaiKhoan)}
          {renderInfoItem('email', 'Email', currentUser.email)}
          {renderInfoItem('phone', 'Số điện thoại', currentUser.soDienThoai)}
          {renderInfoItem('badge-account', 'Vai trò', 
            currentUser.vaiTroId === 1 ? 'Quản trị viên' : 
            currentUser.vaiTroId === 2 ? 'Kỹ thuật viên' : 'Đơn vị'
          )}
          {renderInfoItem('check-circle', 'Trạng thái', 
            currentUser.trangThai === 1 ? 'Hoạt động' : 'Không hoạt động'
          )}
        </View>
      </ScrollView>
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  userRole: {
    fontSize: 16,
  },
  infoSection: {
    padding: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  iconContainer: {
    width: 40,
    alignItems: 'center',
  },
  infoContent: {
    flex: 1,
    marginLeft: 16,
  },
  infoLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
});