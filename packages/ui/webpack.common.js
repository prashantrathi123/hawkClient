const path = require('path');

module.exports = {
  mode: 'production',
  entry: './src/index.js',
  devtool: false,
  target: 'electron-renderer',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              [
                '@babel/preset-env', 
                {
                  targets: {
                    esmodules: true,
                  },
                },
              ],
              '@babel/preset-react',
            ],
          },
        },
      },
      {
        test: [/\.s[ac]ss$/i, /\.css$/i],
        use: [
          'style-loader', // Creates `style` nodes from JS strings
          'css-loader',   // Translates CSS into CommonJS
          'sass-loader',  // Compiles Sass to CSS
        ],
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[path][name].[ext]',
              outputPath: 'images',
              publicPath: 'images',
            },
          },
        ],
      },
    ],
  },
  // resolve: {
  //   extensions: ['.js'],
  // },
  output: {
    filename: 'app.js',
    path: path.resolve(__dirname, '../electron/web', 'js'),
  },
  resolve: {
    extensions: ['.js'],
    fallback: {
      fs: false, // Provide an empty module for 'fs'
      system: false,
      file: false
    },
    alias: {
      'pdfjs-dist/build/pdf.worker.entry': require.resolve('pdfjs-dist/build/pdf.worker.entry'),
    },
  },
};
