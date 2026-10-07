const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

if (!config.resolver.assetExts.includes('ttf')) {
  config.resolver.assetExts.push('ttf');
}

// Limitar concurrencia de workers para evitar Out Of Memory en Node.js de Windows
config.maxWorkers = 2;

module.exports = config;
