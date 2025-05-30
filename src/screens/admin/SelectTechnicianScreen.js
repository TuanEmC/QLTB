import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    TextInput,
    Button,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getTechniciansWithFilters } from '../services/technicianService';
import { lightTheme } from '../constants/themes';

export default function SelectTechnicianScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { chiTietYeuCauId, thietBiId } = route.params;

    const [technicians, setTechnicians] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [search, setSearch] = useState('');

    useEffect(() => {
        loadTechnicians();
    }, [search]);

    const loadTechnicians = async () => {
        const data = await getTechniciansWithFilters({ search });
        setTechnicians(data);
    };

    const toggleSelect = (id) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    const handleNext = () => {
        navigation.navigate('ConfirmTechnicianAssignment', {
            chiTietYeuCauId,
            thietBiId,
            selectedKtvIds: selectedIds,
        });
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Chọn kỹ thuật viên</Text>

            <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Tìm theo tên..."
                style={styles.searchBox}
            />

            <FlatList
                data={technicians}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        onPress={() => toggleSelect(item.id)}
                        style={[styles.item, selectedIds.includes(item.id) && styles.selected]}
                    >
                        <Text style={styles.name}>{item.hoTen}</Text>
                        <Text style={styles.task}>Số việc: {item.taskCount || 0}</Text>
                    </TouchableOpacity>
                )}
            />

            {selectedIds.length > 0 && (
                <Button title="Tiếp tục" onPress={handleNext} color={lightTheme.primary} />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16 },
    header: { fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
    searchBox: {
        borderWidth: 1,
        borderColor: lightTheme.outline,
        borderRadius: 8,
        padding: 8,
        marginBottom: 12,
    },
    item: {
        padding: 12,
        borderWidth: 1,
        borderColor: lightTheme.outline,
        borderRadius: 8,
        marginBottom: 8,
    },
    selected: {
        backgroundColor: lightTheme.surfaceVariant,
        borderColor: lightTheme.primary,
    },
    name: { fontWeight: '600', fontSize: 16 },
    task: { fontSize: 12, color: lightTheme.onSurfaceVariant },
});
