module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // React Native Reanimated plugin (must be listed last)
      'react-native-reanimated/plugin',
      // Module resolver for absolute imports
      [
        'module-resolver',
        {
          root: ['./src'],
          extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
          alias: {
            '@': './src',
          },
        },
      ],
      // Transform paths for production optimization
      [
        'transform-remove-console',
        {
          exclude: ['error', 'warn', 'info'],
        },
      ],
    ],
    env: {
      production: {
        plugins: [
          'transform-remove-console',
          // Additional production-only optimizations
          'transform-react-remove-prop-types',
          [
            'transform-react-constant-elements',
            {
              allowMutablePropsOnTags: ['FormattedMessage'],
            },
          ],
        ],
      },
      development: {
        plugins: [
          // Development-only plugins
        ],
      },
    },
  };
};