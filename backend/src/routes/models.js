const express = require('express');
const router = express.Router();

/**
 * Initialize routes with OpenRouter client
 */
function createModelsRoutes(openrouterClient) {
  
  /**
   * GET /api/models
   * Get available free models from OpenRouter
   */
  router.get('/', async (req, res) => {
    try {
      const result = await openrouterClient.getAvailableModels();

      if (!result.success) {
        return res.status(500).json({
          success: false,
          error: result.error || 'Failed to fetch models'
        });
      }

      res.json({
        success: true,
        data: result.models,
        total: result.models.length
      });
    } catch (error) {
      console.error('Error fetching models:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch models'
      });
    }
  });

  /**
   * GET /api/models/test
   * Test OpenRouter connection
   */
  router.get('/test', async (req, res) => {
    try {
      const isConnected = await openrouterClient.testConnection();

      res.json({
        success: true,
        connected: isConnected,
        message: isConnected ? 'OpenRouter connection successful' : 'OpenRouter connection failed'
      });
    } catch (error) {
      console.error('Error testing connection:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to test connection'
      });
    }
  });

  return router;
}

module.exports = createModelsRoutes;