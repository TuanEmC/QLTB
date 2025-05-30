import React, { useState, useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { useSession } from '../context/SessionContext';
import { useNavigation } from '@react-navigation/native';
import LogoutScreen from '../screens/auth/LogoutScreen';
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import SplashScreen from '../screens/common/SplashScreen';
import PhongListScreen from '../screens/donvi/PhongListScreen';
import AdminRequestListScreen from '../screens/admin/AdminRequestListScreen';
import TaskList from '../screens/dashboard/TaskList';
import Specializations from '../screens/dashboard/Specializations';
import TaskDetail from '../screens/dashboard/TaskDetail';

// Import the tab components as named exports from KtvLamViec.js
import { TabChiTietPhanCong, TabCongViec, TabTienTrinhLamViec } from '../screens/dashboard/KtvLamViec';

import useAppTheme from '../hooks/useAppTheme';

import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import ProfileScreen from '../screens/common/ProfileScreen';
import DebugLoginScreen from '../screens/common/DebugLoginScreen';
import AdminDashboard from '../screens/dashboard/AdminDashboard';
import KtvDashboard from '../screens/dashboard/KtvDashboard';
import DonViDashboard from '../screens/dashboard/DonViDashboard';
import DonViYeuCauListScreen from '../screens/donvi/DonViYeuCauListScreen';
import TestBottomSheetScreen from '../screens/debug/TestBottomSheetScreen';
import DeviceListScreen from '../screens/donvi/DeviceListScreen';
import NewRequestScreen from '../screens/donvi/NewRequestScreen';
import ThietBiDetailScreen from '../screens/donvi/ThietBiDetailScreen';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();
const BottomTab = createBottomTabNavigator();

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
        headerLeft: route.name === 'Home'
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

// New component for KtvLamViec bottom tabs
// This component will now fetch the task data in real-time
import { doc, onSnapshot } from 'firebase/firestore'; // Import necessary Firestore functions

function KtvLamViecBottomTabs({ route }) {
  const { colors } = useAppTheme();
  // We will now manage task state internally
  const { task: initialTask, onTaskUpdated } = route.params; 
  const [task, setTask] = useState(initialTask);
  const [loading, setLoading] = useState(!initialTask); // Set loading true if no initial task

  useEffect(() => {
    // Get the task ID from the initial task data passed via route params
    const taskId = initialTask?.docId; // Assuming docId is available in initialTask

    if (!taskId) {
      console.error('Task ID not found in route params.');
      setLoading(false);
      return;
    }

    console.log('Setting up real-time listener for task ID:', taskId);
    const taskRef = doc(db, 'phan_cong_ktv', taskId);

    const unsubscribe = onSnapshot(taskRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        console.log('Task snapshot received:', docSnapshot.data());
        setTask({ docId: docSnapshot.id, ...docSnapshot.data() });
        setLoading(false);
         // Call the original onTaskUpdated prop if provided
        if (onTaskUpdated) {
          onTaskUpdated();
        }
      } else {
        console.log('Task document does not exist.');
        // Handle case where task might be deleted, e.g., navigate back
        // navigation.goBack(); // Uncomment if you want to navigate back
        setTask(null);
        setLoading(false);
      }
    }, (error) => {
      console.error('Error fetching task snapshot:', error);
      setLoading(false);
    });

    // Cleanup listener on component unmount
    return () => {
      console.log('Cleaning up task listener for ID:', taskId);
      unsubscribe();
    };

  }, [initialTask?.docId]); // Rerun effect if the initial task docId changes

  // Show a loading indicator if task data is still being fetched and not available initially
  if (loading || !task) {
    return (
      <View style={styles.loadingContainer}> {/* You might need to add styles for this */}
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: colors.onSurface }}>Đang tải chi tiết công việc...</Text>
      </View>
    );
  }

  return (
    <BottomTab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Thông tin') {
            iconName = focused ? 'information' : 'information-outline';
          } else if (route.name === 'Làm việc') {
            iconName = focused ? 'briefcase' : 'briefcase-outline';
          } else if (route.name === 'Tiến trình') {
            iconName = focused ? 'help-circle' : 'help-circle-outline'; // Use question mark icon
          }

          // Increased size and used MaterialCommunityIcons
          return <MaterialCommunityIcons name={iconName} size={size + 4} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.onSurfaceVariant,
        headerShown: false, // Hide header for the tab navigator itself
        tabBarStyle: { // Add custom style for the tab bar
          height: 65, // Increase height slightly more
          paddingBottom: 8, // Add more padding at the bottom
          paddingTop: 8, // Add more padding at the top
          backgroundColor: colors.surface, // Match surface color
          borderTopWidth: 1, // Add a subtle border top
          borderTopColor: colors.outline, // Border color
          elevation: 8, // Add some shadow for better appearance
        },
        tabBarLabelStyle: { // Style for the tab labels
          fontSize: 11, // Adjust font size for better fit
          marginTop: 2, // Space between icon and label
        },
        tabBarIconStyle: { // Style for the tab icons
           marginBottom: -3, // Adjust icon vertical alignment
        },
      })}
    >
      {/* Pass the task state to the tab components */}
      <BottomTab.Screen 
        name="Thông tin" 
        options={{ title: 'Thông tin' }}
      >
        {() => <TabChiTietPhanCong task={task} />} 
      </BottomTab.Screen>
      <BottomTab.Screen 
        name="Làm việc" 
        options={{ title: 'Làm việc' }}
      >
        {() => <TabCongViec task={task} onTaskUpdated={onTaskUpdated} />} 
      </BottomTab.Screen>
      <BottomTab.Screen 
        name="Tiến trình" 
        options={{ title: 'Tiến trình' }}
      >
        {() => <TabTienTrinhLamViec task={task} />} 
      </BottomTab.Screen>
    </BottomTab.Navigator>
  );
}

