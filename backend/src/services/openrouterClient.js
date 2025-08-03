const axios = require('axios');
const config = require('../config');

class OpenRouterClient {
  constructor() {
    this.baseURL = config.openrouterBaseUrl;
    this.apiKey = config.openrouterApiKey;
    this.defaultModel = config.defaultModel;
    
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://ai-agents-backend.local',
        'X-Title': 'AI Agents Backend'
      }
    });
  }

  /**
   * Send a chat completion request to OpenRouter
   * @param {Array} messages - Array of chat messages
   * @param {string} model - Model to use (defaults to configured default)
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Response from OpenRouter
   */
  async chatCompletion(messages, model = null, options = {}) {
    try {
      const requestData = {
        model: model || this.defaultModel,
        messages,
        max_tokens: options.maxTokens || 2000,
        temperature: options.temperature || 0.7,
        stream: options.stream || false,
        ...options
      };

      console.log(`Making request to OpenRouter with model: ${requestData.model}`);
      
      const response = await this.client.post('/chat/completions', requestData);
      
      if (response.data && response.data.choices && response.data.choices.length > 0) {
        return {
          success: true,
          data: response.data,
          message: response.data.choices[0].message.content,
          reasoning: response.data.choices[0].message.reasoning || null,
          usage: response.data.usage,
          model: response.data.model
        };
      } else {
        throw new Error('Invalid response format from OpenRouter');
      }
    } catch (error) {
      console.error('OpenRouter API Error:', error.response?.data || error.message);
      
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message,
        status: error.response?.status || 500
      };
    }
  }

  /**
   * Get available models from OpenRouter
   * @returns {Promise<Array>} Array of available models
   */
  async getAvailableModels() {
    try {
      const response = await this.client.get('/models');
      const freeModels = response.data.data.filter(model => 
        model.pricing.prompt === "0" || config.freeModels.includes(model.id)
      );
      
      return {
        success: true,
        models: freeModels.map(model => ({
          id: model.id,
          name: model.name,
          contextLength: model.context_length,
          description: model.description
        }))
      };
    } catch (error) {
      console.error('Error fetching models:', error.message);
      return {
        success: false,
        error: error.message,
        models: []
      };
    }
  }

  /**
   * Test the connection to OpenRouter
   * @returns {Promise<boolean>} True if connection is successful
   */
  async testConnection() {
    try {
      const testMessage = [{
        role: 'user',
        content: 'Hello! This is a connection test.'
      }];

      const result = await this.chatCompletion(testMessage, this.defaultModel, { maxTokens: 10 });
      return result.success;
    } catch (error) {
      console.error('Connection test failed:', error.message);
      return false;
    }
  }
}

module.exports = OpenRouterClient;