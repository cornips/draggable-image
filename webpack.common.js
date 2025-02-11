const path = require('path');

module.exports = {
  entry: {
    app: './js/app.js',
    'draggable-image.min': './js/draggable-image.js',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    clean: true,
    filename: './js/[name].js',
  },
  optimization: {
    minimize: true
  }
};
