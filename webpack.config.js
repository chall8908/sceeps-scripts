var path = require('path');

module.exports = {
  // entry: ['babel-polyfill', './src/main.js'],
  entry: './src/main.js',
  target: 'node',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'build')
  },
  module: {
    rules: [
      { test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['env', {
                targets: { node: '6.6.0' }
              }]
            ]
          }
        }
      }
    ]
  },
  externals: {
    'lodash' : 'commonjs lodash'
  }
};
