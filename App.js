
// import React, { useEffect, useState } from 'react';
// import { View, Text, ScrollView } from 'react-native';
// import { collection, getDocs } from 'firebase/firestore';
// import { db } from './src/services/firebaseConfig'; // đúng tên file
// import { NavigationContainer } from '@react-navigation/native';
// import AppNavigator from './src/navigation/AppNavigator';

// import { StatusBar } from 'react-native';
// import useAppTheme from './src/hooks/useAppTheme';

// export default function App() {
//   const { colorScheme, colors } = useAppTheme();

//   return (
//     <>
//       <StatusBar
//         backgroundColor={colors.primary}
//         barStyle={colors.onPrimary === '#FFFFFF' ? 'light-content' : 'dark-content'}
//       />
//       <NavigationContainer>
//         <AppNavigator />
//       </NavigationContainer>
//     </>
//   );
// }
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import useAppTheme from './src/hooks/useAppTheme';
import AppNavigator from './src/navigation/AppNavigator';
import { StatusBar } from 'react-native';
import { SessionProvider } from './src/context/SessionContext';

export default function App() {
  const { colors, colorScheme } = useAppTheme();

  const navTheme = {
    ...(colorScheme === 'dark' ? DarkTheme : DefaultTheme),
    colors: {
      ...((colorScheme === 'dark' ? DarkTheme : DefaultTheme).colors),
      background: colors.background,
      text: colors.text,
      primary: colors.primary,
      card: colors.surface,
    },
  };

  return (
    <SessionProvider>
      <>
      <StatusBar
        backgroundColor={colors.primary}
        barStyle={colors.onPrimary === '#FFFFFF' ? 'light-content' : 'dark-content'}
      />
      <NavigationContainer theme={navTheme}>
        <AppNavigator />
      </NavigationContainer>
    </>
    </SessionProvider>
    
  );
}
