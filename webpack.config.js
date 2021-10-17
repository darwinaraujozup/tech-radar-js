"use strict";

const path = require("path");
const buildPath = path.join(__dirname, "./dist");
const args = require("yargs").argv;
const {CleanWebpackPlugin} = require("clean-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

let outputPath = "_build";

let main = ["./src/site.js"];
let common = ["./src/common.js"];
let devtool;
let isDev = args.dev;

if (isDev) {
  main.push("webpack-dev-server/client?http://0.0.0.0:8080");
  devtool = "source-map";
}

let plugins = [
  new MiniCssExtractPlugin({
    filename: "[name].[fullhash].css",
  }),
  new HtmlWebpackPlugin({
    template: "./src/index.html",
    chunks: ["main"],
    inject: "body",
    minify: false
  }),
  new CleanWebpackPlugin()
];

module.exports = {
  entry: {
    main: main,
    common: common
  },
  output: {
    path: path.resolve(process.cwd(), outputPath),
    filename: "[name].[fullhash].js",
  },
  mode: "development",

  module: {
    rules: [
      // { 
      //   test: /\.json$/,  
      //   use: {
      //     loader: "json-loader"
      //   }
      // },
      {
        test: /\.scss$/,
        exclude: /node_modules/,
        use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"]
      },
      {
        test: /\.(png|jpg|ico)$/,
        exclude: /node_modules/,
        type: "asset/resource"
      }
    ]
  },

  plugins: plugins,
  devtool: devtool,

  devServer: {
    host: "0.0.0.0",
    compress: true, 
    port: 8080
  }
};
