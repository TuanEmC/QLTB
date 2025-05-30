import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppLayout from '../../components/layout/AppLayout';
import useAppTheme from '../../hooks/useAppTheme';
import { useNavigation } from '@react-navigation/native';

const options = [
    { title: 'Tổng quan yêu cầu', icon: 'reader-outline', route: 'AdminRequestList' },
    { title: 'Tổng quan thiết bị', icon: 'hardware-chip-outline', route: 'DeviceList' },
    // { title: 'Tra cứu nhanh TB', icon: 'qr-code-outline', route: 'ScanQR' },
    // { title: 'Danh sách KTV', icon: 'people-outline', route: 'DanhSachKyThuatVien' },
    // { title: 'Quản lý tài khoản', icon: 'person-circle-outline', route: 'AdminAccount' },
    // { title: 'Quản lý bài viết', icon: 'newspaper-outline', route: 'AdminBaiViet' },
];

export default function AdminDashboardScreen() {
    const { colors } = useAppTheme();
    const navigation = useNavigation();
    console.log('📍 navigation =', navigation);


    return (
        <AppLayout showBottomBar={true}>
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={[styles.title, { color: colors.primary }]}>👑 Admin Dashboard</Text>
                {options.map((opt) => (
                    <TouchableOpacity
                        key={opt.route}
                        style={[styles.card, { backgroundColor: colors.surface }]}
                        onPress={() => {
                            console.log('🟦 Nhấn vào:', opt.route);
                            navigation.navigate(opt.route);
                        }}

                    >
                        <Ionicons name={opt.icon} size={24} color={colors.primary} style={styles.icon} />
                        <Text style={[styles.optionText, { color: colors.onSurface }]}>{opt.title}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </AppLayout>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        gap: 12,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        padding: 16,
        elevation: 2,
    },
    icon: {
        marginRight: 12,
    },
    optionText: {
        fontSize: 16,
        fontWeight: '600',
    },
});