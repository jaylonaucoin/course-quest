const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Define platform-specific module replacements
const ALIASES = {
  'react-native-maps': 'react-native-web-maps',
};

// Initialize resolver configuration
config.resolver = {
  ...config.resolver,
  blockList: [/react-native-maps\/lib\/MapMarkerNativeComponent\.js$/],
  resolveRequest: (context, moduleName, platform) => {
    if (platform === 'web') {
      // Replace react-native-maps with react-native-web-maps on web
      const replacement = ALIASES[moduleName];
      if (replacement) {
        return context.resolveRequest(context, replacement, platform);
      }
    }
    // Use default resolver for all other cases
    return context.resolveRequest(context, moduleName, platform);
  }
};

module.exports = withNativeWind(config, { input: "./global.css" });
