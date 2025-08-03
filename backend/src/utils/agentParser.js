const fs = require('fs-extra');
const path = require('path');
const matter = require('gray-matter');

class AgentParser {
  constructor(agentsPath) {
    this.agentsPath = agentsPath;
    this.agents = new Map();
    this.departments = new Set();
  }

  async loadAllAgents() {
    try {
      console.log('Loading agents from:', this.agentsPath);
      
      if (!await fs.pathExists(this.agentsPath)) {
        console.error('Agents path does not exist:', this.agentsPath);
        return;
      }

      const departmentDirs = await fs.readdir(this.agentsPath);
      
      for (const dept of departmentDirs) {
        const deptPath = path.join(this.agentsPath, dept);
        const stat = await fs.stat(deptPath);
        
        if (stat.isDirectory() && dept !== 'README.md') {
          this.departments.add(dept);
          await this.loadDepartmentAgents(dept, deptPath);
        }
      }

      console.log(`✓ Loaded ${this.agents.size} agents from ${this.departments.size} departments`);
    } catch (error) {
      console.error('Error loading agents:', error);
      throw error;
    }
  }

  async loadDepartmentAgents(department, departmentPath) {
    try {
      const files = await fs.readdir(departmentPath);
      
      for (const file of files) {
        if (path.extname(file) === '.md') {
          const filePath = path.join(departmentPath, file);
          const agent = await this.parseAgentFile(filePath, department);
          
          if (agent) {
            const agentId = this.generateAgentId(department, file);
            this.agents.set(agentId, agent);
          }
        }
      }
    } catch (error) {
      console.error(`Error loading agents from department ${department}:`, error);
    }
  }

  async parseAgentFile(filePath, department) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      const filename = path.basename(filePath, '.md');
      
      let parsed;
      try {
        parsed = matter(content);
      } catch (yamlError) {
        console.warn(`YAML parsing failed for ${filePath}, using fallback:`, yamlError.message);
        // Fallback: create basic agent info without YAML frontmatter
        parsed = {
          data: {
            name: filename,
            description: this.extractDescription(content),
            color: 'gray',
            tools: ['Write', 'Read']
          },
          content: content
        };
      }
      
      return {
        id: this.generateAgentId(department, path.basename(filePath)),
        name: parsed.data.name || this.formatName(filename),
        department: department,
        description: parsed.data.description || this.extractDescription(parsed.content),
        role: parsed.data.role || filename.replace(/-/g, ' '),
        content: parsed.content,
        metadata: parsed.data,
        filename: filename,
        filePath: filePath,
        color: parsed.data.color || 'gray'
      };
    } catch (error) {
      console.warn(`Skipping agent file ${filePath} due to error:`, error.message);
      return null;
    }
  }

  generateAgentId(department, filename) {
    const name = path.basename(filename, '.md');
    return `${department}-${name}`;
  }

  formatName(filename) {
    return filename
      .replace(/-/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  }

  extractDescription(content) {
    // Try to find the first paragraph or sentence
    const lines = content.split('\n').filter(line => line.trim());
    for (const line of lines) {
      if (line.trim() && !line.startsWith('#') && !line.startsWith('*') && !line.startsWith('-')) {
        return line.trim().substring(0, 200) + (line.length > 200 ? '...' : '');
      }
    }
    return 'AI Agent';
  }

  getAllAgents() {
    return Array.from(this.agents.values());
  }

  getAgentById(agentId) {
    return this.agents.get(agentId);
  }

  getAgentsByDepartment(department) {
    return Array.from(this.agents.values()).filter(agent => agent.department === department);
  }

  getDepartments() {
    return Array.from(this.departments);
  }

  searchAgents(keyword) {
    const searchTerm = keyword.toLowerCase();
    return Array.from(this.agents.values()).filter(agent => 
      agent.name.toLowerCase().includes(searchTerm) ||
      agent.description.toLowerCase().includes(searchTerm) ||
      agent.role.toLowerCase().includes(searchTerm) ||
      agent.department.toLowerCase().includes(searchTerm)
    );
  }

  getAgentStats() {
    return {
      totalAgents: this.agents.size,
      departments: this.departments.size,
      departmentBreakdown: this.getDepartments().map(dept => ({
        name: dept,
        count: this.getAgentsByDepartment(dept).length
      }))
    };
  }
}

module.exports = AgentParser;