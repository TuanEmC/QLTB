import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    TextInput,
    Button,
    Modal,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import useCreateYeuCauViewModel from '../../hooks/useCreateYeuCauViewModel';
import { useSession } from '../../context/SessionContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import RequestDeviceItem from '../../components/RequestDeviceItem';
import { Ionicons } from '@expo/vector-icons';



export default function NewRequestScreen() {
    const { currentUser } = useSession();
    const {
        yeuCau,
        yeuCauId,
        chiTietList,
        snackbarMessage,
        setYeuCauId,
        createNewYeuCau,
        loadYeuCau,
        loadChiTietList,
        capNhatTrangThai,
        clearSnackbar,
    } = useCreateYeuCauViewModel();

    const [moTa, setMoTa] = useState('');
    const [showDialog, setShowDialog] = useState(true);
    const navigation = useNavigation();
    const route = useRoute();
    const routeYeuCauId = route.params?.yeuCauId;
    const [isCreating, setIsCreating] = useState(false);
    const [isLoadingChiTiet, setIsLoadingChiTiet] = useState(false);
    const [chiTietError, setChiTietError] = useState(null);


    useEffect(() => {
        if (routeYeuCauId) {
            setYeuCauId(routeYeuCauId);
        }
    }, [routeYeuCauId]);

    useEffect(() => {
        if (yeuCauId) {
            loadYeuCau(yeuCauId);

            setIsLoadingChiTiet(true);
            setChiTietError(null);
            loadChiTietList(yeuCauId)
                .catch((e) => {
                    console.error('❌ Lỗi load chi tiết:', e);
                    setChiTietError('Không thể tải danh sách chi tiết yêu cầu');
                })
                .finally(() => {
                    setIsLoadingChiTiet(false);
                });

            setShowDialog(false);
        }
    }, [yeuCauId]);


    // const handleTaoYeuCau = async () => {
    //     const id = await createNewYeuCau(currentUser.id, currentUser.donViId, moTa);
    //     await loadYeuCau(id);
    //     await loadChiTietList(id);
    //     setShowDialog(false);
    // };
    const handleTaoYeuCau = async () => {
        if (isCreating) return;

        setIsCreating(true);
        try {
            const id = await createNewYeuCau(currentUser.id, currentUser.donViId, moTa);
            await loadYeuCau(id);
            await loadChiTietList(id);
            setShowDialog(false);
        } catch (e) {
            console.error('❌ Lỗi tạo yêu cầu:', e);
        } finally {
            setIsCreating(false);
        }
    };


    const handleReload = () => {
        if (yeuCauId) {
            loadYeuCau(yeuCauId);
            loadChiTietList(yeuCauId);
        }
    };


    const handleThemThietBi = () => {
        if (yeuCauId) {
            navigation.navigate('DeviceList', { isSelectMode: true, yeuCauId });
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.titleRow}>
                <Text style={styles.title}>Chi tiết yêu cầu</Text>
                <TouchableOpacity onPress={handleReload} style={styles.reloadButton}>
                    <Ionicons name="reload-circle" size={28} color="#007AFF" />
                </TouchableOpacity>
            </View>




            {isLoadingChiTiet ? (
                <Text style={{
                    marginTop: 12,
                    fontSize: 16,
                    fontWeight: '500',
                    textAlign: 'center',
                    color: '#555'
                }}>
                    🔄 Đang tải danh sách thiết bị...
                </Text>
            ) : chiTietError ? (
                <Text style={{
                    marginTop: 12,
                    fontSize: 16,
                    fontWeight: '600',
                    textAlign: 'center',
                    color: 'red'
                }}>
                    ⚠️ {chiTietError}
                </Text>
            ) : (
                <FlatList
                    data={chiTietList}
                    keyExtractor={(item) => item.chiTiet.id.toString()}
                    renderItem={({ item }) => (
                        <RequestDeviceItem
                            item={item}
                            onEdit={() => {
                                navigation.navigate('ThietBiDetail', {
                                    thietBiId: item.chiTiet.thietBiId,
                                    yeuCauId: yeuCauId,
                                    chiTietYeuCauId: item.chiTiet.id,
                                });
                            }}
                            onDelete={() => { }}
                            onReview={() => {
                                navigation.navigate('ThietBiDetail', {
                                    thietBiId: item.chiTiet.thietBiId,
                                    yeuCauId: yeuCauId,
                                    chiTietYeuCauId: item.chiTiet.id,
                                });
                            }}
                            isEditable={yeuCau?.trangThai === 'Bản Nháp'}
                        />
                    )}
                />
            )}



            <View style={styles.buttonRow}>
                <Button title="Thêm thiết bị" onPress={handleThemThietBi} />
                <Button title="Gửi yêu cầu" disabled onPress={() => { }} />
            </View>

            <Modal visible={showDialog} transparent animationType="fade">
                <View style={styles.dialogOverlay}>
                    <View style={styles.dialogContent}>

                        <Text style={styles.dialogTitle}>Nhập mô tả yêu cầu</Text>
                        <TextInput
                            value={moTa}
                            onChangeText={setMoTa}
                            placeholder="Nhập mô tả"
                            style={styles.input}
                            multiline
                        />
                        <View style={styles.dialogActions}>
                            <Button title="Hủy" onPress={() => navigation.goBack()} />
                            <Button title="Tạo yêu cầu" disabled={!moTa || isCreating} onPress={handleTaoYeuCau} />

                        </View>
                    </View>
                </View>
            </Modal>

            {snackbarMessage && (
                <TouchableOpacity style={styles.snackbar} onPress={clearSnackbar}>
                    <Text style={{ color: 'white' }}>{snackbarMessage}</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16 },
    title: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
    mota: { fontSize: 14, marginBottom: 8 },
    tieuDe: { fontSize: 18, marginBottom: 8 },
    card: { padding: 12, backgroundColor: '#eee', marginBottom: 8, borderRadius: 8 },
    deviceName: { fontWeight: 'bold' },
    deviceType: { fontStyle: 'italic' },
    buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
    dialogOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    dialogContent: {
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 12,
        width: '80%',
    },
    dialogTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
    input: {
        borderWidth: 1,
        borderColor: '#aaa',
        borderRadius: 8,
        padding: 8,
        height: 80,
        marginBottom: 12,
    },
    dialogActions: { flexDirection: 'row', justifyContent: 'space-between' },
    snackbar: {
        position: 'absolute',
        bottom: 20,
        alignSelf: 'center',
        backgroundColor: '#333',
        padding: 12,
        borderRadius: 8,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    reloadButton: {
        padding: 4,
        borderRadius: 50,
    },


});
