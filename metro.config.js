const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

config.resolver.assetExts = config.resolver.assetExts.concat([
  "glb",
  "gltf",
  "bin",
]);

module.exports = config;