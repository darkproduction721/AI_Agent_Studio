import React, { useState, useEffect } from 'react';
import { modelsAPI } from '../services/api';
import { Settings, Check, AlertCircle, Cpu } from 'lucide-react';

function ModelSelector({ selectedModel, onModelSelect }) {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null);

  useEffect(() => {
    loadModels();
    testConnection();
  }, []);

  const loadModels = async () => {
    try {
      setLoading(true);
      const response = await modelsAPI.getModels();
      if (response.success) {
        setModels(response.data);
        // Auto-select first model if none selected
        if (!selectedModel && response.data.length > 0) {
          onModelSelect(response.data[0].id);
        }
      } else {
        setError('Failed to load models');
      }
    } catch (err) {
      setError('Failed to connect to backend');
      console.error('Error loading models:', err);
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    try {
      const response = await modelsAPI.testConnection();
      setConnectionStatus(response.connected);
    } catch (err) {
      setConnectionStatus(false);
      console.error('Connection test failed:', err);
    }
  };

  const getSelectedModelInfo = () => {
    return models.find(model => model.id === selectedModel);
  };

  const formatModelName = (name) => {
    // Extract just the model name without provider prefix
    const parts = name.split('/');
    return parts[parts.length - 1].replace(':free', ' (Free)');
  };

  const formatContextLength = (length) => {
    if (length >= 1000000) {
      return `${(length / 1000000).toFixed(1)}M tokens`;
    } else if (length >= 1000) {
      return `${Math.floor(length / 1000)}K tokens`;
    }
    return `${length} tokens`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="text-red-600 text-center">
          <AlertCircle className="w-5 h-5 mx-auto mb-2" />
          <p className="text-sm">{error}</p>
          <button 
            onClick={loadModels}
            className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const selectedModelInfo = getSelectedModelInfo();

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <Cpu className="w-4 h-4" />
            AI Model
          </h3>
          <div className="flex items-center gap-2">
            {connectionStatus !== null && (
              <div className={`w-2 h-2 rounded-full ${connectionStatus ? 'bg-green-500' : 'bg-red-500'}`} 
                   title={connectionStatus ? 'Connected to OpenRouter' : 'Connection failed'}
              />
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {selectedModelInfo && (
          <div className="mt-2">
            <div className="text-sm font-medium text-gray-700">
              {formatModelName(selectedModelInfo.name)}
            </div>
            <div className="text-xs text-gray-500">
              {formatContextLength(selectedModelInfo.contextLength)} context
            </div>
          </div>
        )}
      </div>

      {/* Model Selection Dropdown */}
      {isOpen && (
        <div className="p-4 max-h-64 overflow-y-auto">
          <div className="space-y-1">
            {models.length === 0 ? (
              <p className="text-gray-500 text-sm italic">No free models available</p>
            ) : (
              models.map(model => (
                <button
                  key={model.id}
                  onClick={() => {
                    onModelSelect(model.id);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left p-3 rounded-md hover:bg-gray-50 transition-colors border ${
                    selectedModel === model.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-800">
                        {formatModelName(model.name)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {formatContextLength(model.contextLength)} • {model.id}
                      </div>
                      {model.description && (
                        <div className="text-xs text-gray-600 mt-1 line-clamp-2">
                          {model.description.substring(0, 100)}...
                        </div>
                      )}
                    </div>
                    {selectedModel === model.id && (
                      <Check className="w-4 h-4 text-blue-500 ml-2 flex-shrink-0" />
                    )}
                  </div>
                </button>
              ))
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-gray-200">
            <button
              onClick={testConnection}
              className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
            >
              Test Connection
            </button>
            <div className="text-xs text-gray-400 mt-1">
              {models.length} free models available
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ModelSelector;