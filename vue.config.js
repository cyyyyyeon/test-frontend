const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  lintOnSave: false, // 暂时关闭lint检查，以便开发
  devServer: {
    port: 8080,
    proxy: {
      '/api': {
        target: 'http://10.60.38.173:59090',
        changeOrigin: true,
        pathRewrite: {
          '^/api': ''
        }
      }
    }
  }
}) 