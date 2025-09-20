module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        alias: {
          '@': './src',
          '@/components': './src/components',
          '@/screens': './src/screens',
          '@/navigation': './src/navigation',
          '@/theme': './src/theme',
          '@/utils': './src/utils',
          '@/types': './src/types',
          '@/assets': './src/assets',
        },
      },
    ],
  ],
};
