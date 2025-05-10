// src/components/RequestDeviceItem.js
import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useAppTheme from '../hooks/useAppTheme';

export default function RequestDeviceItem({ item, onEdit, onDelete, onReview, isEditable }) {
    const { colors } = useAppTheme();

    return (
        <View style={[styles.card, { borderColor: colors.outlineVariant, backgroundColor: colors.surfaceContainerLowest }]}>
            <View style={[styles.header, { backgroundColor: colors.primaryContainer }]}>
                <Text style={[styles.headerText, { color: colors.onPrimary }]}> {item.chiTiet.loaiYeuCau}</Text>
            </View>
            <View style={styles.body}>
                <View style={[styles.imageBox, { backgroundColor: colors.surfaceContainer }]}>
                    {item.anhDaiDien ? (
                        <Image source={{ uri: item.anhDaiDien }} style={styles.image} />
                    ) : (
                        <Ionicons name="image-outline" size={48} color={colors.onSurfaceVariant} style={{ opacity: 0.3 }} />
                    )}
                    <View style={styles.overlayTag}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <Ionicons name="image-outline" size={12} color={colors.onPrimary} />
                            <Text style={[styles.overlayText, { color: colors.onPrimary }]}>{item.soAnh}</Text>
                            <Ionicons name="videocam-outline" size={12} color={colors.onPrimary} />
                            <Text style={[styles.overlayText, { color: colors.onPrimary }]}>{item.soVideo}</Text>
                        </View>

                    </View>
                </View>

                <View style={styles.infoBox}>
                    <Text style={[styles.name, { color: colors.onSurface }]} numberOfLines={2}>{item.tenThietBi}</Text>
                    <View style={styles.actions}>
                        {isEditable ? (
                            <>
                                <TouchableOpacity onPress={onEdit}>
                                    <Ionicons name="create-outline" size={20} color={colors.primary} />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={onDelete}>
                                    <Ionicons name="trash-outline" size={20} color={colors.error} />
                                </TouchableOpacity>
                            </>
                        ) : (
                            <TouchableOpacity onPress={onReview}>
                                <Ionicons name="eye-outline" size={20} color={colors.primary} />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        marginVertical: 8,
        borderWidth: 1,
        borderRadius: 10,
        overflow: 'hidden',
    },
    header: {
        padding: 8,
    },
    headerText: {
        fontWeight: 'bold',
        fontSize: 14,
    },
    body: {
        flexDirection: 'row',
        padding: 8,
    },
    imageBox: {
        width: 100,
        height: 100,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    overlayTag: {
        position: 'absolute',
        bottom: 4,
        right: 4,
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
    },
    overlayText: {
        fontSize: 10,
    },
    infoBox: {
        flex: 1,
        paddingLeft: 10,
        justifyContent: 'space-between',
    },
    name: {
        fontWeight: '600',
        fontSize: 14,
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 12,
    },
});
