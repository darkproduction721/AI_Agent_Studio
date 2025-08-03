import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const agentsAPI = {
  // Get all agents
  getAllAgents: async () => {
    const response = await api.get('/agents');
    return response.data;
  },

  // Get agents by department
  getDepartments: async () => {
    const response = await api.get('/agents/departments');
    return response.data;
  },

  // Get specific agent
  getAgent: async (agentId) => {
    const response = await api.get(`/agents/${agentId}`);
    return response.data;
  },

  // Search agents
  searchAgents: async (keyword) => {
    const response = await api.get(`/agents/search/${keyword}`);
    return response.data;
  },

  // Chat with agent
  chatWithAgent: async (agentId, message, history = [], model = null, options = {}) => {
    const response = await api.post(`/agents/${agentId}/chat`, {
      message,
      history,
      model,
      options
    });
    return response.data;
  }
};

export const modelsAPI = {
  // Get available models
  getModels: async () => {
    const response = await api.get('/models');
    return response.data;
  },

  // Test connection
  testConnection: async () => {
    const response = await api.get('/models/test');
    return response.data;
  }
};

export default api;