const path = require('path');

const config = {
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  openrouterApiKey: process.env.OPENROUTER_API_KEY || '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',
  agentsPath: path.resolve(__dirname, process.env.AGENTS_PATH || '../../../agents'),
  defaultModel: process.env.DEFAULT_MODEL || 'qwen/qwen3-14b:free',
  openrouterBaseUrl: 'https://openrouter.ai/api/v1',
  freeModels: [
    'qwen/qwen3-14b:free',
    'qwen/qwen3-8b:free',
    'qwen/qwen3-4b:free',
    'qwen/qwen3-30b-a3b:free',
    'qwen/qwen3-235b-a22b:free',
    'deepseek/deepseek-r1:free',
    'meta-llama/llama-3.3-70b-instruct:free',
    'google/gemini-2.0-flash-exp:free',
    'mistralai/mistral-small-3.2-24b-instruct:free'
  ]
};

module.exports = config;