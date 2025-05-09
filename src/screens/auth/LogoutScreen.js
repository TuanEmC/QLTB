import { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useSession } from '../../context/SessionContext';

export default function LogoutScreen() {
  const { clearUser } = useSession();
  const navigation = useNavigation();

  useEffect(() => {
    clearUser();
    navigation.replace('Login');
  }, []);

  return null; // không hiển thị gì
}
