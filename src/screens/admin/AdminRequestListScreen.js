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
import { getTrangThaiYeuCauColor } from '../../constants/trangThaiYeuCau';
import { applySortOrder } from '../../hooks/useAdminRequestViewModel';

function FilterSection({ filters, onPressTrangThai, onPressDonVi, onPressSort, sortOrder, onClear, colors, donViList }) {
    return (
        <View style={{ backgroundColor: colors.surfaceVariant }}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                    flexDirection: 'row',
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    gap: 10,
                }}
            >

                {/* Nút sắp xếp */}
                <TouchableOpacity
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingVertical: 8,
                        paddingHorizontal: 14,
                        borderRadius: 12,
                        borderWidth: 1.5,
                        borderColor: colors.tertiary,
                        backgroundColor: colors.tertiaryContainer,
                        elevation: 3,
                    }}
                    onPress={onPressSort}
                >
                    <Ionicons name="swap-vertical-outline" size={16} color={colors.onTertiaryContainer} />
                    <Text style={{
                        color: colors.onTertiaryContainer,
                        fontWeight: '600',
                        marginLeft: 6,
                    }}>
                        {sortOrder === 'desc' ? 'Mới nhất' : 'Cũ nhất'}
                    </Text>
                </TouchableOpacity>



                {/* Nút lọc trạng thái */}
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
                        color: filters.trangThai ? colors.onPrimaryContainer : colors.onSurface,
                        fontWeight: '500',
                    }}>
                        Trạng thái{filters.trangThai ? `: ${filters.trangThai}` : ''}
                    </Text>

                    {filters.trangThai && (
                        <TouchableOpacity
                            onPress={() => onClear('trangThai')}
                            style={{ marginLeft: 6 }}
                        >
                            <Ionicons name="close-circle" size={16} color={colors.onPrimaryContainer} />
                        </TouchableOpacity>
                    )}
                </TouchableOpacity>


                {/* Nút lọc đơn vị */}
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
                        color: filters.donViId ? colors.onPrimaryContainer : colors.onSurface,
                        fontWeight: '500',
                    }}>
                        Đơn vị{filters.donViId ? `: ${donViList.find(d => d.id === filters.donViId)?.tenDonVi}` : ''}
                    </Text>

                    {filters.donViId && (
                        <TouchableOpacity
                            onPress={() => onClear('donViId')}
                            style={{ marginLeft: 6 }}
                        >
                            <Ionicons name="close-circle" size={16} color={colors.onPrimaryContainer} />
                        </TouchableOpacity>
                    )}
                </TouchableOpacity>



            </ScrollView>
        </View>
    );
}



