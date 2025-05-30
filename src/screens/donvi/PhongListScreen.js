// PhongListScreen.js
import React, { useEffect, useState } from 'react';
import {
    View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, Pressable
} from 'react-native';
import usePhongListViewModel from '../../hooks/usePhongListViewModel';
import { useSession } from '../../context/SessionContext';
import { useNavigation } from '@react-navigation/native';
import useAppTheme from '../../hooks/useAppTheme';

export default function PhongListScreen() {
    const { colors } = useAppTheme();
    const { currentUser } = useSession();
    const navigation = useNavigation();
    const {
        phongList, allPhong, isLoading,
        loadPhongList, setPhongList
    } = usePhongListViewModel();

    const [currentFilterKey, setCurrentFilterKey] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [filterValues, setFilterValues] = useState([]);
    const [filters, setFilters] = useState({ day: null, tang: null });

    const FILTER_KEYS = ['Dãy', 'Tầng'];

    const mapKey = (k) => ({ 'Dãy': 'day', 'Tầng': 'tang' })[k];
    const getValueByKey = (item, key) => {
        const result = ({ 'Dãy': item.tenDay ?? '', 'Tầng': item.tenTang ?? '' })[key];
        // console.log(`🔍 getValueByKey → key: ${key}, result:`, result);
        return result;
    };

    useEffect(() => {
        if (currentUser?.donViId) {
            // console.log('🔄 Tải danh sách phòng cho đơn vị ID:', currentUser.donViId);
            loadPhongList(currentUser.donViId);
        }
    }, [currentUser]);

    useEffect(() => {
        // console.log('📡 allPhong hiện tại:', allPhong);
        // console.log('🔍 currentFilterKey:', currentFilterKey);
        if (currentFilterKey && Array.isArray(allPhong) && allPhong.length > 0) {
            const values = Array.from(new Set(allPhong.map(p => getValueByKey(p, currentFilterKey))));
            // console.log('📌 Danh sách filterValues cho', currentFilterKey, values);
            setFilterValues(values);
            setModalVisible(true);
        }
    }, [currentFilterKey]);

    const handleFilterSelect = (key, value) => {
        // console.log('✅ Đã chọn filter:', key, value);
        const realKey = mapKey(key);
        const newFilters = { ...filters, [realKey]: value };
        setFilters(newFilters);
        setModalVisible(false);
        setCurrentFilterKey(null);

        const filtered = allPhong.filter(p =>
            (!newFilters.day || p.tenDay === newFilters.day) &&
            (!newFilters.tang || p.tenTang === newFilters.tang)
        );
        // console.log('📋 Danh sách phòng sau khi lọc:', filtered);
        setPhongList(filtered);
    };

    const clearFilters = () => {
        // console.log('🧹 Xoá tất cả bộ lọc');
        setFilters({ day: null, tang: null });
        setPhongList(allPhong);
    };

    const renderItem = ({ item }) => {
        // console.log('🧩 Render phòng:', item);
        return (
            <TouchableOpacity style={[styles.card, { backgroundColor: colors.surface }]}
                onPress={() => navigation.navigate('DeviceList', { phongId: item.id })}>
                <View style={{ height: 8, backgroundColor: colors.primaryContainer }} />
                <View style={styles.cardContent}>
                    <View style={[styles.avatar, { backgroundColor: colors.primary + '22' }]}>
                        <Text style={[styles.avatarText, { color: colors.primary }]}> {item.tenPhong?.charAt(0) || '?'} </Text>
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={[styles.title, { color: colors.onSurface }]}>{item.tenPhong}</Text>
                        <Text style={[styles.sub, { color: colors.onSurfaceVariant }]}>Dãy: {item.tenDay} - Tầng: {item.tenTang}</Text>
                        <Text style={[styles.sub, { color: colors.onSurfaceVariant }]}>Số lượng thiết bị: {item.soLuongThietBi}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.screenTitle}>Danh Sách Phòng Của Đơn Vị</Text>

            <View style={styles.filterRow}>
                {FILTER_KEYS.map(key => (
                    <TouchableOpacity key={key} onPress={() => {
                        // console.log('🟦 Nhấn vào filter chip:', key);
                        setCurrentFilterKey(key);
                    }} style={styles.chip}>
                        <Text>{filters[mapKey(key)] ? `${key}: ${filters[mapKey(key)]}` : key}</Text>
                    </TouchableOpacity>
                ))}
                <TouchableOpacity onPress={clearFilters} style={styles.clearChip}>
                    <Text style={{ color: 'red' }}>X</Text>
                </TouchableOpacity>
            </View>

            {isLoading ? (
                <Text style={{ marginTop: 20 }}>🔄 Đang tải...</Text>
            ) : (
                <FlatList
                    data={phongList}
                    keyExtractor={item => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={{ paddingBottom: 16 }}
                />
            )}

            <Modal visible={modalVisible} transparent animationType="slide">
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Chọn {currentFilterKey}</Text>
                        {(filterValues || []).map(value => (
                            <Pressable key={value} style={styles.modalItem} onPress={() => handleFilterSelect(currentFilterKey, value)}>
                                <Text>{value}</Text>
                            </Pressable>
                        ))}
                        <Pressable onPress={() => setModalVisible(false)} style={styles.modalClose}>
                            <Text>Đóng</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16 },
    screenTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
    filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
    chip: { backgroundColor: '#ddd', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
    clearChip: { backgroundColor: '#fdd', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
    card: { borderRadius: 12, marginBottom: 12, overflow: 'hidden', elevation: 2 },
    cardContent: { flexDirection: 'row', alignItems: 'center', padding: 12 },
    avatar: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
    avatarText: { fontWeight: 'bold', fontSize: 18 },
    title: { fontSize: 16, fontWeight: 'bold' },
    sub: { fontSize: 14, marginTop: 2 },
    modalContainer: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.3)' },
    modalContent: { backgroundColor: 'white', padding: 20, borderTopLeftRadius: 12, borderTopRightRadius: 12 },
    modalTitle: { fontWeight: 'bold', fontSize: 16, marginBottom: 10 },
    modalItem: { paddingVertical: 10 },
    modalClose: { marginTop: 10, alignSelf: 'flex-end' },
});
