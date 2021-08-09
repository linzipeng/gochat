const CompressionPlugin = require("compression-webpack-plugin");

module.exports = {
  publicPath: "./",
  devServer: {
    sockHost: "http://localhost:8080/",
    port: 8989,
    disableHostCheck: true,
    https: true,
  },
  productionSourceMap: false,
  pwa: {
    iconPaths: {
      favicon32: "favicon.ico",
      favicon16: "favicon.ico",
      appleTouchIcon: "favicon.ico",
      maskIcon: "favicon.ico",
      msTileImage: "favicon.ico",
    },
  },
  configureWebpack: (config) => {
    if (process.env.NODE_ENV === "production") {
      config.optimization.minimizer[0].options.terserOptions.compress.warnings = false;
      config.optimization.minimizer[0].options.terserOptions.compress.drop_console = false;
      config.optimization.minimizer[0].options.terserOptions.compress.drop_debugger = true;
      config.optimization.minimizer[0].options.terserOptions.compress.pure_funcs =
        ["console.log"];

      return {
        plugins: [
          new CompressionPlugin({
            test: /\.js$|\.html$|\.css/, //匹配文件名
            threshold: 10240, //对超过10k的数据进行压缩
            deleteOriginalAssets: false, //是否删除原文件
          }),
        ],
      };
    } else if (process.env.NODE_ENV === "test") {
      config.optimization.minimizer[0].options.terserOptions.compress.warnings = false;
      config.optimization.minimizer[0].options.terserOptions.compress.drop_console = false;
      config.optimization.minimizer[0].options.terserOptions.compress.drop_debugger = true;
      config.optimization.minimizer[0].options.terserOptions.compress.pure_funcs =
        ["console.log"];
    }
    //console.log(config.module.rules);
  },
};
