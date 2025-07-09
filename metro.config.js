const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for additional file extensions
config.resolver.assetExts.push('db');

// Add support for React Native Web
config.resolver.platforms = ['native', 'web', 'ios', 'android'];

module.exports = config; 