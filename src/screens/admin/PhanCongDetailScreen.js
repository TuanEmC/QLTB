import React, { useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, FlatList, Image, Modal, TextInput, Button, ScrollView } from 'react-native';
import { useRoute } from '@react-navigation/native';
import usePhanCongDetailViewModel from '../../hooks/usePhanCongDetailViewModel';

import RequestInfoCard from '../../components/RequestInfoCard';
import DeviceInfoCard from '../../components/DeviceInfoCard';
import DeviceLocationCard from '../../components/DeviceLocationCard';
import DeviceMaintenanceCard from '../../components/DeviceMaintenanceCard';
import NoteCard from '../../components/NoteCard';

export default function PhanCongDetailScreen() {
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
                {['Thông tin yêu cầu', 'Thiết bị', 'Minh chứng'].map((label, index) => (
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

            <ScrollView style={{ padding: 16 }}>
                {tab === 0 && chiTietYeuCau && (
                    <RequestInfoCard
                        donVi={tenDonVi}
                        loaiYeuCau={chiTietYeuCau.loaiYeuCau}
                        moTa={chiTietYeuCau.moTa}
                    />
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
});
