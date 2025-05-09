import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { useSession } from '../context/SessionContext';
import { useNavigation } from '@react-navigation/native';
import LogoutScreen from '../screens/auth/LogoutScreen';
import { Ionicons } from '@expo/vector-icons';


import useAppTheme from '../hooks/useAppTheme';

import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import ProfileScreen from '../screens/common/ProfileScreen';
import DebugLoginScreen from '../screens/common/DebugLoginScreen';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

function MainDrawer() {
  const { currentUser, clearUser } = useSession();
  const { colors } = useAppTheme();

  return (
    <Drawer.Navigator
      screenOptions={({ route, navigation }) => ({
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: colors.onPrimary,
        drawerActiveTintColor: colors.primary,
        drawerInactiveTintColor: colors.onSurface,
        // 👇 Tùy biến nút menu chỉ hiển thị ở "Trang chủ"
        headerLeft: route.name === 'Home' // Hoặc route.name === 'Trang chủ'
          ? () => (
              <Ionicons
                name="menu"
                size={24}
                color={colors.onPrimary}
                style={{ marginLeft: 16 }}
                onPress={() => navigation.openDrawer()}
              />
            )
          : undefined,
      })}
    >
      <Drawer.Screen name="Home" component={HomeScreen} />

      {currentUser ? (
        <Drawer.Screen name="Logout" component={LogoutScreen} />
      ) : (
        <Drawer.Screen name="Login" component={LoginScreen} />
      )}
    </Drawer.Navigator>
  );
}


export default function AppNavigator() {
  const { colors } = useAppTheme();

  return (
    <Stack.Navigator
      initialRouteName="MainDrawer"
      screenOptions={{
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: colors.onPrimary,
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen name="MainDrawer" component={MainDrawer} options={{ headerShown: false }} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="DebugLogin" component={DebugLoginScreen} />
    </Stack.Navigator>
  );
}











// import React from 'react';
// import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import HomeScreen from '../screens/HomeScreen';
// import LoginScreen from '../screens/auth/LoginScreen';
// import useAppTheme from '../hooks/useAppTheme';
// import ProfileScreen from '../screens/common/ProfileScreen';
// import DebugLoginScreen from '../screens/common/DebugLoginScreen';

// const Stack = createNativeStackNavigator();

// export default function AppNavigator() {
//   const { colors } = useAppTheme();
//   return (
//         <Stack.Navigator
//       initialRouteName="Home"
//       screenOptions={{
//         headerStyle: {
//           backgroundColor: colors.primary,
//         },
//         headerTintColor: colors.onPrimary,
//         headerTitleStyle: {
//           fontWeight: 'bold',
//         },
//       }}
//     >
    
//       <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Trang chủ' }} />
//       {/* <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
//       <Stack.Screen name="KtvDashboard" component={KtvDashboardScreen} />
//       <Stack.Screen name="DonViDashboard" component={DonViDashboardScreen} /> */}
//       <Stack.Screen name="Profile" component={ProfileScreen} />
//       <Stack.Screen name="Login" component={LoginScreen} />
//       <Stack.Screen name="DebugLogin" component={DebugLoginScreen} />

//     </Stack.Navigator>
//   );
// }
