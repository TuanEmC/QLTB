import React, { useState } from 'react';
import { View, Text, Button } from 'react-native';
import { BottomSheet, ListItem } from 'react-native-elements';

export default function TestBottomSheetScreen() {
    const [isVisible, setIsVisible] = useState(false);

    const options = ['Lựa chọn 1', 'Lựa chọn 2', 'Lựa chọn 3'];

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Button title="🧪 Mở Bottom Sheet" onPress={() => setIsVisible(true)} />

            <BottomSheet isVisible={isVisible}>
                {options.map((opt, index) => (
                    <ListItem key={index} onPress={() => setIsVisible(false)}>
                        <ListItem.Content>
                            <ListItem.Title>{opt}</ListItem.Title>
                        </ListItem.Content>
                    </ListItem>
                ))}
                <ListItem onPress={() => setIsVisible(false)}>
                    <ListItem.Content>
                        <ListItem.Title style={{ color: 'red' }}>Đóng</ListItem.Title>
                    </ListItem.Content>
                </ListItem>
            </BottomSheet>
        </View>
    );
}
