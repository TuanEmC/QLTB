import React from 'react';
import { View, StyleSheet, SafeAreaView, Text } from 'react-native';
import BottomNavigationBar from '../BottomNavigationBar';
import useAppTheme from '../../hooks/useAppTheme';

export default function AppLayout({  showBottomBar = true, children }) {
  const { colors } = useAppTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        {children}
      </View>
      {showBottomBar && <BottomNavigationBar />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingBottom: 72,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 12,
  },
});

// export default function AppLayout({ title = '', showBottomBar = true, children }) {
//   const { colors } = useAppTheme();

//   return (
//     <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}> 
//       <View style={styles.content}>{children}</View>
//       {showBottomBar && <BottomNavigationBar />}
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   content: {
//     flex: 1,
//     paddingBottom: 72,
//   },
// });