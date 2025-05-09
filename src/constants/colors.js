import { lightTheme, darkTheme } from './themes';

export const getAppColors = (mode = 'light') =>
  mode === 'dark' ? darkTheme : lightTheme;
