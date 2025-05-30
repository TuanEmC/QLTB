import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { lightTheme } from '../constants/themes';

export default function NoteCard({ note }) {
    const [expanded, setExpanded] = useState(false);

    return (
        <TouchableOpacity onPress={() => setExpanded(!expanded)} activeOpacity={0.9}>
            <View style={styles.card}>
                {/* Dải màu trên */}
                <View style={styles.topBar} />

                {/* Nội dung */}
                <View style={styles.content}>
                    <View style={styles.row}>
                        <Image
                            source={require('../../assets/note.png')}
                            style={styles.icon}
                        />
                        <Text style={styles.title}>
                            {expanded ? 'Ghi chú (đang mở)' : 'Ghi chú (nhấn để xem)'}
                        </Text>
                    </View>

                    {expanded && (
                        <Text style={styles.bodyText}>
                            {note || 'Không có ghi chú'}
                        </Text>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 12,
        borderWidth: 1,
        borderColor: lightTheme.outline,
        backgroundColor: lightTheme.surfaceContainerHigh || '#F9FAFB',
        overflow: 'hidden',
        elevation: 2,
        marginBottom: 16,
    },
    topBar: {
        height: 10,
        backgroundColor: lightTheme.primary,
        width: '100%',
    },
    content: {
        padding: 16,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    icon: {
        width: 32,
        height: 32,
        marginRight: 8,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: lightTheme.primary,
    },
    bodyText: {
        marginTop: 8,
        fontSize: 14,
        color: lightTheme.onSurface,
        lineHeight: 20,
    },
});
