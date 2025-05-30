import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { lightTheme } from '../constants/themes';

export default function RequestInfoCard({ donVi, loaiYeuCau, moTa }) {
    return (
        <View style={styles.card}>
            <View style={styles.topBar} />

            <View style={styles.content}>
                <Text style={styles.title}>📋 Thông tin yêu cầu</Text>

                <View style={styles.row}>
                    <Text style={styles.label}>Đơn vị yêu cầu</Text>
                    <Text style={styles.value}>{donVi || 'Không rõ'}</Text>
                </View>

                <View style={styles.row}>
                    <Text style={styles.label}>Loại yêu cầu</Text>
                    <Text style={[styles.value, styles.primary]}>{loaiYeuCau || 'Không rõ'}</Text>
                </View>

                <Text style={[styles.label, { marginTop: 12 }]}>Mô tả</Text>
                <View style={styles.descBox}>
                    <Text style={styles.descText}>{moTa || 'Không có mô tả'}</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 12,
        borderWidth: 1,
        borderColor: lightTheme.outline,
        backgroundColor: lightTheme.surface,
        overflow: 'hidden',
        marginBottom: 16,
        elevation: 2,
    },
    topBar: {
        height: 10,
        backgroundColor: lightTheme.primary,
        width: '100%',
    },
    content: {
        padding: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: lightTheme.primary,
        marginBottom: 16,
    },
    row: {
        marginBottom: 10,
    },
    label: {
        fontSize: 13,
        color: lightTheme.onSurfaceVariant,
        marginBottom: 2,
    },
    value: {
        fontSize: 15,
        fontWeight: '600',
        color: lightTheme.onSurface,
    },
    primary: {
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
        fontSize: 15,
        color: lightTheme.onSurfaceVariant,
        lineHeight: 22,
    },
});
