
Final Project Video Link: [Screencast from 28-10-26 05:00:19 PM IST.webm](https://github.com/user-attachments/assets/3502f9d5-1b5f-490c-a965-ff7b485c8678)

MCP Playground — Frontend
A Next.js frontend for experimenting with Model Context Protocol (MCP) tools, resources, and prompts through a Groq-powered agent. The application provides a three-panel workspace for configuring tools, chatting with the agent, and inspecting execution activity.
Features
- Auto and Manual tool selection: let the agent choose a tool or explicitly select one.
- MCP integrations: work with project resources and reusable prompts exposed by the backend's MCP server.
- Custom tool builder: define a tool name, description, input parameters, instructions, MCP resources, and an optional MCP prompt with arguments.
- Starter questions: launch common MCP tests directly from the empty chat screen.
- Agent Execution panel: inspect tool calls and backend execution events returned with chat responses.
- New Chat: reset the conversation and execution log.
- Collapsible panels: adjust the sidebar and execution-log space.
- Local custom-tool storage: custom tool definitions are persisted in the browser through the frontend tool hook.
Tech Stack
- Next.js (App Router)
- React and TypeScript
- Tailwind CSS
- Lucide React icons
- FastAPI backend (separate repository)
- Groq LLM and MCP Python SDK (backend)
Project Structure
mcp-playground-frontend/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── src/
│   ├── components/
│   │   ├── chat/ChatPanel.tsx
│   │   ├── execution/ExecutionLog.tsx
│   │   ├── layout/Sidebar.tsx
│   │   └── tools/
│   │       ├── CreateToolForm.tsx
│   │       └── ToolSelector.tsx
│   ├── constants/
│   │   ├── defaults.ts
│   │   └── starters.ts
│   ├── hooks/useTools.ts
│   ├── lib/api.ts
│   ├── types/
│   │   ├── chat.ts
│   │   └── tools.ts
│   └── utils/toolValidation.ts
├── public/
├── .env.example
├── package.json
└── README.md
The structure above lists the primary files discussed in this project; your repository may contain additional components and configuration files.
Prerequisites
- Node.js compatible with your installed Next.js version
- npm
- Running MCP Playground FastAPI backend (by default at http://localhost:8000)
- Backend configured with its Groq API key and MCP server access
Getting Started
1. Clone the frontend repository and enter its directory:
   git clone <your-frontend-repository-url>
   cd mcp-playground-frontend
2. Install dependencies:
   npm install
3. Configure the backend URL. Create .env.local from the example:
   cp .env.example .env.local
   The file should contain:
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
   Check src/lib/api.ts to ensure it reads NEXT_PUBLIC_API_BASE_URL; use the variable name actually implemented there if different.
4. Start the FastAPI backend in its own terminal, following that repository's setup instructions.
5. Start the frontend:
   npm run dev
6. Open http://localhost:3000.
Security: Keep GROQ_API_KEY on the backend only. Never add it to a NEXT_PUBLIC_ variable or commit real credentials.

How to Use
1. Chat in Auto Mode
Select Auto in the left sidebar and ask a question such as:
Explain the project's requirements and architecture.

The backend agent chooses tools based on the request. Check the Agent Execution panel for actual calls made.
2. Chat in Manual Mode
Select Manual, choose a built-in or custom tool, and send a question. Examples of built-in tools include:
- read_mcp_resource — read MCP project resources.
- get_mcp_prompt — retrieve reusable MCP prompt instructions.
The tool must be supported by the connected backend.
3. Create a Custom Tool
Click Create New Tool in the sidebar. Configure:
- Tool Name and Description
- Input Parameters (name, type, description, required flag)
- Custom Prompt (instructions for response generation)
- MCP Resources (for example project://requirements and project://architecture)
- MCP Prompt (for example explain_technical) and supported prompt arguments such as audience
Save the tool, switch to Manual, select it, and ask a relevant question. Custom tools are browser-local definitions passed to the backend for execution; they are not automatically installed as executable Python functions on the MCP server.
4. Use Starter Questions
On an empty chat, select a starter card to populate the intended tool mode and submit its question. Examples include reading project documentation, fetching reusable prompt instructions, reviewing architecture, and letting the agent choose.

Starter cards that depend on a specific tool are shown only when that tool is available in the frontend tool registry.
5. Inspect Agent Execution
Review the right-hand panel for execution events such as resource reads, prompt retrieval, custom-tool activity, and model response generation. The exact event names and sequence depend on the backend response.
6. Start a New Chat
Click New chat to clear the current messages, execution log, and selection state. Saved custom tools remain available in the browser.
Example Test Questions
Mode	Tool	Question
Auto	Agent-selected	What are the main requirements of this project?
Auto	Agent-selected	Explain the architecture and how its components communicate.
Manual	read_mcp_resource	Summarize the project requirements.
Manual	get_mcp_prompt	Retrieve the explain_technical prompt for a developer audience.
Manual	Custom project_review_assistant	Review the project architecture and recommend three improvements.


Custom Tool Example
Name: project_review_assistant

Description: Reviews project requirements and architecture, identifies strengths and improvements, and generates structured recommendations using MCP context.

Input parameter: question (string, required)

MCP resources: project://requirements, project://architecture

MCP prompt: explain_technical (audience: developer or manager, if supported by your MCP server)

Custom prompt:
You are a project review assistant. Use the supplied MCP context to:
1. Summarize the project's purpose and requirements.
2. Explain its architecture and MCP integration.
3. Identify strengths and limitations.
4. Recommend three practical improvements.

Base factual claims on retrieved context. Do not invent undocumented
features. Distinguish documented facts from recommendations. Adjust
technical depth for the selected audience.
Test question:
Perform a complete technical review of this project, including requirements, architecture, MCP integration, strengths, limitations, and three recommended improvements.

Validation
Run TypeScript checks:
npx tsc --noEmit
Run linting if configured:
npm run lint
Build the production bundle:
npm run build
Start the production server after a successful build:
npm run start
Troubleshooting
Frontend loads, but chat requests fail: Confirm the FastAPI backend is running, the frontend API URL matches its host/port, and the backend allows requests from the frontend origin (CORS).

Cannot read properties of undefined (reading 'length'): Ensure parent components pass arrays to ChatPanel and Sidebar, and that those components guard against missing values.

Starter cards are missing: Verify STARTER_PROMPTS is imported in app/page.tsx, passed as the starters prop, and that the corresponding tools exist in the tool registry.

A custom tool does not retrieve context: Confirm the selected resource URIs and MCP prompt names exist on the backend MCP server and inspect the Agent Execution events.
