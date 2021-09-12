const path = require("path");
module.exports = {
  target: "node",
  mode: "development",
  entry: { main: "./src/main.ts", bin: "./src/bin.ts" },

  output: {
    path: path.join(__dirname, "dst"),
    filename: "[name].js",
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
};
