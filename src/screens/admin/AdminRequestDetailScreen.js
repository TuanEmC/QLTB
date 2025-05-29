// import React, { useState } from 'react';
// import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from 'react-native';
// import { useRoute } from '@react-navigation/native';
// import { Ionicons } from '@expo/vector-icons';
// import useAdminRequestDetailViewModel from '../../hooks/useAdminRequestDetailViewModel';
// import useAppTheme from '../../hooks/useAppTheme';

// export default function AdminRequestDetailScreen() {
//     const route = useRoute();
//     const { colors } = useAppTheme();
//     const { yeuCauId } = route.params;
//     const {
//         yeuCau,
//         isLoading,
//         trangThai,
//         daPhanCongList,
//         chuaPhanCongList,
//         duyetYeuCau,
//         tuChoiYeuCau
//     } = useAdminRequestDetailViewModel(yeuCauId);
//     const [tab, setTab] = useState('chua');

//     const data = tab === 'chua' ? chuaPhanCongList : daPhanCongList;

//     const renderItem = ({ item }) => {
//         const {
//             tenThietBi,
//             tenLoaiThietBi,
//             soAnh,
//             soVideo,
//             anhDaiDien,
//             totalDoingTechnicians,
//             totalResponsibleTechnicians
//         } = item.chiTiet;

//         const hasKtv = totalResponsibleTechnicians > 0;
//         const isActive = totalDoingTechnicians > 0;
//         const barColor = isActive ? colors.success : colors.warning;

//         return (
//             <View style={styles.cardWrapper}>
//                 <View style={[styles.statusBar, { backgroundColor: barColor }]} />
//                 <View style={[styles.card, { backgroundColor: colors.surface }]}>
//                     <View style={styles.cardHeader}>
//                         <Text style={[styles.loaiYeuCau, { color: colors.onPrimaryContainer }]}>📋 {item.chiTiet.loaiYeuCau}</Text>
//                         {hasKtv && (
//                             <View style={styles.ktvInfo}>
//                                 <Ionicons name="people" size={14} color={colors.onPrimaryContainer} />
//                                 <Text style={{ marginLeft: 4, color: colors.onPrimaryContainer }}>{totalDoingTechnicians}/{totalResponsibleTechnicians}</Text>
//                             </View>
//                         )}
//                     </View>

//                     <View style={styles.contentRow}>
//                         <Image
//                             source={anhDaiDien ? { uri: anhDaiDien } : require('../../../assets/illustrations/placeholder.png')}
//                             style={styles.image}
//                         />
//                         <View style={styles.contentText}>
//                             <Text style={[styles.tenThietBi, { color: colors.onSurface }]} numberOfLines={1}>{tenThietBi}</Text>
//                             <Text style={{ fontSize: 13, color: colors.onSurfaceVariant }}>{tenLoaiThietBi}</Text>
//                             <Text style={{ fontSize: 12, marginTop: 4, color: colors.onSurfaceVariant }}>
//                                 📷 {soAnh}   🎥 {soVideo}
//                             </Text>
//                         </View>
//                     </View>
//                 </View>
//             </View>
//         );
//     };

//     if (isLoading) return <ActivityIndicator style={{ marginTop: 20 }} />;

//     return (
//         <View style={{ flex: 1 }}>
//             {trangThai === 'Chờ Xác Nhận' ? (
//                 <View style={styles.waitingBox}>
//                     <Text style={{ fontWeight: '600', fontSize: 16, color: colors.primary }}>🕒 Yêu cầu đang chờ xác nhận</Text>
//                 </View>
//             ) : (
//                 <View style={[styles.tabRow, { borderColor: colors.outline }]}>
//                     <TouchableOpacity
//                         style={[styles.tabItem, tab === 'chua' && styles.activeTab]}
//                         onPress={() => setTab('chua')}
//                     >
//                         <Text style={styles.tabText}>Chưa phân công ({chuaPhanCongList.length})</Text>
//                     </TouchableOpacity>
//                     <TouchableOpacity
//                         style={[styles.tabItem, tab === 'da' && styles.activeTab]}
//                         onPress={() => setTab('da')}
//                     >
//                         <Text style={styles.tabText}>Đã phân công ({daPhanCongList.length})</Text>
//                     </TouchableOpacity>
//                 </View>
//             )}

//             <FlatList
//                 data={data}
//                 keyExtractor={item => item.id}
//                 renderItem={renderItem}
//                 contentContainerStyle={{ paddingBottom: 100 }}
//             />

//             {trangThai === 'Chờ Xác Nhận' && (
//                 <View style={styles.footerButtonRow}>
//                     <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.success }]} onPress={duyetYeuCau}>
//                         <Text style={styles.actionText}>✔️ Duyệt</Text>
//                     </TouchableOpacity>
//                     <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.error }]} onPress={() => tuChoiYeuCau('Lý do từ chối...')}>
//                         <Text style={styles.actionText}>❌ Từ chối</Text>
//                     </TouchableOpacity>
//                 </View>
//             )}
//         </View>
//     );
// }

