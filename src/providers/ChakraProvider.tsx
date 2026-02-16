'use client';

/**
 * Chakra UI Provider (v2)
 * Wraps the app with Chakra UI theme and configuration
 */

import { ChakraProvider as ChakraUIProvider, extendTheme, type ThemeConfig } from '@chakra-ui/react';

// Theme configuration
const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: false,
};

// Dropbox-inspired theme
const theme = extendTheme({
  config,
  colors: {
    brand: {
      50: '#e6f2ff',
      100: '#baddff',
      200: '#8dc9ff',
      300: '#5bb4ff',
      400: '#2ea0ff',
      500: '#0061ff', // Dropbox blue
      600: '#0055e6',
      700: '#0047b3',
      800: '#003880',
      900: '#002a4d',
    },
  },
  fonts: {
    heading: `-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif`,
    body: `-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif`,
  },
  styles: {
    global: {
      body: {
        bg: 'gray.50',
      },
    },
  },
});

export function ChakraProvider({ children }: { children: React.ReactNode }) {
  return <ChakraUIProvider theme={theme}>{children}</ChakraUIProvider>;
}

