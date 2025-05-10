import { useColorScheme } from 'react-native';
import { getAppColors } from '../constants/colors';

export default function useAppTheme() {
  const colorScheme = useColorScheme(); // 'light' | 'dark'
  //console.log('🎨 Hệ thống theme hiện tại:', colorScheme);

  const colors = getAppColors(colorScheme || 'light');
  return { colors, colorScheme };
}
