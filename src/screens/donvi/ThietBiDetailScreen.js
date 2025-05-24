// src/screens/ThietBiDetailScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useRoute } from '@react-navigation/native';
import { getThietBiWithChiTietDisplay } from '../../services/thietBiService';
import useAppTheme from '../../hooks/useAppTheme';
import ChiTietYeuCauFormSection from '../../components/ChiTietYeuCauFormSection';
import { useNavigation } from '@react-navigation/native';


const Tab = createMaterialTopTabNavigator();


function ThongTinThietBiTab({ thietBi }) {
    return (
        <View style={[styles.container, { flex: 1 }]}>
            <Text style={styles.title}>{thietBi.tenThietBi}</Text>
            <Text>Mã thiết bị: {thietBi.id}</Text>
            <Text>Loại: {thietBi.tenLoai}</Text>
            <Text>Phòng: {thietBi.tenPhong} - {thietBi.tenTang} - {thietBi.tenDay}</Text>
            <Text>Trạng thái: {thietBi.trangThai}</Text>
        </View>
    );
}

function FormThemChiTietTab({ thietBi, yeuCauId, chiTietYeuCauId }) {
    const navigation = useNavigation();

    return (
        <View style={{ flex: 1 }}>
            <ChiTietYeuCauFormSection
                yeuCauId={yeuCauId}
                thietBiId={thietBi.id}
                chiTietYeuCauId={chiTietYeuCauId}
                onSuccess={() => {
                    console.log('✅ Đã lưu xong chi tiết yêu cầu');
                    navigation.goBack();
                }}
            />
        </View>
    );
}




export default function ThietBiDetailScreen() {
    const route = useRoute();
    const { thietBiId, yeuCauId, chiTietYeuCauId } = route.params;

    const [thietBi, setThietBi] = useState(null);
    const { colors } = useAppTheme();

    useEffect(() => {
        getThietBiWithChiTietDisplay(thietBiId).then(setThietBi);
    }, [thietBiId]);

    if (!thietBi) {
        return <Text>Đang tải dữ liệu...</Text>;
    }

    return (
        <Tab.Navigator
            screenOptions={{
                tabBarStyle: { backgroundColor: colors.surface },
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.onSurfaceVariant,
                tabBarIndicatorStyle: { backgroundColor: colors.primary },
                tabBarLabelStyle: { fontWeight: '600' },
            }}
        >
            <Tab.Screen name="Thông tin">
                {() => <ThongTinThietBiTab thietBi={thietBi} />}
            </Tab.Screen>
            {yeuCauId && (
                <Tab.Screen name="Thêm vào yêu cầu">
                    {() => <FormThemChiTietTab thietBi={thietBi} yeuCauId={yeuCauId} chiTietYeuCauId={chiTietYeuCauId} />}
                </Tab.Screen>
            )}
        </Tab.Navigator>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
});
