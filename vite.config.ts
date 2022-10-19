/* eslint-disable import/no-extraneous-dependencies */

import { fileURLToPath, URL } from 'url';

import 'vite-ssg';
import { defineConfig } from 'vite';
import { generateSitemap } from 'sitemap-ts';
import vue from '@vitejs/plugin-vue';
import tosource from 'tosource';
import { parse } from 'yaml';
import mdPlugin, { Mode } from 'vite-plugin-markdown';

// vite-plugin-imagemin
// import viteImagemin from 'vite-plugin-imagemin';

import { RouteRecordRaw } from 'vue-router';
import svgIcon from './plugin/svgIcon';

// https://vitejs.dev/config/
export default defineConfig({
  base: process.env.BASE_URL,
  plugins: [
    vue(),
    svgIcon(),
    {
      name: 'vite:transform-yaml:',
      transform(code, id) {
        if (!/\.ya?ml$/.test(id)) return null;

        return `const data = ${tosource(parse(code))};\nexport default data`;
      },
    },
    mdPlugin({ mode: [Mode.VUE] }),
    // viteImagemin({
    //   gifsicle: { optimizationLevel: 7, interlaced: false },
    //   optipng: { optimizationLevel: 7 },
    //   mozjpeg: { quality: 20 },
    //   pngquant: { quality: [0.8, 0.9], speed: 4 },
    //   svgo: {
    //     plugins: [
    //       { name: 'removeViewBox' },
    //       { name: 'removeEmptyAttrs', active: false },
    //     ],
    //   },
    // }),
  ],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  build: {
    terserOptions: {
      compress: {
        // Prevent Infinity from being compressed to 1/0, may cause performance issues on Chrome
        keep_infinity: true,
        drop_console: false,
      },
      format: { comments: false },
    },
    minify: 'terser',
    // Speed up packing
    brotliSize: false,
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        entryFileNames: `static/js/[name]-[hash].js`,
        chunkFileNames: `static/js/[name]-[hash].js`,
        assetFileNames: `static/[ext]/[name]-[hash].[ext]`,
      },
    },
  },
  ssgOptions: {
    rootContainerId: 'app-mount',
    formatting: 'minify',
    dirStyle: 'nested',
    script: 'async',
    onFinished() {
      generateSitemap({
        hostname: process.env.HOSTNAME || 'http://localhost/',
        robots: [{ userAgent: '*', allow: '/' }],
      });
    },
  },
});
