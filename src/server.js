const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const morgan = require('morgan');
const { createProxyMiddleware } = require('http-proxy-middleware');

const logStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });

// Настраиваем morgan на запись в файл журнала
app.use(morgan('combined', { stream: logStream }));

require('dotenv').config();


const corsOptions = {
    origin: 'http://localhost:3000'
};

app.use(cors(corsOptions));


// Здесь вы должны указать ключ API (или JWT токен) для Yandex SpeechKit
const YANDEX_API_KEY = process.env.YANDEX_API_KEY;

const proxyOptions = {
    target: 'https://stt.api.cloud.yandex.net/speech/v1/stt:recognize?topic=general', // URL Yandex SpeechKit API
    changeOrigin: true,
    pathRewrite: {
        '/speechkit': '',
    },
    onProxyReq: (proxyReq, req, res) => {
        proxyReq.path = `https://stt.api.cloud.yandex.net/speech/v1/stt:recognize?topic=general`;

        proxyReq.setHeader('Authorization', `Api-Key AQVNwCGJU5ig_17yfiOwJrhKojbesdqV2UEx1ho2`);
        // proxyReq.setHeader('Content-Type', 'multipart/form-data');
        proxyReq.setHeader('Access-Control-Allow-Origin', '*');
    },
};

const proxy2Options = {
    target: 'http://185.241.194.125:8080/api/get-summarize',
    pathRewrite: {
        '/sum': '',
    },
    changeOrigin: true,
    onProxyReq: (proxyReq, req, res) => {
        proxyReq.setHeader('Access-Control-Allow-Origin', '*');
    },
};

// Использование прокси для обращения к Yandex SpeechKit API
app.use('/speechkit', createProxyMiddleware(proxyOptions));
app.use('/sum', createProxyMiddleware(proxy2Options));

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
