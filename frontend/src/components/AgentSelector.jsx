import React, { useState, useEffect } from 'react';
import { agentsAPI } from '../services/api';
import { User, Zap, Users, Palette, Code, Target, Settings, TestTube, Gift } from 'lucide-react';

const departmentIcons = {
  'engineering': Code,
  'design': Palette,
  'marketing': Zap,
  'product': Target,
  'project-management': Users,
  'studio-operations': Settings,
  'testing': TestTube,
  'bonus': Gift
};

const departmentColors = {
  'engineering': 'bg-blue-500',
  'design': 'bg-purple-500',
  'marketing': 'bg-green-500',
  'product': 'bg-orange-500',
  'project-management': 'bg-yellow-500',
  'studio-operations': 'bg-gray-500',
  'testing': 'bg-red-500',
  'bonus': 'bg-pink-500'
};

function AgentSelector({ onAgentSelect, selectedAgent }) {
  const [departments, setDepartments] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedDepartments, setExpandedDepartments] = useState({});

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      setLoading(true);
      const response = await agentsAPI.getDepartments();
      if (response.success) {
        setDepartments(response.data);
        // Expand departments that have agents by default
        const initialExpanded = {};
        Object.keys(response.data).forEach(dept => {
          if (response.data[dept].length > 0) {
            initialExpanded[dept] = true;
          }
        });
        setExpandedDepartments(initialExpanded);
      } else {
        setError('Failed to load departments');
      }
    } catch (err) {
      setError('Failed to connect to backend');
      console.error('Error loading departments:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleDepartment = (department) => {
    setExpandedDepartments(prev => ({
      ...prev,
      [department]: !prev[department]
    }));
  };

  const formatAgentName = (name) => {
    return name.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const formatDepartmentName = (dept) => {
    return dept.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getAgentColor = (agent) => {
    const colorMap = {
      'green': 'bg-green-500',
      'blue': 'bg-blue-500',
      'purple': 'bg-purple-500',
      'magenta': 'bg-pink-500',
      'red': 'bg-red-500',
      'yellow': 'bg-yellow-500',
      'orange': 'bg-orange-500',
      'indigo': 'bg-indigo-500',
      'teal': 'bg-teal-500',
      'cyan': 'bg-cyan-500'
    };
    return colorMap[agent.color] || 'bg-gray-500';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="h-10 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-red-600 text-center">
          <p className="font-semibold">Error Loading Agents</p>
          <p className="text-sm mt-1">{error}</p>
          <button 
            onClick={loadDepartments}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md h-full flex flex-col">
      <div className="flex-shrink-0 p-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <User className="w-5 h-5" />
          AI Agents
        </h2>

        {/* Search */}
        <div>
          <input
            type="text"
            placeholder="Search agents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Departments */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
        {Object.keys(departments).map(department => {
          const agents = departments[department] || [];
          const Icon = departmentIcons[department] || User;
          const isEmpty = agents.length === 0;
          
          if (isEmpty && !expandedDepartments[department]) return null;

          return (
            <div key={department} className="border border-gray-200 rounded-lg">
              <button
                onClick={() => toggleDepartment(department)}
                className={`w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50 transition-colors ${
                  isEmpty ? 'opacity-50' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full ${departmentColors[department]} flex items-center justify-center`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-medium text-gray-800">
                    {formatDepartmentName(department)}
                  </span>
                  <span className="text-sm text-gray-500">({agents.length})</span>
                </div>
                <div className={`transform transition-transform ${
                  expandedDepartments[department] ? 'rotate-90' : ''
                }`}>
                  ▶
                </div>
              </button>

              {expandedDepartments[department] && (
                <div className="px-4 pb-3">
                  {agents.length === 0 ? (
                    <p className="text-gray-500 text-sm italic py-2">No agents loaded in this department</p>
                  ) : (
                    <div className="space-y-1">
                      {agents
                        .filter(agent => 
                          !searchTerm || 
                          (agent.name && agent.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (agent.description && agent.description.toLowerCase().includes(searchTerm.toLowerCase()))
                        )
                        .map(agent => (
                        <button
                          key={agent.id || agent.name || Math.random()}
                          onClick={() => onAgentSelect(agent)}
                          className={`w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 transition-colors ${
                            selectedAgent?.id === agent.id ? 'bg-blue-100 border-l-4 border-blue-500' : ''
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${getAgentColor(agent)}`}></div>
                            <span className="font-medium text-gray-800">
                              {formatAgentName(agent.name || agent.id || 'Unknown Agent')}
                            </span>
                          </div>
                          {agent.description && (
                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                              {agent.description.split('\n')[0].substring(0, 100)}...
                            </p>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
        </div>
      </div>
    </div>
  );
}

export default AgentSelector;