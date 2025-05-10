import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Button } from 'react-native';
import { getAllTaiKhoan } from '../../services/taiKhoanService';
import { useSession } from '../../context/SessionContext';
import useAppTheme from '../../hooks/useAppTheme';
import { useNavigation } from '@react-navigation/native';

export default function DebugLoginScreen() {
  const { colors } = useAppTheme();
  const navigation = useNavigation();
  const { setCurrentUser } = useSession();

  const [taiKhoanList, setTaiKhoanList] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const fetchTaiKhoan = async () => {
      const data = await getAllTaiKhoan();
      setTaiKhoanList(data);
    };
    fetchTaiKhoan();
  }, []);

  const handleLogin = () => {
    if (!selected) return;
    setCurrentUser(selected);
    navigation.replace('MainDrawer'); // hoặc navigate, tùy bạn cấu hình
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.primary }]}>Chọn tài khoản để đăng nhập</Text>

      <FlatList
        data={taiKhoanList}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.card,
              {
                backgroundColor: selected?.id === item.id
                  ? colors.primaryContainer
                  : colors.surface,
              },
            ]}
            onPress={() => setSelected(item)}
          >
            <Text style={{ color: colors.onSurface }}>Tên: {item.tenTaiKhoan}</Text>
            <Text style={{ color: colors.onSurfaceVariant }}>
              Vai trò ID: {item.vaiTroId}
            </Text>
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
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, marginBottom: 16, fontWeight: 'bold', alignSelf: 'center' },
  card: { padding: 16, borderRadius: 8, marginBottom: 12 },
});
