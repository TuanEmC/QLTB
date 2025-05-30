import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AppLayout from '../../components/layout/AppLayout';

export default function AdminDashboard() {
    return (
        <AppLayout showBottomBar={true}>
            <View style={styles.container}>
                <Text style={styles.text}>📊 Đây là dashboard dành cho Admin</Text>
            </View>
        </AppLayout>
    );
}

const styles = StyleSheet.create({
    container: { padding: 16 },
    text: { fontSize: 18, fontWeight: 'bold' },
});
