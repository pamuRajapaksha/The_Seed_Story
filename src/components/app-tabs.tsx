
import { NativeTabs } from 'expo-router/native-tabs';
import { useColorScheme } from 'react-native';

import { Colors } from '@/constants/theme';

export default function AppTabs() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  return (
    <NativeTabs
      backgroundColor={colors.background}
      indicatorColor={colors.backgroundElement}
      labelStyle={{ selected: { color: colors.text } }}
    >
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/home.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="add-seed">
        <NativeTabs.Trigger.Icon md="add" />
        <NativeTabs.Trigger.Label>Add Seed</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="planting-tracker">
        <NativeTabs.Trigger.Icon md="eco" />
        <NativeTabs.Trigger.Label>Planting</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="germination-tracker">
        <NativeTabs.Trigger.Icon md="science" />
        <NativeTabs.Trigger.Label>Germination</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="growth-journal">
        <NativeTabs.Trigger.Icon md="spa" />
        <NativeTabs.Trigger.Label>Growth</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="harvest-tracker">
        <NativeTabs.Trigger.Icon md="agriculture" />
        <NativeTabs.Trigger.Label>Harvest</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

    </NativeTabs>
  );
}
