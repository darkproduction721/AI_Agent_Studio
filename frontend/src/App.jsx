import { useState } from 'react'
import AgentSelector from './components/AgentSelector'
import ModelSelector from './components/ModelSelector'
import ChatInterface from './components/ChatInterface'
import { Menu, X } from 'lucide-react'
import './App.css'

function App() {
  const [selectedAgent, setSelectedAgent] = useState(null)
  const [selectedModel, setSelectedModel] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="h-screen bg-gray-100 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 flex-shrink-0">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3">
            <div className="flex items-center">
              {/* Mobile menu button */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 mr-2"
              >
                {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
              
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                🤖 AI Agents Studio
              </h1>
              <span className="ml-2 sm:ml-3 px-2 sm:px-3 py-1 bg-blue-100 text-blue-800 text-xs sm:text-sm font-medium rounded-full">
                Beta
              </span>
            </div>
            <div className="text-xs sm:text-sm text-gray-500 hidden sm:block">
              {selectedAgent ? `Chatting with ${selectedAgent.name || selectedAgent.id}` : 'Select an agent to start'}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 w-80 lg:w-96 bg-gray-100 border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:flex lg:flex-col overflow-hidden`}>
          {/* Overlay for mobile */}
          {sidebarOpen && (
            <div 
              className="lg:hidden fixed inset-0 bg-gray-600 bg-opacity-75 z-40"
              onClick={() => setSidebarOpen(false)}
            />
          )}
          
          <div className="relative z-50 flex flex-col h-full bg-gray-100 p-4 space-y-4 overflow-hidden">
            {/* Agent Selector */}
            <div className="flex-1 min-h-0">
              <AgentSelector 
                onAgentSelect={(agent) => {
                  setSelectedAgent(agent);
                  setSidebarOpen(false); // Close sidebar on mobile after selection
                }}
                selectedAgent={selectedAgent}
              />
            </div>
            
            {/* Model Selector */}
            <div className="flex-shrink-0">
              <ModelSelector 
                selectedModel={selectedModel}
                onModelSelect={setSelectedModel}
              />
            </div>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="flex-1 flex flex-col min-w-0">
          <ChatInterface 
            selectedAgent={selectedAgent}
            selectedModel={selectedModel}
          />
        </div>
      </div>
    </div>
  )
}

export default App
