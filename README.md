# 🤖 AI Agent Studio

A comprehensive full-stack application featuring 37 specialized AI agents across 9 departments, built with React and Node.js.

![AI Agent Studio](https://img.shields.io/badge/AI-Agent%20Studio-blue?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)

## 🚀 Features

### ✨ **37 Specialized AI Agents**
- **Engineering**: AI Engineer, Backend Architect, DevOps Automator, Frontend Developer, Mobile App Builder, Rapid Prototyper, Test Writer Fixer
- **Design**: Brand Guardian, UI Designer, UX Researcher, Visual Storyteller, Whimsy Injector  
- **Marketing**: App Store Optimizer, Content Creator, Growth Hacker, Instagram Curator, Reddit Community Builder, TikTok Strategist, Twitter Engager
- **Product**: Feedback Synthesizer, Sprint Prioritizer, Trend Researcher
- **Project Management**: Experiment Tracker, Project Shipper, Studio Producer
- **Studio Operations**: Analytics Reporter, Finance Tracker, Infrastructure Maintainer, Legal Compliance Checker, Support Responder
- **Testing**: API Tester, Performance Benchmarker, Test Results Analyzer, Tool Evaluator, Workflow Optimizer
- **Bonus**: Joker, Studio Coach

### 🎨 **Rich User Interface**
- **Responsive Design**: Mobile-friendly interface that adapts to all screen sizes
- **Markdown Rendering**: Full markdown support with syntax highlighting
- **Code Blocks**: Copy-to-clipboard functionality for code snippets
- **Agent Selection**: Organized by departments with search functionality
- **Model Selection**: Choose from multiple AI models via OpenRouter

### ⚡ **Technical Features**
- **Real-time Chat**: Instant responses from specialized agents
- **Fallback System**: Automatic model switching if primary model fails
- **Error Handling**: Robust error handling with graceful degradation
- **Performance**: Optimized for speed and reliability

## 🛠️ Tech Stack

### **Frontend**
- **React 18** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **ReactMarkdown** - Rich markdown rendering
- **React Syntax Highlighter** - Code syntax highlighting

### **Backend**
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **OpenRouter API** - Multiple AI model access
- **Gray Matter** - YAML frontmatter parsing

## 🚦 Quick Start

### Prerequisites
- Node.js 18+ installed
- OpenRouter API key (get one at [openrouter.ai](https://openrouter.ai))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/darkproduction721/AI_Agent_Studio.git
   cd AI_Agent_Studio
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   
   # Copy environment template and add your API key
   cp .env.example .env
   # Edit .env and add your OpenRouter API key:
   # OPENROUTER_API_KEY=your-actual-api-key-here
   
   npm run dev
   ```

3. **Setup Frontend** (in a new terminal)
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001

## 📖 Usage

1. **Select an Agent**: Choose from 37 specialized agents organized by department
2. **Choose a Model**: Select your preferred AI model from the dropdown
3. **Start Chatting**: Send messages and get specialized responses
4. **Copy Code**: Click the copy button on any code block
5. **Mobile Support**: Use on any device with responsive design

## 🏗️ Project Structure

```
AI_Agent_Studio/
├── agents/                    # Agent definitions
│   ├── bonus/                # Fun and experimental agents
│   ├── design/               # Design and creative agents
│   ├── engineering/          # Development and technical agents
│   ├── marketing/            # Marketing and growth agents
│   ├── product/              # Product management agents
│   ├── project-management/   # Project coordination agents
│   ├── studio-operations/    # Business operation agents
│   └── testing/              # QA and testing agents
├── backend/                  # Node.js API server
│   ├── src/
│   │   ├── config/          # Configuration files
│   │   ├── middleware/      # Express middleware
│   │   ├── routes/          # API routes
│   │   ├── services/        # External service integrations
│   │   └── utils/           # Utility functions
│   └── package.json
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/      # React components
│   │   └── services/        # API service layer
│   └── package.json
└── README.md
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [OpenRouter](https://openrouter.ai) for AI model access
- Inspired by the need for specialized AI assistance in development workflows
- Thanks to the open-source community for the amazing tools and libraries

---

**⭐ Star this repository if you find it helpful!**

For questions or support, please open an issue on GitHub.