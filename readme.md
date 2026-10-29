**
MCP Playground — Frontend
**
Final Project Video Link:  https://github.com/user-attachments/assets/1ffa8174-6b79-415c-9dba-23cb3ae8a800

A modern, interactive Next.js frontend for experimenting with Model Context Protocol (MCP) tools, resources, and prompts through a Groq-powered AI agent backend.

The application provides a three-panel workspace for creating and managing custom AI agents, selecting MCP operations, interacting through chat, and inspecting backend execution logs.

Built with Next.js, React, TypeScript, Tailwind CSS, and Lucide React.

1. Project Overview

The MCP Playground frontend provides an interactive interface for a FastAPI backend powered by Groq and the Python MCP SDK.

The application allows users to create custom agents with their own system instructions, select available MCP operations, and observe how the backend processes requests.

The frontend communicates with the backend through REST APIs.

Key Features

Custom AI Agents: Create, select, edit, and manage agents with different responsibilities and system prompts.

Agent-Specific Configuration: Configure tool access, allowed MCP tools, and caching settings.

Auto Mode: Allow Groq to select relevant MCP operations based on the user's question.

Manual Mode: Select permitted MCP operations from the frontend.

Dynamic MCP Discovery: Retrieve available tools, resources, and prompts from the backend.

Interactive Chat: Ask questions using the selected custom agent.

Agent Execution Panel: Inspect MCP operation execution, arguments, results, and errors returned by the backend.

Starter Cards: Quickly begin common MCP test scenarios.

Three-Panel Layout: Separate agent configuration, chat, and execution information.

Custom agents are persisted by the backend using SQLite rather than being stored as custom tool definitions in browser localStorage.

2. Technology Stack

Technology

Purpose

Next.js (App Router)

Frontend framework

React

UI components

TypeScript

Type safety

Tailwind CSS

Styling

Lucide React

Icons

FastAPI

Backend REST API

Groq

LLM-based tool selection and response generation

FastMCP

Backend MCP tools, resources, and prompts

The backend is maintained in a separate repository: mcp-prompts-resources-poc.

3. Project Structure

mcp-playground-frontend/
│
├── app/
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
│
├── src/
│   ├── components/
│   │   ├── agents/
│   │   │   └── AgentForm.tsx
│   │   ├── chat/
│   │   │   └── ChatPanel.tsx
│   │   ├── execution/
│   │   │   └── ExecutionLog.tsx
│   │   ├── layout/
│   │   │   └── Sidebar.tsx
│   │   └── tools/
│   │       └── ToolSelector.tsx
│   │
│   ├── constants/
│   │   └── starters.ts
│   │
│   ├── hooks/
│   │   ├── useAgents.ts
│   │   └── useMCPCapabilities.ts
│   │
│   ├── lib/
│   │   └── api.ts
│   │
│   └── types/
│       ├── agents.ts
│       ├── chat.ts
│       ├── mcp.ts
│       └── tools.ts
│
├── public/
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
├── tsconfig.json
├── next.config.ts
└── README.md

File Responsibilities

File

Responsibility

app/page.tsx

Main application workspace and state coordination

AgentForm.tsx

Custom agent creation and editing

ChatPanel.tsx

Chat messages, question input, and starter cards

ExecutionLog.tsx

Displays backend execution events

Sidebar.tsx

Agent selection and workspace navigation

ToolSelector.tsx

MCP operation selection and execution mode controls

useAgents.ts

Retrieves and manages custom agents

useMCPCapabilities.ts

Fetches MCP capabilities from the backend

api.ts

Centralizes FastAPI requests

starters.ts

Defines starter questions

agents.ts

Agent-related TypeScript types

chat.ts

Chat request and response types

mcp.ts

MCP capability types

tools.ts

Tool selection and execution-related types

4. Application Architecture

                       USER
                         |
                         v
                 Next.js Frontend
                         |
          +--------------+--------------+
          |              |              |
          v              v              v
      Sidebar        ChatPanel      ExecutionLog
          |              |              |
          v              |              |
      AgentForm          |              |
      ToolSelector       |              |
          |              |              |
          +--------------+--------------+
                         |
                         v
                    src/lib/api.ts
                         |
                         v
                    FastAPI Backend
                         |
              +----------+----------+
              |          |          |
              v          v          v
          Agents       Chat       Discovery
              |          |          |
              +----------+----------+
                         |
                         v
                    Groq Agent
                         |
                         v
                     MCP Client
                         |
                         v
                     MCP Server
                         |
              +----------+----------+
              |          |          |
              v          v          v
             Tools    Resources    Prompts
                         |
                         v
                   API Response
                         |
                         v
                 Chat + Execution Log

