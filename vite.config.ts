import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import wasm from 'vite-plugin-wasm';
import ckeditor5 from '@ckeditor/vite-plugin-ckeditor5';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react(), wasm(), ckeditor5({theme: require.resolve('@ckeditor/ckeditor5-theme-lark')})],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    optimizeDeps: {
        include: ['notistack'],
    },
    build: {
        target: 'esnext',
    },
});
