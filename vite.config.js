// vite.config.js

import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
// 导入 Node.js 的 path 模块，用于处理路径别名
import path from 'path';

export default defineConfig(({ mode }) => {
  // 1. 加载环境变量
  // process.cwd() 获取当前工作目录，'' 表示加载所有环境变量
  const env = loadEnv(mode, process.cwd(), '');

  // 获取 API 前缀，默认为 /api
  const baseApi = env.VITE_APP_BASE_API || '/api';

  // 检查是否在开发模式，代理只在开发模式下启用
  const isDevelopment = mode === 'development';

  return {
    // 插件配置：启用 Vue 3 单文件组件支持
    plugins: [
      vue(),
    ],

    // 路径解析配置：设置 @ 别名
    resolve: {
      alias: {
        // 设置 @ 别名指向项目的 src 目录
        '@': path.resolve(__dirname, 'src')
      }
    },

    // 开发服务器配置
    server: {
      port: 8678,

      // 代理配置 (仅在开发环境生效)
      proxy: {
        // 动态使用环境变量 baseApi 作为代理的 key，例如 '/api'
        [baseApi]: {
          // 目标地址，即你的后端服务器地址
          target: 'http://127.0.0.1:8578',

          // 允许跨域
          changeOrigin: true,

          // 路径重写：将请求路径中的 '/api' 替换为空字符串
          rewrite: (path) => path.replace(new RegExp(`^${baseApi}`), ''),
        },
      },
    },

    // 构建配置
    build: {
      outDir: 'dist', // 默认输出目录
      // ...
    }
  };
});
