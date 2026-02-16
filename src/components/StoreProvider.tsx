'use client';

/**
 * Redux Store Provider
 * Wraps the app with Redux store
 */

import { Provider } from 'react-redux';
import { store } from '@/store';

export function StoreProvider({ children }: { children: React.ReactNode }) {
  return <Provider store={store}>{children}</Provider>;
}

