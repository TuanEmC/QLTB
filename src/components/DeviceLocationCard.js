import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { lightTheme } from '../constants/themes';

export default function DeviceLocationCard({ viTriString }) {
    const parts = (viTriString || 'Đang cập nhật...').split('>');

    return (
        <View style={styles.card}>
            <View style={styles.topBar} />

            <View style={styles.row}>
                <Image source={require('../../assets/ic_location.png')} style={styles.icon} />
                <View style={styles.textWrapper}>
                    <Text style={styles.locationText}>
                        {parts.map((part, index) => (
                            <Text key={index}>
                                <Text style={styles.locationPart}>{part.trim()}</Text>
                                {index !== parts.length - 1 && (
                                    <Text style={styles.separator}> {'>'} </Text>
                                )}
                            </Text>
                        ))}
                    </Text>
                </View>
            </View>
        </View>
    );
}


// 🔧 Ghép chuỗi từ { day, tang, phong }
function buildViTriString(location) {
    console.log('📌 [DeviceLocationCard] location nhận được:', location);

    if (!location) {
        console.log('⚠️ Không có location, trả về fallback...');
        return 'Đang cập nhật...';
    }

    const { day, tang, phong } = location;
    const result = [day, tang, phong].filter(Boolean).join(' > ');
    console.log('✅ Chuỗi vị trí sau xử lý:', result);
    return result;
}




const styles = StyleSheet.create({
    card: {
        borderRadius: 12,
        borderWidth: 1,
        borderColor: lightTheme.outline,
        backgroundColor: lightTheme.surfaceContainerHigh || '#F8F9FA',
        overflow: 'hidden',
        marginBottom: 16,
    },
    topBar: {
        height: 10,
        backgroundColor: lightTheme.primary,
        width: '100%',
    },
    row: {
        flexDirection: 'row',
        padding: 16,
        alignItems: 'center',
    },
    icon: {
        width: 32,
        height: 32,
        marginRight: 12,
    },
    textWrapper: {
        flex: 1,
        flexWrap: 'wrap',
    },
    locationText: {
        fontSize: 15,
        fontWeight: '500',
        color: lightTheme.onSurface,
        flexWrap: 'wrap',
        flexDirection: 'row',
    },
    locationPart: {
        color: lightTheme.onSurface,
    },
    separator: {
        color: lightTheme.primary,
        fontWeight: 'bold',
    },
});
