import React from 'react';
import { Pressable, StyleProp, StyleSheet, Text, TextStyle, ViewStyle } from 'react-native';

type ActionButtonProps = {
  title: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'nav' | 'green';
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

export function ActionButton({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  style,
  textStyle,
}: ActionButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.base,
        variant === 'primary' && styles.primary,
        variant === 'secondary' && styles.secondary,
        variant === 'ghost' && styles.ghost,
        variant === 'nav' && styles.nav,
        variant === 'green' && styles.green,
        disabled && styles.disabled,
        style,
      ]}>
      <Text
        style={[
          styles.text,
          variant === 'primary' && styles.primaryText,
          variant === 'secondary' && styles.secondaryText,
          variant === 'ghost' && styles.ghostText,
          variant === 'nav' && styles.navText,
          variant === 'green' && styles.greenText,
          textStyle,
        ]}>
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 18,
  },
  primary: {
    backgroundColor: '#22c55e',
  },
  secondary: {
    backgroundColor: '#182544',
    borderWidth: 1,
    borderColor: '#3a4f85',
  },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#2d407a',
  },
  nav: {
    backgroundColor: '#182544',
    borderWidth: 1,
    borderColor: '#3a4f85',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  green: {
    backgroundColor: '#22c55e',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontWeight: '800',
    fontSize: 15,
  },
  primaryText: {
    color: '#101a31',
  },
  secondaryText: {
    color: '#edf4ff',
  },
  ghostText: {
    color: '#ffb703',
  },
  navText: {
    color: '#edf4ff',
    fontSize: 12,
  },
  greenText: {
    color: '#101a31',
    fontSize: 12,
  },
});
