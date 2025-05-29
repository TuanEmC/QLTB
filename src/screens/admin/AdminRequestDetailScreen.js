import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, FlatList } from 'react-native';
import { useRoute } from '@react-navigation/native';
import useAdminRequestDetailViewModel from '../../hooks/useAdminRequestDetailViewModel';

export default function AdminRequestDetailScreen() {
    const route = useRoute();
    const { yeuCauId } = route.params;
    const {
        yeuCau,
        isLoading,
        daPhanCongList,
        chuaPhanCongList,
        trangThai,
        duyetYeuCau,
        tuChoiYeuCau,
        reload
    } = useAdminRequestDetailViewModel(yeuCauId);

    const [tab, setTab] = useState('chua');

    useEffect(() => {
        reload();
    }, []);

    if (isLoading || !yeuCau) {
        return (
            <View style={styles.centered}><ActivityIndicator size="large" /></View>
        );
    }

    const renderItem = ({ item }) => (
        <TouchableOpacity style={styles.itemCard}>
            <Text style={styles.tenThietBi}>{item.chiTiet.tenThietBi}</Text>
            <Text>{item.chiTiet.loaiYeuCau} - {item.chiTiet.tenLoaiThietBi}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {yeuCau.trangThai === 'CHỜ_XÁC_NHẬN' ? (
                <View style={styles.actionRow}>
                    <TouchableOpacity onPress={duyetYeuCau} style={styles.acceptButton}><Text>Duyệt</Text></TouchableOpacity>
                    <TouchableOpacity onPress={() => tuChoiYeuCau('Không hợp lệ')} style={styles.rejectButton}><Text>Từ chối</Text></TouchableOpacity>
                </View>
            ) : (
                <View style={styles.tabRow}>
                    <TouchableOpacity onPress={() => setTab('chua')}><Text style={tab === 'chua' ? styles.activeTab : styles.tab}>Chưa phân công</Text></TouchableOpacity>
                    <TouchableOpacity onPress={() => setTab('da')}><Text style={tab === 'da' ? styles.activeTab : styles.tab}>Đã phân công</Text></TouchableOpacity>
                </View>
            )}

            {yeuCau.trangThai !== 'CHỜ_XÁC_NHẬN' && (
                <FlatList
                    data={tab === 'chua' ? chuaPhanCongList : daPhanCongList}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    actionRow: { flexDirection: 'row', justifyContent: 'space-around', padding: 16 },
    acceptButton: { backgroundColor: 'green', padding: 12, borderRadius: 8 },
    rejectButton: { backgroundColor: 'red', padding: 12, borderRadius: 8 },
    tabRow: { flexDirection: 'row', justifyContent: 'center', padding: 12, gap: 20 },
    tab: { fontSize: 16, color: '#888' },
    activeTab: { fontSize: 16, fontWeight: 'bold', color: '#000' },
    itemCard: { padding: 16, borderBottomWidth: 1, borderColor: '#ddd' },
    tenThietBi: { fontWeight: 'bold', fontSize: 16 },
});
