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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import DeviceCardInGrid from '../../components/DeviceCardInGrid';
import useDeviceListViewModel from '../../hooks/useDeviceListViewModel';
import { useSession } from '../../context/SessionContext';
import { ActivityIndicator } from 'react-native';


const FILTER_KEYS = ['Phòng', 'Trạng thái', 'Loại thiết bị'];


export default function DeviceListScreen({ route }) {
    const { currentUser } = useSession();
    const { isSelectMode = false, yeuCauId = null } = route.params || {};
    const donViId = currentUser?.donViId;
    const { devices, filters, setFilters, resetFilters } = useDeviceListViewModel(donViId);
    const [selectedDevices, setSelectedDevices] = useState([]);
    const [currentFilterKey, setCurrentFilterKey] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [filterValues, setFilterValues] = useState([]);
    const [isLoading, setIsLoading] = useState(true);


    const navigation = useNavigation();

    useEffect(() => {
        setIsLoading(devices.length === 0);
    }, [devices]);

    useEffect(() => {
        if (currentFilterKey) {
            const values = Array.from(new Set(devices.map(d => getValueByKey(d, currentFilterKey))));
            setFilterValues(values);
            setModalVisible(true);
        }
    }, [currentFilterKey]);

    const handleFilterSelect = (key, value) => {
        setFilters(prev => ({ ...prev, [mapKey(key)]: value }));
        setModalVisible(false);
        setCurrentFilterKey(null);
    };

    // const toggleSelect = (id) => {
    //     setSelectedDevices(prev =>
    //         prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    //     );
    // };

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

            {isLoading ? (
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


            {/* <FlatList
                data={devices}
                keyExtractor={item => item.id}
                numColumns={2}
                renderItem={renderItem}
                columnWrapperStyle={styles.row}
                contentContainerStyle={styles.listContent}
            /> */}

            <Modal visible={modalVisible} transparent animationType="slide">
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Chọn {currentFilterKey}</Text>
                        {filterValues.map(value => (
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
    modalContent: { backgroundColor: 'white', padding: 20, borderTopLeftRadius: 12, borderTopRightRadius: 12 },
    modalTitle: { fontWeight: 'bold', fontSize: 16, marginBottom: 10 },
    modalItem: { paddingVertical: 10 },
    modalClose: { marginTop: 10, alignSelf: 'flex-end' },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

});
