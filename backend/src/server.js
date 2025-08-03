const express = require('express');
const path = require('path');

// Load environment variables
require('dotenv').config();

// Import configuration and utilities
const config = require('./config');
const { applyMiddleware } = require('./middleware');
const AgentParser = require('./utils/agentParser');
const OpenRouterClient = require('./services/openrouterClient');

// Import route factories
const createAgentsRoutes = require('./routes/agents');
const createModelsRoutes = require('./routes/models');

class AIAgentsServer {
  constructor() {
    this.app = express();
    this.agentParser = new AgentParser(config.agentsPath);
    this.openrouterClient = new OpenRouterClient();
  }

  async initialize() {
    try {
      // Apply middleware
      applyMiddleware(this.app);

      // Load all agents
      console.log('Loading agents from:', config.agentsPath);
      await this.agentParser.loadAllAgents();

      // Test OpenRouter connection
      console.log('Testing OpenRouter connection...');
      const isConnected = await this.openrouterClient.testConnection();
      if (isConnected) {
        console.log('✓ OpenRouter connection successful');
      } else {
        console.warn('⚠ OpenRouter connection failed - some features may not work');
      }

      // Setup routes
      this.setupRoutes();

      console.log('✓ Server initialized successfully');
    } catch (error) {
      console.error('Failed to initialize server:', error);
      process.exit(1);
    }
  }

  setupRoutes() {
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.json({
        success: true,
        message: 'AI Agents Backend is running',
        timestamp: new Date().toISOString(),
        agentsLoaded: this.agentParser.getAllAgents().length,
        departments: this.agentParser.getDepartments().length
      });
    });

    // API routes
    this.app.use('/api/agents', createAgentsRoutes(this.agentParser, this.openrouterClient));
    this.app.use('/api/models', createModelsRoutes(this.openrouterClient));

    // API info endpoint
    this.app.get('/api', (req, res) => {
      res.json({
        success: true,
        message: 'AI Agents API',
        version: '1.0.0',
        endpoints: {
          agents: {
            'GET /api/agents': 'Get all agents',
            'GET /api/agents/departments': 'Get agents by department',
            'GET /api/agents/:agentId': 'Get specific agent',
            'GET /api/agents/search/:keyword': 'Search agents',
            'POST /api/agents/:agentId/chat': 'Chat with agent'
          },
          models: {
            'GET /api/models': 'Get available models',
            'GET /api/models/test': 'Test OpenRouter connection'
          },
          system: {
            'GET /health': 'Health check',
            'GET /api': 'API information'
          }
        }
      });
    });

    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        availableEndpoints: '/api'
      });
    });

    // Error handler
    this.app.use((error, req, res, next) => {
      console.error('Unhandled error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    });
  }

  async start() {
    await this.initialize();
    
    this.server = this.app.listen(config.port, () => {
      console.log(`
╔══════════════════════════════════════════════════╗
║              AI Agents Backend                   ║
║                                                  ║
║  🚀 Server running on http://localhost:${config.port}     ║
║  📚 API docs available at /api                   ║
║  ❤️  Health check at /health                     ║
║                                                  ║
║  Agents loaded: ${this.agentParser.getAllAgents().length.toString().padEnd(2, ' ')}                            ║
║  Departments: ${this.agentParser.getDepartments().length.toString().padEnd(2, ' ')}                              ║
║  Environment: ${config.nodeEnv.padEnd(11, ' ')}                 ║
╚══════════════════════════════════════════════════╝
      `);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => this.shutdown());
    process.on('SIGINT', () => this.shutdown());
  }

  shutdown() {
    console.log('\n🛑 Shutting down server gracefully...');
    if (this.server) {
      this.server.close(() => {
        console.log('✓ Server closed');
        process.exit(0);
      });
    } else {
      process.exit(0);
    }
  }
}

// Start the server
if (require.main === module) {
  const server = new AIAgentsServer();
  server.start().catch(error => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });
}

module.exports = AIAgentsServer;