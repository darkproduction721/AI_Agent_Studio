const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');

/**
 * Rate limiting configuration
 */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.'
  }
});

/**
 * Chat-specific rate limiting (more restrictive)
 */
const chatLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // limit each IP to 10 chat requests per minute
  message: {
    success: false,
    error: 'Too many chat requests, please slow down.'
  }
});

/**
 * CORS configuration
 */
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-frontend-domain.com'] 
    : ['http://localhost:3000', 'http://localhost:5173'], // Common React dev servers
  credentials: true,
  optionsSuccessStatus: 200
};

/**
 * Apply all middleware
 */
function applyMiddleware(app) {
  // Security middleware
  app.use(helmet());
  
  // CORS
  app.use(cors(corsOptions));
  
  // Logging
  if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('combined'));
  }
  
  // Rate limiting
  app.use('/api', limiter);
  app.use('/api/agents/*/chat', chatLimiter);
  
  // Body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
}

module.exports = {
  applyMiddleware,
  limiter,
  chatLimiter
};