import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

import authRoutes from './src/routes/authRoutes.js';
import taskRoutes from './src/routes/taskRoutes.js';
import { globalErrorHandler } from './src/middleware/errorHandler.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Step 5: Reference the MongoDB container by its Docker Compose service name ("mongodb")
const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongodb:27017/taskdb';

// Middleware Pipeline
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Container Health & Diagnostic Endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    container: 'task-backend',
    practical: 'Practical 11: Containerization with Docker and Docker Compose',
    student: 'Maitri Sheta',
    studentId: 'D25CS120',
    mongoUri: MONGO_URI,
    mongoConnected: mongoose.connection.readyState === 1,
    network: 'app-network',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        me: 'GET /api/auth/me (Bearer Token required)'
      },
      tasks: {
        list: 'GET /api/tasks (Bearer Token required)',
        create: 'POST /api/tasks (Bearer Token required)',
        update: 'PUT /api/tasks/:id (Bearer Token required)',
        delete: 'DELETE /api/tasks/:id (Bearer Token required)'
      },
      health: 'GET /api/health'
    }
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    service: 'backend',
    container: 'task-backend',
    database: {
      status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      host: mongoose.connection.host || 'mongodb'
    }
  });
});

// Mount Routes
app.use('/tasks', taskRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/auth', authRoutes);

// 404 Fallback
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Endpoint ${req.method} ${req.originalUrl} not found.`
  });
});

// Central Global Error Handler
app.use(globalErrorHandler);

// Connect to MongoDB & Start Server
const connectWithRetry = () => {
  console.log(`Connecting to MongoDB at ${MONGO_URI} (Docker Compose service name)...`);
  mongoose.connect(MONGO_URI)
    .then(() => {
      console.log(`✔ Connected successfully to MongoDB container: ${MONGO_URI}`);
      app.listen(PORT, '0.0.0.0', () => {
        console.log(`✔ Practical 11 Backend running on port ${PORT}`);
        console.log(`✔ Student: Maitri Sheta (ID: D25CS120)`);
        console.log(`✔ Container Network: app-network`);
      });
    })
    .catch((err) => {
      console.error(`MongoDB connection error: ${err.message}`);
      console.log('Retrying MongoDB connection in 5 seconds...');
      setTimeout(connectWithRetry, 5000);
    });
};

connectWithRetry();

export default app;
