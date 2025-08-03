const express = require('express');
const router = express.Router();

/**
 * Initialize routes with agent parser and OpenRouter client
 */
function createAgentsRoutes(agentParser, openrouterClient) {
  
  /**
   * GET /api/agents
   * Get all agents summary (without system prompts)
   */
  router.get('/', (req, res) => {
    try {
      const agents = agentParser.getAllAgents().map(agent => ({
        id: agent.id,
        name: agent.name,
        description: agent.description,
        color: agent.color,
        tools: agent.tools,
        department: agent.department
      }));

      res.json({
        success: true,
        data: agents,
        total: agents.length
      });
    } catch (error) {
      console.error('Error fetching agents:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch agents'
      });
    }
  });

  /**
   * GET /api/agents/departments
   * Get all departments with their agents
   */
  router.get('/departments', (req, res) => {
    try {
      const departments = agentParser.getDepartments();
      const departmentData = {};

      departments.forEach(dept => {
        departmentData[dept] = agentParser.getAgentsByDepartment(dept).map(agent => ({
          id: agent.id,
          name: agent.name,
          description: agent.description,
          color: agent.color,
          tools: agent.tools
        }));
      });

      res.json({
        success: true,
        data: departmentData,
        departments: departments
      });
    } catch (error) {
      console.error('Error fetching departments:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch departments'
      });
    }
  });

  /**
   * GET /api/agents/:agentId
   * Get specific agent details (including system prompt)
   */
  router.get('/:agentId', (req, res) => {
    try {
      const agent = agentParser.getAgentById(req.params.agentId);
      
      if (!agent) {
        return res.status(404).json({
          success: false,
          error: 'Agent not found'
        });
      }

      res.json({
        success: true,
        data: agent
      });
    } catch (error) {
      console.error('Error fetching agent:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch agent'
      });
    }
  });

  /**
   * GET /api/agents/search/:keyword
   * Search agents by keyword
   */
  router.get('/search/:keyword', (req, res) => {
    try {
      const keyword = req.params.keyword;
      const agents = agentParser.searchAgents(keyword).map(agent => ({
        id: agent.id,
        name: agent.name,
        description: agent.description,
        color: agent.color,
        tools: agent.tools,
        department: agent.department
      }));

      res.json({
        success: true,
        data: agents,
        total: agents.length,
        keyword
      });
    } catch (error) {
      console.error('Error searching agents:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to search agents'
      });
    }
  });

  /**
   * POST /api/agents/:agentId/chat
   * Chat with a specific agent
   */
  router.post('/:agentId/chat', async (req, res) => {
    try {
      const { agentId } = req.params;
      const { message, history = [], model, options = {} } = req.body;

      if (!message) {
        return res.status(400).json({
          success: false,
          error: 'Message is required'
        });
      }

      const agent = agentParser.getAgentById(agentId);
      if (!agent) {
        return res.status(404).json({
          success: false,
          error: 'Agent not found'
        });
      }

      // Prepare messages array with system prompt and conversation history
      const messages = [
        {
          role: 'system',
          content: agent.systemPrompt
        },
        ...history,
        {
          role: 'user',
          content: message
        }
      ];

      console.log(`Agent ${agentId} received message: ${message}`);

      // Send to OpenRouter with fallback mechanism
      let result = await openrouterClient.chatCompletion(messages, model, options);

      // If the requested model fails, try fallback to default reliable model
      if (!result.success && model !== 'qwen/qwen3-14b:free') {
        console.warn(`Model ${model} failed, trying fallback to qwen/qwen3-14b:free`);
        result = await openrouterClient.chatCompletion(messages, 'qwen/qwen3-14b:free', options);
      }

      if (!result.success) {
        return res.status(503).json({
          success: false,
          error: `AI model temporarily unavailable: ${result.error || 'Unknown error'}`
        });
      }

      res.json({
        success: true,
        data: {
          agent: {
            id: agent.id,
            name: agent.name,
            color: agent.color,
            department: agent.department
          },
          response: result.message,
          reasoning: result.reasoning,
          model: result.model,
          usage: result.usage
        }
      });

    } catch (error) {
      console.error('Error in chat endpoint:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  });

  return router;
}

module.exports = createAgentsRoutes;