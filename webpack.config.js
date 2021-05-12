const path = require("path");

module.exports = {
  entry: {
    labyrint: "./labyrint.jsx",
  },
  output: {
    path: path.resolve(__dirname, "public", "build"),
    filename: "[name].js",
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env", "@babel/preset-react"],
          },
        },
      },
    ],
  },
  devServer: {
    contentBase: "./public",
  },
};
