import React, { useState, useEffect } from 'react';
import {
    View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl, Modal, Pressable
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import useAdminRequestViewModel from '../../hooks/useAdminRequestViewModel';
import useAppTheme from '../../hooks/useAppTheme';
import { TRANG_THAI_YEU_CAU } from '../../constants/trangThaiYeuCau';
import { ScrollView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';

function FilterSection({ filters, onPressTrangThai, onPressDonVi, onClear, colors, donViList }) {
    return (
        <View style={{ backgroundColor: colors.surfaceVariant, paddingVertical: 8 }}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
            >
                {/* Chip trạng thái */}
                <TouchableOpacity
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingVertical: 6,
                        paddingHorizontal: 12,
                        borderWidth: 1,
                        borderRadius: 20,
                        borderColor: colors.outline,
                        backgroundColor: filters.trangThai ? colors.primaryContainer : colors.surface,
                    }}
                    onPress={onPressTrangThai}
                >
                    <Text style={{
                        color: filters.trangThai ? colors.onPrimaryContainer : colors.onSurfaceVariant,
                        fontWeight: '500',
                    }}>
                        Trạng thái{filters.trangThai ? `: ${filters.trangThai}` : ''}
                    </Text>
                    {filters.trangThai && (
                        <TouchableOpacity onPress={() => onClear('trangThai')}>
                            <Text style={{ marginLeft: 6, color: colors.onPrimaryContainer }}>✕</Text>
                        </TouchableOpacity>
                    )}
                </TouchableOpacity>

                {/* Chip đơn vị */}
                <TouchableOpacity
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingVertical: 6,
                        paddingHorizontal: 12,
                        borderWidth: 1,
                        borderRadius: 20,
                        borderColor: colors.outline,
                        backgroundColor: filters.donViId ? colors.primaryContainer : colors.surface,
                    }}
                    onPress={onPressDonVi}
                >
                    <Text style={{
                        color: filters.donViId ? colors.onPrimaryContainer : colors.onSurfaceVariant,
                        fontWeight: '500',
                    }}>
                        Đơn vị{filters.donViId ? `: ${donViList.find(d => d.id === filters.donViId)?.tenDonVi}` : ''}
                    </Text>
                    {filters.donViId && (
                        <TouchableOpacity onPress={() => onClear('donViId')}>
                            <Text style={{ marginLeft: 6, color: colors.onPrimaryContainer }}>✕</Text>
                        </TouchableOpacity>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}



export default function AdminRequestListScreen() {

    const navigation = useNavigation();
    const {
        yeuCauList = [],
        donViList = [],
        applyFilter,
        clearFilters,
        filters,
        chiTietCountMap = {},
        phanCongCountMap = {},
        isLoading,
        refresh,
    } = useAdminRequestViewModel();
    const { colors } = useAppTheme();

    const [modalVisible, setModalVisible] = useState(false);
    const [filterKey, setFilterKey] = useState(null);

    const openFilter = (key) => {
        setFilterKey(key);
        setModalVisible(true);
    };

    const handleSelect = (key, value) => {
        applyFilter(key, value);
        setModalVisible(false);
    };

    const renderItem = ({ item }) => {
        const daPhanCong = phanCongCountMap[item.id] || 0;
        const tongChiTiet = chiTietCountMap[item.id] || 0;
        const donVi = (donViList || []).find(d => d.id === item.donViId);

        return (
            <TouchableOpacity
                style={[styles.card, { backgroundColor: colors.surface }]}
                onPress={() => navigation.navigate('AdminRequestDetail', { id: item.id })}
            >
                <View
                    style={[
                        styles.dot,
                        { backgroundColor: colors.trangThai?.[item.trangThai] || colors.outline },
                    ]}
                />
                <View style={styles.cardBody}>
                    <Text style={[styles.title, { color: colors.onSurface }]}>
                        Yêu cầu từ: {donVi?.tenDonVi || 'Không rõ'}
                    </Text>
                    <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
                        {item.moTa || '(Không có mô tả)'}
                    </Text>
                    <Text style={[styles.date, { color: colors.onSurfaceVariant }]}>
                        Ngày tạo: {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '??'}
                    </Text>
                    <Text style={[styles.count, { color: colors.primary }]}>
                        Phân công: {daPhanCong}/{tongChiTiet}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    const filterOptions = filterKey === 'trangThai'
        ? Object.entries(TRANG_THAI_YEU_CAU).filter(([key]) => key !== 'NHAP') // hoặc 'DRAFT'
        : donViList.map(d => [d.id, d.tenDonVi]);


    return (
        <View style={{ flex: 1, }}>

            <FilterSection
                filters={filters}
                onPressTrangThai={() => openFilter('trangThai')}
                onPressDonVi={() => openFilter('donViId')}

                onClear={(key) => applyFilter(key, null)}
                colors={colors}
                donViList={donViList}
            />



            <FlatList
                data={yeuCauList}
                keyExtractor={item => item.id.toString()}
                renderItem={renderItem}
                refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refresh} />}
                contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
                ListEmptyComponent={
                    !isLoading && (
                        <Text style={{ textAlign: 'center', color: colors.outline }}>
                            Không có yêu cầu nào.
                        </Text>
                    )
                }
            />

            {/* BottomSheetModal */}
            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent
                onRequestClose={() => setModalVisible(false)}
            >
                <Pressable style={styles.backdrop} onPress={() => setModalVisible(false)} />
                <View style={[styles.bottomSheet, { backgroundColor: colors.background }]}>
                    <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 12 }}>
                        {filterKey === 'trangThai' ? 'Chọn trạng thái' : 'Chọn đơn vị'}
                    </Text>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        {filterOptions.map(([key, label]) => (
                            <TouchableOpacity
                                key={key}
                                style={{ paddingVertical: 12 }}
                                onPress={() => handleSelect(filterKey, key)}
                            >
                                <Text style={{ color: colors.onBackground }}>{label}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </Modal>

        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
        elevation: 2,
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginTop: 6,
        marginRight: 10,
    },
    cardBody: { flex: 1 },
    title: { fontWeight: 'bold', fontSize: 16, marginBottom: 4 },
    subtitle: { fontSize: 14, marginBottom: 2 },
    date: { fontSize: 13, marginBottom: 4 },
    count: { fontWeight: '600', fontSize: 14 },
    chip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    backdrop: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    bottomSheet: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 16,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        elevation: 10,
        maxHeight: '75%',
    },

});
