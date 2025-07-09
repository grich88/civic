/**
 * @format
 */

import { registerRootComponent } from 'expo';
import { activateKeepAwake } from 'expo-keep-awake';

import App from './App';

// Keep the app awake during development
if (__DEV__) {
  activateKeepAwake();
}

// Register the main component
registerRootComponent(App); 