export default function AppNavigator() {
  const { colors } = useAppTheme();

  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: colors.onPrimary,
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />
      <Stack.Screen name="MainDrawer" component={MainDrawer} options={{ headerShown: false }} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="DebugLogin" component={DebugLoginScreen} />
      <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
      <Stack.Screen name="KtvDashboard" component={KtvDashboard} />
      <Stack.Screen name="DonViDashboard" component={DonViDashboard} />
      <Stack.Screen name="QLDVDanhSachYeuCau" component={DonViYeuCauListScreen} />
      <Stack.Screen name="TestBottomSheet" component={TestBottomSheetScreen} />
      <Stack.Screen name="DeviceList" component={DeviceListScreen} />
      <Stack.Screen name="NewRequest" component={NewRequestScreen} />
      <Stack.Screen name="ThietBiDetail" component={ThietBiDetailScreen} options={{ title: 'Chi tiết thiết bị' }} />
      <Stack.Screen name="PhongList" component={PhongListScreen} options={{ title: 'Danh sách phòng' }} />
      <Stack.Screen name="AdminRequestList" component={AdminRequestListScreen} options={{ title: 'Danh sách yêu cầu' }} />
      <Stack.Screen name="TaskList" component={TaskList} options={{ title: 'Danh sách công việc' }} />
      <Stack.Screen name="Specializations" component={Specializations} options={{ title: 'Chuyên môn' }} />
      <Stack.Screen name="TaskDetail" component={TaskDetail} options={{ title: 'Chi tiết công việc' }} />
      {/* Route for the KtvLamViec tabs - pass the task docId and the original onTaskUpdated prop */}
      <Stack.Screen name="KtvLamViec" options={{ title: 'Chi tiết công việc' }}>
         {(props) => <KtvLamViecBottomTabs {...props} />} 
      </Stack.Screen>
    </Stack.Navigator>
  );
}







