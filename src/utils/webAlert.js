import { Alert, Platform } from 'react-native';

const isWeb = Platform.OS === 'web';

export const showAlert = (title, message, buttons = [{ text: 'OK' }]) => {
  if (isWeb) {
    alert(`${title}\n\n${message}`);
    return Promise.resolve({ text: 'OK' });
  }
  return new Promise((resolve) => {
    Alert.alert(title, message, buttons.map(b => ({
      ...b,
      onPress: () => resolve(b)
    })));
  });
};
