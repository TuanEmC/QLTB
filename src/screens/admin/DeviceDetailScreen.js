import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    ActivityIndicator,
    Image,
    TouchableOpacity,
    Modal,
    StyleSheet,
    Dimensions,
} from 'react-native';
import { lightTheme } from '../../constants/themes';
import { useRoute } from '@react-navigation/native';
import useDeviceDetailViewModel from '../../hooks/useDeviceDetailViewModel';
import DeviceInfoCard from '../../components/DeviceInfoCard';
import DeviceLocationCard from '../../components/DeviceLocationCard';
import DeviceMaintenanceCard from '../../components/DeviceMaintenanceCard';
import NoteCard from '../../components/NoteCard';
import RequestInfoCard from '../../components/RequestInfoCard';

// 📐 Constants
const windowWidth = Dimensions.get('window').width;

export default function DeviceDetailScreen() {
    const route = useRoute();
    const { thietBiId, yeuCauId = null } = route.params || {};

    const {
        thietBi,
        chiTietYeuCau,
        yeuCau,
        tenDonVi,
        viTri,
        imageUris,
        videoUri,
        loading,
    } = useDeviceDetailViewModel(thietBiId, yeuCauId);

    const [selectedTab, setSelectedTab] = useState(yeuCauId ? 0 : 1);
    const [modalImage, setModalImage] = useState(null);

    if (loading) {
        console.log('🔄 Đang tải dữ liệu...');
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" />
                <Text>Đang tải dữ liệu...</Text>
            </View>
        );
    }

    if (!thietBi) {
        return (
            <View style={styles.centered}>
                <Text>Không tìm thấy thiết bị</Text>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
            {/* 🔘 Tab Selector nếu có yêuCauId */}
            {yeuCauId && (
                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[styles.tab, selectedTab === 0 && styles.activeTab]}
                        onPress={() => setSelectedTab(0)}
                    >
                        <Text style={[styles.tabText, selectedTab === 0 && styles.activeTabText]}>
                            Thông tin yêu cầu
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, selectedTab === 1 && styles.activeTab]}
                        onPress={() => setSelectedTab(1)}
                    >
                        <Text style={[styles.tabText, selectedTab === 1 && styles.activeTabText]}>
                            Thông tin thiết bị
                        </Text>
                    </TouchableOpacity>
                </View>
            )}

            <ScrollView style={{ padding: 16 }}>




                {selectedTab === 0 && chiTietYeuCau ? (
                    <>
                        {/* <View style={styles.section}>
                            <Text style={styles.sectionTitle}>📋 Thông tin yêu cầu</Text>

                            <Text style={styles.label}>
                                Đơn vị yêu cầu: <Text style={styles.highlight}>{tenDonVi || 'Không rõ'}</Text>
                            </Text>

                            <Text style={styles.label}>
                                Loại yêu cầu: <Text style={styles.loaiYeuCau}>{chiTietYeuCau?.loaiYeuCau || 'Không rõ'}</Text>
                            </Text>

                            <Text style={styles.label}>Mô tả:</Text>
                            <View style={styles.descBox}>
                                <Text style={styles.descText}>
                                    {chiTietYeuCau?.moTa || 'Không có mô tả'}
                                </Text>
                            </View>
                        </View> */}
                        <RequestInfoCard
                            donVi={tenDonVi}
                            loaiYeuCau={chiTietYeuCau?.loaiYeuCau}
                            moTa={chiTietYeuCau?.moTa}
                        />


                        {imageUris.length > 0 && (
                            <>
                                <Text style={styles.sectionTitle}>Ảnh minh chứng</Text>
                                <ScrollView horizontal>
                                    {imageUris.map((uri, idx) => (
                                        <TouchableOpacity key={idx} onPress={() => setModalImage(uri)}>
                                            <Image source={{ uri }} style={styles.thumbnail} />
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </>
                        )}

                        {/* {videoUri && (
                            <>
                                <Text style={styles.sectionTitle}>Video minh chứng</Text>
                                <Text>▶ Video: {videoUri}</Text>
                            </>
                        )} */}
                    </>
                ) : (
                    <>

                        <DeviceInfoCard device={thietBi} iconSource={require('../../../assets/illustrations/airconditioner.png')} />
                        <DeviceLocationCard viTriString={viTri} />
                        <DeviceMaintenanceCard device={thietBi} />
                        <NoteCard note={thietBi.ghiChu} />
                    </>
                )}
            </ScrollView>

            {/* 🔍 Modal xem ảnh lớn */}
            <Modal visible={!!modalImage} transparent>
                <View style={styles.modalContainer}>
                    <Image source={{ uri: modalImage }} style={styles.fullImage} />
                    <TouchableOpacity style={styles.closeButton} onPress={() => setModalImage(null)}>
                        <Text style={{ color: '#fff', fontSize: 18 }}>Đóng</Text>
                    </TouchableOpacity>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    section: {

    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: lightTheme.primary,
        marginBottom: 12,
    },
    label: {
        fontSize: 14,
        color: lightTheme.onSurface,
        marginBottom: 6,
    },
    highlight: {
        fontWeight: '600',
        color: lightTheme.onSurface,
    },
    loaiYeuCau: {
        fontWeight: '600',
        color: lightTheme.primary,
    },
    descBox: {
        backgroundColor: lightTheme.surfaceVariant,
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: lightTheme.outlineVariant,
        marginTop: 4,
    },
    descText: {
        fontSize: 14,
        color: lightTheme.onSurfaceVariant,
        lineHeight: 20,
    },


    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', marginVertical: 8 },
    thumbnail: {
        width: 100,
        height: 100,
        marginRight: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ccc',
    },
    tabContainer: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#ccc' },
    tab: { flex: 1, padding: 12, alignItems: 'center' },
    activeTab: { borderBottomWidth: 3, borderBottomColor: '#007bff' },
    tabText: { color: '#555' },
    activeTabText: { color: '#007bff', fontWeight: 'bold' },
    modalContainer: {
        flex: 1,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
    },
    fullImage: {
        width: windowWidth,
        height: windowWidth,
        resizeMode: 'contain',
    },
    closeButton: {
        position: 'absolute',
        top: 40,
        right: 20,
        padding: 10,
        backgroundColor: '#444',
        borderRadius: 8,
    },
});
