import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AppLayout from '../../components/layout/AppLayout';

export default function KtvDashboard() {
    return (
        <AppLayout showBottomBar={true}>
            <View style={styles.container}>
                <Text style={styles.text}>🛠️ Đây là dashboard dành cho Kỹ thuật viên</Text>
            </View>
        </AppLayout>
    );
}

const styles = StyleSheet.create({
    container: { padding: 16 },
    text: { fontSize: 18, fontWeight: 'bold' },
});
