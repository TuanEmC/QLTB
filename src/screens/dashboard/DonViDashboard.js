import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import AppLayout from '../../components/layout/AppLayout';
import { Ionicons } from '@expo/vector-icons';
import useAppTheme from '../../hooks/useAppTheme';
import { useNavigation } from '@react-navigation/native';

const options = [
    { title: 'Danh sách phòng', icon: 'home-outline', route: 'QLDVPhong' },
    { title: 'Danh sách thiết bị', icon: 'settings-outline', route: 'DeviceList' },
    { title: 'Tạo yêu cầu mới', icon: 'add-circle-outline', route: 'NewRequest' },
    { title: 'Danh sách yêu cầu', icon: 'list-outline', route: 'QLDVDanhSachYeuCau' },
];

export default function DonViDashboard() {
    const { colors } = useAppTheme();
    const navigation = useNavigation();

    return (
        <AppLayout showBottomBar={true}>
            <View style={styles.container}>
                <Text style={[styles.title, { color: colors.primary }]}>🏢 Dashboard Quản lý đơn vị</Text>
                {options.map((opt) => (
                    <TouchableOpacity
                        key={opt.route}
                        style={[styles.card, { backgroundColor: colors.surface }]}
                        onPress={() => navigation.navigate(opt.route)}
                    >
                        <Ionicons name={opt.icon} size={24} color={colors.primary} style={styles.icon} />
                        <Text style={[styles.optionText, { color: colors.onSurface }]}>{opt.title}</Text>
                    </TouchableOpacity>
                ))}
            </View>
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
