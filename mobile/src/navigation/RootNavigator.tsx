import { DefaultTheme, NavigationContainer, type Theme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useAuth } from '../context/AuthContext';
import { AddSubscriptionScreen } from '../screens/AddSubscriptionScreen';
import { AuthScreen } from '../screens/AuthScreen';
import { SubscriptionDetailScreen } from '../screens/SubscriptionDetailScreen';
import { colors } from '../theme';
import type { RootStackParamList } from '../types/navigation';
import { MainTabs } from './MainTabs';

const Stack = createNativeStackNavigator<RootStackParamList>();

const theme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
  },
};

/**
 * Oturum yoksa yalnızca S1 vardır; oturum varsa S2/S5, S3 ve S4.
 * Çıkış veya 401 sonrası yığın S1'e döner ve geri tuşu veri ekranlarına dönmez (akış F6).
 * Açılışta token SecureStore'dan okunurken hiçbir ekran gösterilmez (S1 bir an görünmesin).
 */
export function RootNavigator() {
  const { token, isRestoring } = useAuth();

  if (isRestoring) {
    return (
      <View style={styles.restoring}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer theme={theme}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        {token ? (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="SubscriptionDetail" component={SubscriptionDetailScreen} />
            <Stack.Screen name="AddSubscription" component={AddSubscriptionScreen} />
          </>
        ) : (
          <Stack.Screen name="Auth" component={AuthScreen} options={{ animation: 'fade' }} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  restoring: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});
