const { defineConfig } = require("@vue/cli-service");
const { VuetifyPlugin } = require("webpack-plugin-vuetify");

module.exports = defineConfig({
  transpileDependencies: true,

  devServer: {
    allowedHosts: "all",
    proxy: {
      "/api": {
        target: process.env.VUE_APP_API_URL,
        changeOrigin: true,
        pathRewrite: {
          "^/api": "",
        },
      },
    },
  },

  pluginOptions: {
    vuetify: {
      styles: { configFile: "src/settings.scss" },
      // https://github.com/vuetifyjs/vuetify-loader/tree/next/packages/vuetify-loader
    },
  },
});
``;
