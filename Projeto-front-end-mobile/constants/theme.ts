/**
 * Paleta visual premium do app CINE MAX.
 */

import { Platform } from 'react-native';

const tintColorLight = '#22c55e';
const tintColorDark = '#22c55e';

export const Colors = {
  light: {
    text: '#f8f9ff',
    background: '#0b1020',
    tint: tintColorLight,
    icon: '#bbc3ff',
    tabIconDefault: '#8b92bf',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#f8f9ff',
    background: '#0b1020',
    tint: tintColorDark,
    icon: '#bbc3ff',
    tabIconDefault: '#8b92bf',
    tabIconSelected: tintColorDark,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
