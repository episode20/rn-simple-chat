import React, { useState } from 'react';
import { StatusBar, Image, Text } from 'react-native';
import AppLoading from 'expo-app-loading';
import { Asset } from 'expo-asset';
import * as Font from 'expo-font';

import { ThemeProvider } from 'styled-components/native';
import { theme } from './theme';

import Navigation from './navigations';

import { images } from './utils/images';

import { ProgressProvider, UserProvider } from './contexts';

const cacheImages = images => {
  return images.map(image => {
    if (typeof image === 'string') {
      console.log('test1');
      return Image.prefetch(image);
    } else {
      console.log('test2');
      return Asset.fromModule(image).downloadAsync();
    }
  });
};

const cacheFonts = fonts => {
  return fonts.map(font => Font.loadAsync(font));
};

const App = () => {
  const [isReady, setIsReady] = useState(false);

  const _loadAssets = async () => {
    const imageAssets = cacheImages([require('../assets/splash.png'), ...Object.values(images)]);
    const fontAssets = cacheFonts([]);

    await Promise.all([...imageAssets, ...fontAssets]);
  };

  return isReady ? (
    <ThemeProvider theme={theme}>
      <UserProvider>
        <ProgressProvider>
          <StatusBar barStyle="dark-content" />
          <Navigation />
        </ProgressProvider>
      </UserProvider>
    </ThemeProvider>
  ) : (
    <AppLoading startAsync={_loadAssets} onFinish={() => setIsReady(true)} onError={console.warn} />
  );
};

export default App;