// const styles = StyleSheet.create({
//     tabRow: {
//         flexDirection: 'row',
//         justifyContent: 'center',
//         backgroundColor: '#fff',
//         paddingVertical: 8,
//         borderBottomWidth: 1,
//         elevation: 2
//     },
//     tabItem: {
//         paddingHorizontal: 16,
//         paddingVertical: 6,
//         borderBottomWidth: 2,
//         borderColor: 'transparent'
//     },
//     activeTab: {
//         borderColor: '#007bff'
//     },
//     tabText: {
//         fontWeight: 'bold',
//         fontSize: 14
//     },
//     waitingBox: {
//         alignItems: 'center',
//         paddingVertical: 12,
//         borderBottomWidth: 1,
//         backgroundColor: '#fff'
//     },
//     cardWrapper: {
//         margin: 12,
//         borderRadius: 12,
//         overflow: 'hidden'
//     },
//     statusBar: {
//         height: 4
//     },
//     card: {
//         borderRadius: 12,
//         padding: 12,
//         shadowColor: '#000',
//         shadowOpacity: 0.1,
//         shadowRadius: 4,
//         shadowOffset: { width: 0, height: 2 }
//     },
//     cardHeader: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         marginBottom: 8
//     },
//     loaiYeuCau: {
//         fontWeight: '700',
//         fontSize: 15
//     },
//     ktvInfo: {
//         flexDirection: 'row',
//         alignItems: 'center'
//     },
//     contentRow: {
//         flexDirection: 'row',
//         alignItems: 'center'
//     },
//     image: {
//         width: 72,
//         height: 72,
//         borderRadius: 12,
//         backgroundColor: '#ddd',
//         borderWidth: 2,
//         borderColor: '#ccc'
//     },
//     contentText: {
//         flex: 1,
//         marginLeft: 12
//     },
//     tenThietBi: {
//         fontWeight: '600',
//         fontSize: 16
//     },
//     footerButtonRow: {
//         flexDirection: 'row',
//         justifyContent: 'space-around',
//         padding: 12,
//         borderTopWidth: 1,
//         backgroundColor: '#fff'
//     },
//     actionButton: {
//         flex: 1,
//         paddingVertical: 12,
//         marginHorizontal: 8,
//         borderRadius: 8,
//         alignItems: 'center'
//     },
//     actionText: {
//         color: '#fff',
//         fontWeight: '600'
//     }
// });



import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, FlatList, Image, Modal, TextInput, Button } from 'react-native';
import { useRoute } from '@react-navigation/native';
import useAdminRequestDetailViewModel from '../../hooks/useAdminRequestDetailViewModel';
import { Ionicons } from '@expo/vector-icons';
import { TRANG_THAI_YEU_CAU } from '../../constants/trangThaiYeuCau';


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
    const [showRejectDialog, setShowRejectDialog] = useState(false);
    const [rejectReason, setRejectReason] = useState('');


    useEffect(() => {
        reload();
    }, []);

    if (isLoading || !yeuCau) {
        return (
            <View style={styles.centered}><ActivityIndicator size="large" /></View>
        );
    }

    const renderItem = ({ item }) => {
        const { chiTiet } = item;
        const colorBar = chiTiet.totalDoingTechnicians > 0 ? '#4caf50' : '#ff9800';

        return (
            <View style={styles.cardWrapper}>
                <View style={[styles.cardHeader, { backgroundColor: chiTiet.totalResponsibleTechnicians > 0 ? '#003c8f' : '#ff6f00' }]}>
                    <Text style={styles.headerText}>{chiTiet.loaiYeuCau}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name="people" size={14} color="white" />
                        <Text style={styles.ktvText}>{chiTiet.totalDoingTechnicians}/{chiTiet.totalResponsibleTechnicians}</Text>
                    </View>
                </View>
                <View style={styles.cardBody}>
                    <Image
                        source={chiTiet.anhDaiDien ? { uri: chiTiet.anhDaiDien } : require('../../../assets/illustrations/placeholder.png')}
                        style={styles.image}
                    />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text numberOfLines={1} style={styles.tenThietBi}>{chiTiet.tenThietBi}</Text>
                        <Text numberOfLines={1} style={styles.subText}>{chiTiet.loaiYeuCau} - {chiTiet.tenLoaiThietBi}</Text>
                        <View style={styles.iconRow}>
                            <Ionicons name="image-outline" size={16} color="#555" />
                            <Text style={styles.iconText}>{chiTiet.soAnh || 0}</Text>
                            <Ionicons name="videocam-outline" size={16} color="#555" style={{ marginLeft: 12 }} />
                            <Text style={styles.iconText}>{chiTiet.soVideo || 0}</Text>
                        </View>
                    </View>
                </View>
            </View>
        );
    };

    const handleRejectConfirm = () => {
        if (!rejectReason.trim()) return;
        tuChoiYeuCau(rejectReason.trim());
        setShowRejectDialog(false);
        setRejectReason('');
    };



    return (
        <View style={styles.container}>
            {yeuCau.trangThai === TRANG_THAI_YEU_CAU.CHO_XAC_NHAN ? (
                <>
                    <View style={styles.waitingBox}>
                        <Text style={styles.waitingText}>🕒 Yêu cầu đang chờ xác nhận</Text>
                    </View>
                    <View style={styles.listContainer}>
                        <FlatList
                            data={[...chuaPhanCongList, ...daPhanCongList]}
                            renderItem={renderItem}
                            keyExtractor={(item) => item.id}
                        />
                    </View>
                    <View style={styles.footerRow}>
                        <TouchableOpacity onPress={() => setShowRejectDialog(true)} style={styles.rejectButton}>
                            <Text style={styles.actionText}>Từ chối</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={duyetYeuCau} style={styles.acceptButton}>
                            <Text style={styles.actionText}>Duyệt</Text>
                        </TouchableOpacity>
                    </View>
                </>
            ) : (
                <>
                    <View style={styles.tabRow}>
                        <TouchableOpacity onPress={() => setTab('chua')} style={styles.tabButton}>
                            <Text style={[styles.tabLabel, tab === 'chua' && styles.activeTabLabel]}>
                                Chưa phân công ({chuaPhanCongList.length})
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setTab('da')} style={styles.tabButton}>
                            <Text style={[styles.tabLabel, tab === 'da' && styles.activeTabLabel]}>
                                Đã phân công ({daPhanCongList.length})
                            </Text>
                        </TouchableOpacity>
                    </View>
                    <FlatList
                        data={tab === 'chua' ? chuaPhanCongList : daPhanCongList}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.id}
                    />
                </>
            )}

            <Modal visible={showRejectDialog} transparent animationType="fade">
                <View style={styles.modalWrapper}>
                    <View style={styles.dialogContent}>
                        <Text style={styles.dialogTitle}>Nhập lý do từ chối</Text>
                        <TextInput
                            value={rejectReason}
                            onChangeText={setRejectReason}
                            placeholder="Nhập lý do..."
                            style={styles.input}
                            multiline
                        />
                        <View style={styles.dialogActions}>
                            <TouchableOpacity onPress={() => setShowRejectDialog(false)} style={styles.dialogButton}>
                                <Text style={styles.dialogButtonText}>Hủy</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleRejectConfirm} style={[styles.dialogButton, { backgroundColor: '#2e7d32' }]} disabled={!rejectReason.trim()}>
                                <Text style={styles.dialogButtonText}>Xác nhận</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>


        </View>


    );


}

