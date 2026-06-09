import express from 'express';
import 'dotenv/config';
import cors from 'cors';

import { connectMongoDB } from './db/connectMongoDB.js';

import { logger } from './middleware/logger.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import { errorHandler } from './middleware/errorHandler.js';

import notesRoutes from './routes/notesRoutes.js'

const app = express();
const PORT = process.env.PORT || 3000;

app.use(logger); //1. Логер прешим бачить всі запити
app.use(express.json()); //2. Парсинг JSON-тіла
app.use(cors()); //3. Дозвіл для запитів з інших доменів

app.use(notesRoutes);

// 404 - якщо маршрут не знайдено
app.use(notFoundHandler);

// Error - якщо під час запиту виникла помилка
app.use(errorHandler);

// підключення до MongoDB
await connectMongoDB();

// запуск сервера
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
