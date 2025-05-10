import 'react-native-gesture-handler'; // luôn là dòng đầu tiên
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { enableScreens } from 'react-native-screens'; // import
import useAppTheme from './src/hooks/useAppTheme';
import AppNavigator from './src/navigation/AppNavigator';
import { SessionProvider } from './src/context/SessionContext';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';


enableScreens(); // ✅ GỌI NGAY sau import!

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

  // return (
  //   <GestureHandlerRootView style={{ flex: 1 }}>
  //     <SessionProvider>
  //       <>
  //         <StatusBar
  //           backgroundColor={colors.primary}
  //           barStyle={colors.onPrimary === '#FFFFFF' ? 'light-content' : 'dark-content'}
  //         />
  //         <NavigationContainer theme={navTheme}>
  //           <AppNavigator />
  //         </NavigationContainer>
  //       </>
  //     </SessionProvider>
  //   </GestureHandlerRootView>
  // );
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SessionProvider>
        <BottomSheetModalProvider>
          <>
            <StatusBar
              backgroundColor={colors.primary}
              barStyle={colors.onPrimary === '#FFFFFF' ? 'light-content' : 'dark-content'}
            />
            <NavigationContainer theme={navTheme}>
              <AppNavigator />
            </NavigationContainer>
          </>
        </BottomSheetModalProvider>
      </SessionProvider>
    </GestureHandlerRootView>
  );

}

