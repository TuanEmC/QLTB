import React, { useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, FlatList, Image, Modal, TextInput, Button, ScrollView, Linking } from 'react-native';
import { useRoute } from '@react-navigation/native';
import usePhanCongDetailViewModel from '../../hooks/usePhanCongDetailViewModel';

import RequestInfoCard from '../../components/RequestInfoCard';
import DeviceInfoCard from '../../components/DeviceInfoCard';
import DeviceLocationCard from '../../components/DeviceLocationCard';
import DeviceMaintenanceCard from '../../components/DeviceMaintenanceCard';
import NoteCard from '../../components/NoteCard';
import useAppTheme from '../../hooks/useAppTheme';

export default function PhanCongDetailScreen() {
    const { colors } = useAppTheme();
    const route = useRoute();
    const { id: phanCongId } = route.params || {};

    const {
        loading,
        chiTietYeuCau,
        yeuCau,
        thietBi,
        tenDonVi,
        viTri,
        imageUris,
        videoUri,
        phanCong,
        taiKhoanTaoPhanCong,
    } = usePhanCongDetailViewModel(phanCongId);

    const [tab, setTab] = useState(0); // 0 = Thông tin yêu cầu, 1 = Thiết bị, 2 = Minh chứng

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" />
                <Text>Đang tải dữ liệu phân công...</Text>
            </View>
        );
    }

    return (
        <View style={{ flex: 1 }}>
            {/* Tab selector */}
            <View style={styles.tabContainer}>
                {['Thông tin', 'Thiết bị', 'Minh chứng'].map((label, index) => (
                    <TouchableOpacity
                        key={index}
                        style={[styles.tab, tab === index && styles.activeTab]}
                        onPress={() => setTab(index)}
                    >
                        <Text style={[styles.tabText, tab === index && styles.activeTabText]}>
                            {label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <ScrollView style={{ padding: 16 }} contentContainerStyle={{ paddingBottom: 32 }}>
                {tab === 0 && chiTietYeuCau && (
                    <>
                        <RequestInfoCard
                            donVi={tenDonVi}
                            loaiYeuCau={chiTietYeuCau.loaiYeuCau}
                            moTa={chiTietYeuCau.moTa}
                        />

                        {phanCong && (
    <View style={[styles.cardWrapper, {
        backgroundColor: colors.surfaceContainerLowest,
        borderColor: colors.outlineVariant,
    }]}>
        <View style={[styles.cardHeader, {
            backgroundColor: colors.primaryContainer,
        }]}>
            <Text style={[styles.cardHeaderText, {
                color: colors.onPrimary,
            }]}>Thông tin phân công</Text>
        </View>
        <View style={styles.cardContent}>
            <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>Loại phân công:</Text>
            <Text style={[styles.value, { color: colors.onSurface }]}>{phanCong.loaiPhanCong}</Text>

            <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>Thời gian tạo:</Text>
            <Text style={[styles.value, { color: colors.onSurface }]}>{new Date(phanCong.thoiGianTaoPhanCong).toLocaleString()}</Text>

            <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>Mức độ ưu tiên:</Text>
            <Text style={[styles.value, { color: colors.onSurface }]}>{phanCong.mucDoUuTien}</Text>

            <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>Số lượng KTV tham gia:</Text>
            <Text style={[styles.value, { color: colors.onSurface }]}>{phanCong.soLuongKTVThamGia ?? 'Không rõ'}</Text>

            <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>Trạng thái:</Text>
            <Text style={[styles.value, { color: colors.onSurface }]}>{phanCong.trangThai}</Text>

            {phanCong.ghiChu ? (
                <>
                    <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>Ghi chú:</Text>
                    <Text style={[styles.value, { color: colors.onSurface }]}>{phanCong.ghiChu}</Text>
                </>
            ) : null}

            <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>Người tạo:</Text>
            <Text style={[styles.value, { color: colors.onSurface }]}>{taiKhoanTaoPhanCong?.hoTen || 'Không rõ'}</Text>

            <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>SĐT:</Text>
            <Text
                style={[styles.value, { color: colors.primary }]}
                onPress={() => taiKhoanTaoPhanCong?.soDienThoai && Linking.openURL(`tel:${taiKhoanTaoPhanCong.soDienThoai}`)}
            >
                {taiKhoanTaoPhanCong?.soDienThoai || 'Không rõ'}
            </Text>
        </View>
    </View>
)}

                    </>
                )}

                {tab === 1 && thietBi && (
                    <>
                        <DeviceInfoCard device={thietBi} iconSource={require('../../../assets/illustrations/airconditioner.png')} />
                        <DeviceLocationCard viTriString={viTri} />
                        <DeviceMaintenanceCard device={thietBi} />
                        <NoteCard note={thietBi.ghiChu} />
                    </>
                )}

                {tab === 2 && imageUris.length > 0 && (
                    <>
                        <Text style={styles.sectionTitle}>Ảnh minh chứng</Text>
                        <ScrollView horizontal>
                            {imageUris.map((uri, idx) => (
                                <Image key={idx} source={{ uri }} style={styles.imageThumb} />
                            ))}
                        </ScrollView>
                    </>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    tabContainer: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#ccc' },
    tab: { flex: 1, padding: 12, alignItems: 'center' },
    activeTab: { borderBottomWidth: 3, borderBottomColor: '#007bff' },
    tabText: { color: '#555' },
    activeTabText: { color: '#007bff', fontWeight: 'bold' },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', marginVertical: 8 },
    imageThumb: {
        width: 100,
        height: 100,
        marginRight: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ccc',
    },
    cardWrapper: {
    marginTop: 16,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    //shadowOpacity: 0.05,
    shadowRadius: 0,
    //shadowOffset: { width: 0, height: 2 },
    elevation: 3,
},
cardHeader: {
    padding: 10,
},
cardHeaderText: {
    fontWeight: 'bold',
    fontSize: 16,
},
cardContent: {
    padding: 16,
},
label: {
    fontWeight: '600',
    marginTop: 8,
    fontSize: 13,
},
value: {
    marginBottom: 6,
    fontSize: 14,
},

});




// import React, { useState } from 'react';
// import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, FlatList, Image, Modal, TextInput, Button, ScrollView } from 'react-native';
// import { useRoute } from '@react-navigation/native';
// import usePhanCongDetailViewModel from '../../hooks/usePhanCongDetailViewModel';

// import RequestInfoCard from '../../components/RequestInfoCard';
// import DeviceInfoCard from '../../components/DeviceInfoCard';
// import DeviceLocationCard from '../../components/DeviceLocationCard';
// import DeviceMaintenanceCard from '../../components/DeviceMaintenanceCard';
// import NoteCard from '../../components/NoteCard';

// export default function PhanCongDetailScreen() {
//     const route = useRoute();
//     const { id: phanCongId } = route.params || {};

//     const {
//         loading,
//         chiTietYeuCau,
//         yeuCau,
//         thietBi,
//         tenDonVi,
//         viTri,
//         imageUris,
//         videoUri,
//         phanCong,
//     } = usePhanCongDetailViewModel(phanCongId);

//     const [tab, setTab] = useState(0); // 0 = Thông tin yêu cầu, 1 = Thiết bị, 2 = Minh chứng

//     if (loading) {
//         return (
//             <View style={styles.centered}>
//                 <ActivityIndicator size="large" />
//                 <Text>Đang tải dữ liệu phân công...</Text>
//             </View>
//         );
//     }

//     return (
//         <View style={{ flex: 1 }}>
//             {/* Tab selector */}
//             <View style={styles.tabContainer}>
//                 {['Thông tin', 'Thiết bị', 'Minh chứng'].map((label, index) => (
//                     <TouchableOpacity
//                         key={index}
//                         style={[styles.tab, tab === index && styles.activeTab]}
//                         onPress={() => setTab(index)}
//                     >
//                         <Text style={[styles.tabText, tab === index && styles.activeTabText]}>
//                             {label}
//                         </Text>
//                     </TouchableOpacity>
//                 ))}
//             </View>

//             <ScrollView style={{ padding: 16 }}>
//                 {tab === 0 && chiTietYeuCau && (
//                     <>
//                         <RequestInfoCard
//                             donVi={tenDonVi}
//                             loaiYeuCau={chiTietYeuCau.loaiYeuCau}
//                             moTa={chiTietYeuCau.moTa}
//                         />

//                         {/* 📦 Thông tin phân công */}
//                         <View style={styles.assignCard}>
//                             <Text style={styles.cardTitle}>Thông tin phân công</Text>

//                             <View style={styles.row}>
//                                 <Text style={styles.label}>Loại phân công:</Text>
//                                 <Text style={styles.value}>{phanCong?.loaiPhanCong || '—'}</Text>
//                             </View>

//                             <View style={styles.row}>
//                                 <Text style={styles.label}>Mức độ ưu tiên:</Text>
//                                 <Text style={styles.value}>{phanCong?.mucDoUuTien || '—'}</Text>
//                             </View>

//                             <View style={styles.row}>
//                                 <Text style={styles.label}>Trạng thái:</Text>
//                                 <Text style={styles.value}>{phanCong?.trangThai || '—'}</Text>
//                             </View>

//                             {phanCong?.ghiChu ? (
//                                 <View style={styles.row}>
//                                     <Text style={styles.label}>Ghi chú:</Text>
//                                     <Text style={styles.value}>{phanCong.ghiChu}</Text>
//                                 </View>
//                             ) : null}
//                         </View>
//                     </>
//                 )}

//                 {tab === 1 && thietBi && (
//                     <>
//                         <DeviceInfoCard device={thietBi} iconSource={require('../../../assets/illustrations/airconditioner.png')} />
//                         <DeviceLocationCard viTriString={viTri} />
//                         <DeviceMaintenanceCard device={thietBi} />
//                         <NoteCard note={thietBi.ghiChu} />
//                     </>
//                 )}

//                 {tab === 2 && imageUris.length > 0 && (
//                     <>
//                         <Text style={styles.sectionTitle}>Ảnh minh chứng</Text>
//                         <ScrollView horizontal>
//                             {imageUris.map((uri, idx) => (
//                                 <Image key={idx} source={{ uri }} style={styles.imageThumb} />
//                             ))}
//                         </ScrollView>
//                     </>
//                 )}
//             </ScrollView>
//         </View>
//     );
// }

// const styles = StyleSheet.create({
//     centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
//     tabContainer: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#ccc' },
//     tab: { flex: 1, padding: 12, alignItems: 'center' },
//     activeTab: { borderBottomWidth: 3, borderBottomColor: '#007bff' },
//     tabText: { color: '#555' },
//     activeTabText: { color: '#007bff', fontWeight: 'bold' },
//     sectionTitle: { fontSize: 18, fontWeight: 'bold', marginVertical: 8 },
//     imageThumb: {
//         width: 100,
//         height: 100,
//         marginRight: 10,
//         borderRadius: 8,
//         borderWidth: 1,
//         borderColor: '#ccc',
//     },

//     assignCard: {
//         backgroundColor: '#fff',
//         borderRadius: 12,
//         padding: 16,
//         marginTop: 12,
//         shadowColor: '#000',
//         shadowOpacity: 0.05,
//         shadowRadius: 4,
//         shadowOffset: { width: 0, height: 2 },
//         elevation: 2,
//     },
//     cardTitle: {
//         fontSize: 16,
//         fontWeight: 'bold',
//         marginBottom: 12,
//         color: '#003c8f',
//     },
//     row: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         marginBottom: 8,
//     },
//     label: {
//         color: '#555',
//         fontWeight: '600',
//         flex: 1,
//     },
//     value: {
//         color: '#111',
//         textAlign: 'right',
//         flex: 1,
//     },
// });


// import React, { useState } from 'react';
// import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, FlatList, Image, Modal, TextInput, Button, ScrollView } from 'react-native';
// import { useRoute } from '@react-navigation/native';
// import usePhanCongDetailViewModel from '../../hooks/usePhanCongDetailViewModel';

// import RequestInfoCard from '../../components/RequestInfoCard';
// import DeviceInfoCard from '../../components/DeviceInfoCard';
// import DeviceLocationCard from '../../components/DeviceLocationCard';
// import DeviceMaintenanceCard from '../../components/DeviceMaintenanceCard';
// import NoteCard from '../../components/NoteCard';

// export default function PhanCongDetailScreen() {
//     const route = useRoute();
//     const { id: phanCongId } = route.params || {};

//     const {
//         loading,
//         chiTietYeuCau,
//         yeuCau,
//         thietBi,
//         tenDonVi,
//         viTri,
//         imageUris,
//         videoUri,
//     } = usePhanCongDetailViewModel(phanCongId);

//     const [tab, setTab] = useState(0); // 0 = Thông tin yêu cầu, 1 = Thiết bị, 2 = Minh chứng

//     if (loading) {
//         return (
//             <View style={styles.centered}>
//                 <ActivityIndicator size="large" />
//                 <Text>Đang tải dữ liệu phân công...</Text>
//             </View>
//         );
//     }

//     return (
//         <View style={{ flex: 1 }}>
//             {/* Tab selector */}
//             <View style={styles.tabContainer}>
//                 {['Thông tin yêu cầu', 'Thiết bị', 'Minh chứng'].map((label, index) => (
//                     <TouchableOpacity
//                         key={index}
//                         style={[styles.tab, tab === index && styles.activeTab]}
//                         onPress={() => setTab(index)}
//                     >
//                         <Text style={[styles.tabText, tab === index && styles.activeTabText]}>
//                             {label}
//                         </Text>
//                     </TouchableOpacity>
//                 ))}
//             </View>

//             <ScrollView style={{ padding: 16 }}>
//                 {tab === 0 && chiTietYeuCau && (
//                     <RequestInfoCard
//                         donVi={tenDonVi}
//                         loaiYeuCau={chiTietYeuCau.loaiYeuCau}
//                         moTa={chiTietYeuCau.moTa}
//                     />
                    

//                 )}

//                 {tab === 1 && thietBi && (
//                     <>
//                         <DeviceInfoCard device={thietBi} iconSource={require('../../../assets/illustrations/airconditioner.png')} />
//                         <DeviceLocationCard viTriString={viTri} />
//                         <DeviceMaintenanceCard device={thietBi} />
//                         <NoteCard note={thietBi.ghiChu} />
//                     </>
//                 )}

//                 {tab === 2 && imageUris.length > 0 && (
//                     <>
//                         <Text style={styles.sectionTitle}>Ảnh minh chứng</Text>
//                         <ScrollView horizontal>
//                             {imageUris.map((uri, idx) => (
//                                 <Image key={idx} source={{ uri }} style={styles.imageThumb} />
//                             ))}
//                         </ScrollView>
//                     </>
//                 )}
//             </ScrollView>
//         </View>
//     );
// }

// const styles = StyleSheet.create({
//     centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
//     tabContainer: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#ccc' },
//     tab: { flex: 1, padding: 12, alignItems: 'center' },
//     activeTab: { borderBottomWidth: 3, borderBottomColor: '#007bff' },
//     tabText: { color: '#555' },
//     activeTabText: { color: '#007bff', fontWeight: 'bold' },
//     sectionTitle: { fontSize: 18, fontWeight: 'bold', marginVertical: 8 },
//     imageThumb: {
//         width: 100,
//         height: 100,
//         marginRight: 10,
//         borderRadius: 8,
//         borderWidth: 1,
//         borderColor: '#ccc',
//     },
// });
