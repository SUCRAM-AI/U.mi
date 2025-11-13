// metro.config.js

const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const defaultConfig = getDefaultConfig(__dirname);

module.exports = {
  ...defaultConfig,
  transformer: {
    ...defaultConfig.transformer,
    // Adiciona o transformador de SVG
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
  },
  resolver: {
    ...defaultConfig.resolver,
    // Adiciona o tipo de arquivo '.svg' ao resolver
    assetExts: defaultConfig.resolver.assetExts.filter((ext) => ext !== 'svg'),
    sourceExts: [...defaultConfig.resolver.sourceExts, 'svg'],
    // Adiciona suporte para aliases
    alias: {
      '@': path.resolve(__dirname, './'),
      '@contexts': path.resolve(__dirname, './contexts'),
      '@components': path.resolve(__dirname, './components'),
      '@assets': path.resolve(__dirname, './assets'),
      '@services': path.resolve(__dirname, './services'),
      '@hooks': path.resolve(__dirname, './hooks'),
      '@config': path.resolve(__dirname, './config'),
    },
  },
};