const styles = StyleSheet.create({
    modalWrapper: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    dialogContent: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 12,
        width: '85%',
        elevation: 5,
    },
    dialogTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 10,
        minHeight: 80,
        textAlignVertical: 'top',
        marginBottom: 12,
    },
    dialogActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    dialogButton: {
        flex: 1,
        backgroundColor: '#c62828',
        paddingVertical: 12,
        marginHorizontal: 4,
        borderRadius: 8,
        alignItems: 'center',
    },
    dialogButtonText: {
        color: '#fff',
        fontWeight: '600',
    },



    listContainer: {
        flex: 1,
    },

    footerRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderColor: '#ddd',
        gap: 12,
    },


    dialogActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 12,
        gap: 12,
    },



    acceptButton: {
        flex: 1,
        backgroundColor: '#2e7d32',
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: 'center',
        marginRight: 8,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
    },

    rejectButton: {
        flex: 1,
        backgroundColor: '#c62828',
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: 'center',
        marginLeft: 8,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
    },


    actionText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 15,
    },

    container: { flex: 1, backgroundColor: '#f5f6fa' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    actionRow: { flexDirection: 'row', justifyContent: 'space-around', padding: 16 },

    tabRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        backgroundColor: '#fff',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderColor: '#ddd',
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 2,
        shadowOffset: { width: 0, height: 1 }
    },

    tabButton: { marginHorizontal: 12 },
    tabLabel: { fontSize: 16, color: '#666' },
    activeTabLabel: { fontWeight: 'bold', color: '#003c8f', textDecorationLine: 'underline' },
    cardWrapper: {
        marginHorizontal: 12,
        marginVertical: 6,
        borderRadius: 10,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
    },
    cardHeader: {
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    headerText: { color: 'white', fontWeight: 'bold', fontSize: 14 },
    ktvText: { color: 'white', fontWeight: 'bold', marginLeft: 4, fontSize: 12 },
    cardBody: { flexDirection: 'row', padding: 12, alignItems: 'center' },
    image: {
        width: 72,
        height: 72,
        borderRadius: 12,
        backgroundColor: '#ddd',
        borderWidth: 2,
        borderColor: '#ccc' // hoặc chọn màu nổi bật hơn như '#003c8f'
    },

    tenThietBi: { fontWeight: 'bold', fontSize: 16, color: '#222' },
    subText: { fontSize: 13, color: '#666', marginTop: 4 },
    iconRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
    iconText: { fontSize: 13, color: '#333', marginLeft: 4 },
    waitingBox: {
        paddingVertical: 14,
        alignItems: 'center',
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderColor: '#ddd',
    },
    waitingText: {
        fontSize: 15,
        color: '#003c8f',
        fontWeight: '600',
    }

});
