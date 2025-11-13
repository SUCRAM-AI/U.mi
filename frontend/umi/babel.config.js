// babel.config.js
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './',
            '@contexts': './contexts',
            '@components': './components',
            '@assets': './assets',
            '@services': './services',
            '@hooks': './hooks',
            '@config': './config',
          },
        },
      ],
    ],
  };
};