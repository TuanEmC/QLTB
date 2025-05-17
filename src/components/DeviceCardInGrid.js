import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { getTrangThaiThietBiColor } from '../constants/trangThaiThietBi';
import { getIllustrationForDeviceType } from '../utils/getIllustrationForDeviceType';
import { Dimensions } from 'react-native';

export default function DeviceCard({ device, onPress, isSelected }) {
    const screenWidth = Dimensions.get('window').width;
    const numColumns = 2;
    const itemWidth = (screenWidth - 16 - numColumns * 8) / numColumns;
    return (
        // <TouchableOpacity style={styles.card} onPress={onPress}>
        <TouchableOpacity style={[styles.card, { width: itemWidth }]} onPress={onPress}>
            <View style={styles.iconArea}>
                <Image
                    source={getIllustrationForDeviceType(device.tenLoai)}
                    style={{ width: 48, height: 48, resizeMode: 'contain' }}
                />

            </View>
            <View style={styles.infoArea}>
                <View style={styles.row}>
                    <Text style={styles.type}>{device.tenLoai}</Text>
                    <View style={[styles.dot, { backgroundColor: getTrangThaiThietBiColor(device.trangThai) }]} />
                </View>
                <Text
                    style={styles.name}
                    numberOfLines={2}
                    ellipsizeMode="tail"
                >
                    {device.tenThietBi}
                </Text>

                <Text style={styles.location}>
                    P.{device.tenPhong}
                </Text>
                {isSelected && <Text style={styles.selected}>✓ Đã chọn</Text>}
            </View>
        </TouchableOpacity>
    );
}


const styles = StyleSheet.create({
    // card: { flex: 1, margin: 8, borderWidth: 1, borderRadius: 10, overflow: 'hidden' },
    card: {
        flex: 1,
        margin: 4,
        minWidth: 0, // tránh bug co giãn
        borderWidth: 1,
        borderRadius: 10,
        backgroundColor: '#fff',
        overflow: 'hidden',
    },

    iconArea: { height: 80, backgroundColor: '#EEE', justifyContent: 'center', alignItems: 'center' },
    infoArea: { padding: 10 },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    type: { fontWeight: '600', fontSize: 14 },
    dot: { width: 12, height: 12, borderRadius: 6 },
    name: { fontSize: 12, marginVertical: 4 },
    location: { fontSize: 12, color: '#007bff' },
    selected: { color: 'red', fontWeight: 'bold' },
});
