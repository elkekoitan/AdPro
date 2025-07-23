// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add web support
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Add alias for react-native -> react-native-web on web
config.resolver.alias = {
  'react-native': 'react-native-web',
};

module.exports = config;