// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// Find the project and workspace directories
const projectRoot = __dirname;
// This can be replaced with `find-yarn-workspace-root`
const workspaceRoot = path.resolve(projectRoot, '../');

const config = getDefaultConfig(projectRoot);

// 1. Watch all files within the monorepo
config.watchFolders = [workspaceRoot];
// 2. Let Metro know where to resolve packages and in what order
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];
// 3. Force Metro to resolve (sub)dependencies only from the `nodeModulesPaths`
config.resolver.disableHierarchicalLookup = true;

// Add additional optimizations for production
if (process.env.APP_ENV === 'production') {
  // Enable minification
  config.transformer.minifierConfig = {
    compress: {
      drop_console: true,
      drop_debugger: true,
      global_defs: {
        __DEV__: false,
      },
    },
  };

  // Enable RAM bundles for better performance
  config.bundleOutput = {
    ...config.bundleOutput,
    enableRAMBundles: true,
  };

  // Configure caching
  config.cacheStores = [
    ...config.cacheStores,
    {
      name: 'persistent',
      get: async (key) => {
        // Implement persistent cache retrieval
      },
      set: async (key, value) => {
        // Implement persistent cache storage
      },
    },
  ];
}

module.exports = config;