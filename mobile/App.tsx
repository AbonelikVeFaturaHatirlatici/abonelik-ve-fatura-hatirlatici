import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from './src/context/AuthContext';
import { DataProvider } from './src/context/DataContext';
import { SnackbarProvider } from './src/context/SnackbarContext';
import { RootNavigator } from './src/navigation/RootNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <DataProvider>
          <SnackbarProvider>
            <RootNavigator />
            <StatusBar style="dark" />
          </SnackbarProvider>
        </DataProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
