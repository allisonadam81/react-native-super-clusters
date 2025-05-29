const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');
/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const extraNodeModules = {
  '@allisonadam81/react-native-super-clusters': path.resolve(__dirname, '../lib'),
};
const watchFolders = [path.resolve(__dirname, '../lib')];
const config = { resolver: { extraNodeModules }, watchFolders };

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
