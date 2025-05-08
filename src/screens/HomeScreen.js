import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';

export default function HomeScreen() {
  const [count, setCount] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getCount = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'thiet_bi'));
        setCount(snapshot.size); // ✅ lấy số lượng documents
      } catch (e) {
        console.error('Lỗi khi lấy dữ liệu:', e);
      } finally {
        setLoading(false);
      }
    };

    getCount();
  }, []);

  if (loading) return <ActivityIndicator />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tổng số thiết bị:</Text>
      <Text style={styles.count}>{count}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 18 },
  count: { fontSize: 32, fontWeight: 'bold', marginTop: 8 },
});
