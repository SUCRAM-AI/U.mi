// metro.config.js

const { getDefaultConfig } = require('expo/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

module.exports = {
  transformer: {
    // Adiciona o transformador de SVG
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
  },
  resolver: {
    // Adiciona o tipo de arquivo '.svg' ao resolver
    assetExts: defaultConfig.resolver.assetExts.filter((ext) => ext !== 'svg'),
    sourceExts: [...defaultConfig.resolver.sourceExts, 'svg'],
  },
};