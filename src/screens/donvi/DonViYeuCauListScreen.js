// 📁 src/screens/donvi/DonViYeuCauListScreen.js
import React, { useEffect, useState } from 'react';
import { View, FlatList, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { getYeuCauByDonVi, deleteYeuCau, deleteYeuCauWithCascade } from '../../services/yeuCauService';
import { useSession } from '../../context/SessionContext';
import { getTrangThaiYeuCauColor, TRANG_THAI_YEU_CAU, TRANG_THAI_YEU_CAU_ALL } from '../../constants/trangThaiYeuCau';
import useAppTheme from '../../hooks/useAppTheme';
import AppLayout from '../../components/layout/AppLayout';
import { formatNgayGio } from '../../utils/formatDate';
import { BottomSheetModal, BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { useRef, useMemo } from 'react';
import { BottomSheet, ListItem } from 'react-native-elements';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { ActivityIndicator } from 'react-native';




export default function DonViYeuCauListScreen() {
    const { currentUser } = useSession();
    const { colors } = useAppTheme();
    const [yeuCauList, setYeuCauList] = useState([]);
    const [trangThaiFilter, setTrangThaiFilter] = useState(null);
    const bottomSheetRef = useRef(null);
    const snapPoints = useMemo(() => ['40%'], []);
    const [isFilterVisible, setIsFilterVisible] = useState(false);
    const navigation = useNavigation();
    const [isLoading, setIsLoading] = useState(false);



    const openFilterSheet = () => {
        bottomSheetRef.current?.present();
    };



    useEffect(() => {
        if (currentUser?.donViId) {
            //console.log('🧑‍💼 currentUser:', currentUser);
            loadData();
        }
    }, [currentUser, trangThaiFilter]);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const data = await getYeuCauByDonVi(currentUser.donViId);
            setYeuCauList(trangThaiFilter ? data.filter(yc => yc.trangThai === trangThaiFilter) : data);
        } catch (e) {
            console.error('❌ Lỗi khi load yêu cầu:', e);
        } finally {
            setIsLoading(false);
        }
    };



    const handleLongPress = (item) => {
        if (item.trangThai === TRANG_THAI_YEU_CAU.NHAP) {
            Alert.alert('Xác nhận', 'Bạn có muốn xóa yêu cầu này?', [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Xóa', style: 'destructive', onPress: async () => {
                        console.log('🗑️ Đang xoá yêu cầu với id =', item.id);
                        try {
                            await deleteYeuCauWithCascade(String(item.id));
                            console.log('✅ Xoá thành công');
                            loadData();
                        } catch (e) {
                            console.error('❌ Lỗi xoá yêu cầu:', e);
                        }
                    },
                },
            ]);
        }
    };


    const renderItem = ({ item }) => (
        <TouchableOpacity
            onPress={() => navigation.navigate('NewRequest', { yeuCauId: item.id })}
            onLongPress={() => handleLongPress(item)}
            style={[styles.card, { borderLeftColor: getTrangThaiYeuCauColor(item.trangThai) }]}
        >
            <Text style={[styles.moTa, { color: colors.onSurface }]}>{item.moTa}</Text>
            <View style={styles.metaRow}>
                <Text style={{ color: colors.onSurfaceVariant }}>
                    {formatNgayGio(item.createdAt)}
                </Text>
                <View style={[styles.trangThaiBox, { backgroundColor: getTrangThaiYeuCauColor(item.trangThai) }]}>
                    <Text style={styles.trangThaiText}>{item.trangThai}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );


    return (
        <BottomSheetModalProvider>
            <AppLayout showBottomBar={false} title="Danh sách yêu cầu">
                <View style={styles.container}>
                    <TouchableOpacity
                        onPress={() => setIsFilterVisible(true)}
                        style={{
                            marginBottom: 12,
                            paddingVertical: 10,
                            paddingHorizontal: 16,
                            borderWidth: 1.5,
                            borderColor: colors.primary,
                            borderRadius: 8,
                            backgroundColor: colors.surface,
                            alignSelf: 'stretch',
                        }}
                    >
                        <Text style={{
                            color: colors.onSurfaceVariant,
                            textAlign: 'center',
                            fontSize: 14,
                            fontWeight: '500',
                        }}>
                            {trangThaiFilter ? `Trạng thái: ${trangThaiFilter}` : 'Chọn trạng thái'}
                        </Text>
                    </TouchableOpacity>



                    {isLoading ? (
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 32 }}>
                            <Text style={{ marginBottom: 12, color: colors.onSurfaceVariant }}>Đang tải danh sách...</Text>
                            <ActivityIndicator size="large" color={colors.primary} />
                        </View>
                    ) : (
                        <FlatList
                            data={yeuCauList}
                            keyExtractor={(item) => item.id}
                            renderItem={renderItem}
                            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
                        />
                    )}

                </View>
            </AppLayout>

            <BottomSheet isVisible={isFilterVisible}>
                <ListItem onPress={() => {
                    setTrangThaiFilter(null);
                    setIsFilterVisible(false);
                }}>
                    <ListItem.Content>
                        <ListItem.Title>Tất cả</ListItem.Title>
                    </ListItem.Content>
                </ListItem>

                {TRANG_THAI_YEU_CAU_ALL.map((tt) => (
                    <ListItem key={tt} onPress={() => {
                        setTrangThaiFilter(tt);
                        setIsFilterVisible(false);
                    }}>
                        <ListItem.Content>
                            <ListItem.Title>{tt}</ListItem.Title>
                        </ListItem.Content>
                    </ListItem>
                ))}
            </BottomSheet>

            <TouchableOpacity
                onPress={() => navigation.navigate('NewRequest')}
                style={{
                    position: 'absolute',// vi tri nut noi
                    bottom: 24,
                    right: 24,
                    width: 56,
                    height: 56,
                    borderRadius: 28,
                    backgroundColor: colors.primary,
                    justifyContent: 'center',
                    alignItems: 'center',
                    elevation: 6,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.25,
                    shadowRadius: 4,
                }}
            >
                <Ionicons name="add" size={28} color={colors.onPrimary} />
            </TouchableOpacity>


        </BottomSheetModalProvider>


    );


}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 8,
        paddingTop: 16,
        paddingBottom: 0,
    },

    card: {
        padding: 16,
        backgroundColor: '#fff',
        borderRadius: 8,
        borderLeftWidth: 6,
        elevation: 3, // ✅ Android shadow
        shadowColor: '#000', // ✅ iOS shadow
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },

    moTa: {
        fontSize: 16,
        fontWeight: '600',
    },
    metaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    trangThaiBox: {
        borderRadius: 16,
        paddingHorizontal: 8,
        paddingVertical: 2,
    },
    trangThaiText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '500',
    },
});
