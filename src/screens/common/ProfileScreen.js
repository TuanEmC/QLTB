import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import useAppTheme from '../../hooks/useAppTheme';
import { useSession } from '../../context/SessionContext';
import AppLayout from '../../components/layout/AppLayout';

export default function ProfileScreen() {
  const { colors } = useAppTheme();
  const { currentUser } = useSession();

  if (!currentUser) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.error }}>Bạn chưa đăng nhập.</Text>
      </View>
    );
  }

  return (
    <AppLayout showBottomBar={true}> <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.label, { color: colors.primary }]}>Hồ sơ người dùng</Text>
      <Text style={{ color: colors.onSurface }}>Tên đăng nhập: {currentUser.tenTaiKhoan}</Text>
      <Text style={{ color: colors.onSurface }}>Họ tên: {currentUser.hoTen}</Text>
      <Text style={{ color: colors.onSurface }}>Email: {currentUser.email}</Text>
      <Text style={{ color: colors.onSurface }}>Số điện thoại: {currentUser.soDienThoai}</Text>
      <Text style={{ color: colors.onSurface }}>Vai trò ID: {currentUser.vaiTroId}</Text>
      <Text style={{ color: colors.onSurface }}>Trạng thái: {currentUser.trangThai}</Text>
    </View>
    </AppLayout>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  label: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
});