The frontend does not directly execute MCP operations. It sends requests to FastAPI, which handles MCP discovery, agent execution, and tool invocation.

5. Custom AI Agents

The application supports creating and managing multiple custom agents.

Each agent can have its own:

Name and description.

Custom system prompt.

Tool access configuration.

Allowed MCP tools.

Cache settings.

Agent configurations are stored by the backend using SQLite.

Example Agent 1: Project Assistant

Purpose: Answer general questions about project requirements, architecture, and objectives.

Typical questions:

What are the main project requirements?

Give me a complete project overview.

Explain the architecture in simple terms.

Summarize the project requirements and architecture.

Example Agent 2: Project Technical Analyst

Purpose: Analyze the technical architecture and implementation requirements.

Typical questions:

Explain the project's technical components.

Compare the requirements with the architecture.

Identify potential technical limitations.

Recommend architectural improvements.

Creating a Custom Agent

Open the agent creation interface from the sidebar.

Enter the agent name and description.

Provide a custom system prompt.

Configure MCP tool access.

Configure caching if needed.

Save the agent.

Select the agent and begin chatting.

Example Custom System Prompt

You are a Project Technical Analyst specializing in
software architecture and requirements analysis.

Your responsibilities:
1. Analyze project requirements and architecture.
2. Retrieve relevant information using MCP operations.
3. Explain technical components and design decisions.
4. Identify technical risks and limitations.
5. Recommend practical improvements.

Base factual claims on retrieved MCP information.
Do not invent undocumented project features.

Use the following response structure:
1. Summary
2. Key Findings
3. Technical Explanation
4. Sources Used

6. MCP Capabilities

The frontend retrieves available MCP capabilities from the backend.

Native MCP Tools

The backend currently exposes:

get_project_overview

The agent can execute it through the Groq-facing function:

mcp_tool__get_project_overview

MCP Resources

Resource

URI

Project Requirements

project://requirements

Project Architecture

project://architecture

These resources contain project information maintained by the backend.

MCP Prompts

Prompt

Purpose

summarize_project

Retrieve reusable project summarization instructions

explain_technical

Retrieve reusable technical explanation instructions

The backend discovers the available capabilities and provides the relevant information to the frontend.

7. Auto and Manual Modes

Auto Mode

Auto mode allows Groq to determine which available MCP operations should be used.

Example question:

Read both project resources and explain how the
architecture supports the project requirements.

The backend may execute multiple MCP operations before returning the final response.

Manual Mode

Manual mode allows users to select MCP operations through the frontend.

To use Manual mode:

Select the required agent.

Switch from Auto to Manual.

Choose the relevant MCP operation.

Enter a question.

Inspect the execution log.

Current limitation: Manual mode restricts available native MCP tools but does not force Groq to call the selected tool. Resource and prompt selections are not yet fully enforced.

8. Chat Interface

The chat interface allows users to submit questions to the selected custom agent.

The backend processes each request using:

The selected agent configuration.

The agent's custom system prompt.

Available MCP capabilities.

Groq function calling.

MCP execution results.

The final response is displayed in the chat panel.

Starter Cards

Starter cards provide example questions for testing MCP capabilities.

Examples include:

Retrieve project requirements.

Explain project architecture.

Generate a project overview.

Retrieve reusable MCP prompt instructions.

9. Agent Execution Panel

The execution panel displays execution information returned by the backend.

Depending on the request, this may include:

MCP operation selection.

Function arguments.

MCP tool execution.

Resource retrieval.

Prompt retrieval.

Cache-related events.

Execution errors.

Agent response generation.

The execution panel is intended to help users understand how the backend agent processes a question.

Execution information is returned through the API rather than a dedicated WebSocket stream.

10. Backend API Integration

The frontend communicates with FastAPI through src/lib/api.ts.

Main API Endpoints

Endpoint

Purpose

GET /api/mcp/capabilities

Retrieve available MCP capabilities

/api/agents

