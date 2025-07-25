import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    }
  },
  build: {
    // 输出目录
    outDir: 'dist',
    // 清空输出目录
    emptyOutDir: true,
    // 启用/禁用 sourcemap
    sourcemap: false, // 生产环境关闭 sourcemap，开发时可以设为 true
    // 代码分割阈值
    chunkSizeWarningLimit: 1000,
    // Rollup 选项
    rollupOptions: {
      output: {
        // 手动分割代码
        manualChunks: {
          // 将 Vue 相关库打包为单独的 chunk
          vue: ['vue', 'vue-router', 'pinia'],
          // 将 UI 库打包为单独的 chunk
          'element-plus': ['element-plus', '@element-plus/icons-vue'],
          // 将工具库打包为单独的 chunk
          utils: ['axios', 'fast-xml-parser', 'jsonpath-plus', 'xmldom', 'xpath']
        },
        // 配置文件名
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          // 根据文件类型分别放到不同目录
          const info = assetInfo.name?.split('.') ?? []
          const ext = info[info.length - 1]
          if (/\.(mp4|webm|ogg|mp3|wav|flac|aac)$/.test(assetInfo.name ?? '')) {
            return `media/[name]-[hash][extname]`
          }
          if (/\.(png|jpe?g|gif|svg)$/.test(assetInfo.name ?? '')) {
            return `images/[name]-[hash][extname]`
          }
          if (ext === 'css') {
            return `css/[name]-[hash][extname]`
          }
          return `assets/[name]-[hash][extname]`
        }
      }
    },
    // 压缩选项
    minify: 'terser',
    terserOptions: {
      compress: {
        // 生产环境移除 console
        drop_console: true,
        drop_debugger: true,
        // 移除未使用的代码
        pure_funcs: ['console.log', 'console.info'],
      },
      mangle: {
        // 混淆变量名
        safari10: true,
      },
      format: {
        // 移除注释
        comments: false,
      },
    },
    // 启用 CSS 代码分割
    cssCodeSplit: true,
    // 构建目标
    target: 'es2015',
    // 启用 gzip 压缩提示
    reportCompressedSize: true,
  },
  // 开发服务器配置
  server: {
    port: 3000,
    open: true,
    cors: true,
  },
  // 预览服务器配置
  preview: {
    port: 4173,
  },
})
