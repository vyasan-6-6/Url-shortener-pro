import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import apiRoutes from './routes/index.js';
import { redirectToOriginal, getUrlStats } from './controllers/urlController.js';
import { errorHandler } from './middlewares/errorHandler.js';

connectDB();

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/', apiRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'URL Shortener API is healthy and running',
    timestamp: new Date().toISOString()
  });
});

app.get('/stats/:shortCode', getUrlStats);
app.get('/:shortCode', redirectToOriginal);

app.use((req, res, next) => {
  res.status(404).json({
    status: 'error',
    message: `Route not found: ${req.originalUrl}`
  });
});

app.use(errorHandler);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
