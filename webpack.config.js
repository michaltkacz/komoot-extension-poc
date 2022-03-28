const path = require('path');
// const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin').CleanWebpackPlugin;
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const mode =
  process.env.NODE_ENV === 'development' ? 'development' : 'production';

module.exports = {
  mode: mode,
  entry: {
    popup: path.join(__dirname, 'src', 'ts', 'popup.ts'),
    options: path.join(__dirname, 'src', 'ts', 'options.ts'),
    content: path.join(__dirname, 'src', 'ts', 'content.ts'),
    background: path.join(__dirname, 'src', 'ts', 'background.ts'),
  },
  output: {
    path: path.join(__dirname, 'build'),
    filename: '[name].js',
  },
  module: {
    rules: [
      {
        test: /\.html$/,
        use: 'html-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
              modules: true,
            },
          },
        ],
        include: /\.module\.css$/,
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
        exclude: /\.module\.css$/,
      },
      {
        test: /.(jpg|jpeg|png|gif|svg)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
            },
          },
        ],
        exclude: /node_modules/,
      },
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    // new MiniCssExtractPlugin(),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.join(__dirname, 'src', 'manifest.json'),
          transform: function (content, absoluteFrom) {
            return Buffer.from(
              JSON.stringify({
                ...JSON.parse(content.toString()),
                version: process.env.npm_package_version,
              })
            );
          },
        },
      ],
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'src', 'html', 'popup.html'),
      filename: 'popup.html',
      chunks: ['popup'],
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'src', 'html', 'options.html'),
      filename: 'options.html',
      chunks: ['options'],
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'src', 'html', 'content.html'),
      filename: 'content.html',
      chunks: ['content'],
    }),
  ],
  resolve: {
    extensions: ['.ts', '.js'],
  },
  devtool: false,
  // stats: {
  //   errorDetails: true,
  //   children: true,
  // },
};
