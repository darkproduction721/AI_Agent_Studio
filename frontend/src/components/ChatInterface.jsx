import React, { useState, useRef, useEffect } from 'react';
import { agentsAPI } from '../services/api';
import { Send, Bot, User, AlertCircle, Loader, Brain, Copy, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

function ChatInterface({ selectedAgent, selectedModel }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Clear messages when agent changes
    if (selectedAgent) {
      setMessages([{
        role: 'assistant',
        content: `Hello! I'm ${formatAgentName(selectedAgent.name || selectedAgent.id)}. ${getAgentGreeting(selectedAgent)}`,
        timestamp: new Date().toISOString(),
        agent: selectedAgent
      }]);
      setError(null);
    }
  }, [selectedAgent]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const copyToClipboard = async (text, codeId) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCode(codeId);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const CodeBlock = ({ language, children, ...props }) => {
    const codeId = Math.random().toString(36);
    const codeString = String(children).replace(/\n$/, '');
    
    return (
      <div className="relative group">
        <button
          onClick={() => copyToClipboard(codeString, codeId)}
          className="absolute top-2 right-2 p-1.5 bg-gray-700 hover:bg-gray-600 rounded text-white opacity-0 group-hover:opacity-100 transition-opacity z-10"
          title="Copy code"
        >
          {copiedCode === codeId ? (
            <Check className="w-3 h-3" />
          ) : (
            <Copy className="w-3 h-3" />
          )}
        </button>
        <SyntaxHighlighter
          style={oneDark}
          language={language || 'text'}
          PreTag="div"
          className="!bg-gray-900 !rounded-lg !text-sm"
          {...props}
        >
          {codeString}
        </SyntaxHighlighter>
      </div>
    );
  };

  const MarkdownMessage = ({ content }) => {
    return (
      <div className="prose prose-sm max-w-none dark:prose-invert">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : null;
            
            if (!inline) {
              return (
                <CodeBlock language={language} {...props}>
                  {children}
                </CodeBlock>
              );
            }
            
            return (
              <code className="bg-gray-200 px-1 py-0.5 rounded text-xs font-mono" {...props}>
                {children}
              </code>
            );
          },
          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
          ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
          li: ({ children }) => <li className="text-sm">{children}</li>,
          h1: ({ children }) => <h1 className="text-lg font-bold mb-2">{children}</h1>,
          h2: ({ children }) => <h2 className="text-md font-bold mb-2">{children}</h2>,
          h3: ({ children }) => <h3 className="text-sm font-bold mb-1">{children}</h3>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-gray-300 pl-4 italic my-2 text-gray-600">
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-300 my-2">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border border-gray-300 px-2 py-1 bg-gray-100 font-semibold text-left text-xs">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-gray-300 px-2 py-1 text-xs">{children}</td>
          ),
        }}
        >
          {content}
        </ReactMarkdown>
      </div>
    );
  };

  const formatAgentName = (name) => {
    return name.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getAgentGreeting = (agent) => {
    const greetings = {
      'rapid-prototyper': 'I help you build MVPs and prototypes at lightning speed. What would you like to create today?',
      'ui-designer': 'I specialize in creating beautiful, functional interfaces. What UI challenge can I help you solve?',
      'backend-architect': 'I design robust backend systems and APIs. What architecture challenge are you facing?',
      'frontend-developer': 'I build responsive, interactive frontends. What feature shall we implement?',
      'ai-engineer': 'I integrate AI capabilities into applications. What AI functionality do you need?',
      'devops-automator': 'I automate deployment and infrastructure. What processes need streamlining?',
      'test-writer-fixer': 'I ensure code quality through comprehensive testing. What needs testing?'
    };
    
    return greetings[agent.name || agent.id] || 'How can I assist you today?';
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || loading || !selectedAgent) return;

    const userMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);
    setError(null);

    try {
      // Prepare conversation history for API
      const history = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await agentsAPI.chatWithAgent(
        selectedAgent.id || selectedAgent.name,
        inputMessage,
        history,
        selectedModel
      );

      if (response.success) {
        const assistantMessage = {
          role: 'assistant',
          content: response.data.response,
          timestamp: new Date().toISOString(),
          agent: response.data.agent,
          model: response.data.model,
          reasoning: response.data.reasoning,
          usage: response.data.usage
        };

        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error(response.error || 'Failed to get response');
      }
    } catch (err) {
      console.error('Chat error:', err);
      setError(err.message || 'Failed to send message');
      
      // Add error message to chat
      const errorMessage = {
        role: 'system',
        content: `Error: ${err.message || 'Failed to send message'}`,
        timestamp: new Date().toISOString(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    if (selectedAgent) {
      setMessages([{
        role: 'assistant',
        content: `Hello! I'm ${formatAgentName(selectedAgent.name || selectedAgent.id)}. ${getAgentGreeting(selectedAgent)}`,
        timestamp: new Date().toISOString(),
        agent: selectedAgent
      }]);
    } else {
      setMessages([]);
    }
    setError(null);
  };

  if (!selectedAgent) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 h-full flex items-center justify-center">
        <div className="text-center text-gray-500">
          <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">Select an AI Agent</h3>
          <p>Choose an agent from the sidebar to start chatting</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full bg-${selectedAgent.color || 'blue'}-500 flex items-center justify-center`}>
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">
                {formatAgentName(selectedAgent.name || selectedAgent.id)}
              </h3>
              <p className="text-sm text-gray-600">{selectedAgent.department}</p>
            </div>
          </div>
          <button
            onClick={clearChat}
            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded transition-colors"
          >
            Clear Chat
          </button>
        </div>
        {selectedModel && (
          <div className="mt-2 text-xs text-gray-500">
            Model: {selectedModel}
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {messages.map((message, index) => (
          <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
              message.role === 'user'
                ? 'bg-blue-500 text-white'
                : message.isError
                ? 'bg-red-100 text-red-800 border border-red-200'
                : 'bg-gray-100 text-gray-800'
            }`}>
              <div className="flex items-start gap-2">
                {message.role === 'user' ? (
                  <User className="w-4 h-4 mt-0.5 flex-shrink-0" />
                ) : message.isError ? (
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                ) : (
                  <Bot className="w-4 h-4 mt-0.5 flex-shrink-0" />
                )}
                <div className="flex-1">
                  {message.role === 'assistant' && !message.isError ? (
                    <div className="text-sm">
                      <MarkdownMessage content={message.content} />
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                  )}
                  {message.reasoning && (
                    <details className="mt-2">
                      <summary className="text-xs opacity-75 cursor-pointer flex items-center gap-1">
                        <Brain className="w-3 h-3" />
                        Reasoning
                      </summary>
                      <div className="text-xs opacity-75 mt-1 pl-4 border-l-2 border-gray-300">
                        {message.reasoning}
                      </div>
                    </details>
                  )}
                  <div className="text-xs opacity-75 mt-1">
                    {formatTimestamp(message.timestamp)}
                    {message.model && (
                      <span className="ml-2">• {message.model}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg max-w-xs">
              <div className="flex items-center gap-2">
                <Loader className="w-4 h-4 animate-spin" />
                <span className="text-sm">Agent is thinking...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 border-t border-gray-200 p-4">
        {error && (
          <div className="mb-3 p-3 bg-red-100 border border-red-200 rounded-md">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{error}</span>
            </div>
          </div>
        )}
        
        <div className="flex gap-2 items-end">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Message ${formatAgentName(selectedAgent.name || selectedAgent.id)}...`}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-all duration-200"
            rows="1"
            style={{
              minHeight: '40px',
              maxHeight: '120px',
              resize: 'none'
            }}
            onInput={(e) => {
              e.target.style.height = '40px';
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
            }}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || loading}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
            style={{ minHeight: '40px' }}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        
        <div className="mt-2 text-xs text-gray-500">
          Press Enter to send, Shift+Enter for new line
        </div>
      </div>
    </div>
  );
}

export default ChatInterface;