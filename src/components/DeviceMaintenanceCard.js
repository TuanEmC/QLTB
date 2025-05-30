import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { lightTheme } from '../constants/themes';
import dayjs from 'dayjs';
import * as Progress from 'react-native-progress';

export default function DeviceMaintenanceCard({ device }) {
    const {
        baoDuongDinhKy: cycle = 0,
        ngayBaoDuongTiepTheo,
        ngayBaoDuongGanNhat,
        ngayDaCat,
        ngayDungSuDung
    } = device;

    const dateTiepTheo = ngayBaoDuongTiepTheo ? new Date(ngayBaoDuongTiepTheo) : null;
    const dateGanNhat = ngayBaoDuongGanNhat ? new Date(ngayBaoDuongGanNhat) : null;

    const daysLeft = dateTiepTheo
        ? Math.max(0, Math.floor((dateTiepTheo.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
        : 0;

    const progress = cycle > 0 ? Math.min(1, 1 - daysLeft / cycle) : 1;

    const dateFormat = (d) => (d ? dayjs(d).format('DD/MM/YYYY') : 'Không rõ');

    const suDungText = ngayDaCat
        ? `Sử dụng từ: ${dateFormat(ngayDaCat)}`
        : ngayDungSuDung
            ? `Dừng sử dụng: ${dateFormat(ngayDungSuDung)}`
            : 'Chưa cập nhật';

    return (
        <View style={styles.card}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerText}>🔧 Thông tin bảo dưỡng</Text>
            </View>

            <View style={styles.content}>
                {/* Vòng tròn trái */}
                <View style={styles.circleBox}>
                    <Text style={styles.label}>Còn lại</Text>
                    <Progress.Circle
                        progress={progress}
                        size={100}
                        thickness={10}
                        color="#FFC107"
                        unfilledColor="#F3DAB7"
                        showsText={true}
                        formatText={() => `${daysLeft} ngày`}
                        textStyle={{ fontWeight: 'bold', color: lightTheme.primary }}
                        borderWidth={0}
                    />
                </View>

                {/* Text phải */}
                <View style={styles.infoBox}>
                    <Text style={styles.infoTextBold}>Chu kỳ BD: {cycle} ngày</Text>
                    <Text style={styles.infoText}>{suDungText}</Text>
                    <Text style={styles.infoText}>BD Gần nhất: {dateFormat(dateGanNhat)}</Text>
                    <Text style={styles.infoText}>BD Kế tiếp: {dateFormat(dateTiepTheo)}</Text>
                </View>
            </View>
        </View>
    );
}


const styles = StyleSheet.create({
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        marginBottom: 16,

        // 👉 Bắt buộc để bo góc có hiệu lực
        overflow: 'hidden',

        // Bóng đẹp
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },


    header: {
        backgroundColor: lightTheme.primary,
        padding: 12,

        // 👉 Chỉ cần thêm nếu bạn không dùng overflow ở card cha
        // borderTopLeftRadius: 12,
        // borderTopRightRadius: 12,
    },

    headerText: {
        color: lightTheme.onPrimary,
        fontSize: 16,
        fontWeight: 'bold',
    },
    content: {
        flexDirection: 'row',
        padding: 16,
    },
    circleBox: {
        flex: 1,
        alignItems: 'center',
    },
    label: {
        fontSize: 12,
        color: lightTheme.onSurfaceVariant,
        marginBottom: 6,
    },
    infoBox: {
        flex: 2,
        paddingLeft: 16,
        justifyContent: 'space-evenly',
    },
    infoText: {
        fontSize: 14,
        color: lightTheme.onSurfaceVariant,
        marginBottom: 4,
    },
    infoTextBold: {
        fontSize: 14,
        color: lightTheme.primary,
        fontWeight: 'bold',
        marginBottom: 8,
    },
});
