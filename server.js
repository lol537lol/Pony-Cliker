const express = require('express');
const path = require('path');

const app = express();
const PORT = 8080; // Укажите нужный порт

// Статические файлы
app.use(express.static(path.join(__dirname, 'public'))); // Укажите папку с вашими статическими файлами

app.get('/', (req, res) => {
    if (req.hostname === 'localhost' || req.hostname === '127.0.0.1') {
        res.redirect(`http://localhost:${PORT}`);
    } else {
        res.sendFile(path.join(__dirname, 'public', 'index.html')); // Укажите путь к вашему HTML-файлу
    }
});

app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});
