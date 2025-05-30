// components/DeviceInfoCard.js
import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView, } from 'react-native';
import { lightTheme } from '../constants/themes';

export default function DeviceInfoCard({ device }) {
    const statusColor = getStatusColor(device.trangThai);
    const icon = getDeviceIcon(device.loaiThietBiId);

    return (
        <View style={styles.card}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: lightTheme.primary }]}>
                <Text style={styles.headerText}>Thông tin thiết bị</Text>
                <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            </View>

            {/* Body */}
            <View style={styles.body}>
                <View style={styles.iconBox}>
                    <Image source={icon} style={styles.icon} resizeMode="contain" />
                </View>

                <View style={styles.textBox}>
                    <Text style={styles.name}>{device.tenThietBi}</Text>
                    <Text style={[styles.statusLabel, { color: statusColor, borderColor: statusColor }]}>
                        {device.trangThai}
                    </Text>
                </View>
            </View>

            {/* Mô tả */}
            <Text style={styles.descTitle}>Mô tả thiết bị:</Text>
            {/* <View style={styles.descBox}>
                <ScrollView nestedScrollEnabled>
                    <Text style={styles.descText}>{device.moTa || 'Không có mô tả'}</Text>
                </ScrollView>
            </View> */}
            <View style={styles.descBox}>
                <ScrollView nestedScrollEnabled style={styles.descScroll}>
                    <Text style={styles.descText}>{device.moTa || 'Không có mô tả'}</Text>
                </ScrollView>
            </View>

        </View>
    );
}

// 🔧 Trả về màu trạng thái
function getStatusColor(status) {
    switch (status) {
        case 'Đang Hoạt Động': return '#4CAF50';
        case 'Chờ Bảo Trì': return '#FFC107';
        case 'Đã Ngưng': return '#F44336';
        default: return lightTheme.outline;
    }
}

// 🔧 Trả về đường dẫn ảnh icon theo loại thiết bị
function getDeviceIcon(loaiThietBiId) {
    switch (loaiThietBiId) {
        case 1: return require('../../assets/illustrations/projector.png');
        case 2: return require('../../assets/illustrations/airconditioner.png');
        case 3: return require('../../assets/illustrations/computer.png');
        case 4: return require('../../assets/illustrations/microphone.png');
        case 5: return require('../../assets/illustrations/speaker.png');
        case 6: return require('../../assets/illustrations/printer.png');
        case 7: return require('../../assets/illustrations/photocopy.png');
        case 9: return require('../../assets/illustrations/smarttv.png');
        default: return require('../../assets/illustrations/placeholder.png');
    }
}


const styles = StyleSheet.create({
    card: {
        borderRadius: 12,
        backgroundColor: lightTheme.surface,
        marginBottom: 16,
        overflow: 'hidden',
        elevation: 3,
    },
    header: {
        padding: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerText: {
        color: lightTheme.onPrimary,
        fontWeight: 'bold',
        fontSize: 16,
    },
    statusDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: lightTheme.onPrimary,
    },
    body: {
        flexDirection: 'row',
        padding: 16,
        alignItems: 'center',
    },
    iconBox: {
        width: 80,
        height: 80,
        backgroundColor: lightTheme.surfaceVariant,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    icon: {
        width: 60,
        height: 60,
    },
    textBox: {
        flex: 1,
    },
    name: {
        fontWeight: '600',
        fontSize: 16,
        marginBottom: 8,
        color: lightTheme.onSurface,
    },
    statusLabel: {
        fontSize: 12,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
        borderWidth: 1,
        alignSelf: 'flex-start',
        backgroundColor: '#FFF5',
    },
    descTitle: {
        marginHorizontal: 16,
        fontSize: 14,
        fontWeight: 'bold',
        color: lightTheme.primary,
    },
    descBox: {
        margin: 16,
        padding: 12,
        backgroundColor: lightTheme.surfaceVariant,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: lightTheme.outlineVariant,

        // 👉 Thêm hai dòng này:
        maxHeight: 180,
    },
    descScroll: {
        flexGrow: 0,  // tránh full height
    },

    descText: {
        color: lightTheme.onSurfaceVariant,
        fontSize: 14,
        lineHeight: 20,
    },
});