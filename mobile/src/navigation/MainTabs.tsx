import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomNav } from '../components/BottomNav';
import { OverflowMenu } from '../components/OverflowMenu';
import { ScreenHeader } from '../components/ScreenHeader';
import { useAuth } from '../context/AuthContext';
import { RemindersScreen } from '../screens/RemindersScreen';
import { SubscriptionsScreen } from '../screens/SubscriptionsScreen';
import { colors } from '../theme';
import type { MainTab } from '../types/navigation';
import { strings } from '../utils/strings';

/**
 * Ana ekran: S2 Aboneliklerim ve S5 Hatırlatmalar sekmeleri + alt gezinme barı.
 * Alt bar yalnızca bu iki ekranda görünür; S1, S3, S4 tam ekrandır (şartname bölüm 3).
 * Geri tuşu bu ekrandan uygulamadan çıkar.
 */
export function MainTabs() {
  const { signOut } = useAuth();
  const [tab, setTab] = useState<MainTab>('subscriptions');
  const [menuVisible, setMenuVisible] = useState(false);

  const title = tab === 'subscriptions' ? strings.list.title : strings.reminders.title;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScreenHeader title={title} onMenu={() => setMenuVisible(true)} />
      <View style={styles.body}>
        {tab === 'subscriptions' ? <SubscriptionsScreen /> : <RemindersScreen />}
      </View>
      <BottomNav active={tab} onChange={setTab} />
      <OverflowMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        onLogout={signOut}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  body: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
