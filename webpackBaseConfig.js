const path = require('path');

// This module isn't used to build the documentation. We use Next.js for that.
// This module is used by the visual regression tests to run the demos.
module.exports = {
  context: path.resolve(__dirname),
  resolve: {
    modules: [__dirname, 'node_modules'],
    alias: {
      '@mui/docs': path.resolve(__dirname, './node_modules/@mui/monorepo/packages/mui-docs/src'),
      '@mui/x-data-grid': path.resolve(__dirname, './packages/x-data-grid/src'),
      '@mui/x-data-grid-generator': path.resolve(__dirname, './packages/x-data-grid-generator/src'),
      '@mui/x-data-grid-pro': path.resolve(__dirname, './packages/x-data-grid-pro/src'),
      '@mui/x-data-grid-premium': path.resolve(__dirname, './packages/x-data-grid-premium/src'),
      '@mui/x-adapter-date-fns-v2': path.resolve(
        __dirname,
        './packages/adapters/x-adapter-date-fns-v2/src',
      ),
      '@mui/x-adapter-date-fns-v3': path.resolve(
        __dirname,
        './packages/adapters/x-adapter-date-fns-v3/src',
      ),
      '@mui/x-date-pickers': path.resolve(__dirname, './packages/x-date-pickers/src'),
      '@mui/x-date-pickers-pro': path.resolve(__dirname, './packages/x-date-pickers-pro/src'),
      '@mui/x-charts': path.resolve(__dirname, './packages/x-charts/src'),
      '@mui/x-tree-view': path.resolve(__dirname, './packages/x-tree-view/src'),
      '@mui/x-tree-view-pro': path.resolve(__dirname, './packages/x-tree-view-pro/src'),
      '@mui/x-license': path.resolve(__dirname, './packages/x-license/src'),
      '@mui/material-nextjs': path.resolve(
        __dirname,
        './node_modules/@mui/monorepo/packages/mui-material-nextjs/src',
      ),

      '@mui-internal/test-utils': path.resolve(
        __dirname,
        './node_modules/@mui/monorepo/packages/test-utils/src',
      ),
      docs: path.resolve(__dirname, './node_modules/@mui/monorepo/docs'),
      docsx: path.resolve(__dirname, './docs'),
    },
    extensions: ['.js', '.ts', '.tsx', '.d.ts'],
  },
  output: {
    path: path.join(__dirname, 'build'),
    filename: 'bundle.js',
    publicPath: '/build/',
  },
  target: 'web',
  module: {
    rules: [
      {
        test: /\.(js|ts|tsx)$/,
        exclude: /node_modules\/(?!@mui)/,
        loader: 'babel-loader',
        options: {
          cacheDirectory: true,
        },
      },
      {
        test: /\.md$/,
        loader: 'raw-loader',
      },
      {
        test: /\.(ts|tsx)$/,
        loader: 'string-replace-loader',
        options: {
          search: '__RELEASE_INFO__',
          replace: 'MTU5NjMxOTIwMDAwMA==', // 2020-08-02
        },
      },
    ],
  },
};
