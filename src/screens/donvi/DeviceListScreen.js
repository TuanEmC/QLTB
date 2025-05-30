// src/screens/DeviceListScreen.js
import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    Modal,
    Pressable,
    ActivityIndicator
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import DeviceCardInGrid from '../../components/DeviceCardInGrid';
import useDeviceListViewModel from '../../hooks/useDeviceListViewModel';
import { useSession } from '../../context/SessionContext';
import { ScrollView } from 'react-native-gesture-handler';
import { getPhongById } from '../../services/phongService';


const FILTER_KEYS = ['Phòng', 'Trạng thái', 'Loại thiết bị'];


export default function DeviceListScreen({
    route
}) {
    const { currentUser } = useSession();
    const { isSelectMode = false, yeuCauId = null, phongId = null } = route.params || {};
    const isAdmin = currentUser.vaiTroId === 1;
    const donViId = currentUser?.donViId;

    const [initialPhongName, setInitialPhongName] = useState(null);

    useEffect(() => {
        if (phongId) {
            getPhongById(phongId).then(phong => {
                if (phong) {
                    setInitialPhongName(phong.tenPhong);
                }
            }).catch(error => {
                console.error('Error fetching phong data:', error);
                setInitialPhongName('Không rõ phòng');
            });
        }
    }, [phongId]);

    const {
        devices,
        filters,
        setFilters,
        resetFilters,
        isLoading: viewModelLoading
    } = useDeviceListViewModel({
        isAdmin,
        donViId
    });
    console.log('📌 isAdmin:', isAdmin, 'donViId:', donViId, 'phongId', phongId);

    useEffect(() => {
        if (!viewModelLoading && initialPhongName && !filters.phong) {
            setFilters(prev => ({
                ...prev,
                phong: initialPhongName
            }));
        }
    }, [viewModelLoading, initialPhongName, setFilters, filters.phong]);


    const [selectedDevices, setSelectedDevices] = useState([]);
    const [currentFilterKey, setCurrentFilterKey] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [filterValues, setFilterValues] = useState([]);


    const navigation = useNavigation();

    useEffect(() => {
        if (currentFilterKey && Array.isArray(devices) && devices.length > 0) {
            const values = Array.from(new Set(devices.map(d => getValueByKey(d, currentFilterKey))));
            setFilterValues(values);
        }
    }, [currentFilterKey, devices]);


    useEffect(() => {
        if (filterValues.length > 0) {
            setModalVisible(true);
        }
    }, [filterValues]);


    const handleFilterSelect = (key, value) => {
        setFilters(prev => ({ ...prev, [mapKey(key)]: value }));
        setModalVisible(false);
        setCurrentFilterKey(null);
    };

    const renderItem = ({ item }) => (
        <DeviceCardInGrid
            device={item}
            isSelected={selectedDevices.includes(item.id)}
            onPress={() => {
                if (isSelectMode && yeuCauId) {
                    navigation.navigate('ThietBiDetail', {
                        thietBiId: item.id,
                        yeuCauId: yeuCauId,
                    });
                } else {
                    navigation.navigate('ThietBiDetail', {
                        thietBiId: item.id,
                    });
                }
            }}
        />
    );


    return (
        <View style={styles.container}>
            <View style={styles.filterRow}>
                {FILTER_KEYS.map(key => (
                    <TouchableOpacity key={key} onPress={() => setCurrentFilterKey(key)} style={styles.chip}>
                        <Text>{filters[mapKey(key)] ? `${key}: ${filters[mapKey(key)]}` : key}</Text>
                    </TouchableOpacity>
                ))}
                <TouchableOpacity onPress={resetFilters} style={styles.clearChip}>
                    <Text style={{ color: 'red' }}>X</Text>
                </TouchableOpacity>
            </View>

            {viewModelLoading ? (
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color="#007AFF" />
                    <Text style={{ marginTop: 10 }}>Đang tải thiết bị...</Text>
                </View>
            ) : (
                <FlatList
                    data={devices}
                    keyExtractor={item => item.id}
                    numColumns={2}
                    renderItem={renderItem}
                    columnWrapperStyle={styles.row}
                    contentContainerStyle={styles.listContent}
                />
            )}



            <Modal visible={modalVisible} transparent animationType="slide">
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Chọn {currentFilterKey}</Text>
                        {(filterValues || []).map(value => (
                            <Pressable
                                key={value}
                                style={styles.modalItem}
                                onPress={() => handleFilterSelect(currentFilterKey, value)}>
                                <Text>{value}</Text>
                            </Pressable>
                        ))}
                        <Pressable onPress={() => setModalVisible(false)} style={styles.modalClose}>
                            <Text>Đóng</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const mapKey = (k) => {
    return {

        'Phòng': 'phong',
        'Trạng thái': 'trangThai',
        'Loại thiết bị': 'loaiThietBi'
    }[k];
};

const getValueByKey = (item, key) => {
    return {

        'Phòng': item.tenPhong,
        'Trạng thái': item.trangThai,
        'Loại thiết bị': item.tenLoai
    }[key];
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    filterRow: { flexDirection: 'row', flexWrap: 'wrap', padding: 10, gap: 8 },
    chip: { backgroundColor: '#ddd', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
    clearChip: { backgroundColor: '#fdd', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
    row: { justifyContent: 'space-between' },
    listContent: { paddingHorizontal: 8, paddingBottom: 20 },
    modalContainer: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.3)' },
    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        maxHeight: '60%',
    },

    modalTitle: { fontWeight: 'bold', fontSize: 16, marginBottom: 10 },
    modalItem: { paddingVertical: 10 },
    modalClose: { marginTop: 10, alignSelf: 'flex-end' },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

});
