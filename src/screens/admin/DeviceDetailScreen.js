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
import { useRoute } from '@react-navigation/native';
import useDeviceDetailViewModel from '../../hooks/useDeviceDetailViewModel';

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
                        <Text style={styles.sectionTitle}>Thông tin yêu cầu</Text>
                        <Text>Đơn vị yêu cầu: {tenDonVi}</Text>
                        <Text>Loại yêu cầu: {chiTietYeuCau.loaiYeuCau}</Text>
                        <Text>Mô tả: {chiTietYeuCau.moTa}</Text>

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

                        {videoUri && (
                            <>
                                <Text style={styles.sectionTitle}>Video minh chứng</Text>
                                <Text>▶ Video: {videoUri}</Text>
                            </>
                        )}
                    </>
                ) : (
                    <>
                        <Text style={styles.sectionTitle}>Thông tin thiết bị</Text>
                        <Text>Tên thiết bị: {thietBi.tenThietBi}</Text>
                        <Text>Trạng thái: {thietBi.trangThai}</Text>
                        <Text>Loại: {thietBi.loaiThietBi}</Text>
                        <Text>Vị trí: {viTri}</Text>
                        <Text>Mô tả: {thietBi.moTa || 'Không có mô tả'}</Text>
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
