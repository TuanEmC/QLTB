import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Button, Alert } from 'react-native';
import useAppTheme from '../../hooks/useAppTheme';
import { useSession } from '../../context/SessionContext';

const dummyAccounts = [
  {
    id: '1',
    tenTaiKhoan: 'admin1',
    matKhau: '123456',
    hoTen: 'Nguyễn Văn A',
    vaiTroId: 1,
    email: 'admin1@example.com',
    soDienThoai: '0909000001',
    trangThai: 'dang_hoat_dong',
  },
  {
    id: '2',
    tenTaiKhoan: 'ktv1',
    matKhau: '123456',
    hoTen: 'Kỹ Thuật Viên 1',
    vaiTroId: 2,
    email: 'ktv1@example.com',
    soDienThoai: '0909000002',
    trangThai: 'dang_hoat_dong',
  },
  {
    id: '3',
    tenTaiKhoan: 'donvi1',
    matKhau: '123456',
    hoTen: 'QL Đơn Vị 1',
    vaiTroId: 3,
    email: 'donvi1@example.com',
    soDienThoai: '0909000003',
    trangThai: 'dang_hoat_dong',
  },
];

export default function DebugLoginScreen({ navigation }) {
  const { colors } = useAppTheme();
  const { setCurrentUser } = useSession();
  const [selected, setSelected] = useState(null);

  const handleLogin = () => {
    if (!selected) return;
    setCurrentUser({ ...selected, createdAt: Date.now(), updatedAt: Date.now() });
    navigation.navigate('Home');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.primary }]}>Chọn tài khoản để đăng nhập</Text>

      <FlatList
        data={dummyAccounts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => setSelected(item)}
            style={[
              styles.card,
              {
                backgroundColor: selected?.id === item.id ? colors.primaryContainer : colors.surface,
              },
            ]}
          >
            <Text style={{ color: colors.onSurface }}>Tên: {item.tenTaiKhoan}</Text>
            <Text style={{ color: colors.onSurfaceVariant }}>Vai trò ID: {item.vaiTroId}</Text>
          </TouchableOpacity>
        )}
        style={{ flex: 1 }}
      />

      <View style={{ marginTop: 12 }}>
        <Button
          title="Đăng nhập"
          onPress={handleLogin}
          disabled={!selected}
          color={colors.primary}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 20,
    marginBottom: 16,
    fontWeight: 'bold',
    alignSelf: 'center',
  },
  card: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
});
