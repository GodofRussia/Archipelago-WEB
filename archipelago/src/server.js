const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const app = express();

require('dotenv').config();

// Здесь вы должны указать ключ API (или JWT токен) для Yandex SpeechKit
const YANDEX_API_KEY = process.env.YANDEX_API_KEY;

const proxyOptions = {
    target: 'https://stt.api.cloud.yandex.net/speech/v1/stt:recognize?topic=general', // URL Yandex SpeechKit API
    changeOrigin: true,
    pathRewrite: {
        '^/speechkit': '', // Перепишите путь запроса так, чтобы убрать префикс
    },
    onProxyReq: (proxyReq, req, res) => {
        // Добавляем заголовок авторизации к перенаправляемому запросу
        proxyReq.setHeader('Authorization', `Api-Key ${YANDEX_API_KEY}`);
    },
};

// Использование прокси для обращения к Yandex SpeechKit API
app.use('/speechkit', createProxyMiddleware(proxyOptions));

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
