import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import TopNavBar from '@/components/top-navbar';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme ?? 'light'];

  return (
    <>
      <TopNavBar />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarStyle: {
            backgroundColor: '#101a31',
            borderTopColor: '#1d2c4b',
            borderTopWidth: 1,
            height: 72,
            paddingBottom: 10,
            paddingTop: 8,
          },
          tabBarActiveTintColor: palette.tint,
          tabBarInactiveTintColor: '#8b92bf',
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '700',
          },
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <IconSymbol size={25} name="house.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: 'Programação',
            tabBarIcon: ({ color }) => <IconSymbol size={25} name="calendar" color={color} />,
          }}
        />
        <Tabs.Screen
          name="compras"
          options={{
            title: 'Compras',
            tabBarIcon: ({ color }) => <IconSymbol size={25} name="bag.fill" color={color} />,
          }}
        />
      </Tabs>
    </>
  );
}
