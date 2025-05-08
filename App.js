
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from './src/services/firebaseConfig'; // đúng tên file
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  
  return (
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
    // <ScrollView contentContainerStyle={{ padding: 20 }}>
    //   <Text style={{ fontSize: 20, marginBottom: 12 }}>Danh sách thiết bị:</Text>
    //   {data.map((item) => (
    //     <View key={item.id} style={{ marginBottom: 10 }}>
    //       <Text style={{ fontWeight: 'bold' }}>{item.ten}</Text>
    //       <Text>{item.vi_tri}</Text>
    //     </View>
    //   ))}
    // </ScrollView>
  );
}