Create, retrieve, update, and delete custom agents

POST /api/chat

Submit questions to the selected agent

The backend also provides interactive API documentation at:

http://localhost:8000/docs

11. Prerequisites

Before running the frontend, ensure that you have:

Node.js and npm installed.

The MCP Playground FastAPI backend available.

A valid Groq API key configured on the backend.

Backend dependencies installed.

The backend MCP server registered and accessible through FastAPI.

The current backend uses an in-process MCP connection, so a separate MCP server terminal is not required.

12. Installation

Step 1: Clone the Frontend Repository

git clone <your-frontend-repository-url>
cd mcp-playground-frontend

Step 2: Install Dependencies

npm install

Step 3: Configure Environment Variables

Copy the environment template:

cp .env.example .env.local

Configure the backend URL:

NEXT_PUBLIC_API_BASE_URL=http://localhost:8000

Ensure the variable name matches the one used by src/lib/api.ts.

Security: Keep GROQ_API_KEY on the backend. Never place private API keys inside frontend environment variables prefixed with NEXT_PUBLIC_.

Step 4: Start the Backend

In a separate terminal:

cd mcp-prompts-resources-poc
source .venv/bin/activate
uvicorn api:app --reload

The backend should be accessible at:

http://localhost:8000

Step 5: Start the Frontend

npm run dev

Open:

http://localhost:3000

13. Testing

The frontend can be tested with two custom agents: Project Assistant and Project Technical Analyst.

Project Assistant Tests

Test 1 — Project Overview

Give me a complete overview of this project
using the available MCP tool.

Expected: The backend executes get_project_overview.

Test 2 — Requirements Resource

What are the main requirements of this project?

Expected: The backend retrieves the requirements resource.

Test 3 — MCP Prompt

Retrieve the summarize_project MCP prompt
and show its instructions.

Expected: The backend retrieves the selected MCP prompt.

Project Technical Analyst Tests

Test 1 — Technical Architecture

Analyze the project's architecture and explain
its major technical components.

Expected: The backend retrieves relevant architecture information.

Test 2 — Requirements Comparison

Compare the project requirements with the
architecture and identify potential gaps.

Expected: The backend retrieves the relevant resources and performs a grounded comparison.

Test 3 — Multi-Operation Execution

Use the project overview tool, read both project
resources, and provide a detailed technical analysis.

Expected: The backend executes multiple relevant MCP operations.

Multi-Agent Switching

Switch between the two agents and verify:

Each agent follows its own system prompt.

Agent configuration changes are reflected correctly.

Tool permissions remain agent-specific.

The execution log corresponds to the selected agent's request.

Out-of-Scope Questions

Example:

Write a poem about the ocean.

Desired response:

Out of scope: This question is outside the selected
agent's responsibilities. Please ask a question
related to this agent's purpose or select a more
suitable agent.

Implementation note: Strict out-of-scope enforcement is planned. The current implementation should not be assumed to reject all unrelated questions until backend validation is implemented and tested.

14. Code Verification

Run the following commands from the frontend directory.

TypeScript Validation

npx tsc --noEmit

ESLint

npm run lint

Production Build

npm run build

Start Production Server

npm run start

These commands help verify that the frontend compiles and can be built successfully.

15. Known Limitations

The MCP Playground is a proof of concept.

Current limitations include:

Manual mode does not guarantee execution of the selected MCP operation.

Resource and prompt selection restrictions are not fully enforced.

Strict out-of-scope validation is not yet implemented.

The frontend depends on a running FastAPI backend.

Execution logs are returned through API responses rather than live WebSocket streaming.

Production authentication and deployment are outside the current scope.

16. Future Improvements

Potential enhancements include:

Strict out-of-scope validation for custom agents.

Full Manual mode enforcement.

Improved multi-agent testing and isolation.

Support for additional MCP servers.

Enhanced execution event streaming.

Better agent permission management.

More detailed error handling.

Production deployment and authentication.

17. Conclusion

The MCP Playground frontend provides a configurable interface for experimenting with MCP-enabled AI agents.

By combining Next.js, FastAPI, Groq, and FastMCP, the project demonstrates custom agent management, dynamic MCP discovery, automated tool selection, resource retrieval, prompt execution, and agent execution inspection.

The frontend and backend are maintained as separate repositories, allowing both applications to evolve independently.
