import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useFonts } from 'expo-font';
import {
  SpaceGrotesk_400Regular,
  SpaceGrotesk_700Bold
} from '@expo-google-fonts/space-grotesk';
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold
} from '@expo-google-fonts/plus-jakarta-sans';
import { SplashScreen } from 'expo-router';
import { Platform, View } from 'react-native';
import ErrorBoundary from '../components/ErrorBoundary';

// Initialize splash screen prevention
(() => {
  try {
    SplashScreen.preventAutoHideAsync();
  } catch (e) {
    // Ignore errors - splash screen may already be hidden
  }
})();

export default function RootLayout() {
  useFrameworkReady();
  const [isReady, setIsReady] = useState(false);
  
  const [fontsLoaded, fontError] = useFonts({
    'SpaceGrotesk-Regular': SpaceGrotesk_400Regular,
    'SpaceGrotesk-Bold': SpaceGrotesk_700Bold,
    'PlusJakartaSans-Regular': PlusJakartaSans_400Regular,
    'PlusJakartaSans-Medium': PlusJakartaSans_500Medium,
    'PlusJakartaSans-SemiBold': PlusJakartaSans_600SemiBold,
    'PlusJakartaSans-Bold': PlusJakartaSans_700Bold,
  });

  useEffect(() => {
    async function prepare() {
      try {
        // Wait for fonts to load
        if (fontsLoaded || fontError) {
          await SplashScreen.hideAsync();
          setIsReady(true);
        }
      } catch (e) {
        // Ignore errors
        console.warn('Error preparing app:', e);
        setIsReady(true);
      }
    }

    prepare();
  }, [fontsLoaded, fontError]);

  // Keep splash screen visible while fonts are loading
  if (!isReady) {
    return null;
  }

  return (
    <ErrorBoundary>
      <View style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
      </View>
    </ErrorBoundary>
  );
}