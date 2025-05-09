import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { defaultTaiKhoan } from '../models/taiKhoanModel';

const SessionContext = createContext();

export const SessionProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);

  // Load user từ AsyncStorage nếu có
  useEffect(() => {
    const loadUser = async () => {
      const saved = await AsyncStorage.getItem('currentUser');
      if (saved) {
        setCurrentUser(JSON.parse(saved));
      }
    };
    loadUser();
  }, []);

  const saveUser = async (user) => {
    setCurrentUser(user);
    await AsyncStorage.setItem('currentUser', JSON.stringify(user));
  };

  const clearUser = async () => {
    setCurrentUser(null);
    await AsyncStorage.removeItem('currentUser');
  };

  return (
    <SessionContext.Provider value={{ currentUser, setCurrentUser: saveUser, clearUser }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => useContext(SessionContext);
