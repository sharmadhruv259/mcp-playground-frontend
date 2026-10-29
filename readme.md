
Final Project Video Link:  https://github.com/user-attachments/assets/1ffa8174-6b79-415c-9dba-23cb3ae8a800





# MCP Playground — Frontend

A modern Next.js frontend for experimenting with Model Context Protocol (MCP) tools, resources, and prompts through a Groq-powered backend agent. The application provides a responsive, three-panel workspace for configuring tools, conversing with the agent, and inspecting real-time backend execution logs.

---

## Key Features

- **Flexible Tool Execution Modes**:
  - **Auto Mode**: Allows the Groq-powered agent to dynamically select tools based on user input.
  - **Manual Mode**: Exposes direct selection of specific built-in tools or user-defined custom tools.
- **MCP Integrations**: Direct integration with project resources (`read_mcp_resource`) and reusable prompt templates (`get_mcp_prompt`) exposed by the backend MCP server.
- **Custom Tool Builder**: Define custom tools directly in the UI with custom names, descriptions, input schemas, instructions, target MCP resource URIs, and MCP prompts with arguments.
- **Agent Execution Panel**: Real-time inspection panel to track backend execution steps, resource reads, prompt retrievals, and model responses.
- **Starter Cards**: Quick-launch common MCP test scenarios directly from the empty chat screen.
- **Browser Persistence**: Custom tool definitions automatically persist locally using `localStorage` through the custom tools hook.
- **Workspace Customization**: Collapsible sidebars and execution logs for tailored screen real estate.

---

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Backend API**: FastAPI (separate repository) powered by Groq LLM & Python MCP SDK

---

## Project Structure

```text
mcp-playground-frontend/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── src/
│   ├── components/
│   │   ├── chat/
│   │   │   └── ChatPanel.tsx
│   │   ├── execution/
│   │   │   └── ExecutionLog.tsx
│   │   ├── layout/
│   │   │   └── Sidebar.tsx
│   │   └── tools/
│   │       ├── CreateToolForm.tsx
│   │       └── ToolSelector.tsx
│   ├── constants/
│   │   ├── defaults.ts
│   │   └── starters.ts
│   ├── hooks/
│   │   └── useTools.ts
│   ├── lib/
│   │   └── api.ts
│   ├── types/
│   │   ├── chat.ts
│   │   └── tools.ts
│   └── utils/
│       └── toolValidation.ts
├── public/
├── .env.example
├── package.json
└── README.md
```

---

## Prerequisites

Before running the application, make sure you have:

- **Node.js** (v18.x or later recommended)
- **npm**, **yarn**, or **pnpm** package manager
- **MCP Playground FastAPI Backend** running (default: `http://localhost:8000`)
- Backend environment properly configured with valid **Groq API key** and access to an active MCP server

---

## Getting Started

### 1. Clone the Repository
```bash
git clone <your-frontend-repository-url>
cd mcp-playground-frontend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a local environment configuration file from the provided template:

```bash
cp .env.example .env.local
```

Ensure `.env.local` specifies your backend API address:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

> **Security Note**: Never expose sensitive keys (such as `GROQ_API_KEY`) on the frontend or put them inside `NEXT_PUBLIC_` variables. API keys must remain securely stored on the backend service.

### 4. Run Development Server
Ensure the FastAPI backend server is running in a separate terminal session, then launch the frontend:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to start using the playground.

---

## How to Use

### 1. Chat in Auto Mode
1. Select **Auto** in the left sidebar.
2. Submit a request (e.g., *"Explain the project's requirements and architecture."*).
3. The backend agent will autonomously determine which tools to invoke.
4. View the step-by-step tool invocation process inside the **Agent Execution** panel on the right.

### 2. Chat in Manual Mode
1. Select **Manual** in the left sidebar.
2. Pick a built-in or custom tool from the selector dropdown:
   - `read_mcp_resource`: Read project resources directly from the MCP server.
   - `get_mcp_prompt`: Fetch pre-configured prompt instructions from the MCP server.
3. Submit your targeted question.

### 3. Creating Custom Tools
1. Click **Create New Tool** in the left sidebar.
2. Configure your tool:
   - **Tool Name** & **Description**
   - **Input Parameters** (name, type, description, required toggle)
   - **Custom Instructions** (system instructions guiding response structure)
   - **MCP Resources** (e.g., `project://requirements`, `project://architecture`)
   - **MCP Prompt & Arguments** (e.g., `explain_technical` with `audience: developer`)
3. Click **Save Tool**.
4. Switch execution mode to **Manual**, select your new custom tool, and ask a relevant query.

> **Note**: Custom tools defined in the frontend are client-side metadata definitions passed alongside execution requests; they do not automatically inject python code onto the backend server.

### 4. Starter Cards
When starting on a blank chat screen, click any of the available starter cards to automatically configure the intended tool/mode and populate the input field.

### 5. Inspect Execution Activity
Monitor the **Agent Execution** panel on the right side of the screen to observe raw events emitted during execution, such as:
- Resource URI fetching
- MCP Prompt retrieval
- Context assembly
- Model completion responses

---

## Example Custom Tool Setup

| Field | Value |
| :--- | :--- |
| **Name** | `project_review_assistant` |
| **Description** | Reviews project requirements and architecture, identifies strengths and improvements, and generates structured recommendations using MCP context. |
| **Input Parameter** | `question` (string, required) |
| **MCP Resources** | `project://requirements`, `project://architecture` |
| **MCP Prompt** | `explain_technical` (`audience: developer`) |

#### Custom System Prompt:
```text
You are a project review assistant. Use the supplied MCP context to:
1. Summarize the project's purpose and requirements.
2. Explain its architecture and MCP integration.
3. Identify strengths and limitations.
4. Recommend three practical improvements.

Base factual claims on retrieved context. Do not invent undocumented features.
Distinguish documented facts from recommendations. Adjust technical depth for the selected audience.
```

---

## Verification & Building

To verify code quality and build for production:

```bash
# Type check TypeScript files
npx tsc --noEmit

# Run ESLint (if configured)
npm run lint

# Build production distribution
npm run build

# Start production server
npm run start
```

---
