const path = require("path");
const webpack = require("webpack");

module.exports = {
  target: "node",
  entry: { main: "./src/main.ts", bin: "./src/bin.ts" },

  output: {
    path: path.join(__dirname, "dst"),
    filename: "[name].js",
    library: {
      name: "stlap",
      type: "umd",
    },
  },

  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  plugins: [
    new webpack.BannerPlugin({
      banner: "#!/usr/bin/env node",
      raw: true,
      include: "bin.js",
    }),
  ],
};
