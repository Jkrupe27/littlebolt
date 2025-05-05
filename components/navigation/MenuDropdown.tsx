import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { Menu, X, Chrome as Home, Compass, Zap, Bold as Golf, User } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { Spacing } from '@/constants/Spacing';
import Text from '@/components/ui/Text';
import Card from '@/components/ui/Card';

const MENU_ITEMS = [
  { name: 'Feed', icon: Home, route: '/(tabs)' },
  { name: 'Discover', icon: Compass, route: '/(tabs)/discover' },
  { name: 'Create', icon: Zap, route: '/(tabs)/create' },
  { name: 'Golf', icon: Golf, route: '/(tabs)/golf' },
  { name: 'Profile', icon: User, route: '/(tabs)/profile' },
];

export default function MenuDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const menuAnimation = new Animated.Value(isOpen ? 1 : 0);

  const toggleMenu = () => {
    const toValue = isOpen ? 0 : 1;
    Animated.spring(menuAnimation, {
      toValue,
      useNativeDriver: true,
      tension: 40,
      friction: 8,
    }).start();
    setIsOpen(!isOpen);
  };

  const handleNavigation = (route: string) => {
    router.push(route);
    toggleMenu();
  };

  const menuStyle = {
    transform: [
      {
        translateY: menuAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [-300, 0],
        }),
      },
    ],
    opacity: menuAnimation,
  };

  return (
    <>
      <TouchableOpacity onPress={toggleMenu} style={styles.menuButton}>
        {isOpen ? (
          <X size={24} color={Colors.neutral[50]} />
        ) : (
          <Menu size={24} color={Colors.neutral[50]} />
        )}
      </TouchableOpacity>

      {isOpen && (
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={toggleMenu}
        />
      )}

      <Animated.View style={[styles.dropdown, menuStyle]}>
        <Card variant="elevated" style={styles.menu}>
          {MENU_ITEMS.map((item) => (
            <TouchableOpacity
              key={item.name}
              style={styles.menuItem}
              onPress={() => handleNavigation(item.route)}
            >
              <item.icon
                size={20}
                color={item.name === 'Create' ? Colors.accent[500] : Colors.neutral[300]}
              />
              <Text
                variant="body1"
                color={item.name === 'Create' ? Colors.accent[500] : Colors.neutral[100]}
                style={styles.menuText}
              >
                {item.name}
              </Text>
            </TouchableOpacity>
          ))}
        </Card>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  menuButton: {
    position: 'absolute',
    top: Spacing.screen.md,
    left: Spacing.screen.md,
    zIndex: 100,
    padding: Spacing.sm,
    backgroundColor: Colors.background.card,
    borderRadius: 12,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 90,
  },
  dropdown: {
    position: 'absolute',
    top: Spacing.screen.md + 50,
    left: Spacing.screen.md,
    zIndex: 100,
    width: 200,
  },
  menu: {
    padding: Spacing.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    borderRadius: 8,
  },
  menuText: {
    marginLeft: Spacing.sm,
  },
});