import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import useAppTheme from '../../hooks/useAppTheme';

export default function LoginScreen({ navigation }) {
  const { colors } = useAppTheme();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState(null); // UI demo

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Image source={require('../../../assets/logo.png')} style={styles.logo} resizeMode="contain" />

      <TouchableOpacity style={styles.debugBtn} onPress={() => navigation.navigate('DebugLogin')}>
        <Text style={{ color: colors.onPrimary }}>Mở Debug Login</Text>
      </TouchableOpacity>

      <TextInput
        placeholder="Tài khoản"
        placeholderTextColor={colors.onSurfaceVariant}
        value={username}
        onChangeText={setUsername}
        style={[styles.input, { backgroundColor: colors.surface, color: colors.onSurface }]}
      />

      <TextInput
        placeholder="Mật khẩu"
        placeholderTextColor={colors.onSurfaceVariant}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={[styles.input, { backgroundColor: colors.surface, color: colors.onSurface }]}
      />

      {errorMessage && (
        <Text style={[styles.errorText, { color: 'red' }]}>{errorMessage}</Text>
      )}

      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.primary }]}
        onPress={() => {
          // tạm thời hiển thị lỗi mock
          if (username === '' || password === '') {
            setErrorMessage('Vui lòng nhập đủ thông tin');
          } else {
            setErrorMessage(null);
            // logic login sẽ xử lý sau
          }
        }}
      >
        <Text style={[styles.buttonText, { color: colors.onPrimary }]}>Đăng nhập</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
        <Text style={[styles.linkText, { color: colors.primary }]}>Quên mật khẩu?</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={[styles.linkText, { color: colors.primary }]}>Đăng ký</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 240,
    height: 240,
    marginBottom: 24,
  },
  debugBtn: {
    marginBottom: 32,
    backgroundColor: '#002D5E',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  input: {
    width: '100%',
    height: 48,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 12,
  },
  button: {
    width: '100%',
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  linkText: {
    fontSize: 14,
    marginTop: 8,
  },
  errorText: {
    marginBottom: 8,
    fontSize: 14,
  },
});
