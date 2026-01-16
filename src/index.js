const express = require('express');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Database connection pool
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'devops_app',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Status endpoint
app.get('/status', async (req, res) => {
  try {
    // Check database connection
    const dbResult = await pool.query('SELECT NOW()');
    const dbStatus = dbResult ? 'connected' : 'disconnected';

    res.status(200).json({
      status: 'operational',
      timestamp: new Date().toISOString(),
      database: dbStatus,
      environment: process.env.NODE_ENV || 'development',
    });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(503).json({
      status: 'degraded',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error.message,
    });
  }
});

// Process endpoint
app.post('/process', async (req, res) => {
  try {
    const { data } = req.body;

    if (!data) {
      return res.status(400).json({
        error: 'Missing required field: data',
      });
    }

    // Log the processing request
    console.log(`Processing request: ${JSON.stringify(data)}`);

    // Store in database if available
    try {
      await pool.query(
        'INSERT INTO process_logs (data, created_at) VALUES ($1, NOW())',
        [JSON.stringify(data)]
      );
    } catch (dbError) {
      console.warn('Database write failed, continuing without persistence:', dbError.message);
    }

    // Simulate processing
    const processedData = {
      original: data,
      processed: true,
      timestamp: new Date().toISOString(),
      processedBy: process.env.HOSTNAME || 'unknown',
    };

    res.status(200).json({
      success: true,
      result: processedData,
    });
  } catch (error) {
    console.error('Processing error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
});

// Initialize database table on startup
async function initializeDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS process_logs (
        id SERIAL PRIMARY KEY,
        data TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('Database table initialized successfully');
  } catch (error) {
    console.warn('Database initialization failed (this is OK if DB is not available):', error.message);
  }
}

// Start server
async function startServer() {
  await initializeDatabase();

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
  });
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await pool.end();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await pool.end();
  process.exit(0);
});

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});