export default function AdminRequestListScreen() {
    const [showSortModal, setShowSortModal] = useState(false);
    const [sortOrder, setSortOrder] = useState('desc');

    const toggleSort = () => {
        const newOrder = sortOrder === 'desc' ? 'asc' : 'desc';
        applySortOrder(newOrder);
        setSortOrder(newOrder);
    };

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
        applySortOrder
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

    // const renderItem = ({ item }) => {
    //     const daPhanCong = phanCongCountMap[item.id] || 0;
    //     const tongChiTiet = chiTietCountMap[item.id] || 0;
    //     const donVi = (donViList || []).find(d => d.id === item.donViId);

    //     return (
    //         <TouchableOpacity
    //             style={[styles.card, { backgroundColor: colors.surface }]}
    //             onPress={() => navigation.navigate('AdminRequestDetail', { id: item.id })}
    //         >
    //             <View
    //                 style={[
    //                     styles.dot,
    //                     { backgroundColor: colors.trangThai?.[item.trangThai] || colors.outline },
    //                 ]}
    //             />
    //             <View style={styles.cardBody}>
    //                 <Text style={[styles.title, { color: colors.onSurface }]}>
    //                     Yêu cầu từ: {donVi?.tenDonVi || 'Không rõ'}
    //                 </Text>
    //                 <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
    //                     {item.moTa || '(Không có mô tả)'}
    //                 </Text>
    //                 <Text style={[styles.date, { color: colors.onSurfaceVariant }]}>
    //                     Ngày tạo: {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '??'}
    //                 </Text>
    //                 <Text style={[styles.count, { color: colors.primary }]}>
    //                     Phân công: {daPhanCong}/{tongChiTiet}
    //                 </Text>
    //             </View>
    //         </TouchableOpacity>
    //     );
    // };
    const renderItem = ({ item }) => {
        const daPhanCong = phanCongCountMap[item.id] || 0;
        const tongChiTiet = chiTietCountMap[item.id] || 0;
        const donVi = donViList.find(d => d.id === item.donViId);
        const labelTrangThai = item.trangThai || 'Không rõ';
        const colorTrangThai = getTrangThaiYeuCauColor(item.trangThai);

        return (
            <TouchableOpacity
                style={[styles.card, { backgroundColor: colors.surface }]}
                onPress={() => navigation.push('AdminRequestDetail', { yeuCauId: item.id })}
            >
                {/* Header xanh đậm */}
                <View style={[styles.cardHeader, { backgroundColor: colors.primaryContainer }]}>
                    <View style={styles.headerLeft}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 8 }}>
                            <Ionicons name="person" size={14} color={colors.onPrimaryContainer} />
                            <Text style={{ marginLeft: 4, color: colors.onPrimaryContainer, fontWeight: '500' }}>
                                {daPhanCong}/{tongChiTiet}
                            </Text>
                        </View>
                    </View>
                    {/* Chip trạng thái */}
                    <View style={[styles.statusChip, { backgroundColor: colorTrangThai }]}>
                        <Text style={{ color: '#fff', fontSize: 12, fontWeight: '600' }}>{labelTrangThai}</Text>
                    </View>
                </View>

                {/* Nội dung */}
                <View style={{ padding: 12 }}>
                    {/* Đơn vị */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                        <Ionicons name="business-outline" size={18} color={colors.onSurfaceVariant} />
                        <Text
                            style={{
                                fontSize: 16,
                                fontWeight: '700',
                                marginLeft: 8,
                                color: colors.onSurface,
                                flexShrink: 1, // Cho phép co lại nếu thiếu chỗ
                                maxWidth: '85%', // hoặc bạn có thể dùng số tuyệt đối như 250
                            }}
                            numberOfLines={1}
                            ellipsizeMode="tail"
                        >
                            {donVi?.tenDonVi || 'Không rõ'}
                        </Text>
                    </View>


                    {/* Ngày yêu cầu */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                        <Ionicons name="calendar-outline" size={16} color={colors.onSurfaceVariant} />
                        <Text
                            style={{
                                fontSize: 13,
                                marginLeft: 6,
                                color: colors.onSurfaceVariant,
                            }}
                            numberOfLines={1}
                        >
                            Ngày yêu cầu: {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '??'}
                        </Text>
                    </View>

                    {/* Mô tả */}
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name="document-text-outline" size={16} color={colors.onSurfaceVariant} />
                        <Text
                            style={{
                                fontSize: 13,
                                fontStyle: 'italic',
                                marginLeft: 6,
                                color: colors.onSurfaceVariant,
                            }}
                            numberOfLines={1}
                        >
                            {item.moTa || '(Không có mô tả)'}
                        </Text>
                    </View>
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
                onPressSort={toggleSort}
                sortOrder={sortOrder}
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
            <Modal
                visible={showSortModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowSortModal(false)}
            >
                <Pressable style={styles.backdrop} onPress={() => setShowSortModal(false)} />
                <View style={[styles.bottomSheet, { backgroundColor: colors.background }]}>
                    <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 12 }}>Sắp xếp theo</Text>
                    <TouchableOpacity
                        style={{ paddingVertical: 12 }}
                        onPress={() => {
                            applySortOrder('desc');
                            setShowSortModal(false);
                        }}
                    >
                        <Text style={{ color: colors.onBackground }}>🆕 Mới nhất trước</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={{ paddingVertical: 12 }}
                        onPress={() => {
                            applySortOrder('asc');
                            setShowSortModal(false);
                        }}
                    >
                        <Text style={{ color: colors.onBackground }}>🕒 Cũ nhất trước</Text>
                    </TouchableOpacity>
                </View>
            </Modal>

        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 12,
        marginBottom: 12,
        overflow: 'hidden',
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 8,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginHorizontal: 2,
    },
    statusChip: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    textRow: {
        fontSize: 14,
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
