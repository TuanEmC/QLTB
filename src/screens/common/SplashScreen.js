import React, { useEffect } from 'react';
import { View, StyleSheet, Text, ActivityIndicator, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';

export default function SplashScreen() {
    const navigation = useNavigation();

    useEffect(() => {
        const timeout = setTimeout(() => {
            navigation.replace('MainDrawer');
        }, 5000);
        return () => clearTimeout(timeout);
    }, []);

    return (
        <View style={styles.container}>
            <Animated.Text entering={ZoomIn.duration(1000)} style={styles.title}>
                TDMU
            </Animated.Text>

            <Animated.View entering={ZoomIn.delay(1000).duration(1000)}>
                <Image
                    source={require('../../../assets/logo.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />
            </Animated.View>

            <Animated.View entering={FadeIn.delay(2000).duration(800)} style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0D47A1" />
                <Text style={styles.loadingText}>Đang khởi động...</Text>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#0D47A1',
        marginBottom: 20,
        letterSpacing: 2,
    },
    logo: {
        width: 280,
        height: 280,
    },
    loadingContainer: {
        marginTop: 30,
        alignItems: 'center',
    },
    loadingText: {
        color: '#0D47A1',
        marginTop: 8,
        fontSize: 16,
    },
});
