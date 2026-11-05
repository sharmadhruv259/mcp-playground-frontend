# MCP Playground — Frontend

Final Project Video Link: https://github.com/user-attachments/assets/1ffa8174-6b79-415c-9dba-23cb3ae8a800

![Next.js](https://img.shields.io/badge/Next.js-App_Router-black?logo=nextdotjs)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-styling-06B6D4?logo=tailwindcss&logoColor=white)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi&logoColor=white)

A modern, interactive **Next.js frontend** for experimenting with Model Context Protocol (MCP) tools, resources, and prompts through a Groq-powered AI agent backend.

The application provides a three-panel workspace for creating and managing custom AI agents, selecting MCP operations, chatting with agents, and inspecting backend execution logs. It also includes **sign-in, role-based access, an agent approval workflow, and Admin and Manager dashboards**.

Built with **Next.js, React, TypeScript, Tailwind CSS, and Lucide React**.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [Project Structure](#3-project-structure)
4. [Application Architecture](#4-application-architecture)
5. [Authentication and Roles](#5-authentication-and-roles)
6. [Custom AI Agents and Approval Workflow](#6-custom-ai-agents-and-approval-workflow)
7. [MCP Capabilities](#7-mcp-capabilities)
8. [Auto and Manual Modes](#8-auto-and-manual-modes)
9. [Chat Interface](#9-chat-interface)
10. [Agent Execution Panel](#10-agent-execution-panel)
11. [Admin and Manager Dashboards](#11-admin-and-manager-dashboards)
12. [User Interface](#12-user-interface)
13. [Backend API Integration](#13-backend-api-integration)
14. [Prerequisites](#14-prerequisites)
15. [Installation](#15-installation)
16. [Testing](#16-testing)
17. [Code Verification](#17-code-verification)
18. [Known Limitations](#18-known-limitations)
19. [Future Improvements](#19-future-improvements)
20. [Conclusion](#20-conclusion)

---

## 1. Project Overview

The MCP Playground frontend provides an interactive interface for a FastAPI backend powered by Groq and the Python MCP SDK.

Users can create custom agents with their own system instructions, submit them for review, select available MCP operations, and observe how the backend processes requests. Administrators and managers can review submitted agents and manage accounts from dedicated dashboards.

The frontend communicates with the backend through REST APIs.

### Key Features

- **Authentication:** Sign in through a login modal. Chat and agent actions prompt for sign-in when needed, and an interrupted message is sent automatically after login.
- **Role-Based Access:** Separate experiences for Users, Managers, and Admins.
- **Default Assistant:** General-purpose chat that is available without selecting a custom agent. It does not execute MCP tools.
- **Custom AI Agents:** Create, select, edit, and delete agents with different responsibilities and system prompts.
- **Approval Workflow:** Agents move through Draft, Pending, Approved, and Rejected states. Only approved agents can run.
- **Agent-Specific Configuration:** Configure tool access, allowed MCP tools, and caching settings.
- **Auto Mode:** Let Groq select relevant MCP operations based on the user's question.
- **Manual Mode:** Select a permitted MCP operation from the frontend.
- **Dynamic MCP Discovery:** Retrieve available tools, resources, and prompts from the backend.
- **Interactive Chat:** Ask questions with Markdown rendering for tables, lists, and code blocks.
- **Agent Execution Panel:** Inspect MCP operation execution, arguments, results, and errors returned by the backend.
- **Starter Cards:** Begin common MCP test scenarios in one click.
- **Admin and Manager Dashboards:** User management, manager management, agent reviews, and MCP tool management.
- **Loading Screen with ETA:** Shows an estimated remaining time based on previous successful loads.

Custom agents are persisted by the backend using SQLite rather than being stored in browser `localStorage`.

## 2. Technology Stack

| Technology | Purpose |
|---|---|
| Next.js (App Router) | Frontend framework |
| React | UI components |
| TypeScript | Type safety |
| Tailwind CSS | Styling |
| Lucide React | Icons |
| react-markdown + remark-gfm | Markdown rendering in chat responses |
| FastAPI | Backend REST API |
| Groq | LLM-based tool selection and response generation |
| FastMCP | Backend MCP tools, resources, and prompts |

The backend is maintained in a separate repository: `mcp-prompts-resources-poc`.

## 3. Project Structure

```text
mcp-playground-frontend/
│
├── app/
│   ├── login/                      # Login route
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                    # Playground workspace and state coordination
│
├── src/
│   ├── components/
│   │   ├── admin/                  # Admin dashboard, manager and tool management
│   │   ├── agents/
│   │   │   └── AgentForm.tsx       # Agent creation and editing
│   │   ├── auth/
│   │   │   └── LoginModal.tsx      # Sign-in modal
│   │   ├── chat/
│   │   │   └── ChatPanel.tsx       # Messages, input, and starter cards
│   │   ├── dashboard/              # Shared dashboard layout, user management, agent reviews
│   │   ├── execution/
│   │   │   └── ExecutionLog.tsx    # Backend execution events
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx         # Agents, approval status, tools, profile
│   │   │   ├── FullScreenLoader.tsx
│   │   │   └── RolePortal.tsx      # Role-based routing to the right view
│   │   ├── manager/                # Manager dashboard
│   │   └── tools/
│   │       └── ToolSelector.tsx    # Auto/Manual mode controls
│   │
│   ├── constants/
│   │   └── starters.ts             # Starter prompts
│   │
│   ├── context/
│   │   └── AuthContext.tsx         # Authentication state
│   │
│   ├── hooks/
│   │   ├── useAgents.ts
│   │   ├── useMCPCapabilities.ts
│   │   └── useLoadingPrediction.ts
│   │
│   ├── lib/
│   │   ├── api.ts                  # FastAPI requests
│   │   └── auth.ts                 # Access token helpers
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
├── eslint.config.mjs
├── next.config.ts
├── package.json
├── package-lock.json
├── tsconfig.json
└── README.md
```

### File Responsibilities

| File | Responsibility |
|---|---|
| `app/page.tsx` | Main workspace: chat, agents, tool selection, and authentication flow |
| `RolePortal.tsx` | Directs signed-in users to the Playground or their role's dashboard |
| `LoginModal.tsx` | Sign-in modal opened when an action requires authentication |
| `AgentForm.tsx` | Custom agent creation, editing, and submission for approval |
| `ChatPanel.tsx` | Chat messages, question input, and starter cards |
| `ExecutionLog.tsx` | Displays backend execution events |
| `Sidebar.tsx` | Agent selection, approval status groups, tool list, and user profile |
| `ToolSelector.tsx` | MCP operation selection and execution mode controls |
| `FullScreenLoader.tsx` | Animated loading screen with estimated time remaining |
| `AuthContext.tsx` | Current user, role, and sign-in state |
| `useAgents.ts` | Retrieves and manages agents and their approval status |
| `useMCPCapabilities.ts` | Fetches MCP capabilities from the backend |
| `useLoadingPrediction.ts` | Predicts initial load time from previous successful loads |
| `api.ts` | Centralizes FastAPI requests |
| `starters.ts` | Defines starter questions |

## 4. Application Architecture

```text
                       USER
                         |
                         v
                 Next.js Frontend
                         |
                    AuthContext
                         |
                    RolePortal
          +--------------+--------------+
          |                             |
          v                             v
     Playground                  Admin / Manager
          |                       Dashboards
   +------+-------+
   |      |       |
   v      v       v
Sidebar ChatPanel ExecutionLog
   |
   v
AgentForm / ToolSelector
          |
          v
     src/lib/api.ts
          |
          v
    FastAPI Backend
          |
   +------+------+------+
   |      |      |      |
   v      v      v      v
 Auth  Agents   Chat  Discovery
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
   +------+------+
   |      |      |
   v      v      v
 Tools Resources Prompts
          |
          v
     API Response
          |
          v
 Chat + Execution Log
```

The frontend does not directly execute MCP operations. It sends requests to FastAPI, which handles authentication, MCP discovery, agent execution, and tool invocation.

## 5. Authentication and Roles

Users sign in through a login modal. Actions that need an account, such as sending a message, creating, editing, or deleting an agent, or submitting an agent for approval, open the modal when the user is signed out. If a message was interrupted by the login prompt, it is sent automatically after a successful sign-in.

### Roles

| Capability | User | Manager | Admin |
|---|:---:|:---:|:---:|
| Chat with the Default Assistant or approved agents | ✅ | ✅ | ✅ |
| Create, edit, and delete agents; submit them for approval | ✅ | ✅ | ✅ |
| Review, approve, and reject submitted agents | — | ✅ | ✅ |
| Manage regular User accounts | — | ✅ | ✅ |
| Manage Manager accounts | — | — | ✅ |
| Manage MCP tools (descriptions and availability) | — | — | ✅ |

Role permissions are also enforced by the backend. The frontend hides or blocks restricted sections but does not rely on that for security.

## 6. Custom AI Agents and Approval Workflow

The application supports creating and managing multiple custom agents. Each agent can have its own:

- Name and description.
- Custom system prompt.
- Tool access configuration.
- Allowed MCP tools.
- Cache settings.

Agent configurations are stored by the backend using SQLite.

### Default Assistant

When no custom agent is selected, the **Default Assistant** answers general questions through Groq. It has no MCP access and does not execute tools.

### Approval Workflow

```text
  Create / Edit            Submit for Approval           Review
  ┌────────┐             ┌──────────────┐          ┌──────────────┐
  │ Draft  │ ──────────► │   Pending    │ ───────► │   Approved   │
  └────────┘             └──────────────┘    │     └──────────────┘
                                             │     ┌──────────────┐
                                             └───► │   Rejected   │
                                                   └──────────────┘
```

- **Draft:** Saved but not yet submitted for review.
- **Pending:** Waiting for Admin or Manager approval.
- **Approved:** Available in the **Saved Agents** selector and can run.
- **Rejected:** Declined by a reviewer.

The sidebar groups agents by status. A custom agent that is not approved cannot execute requests.

### Creating a Custom Agent

1. Sign in and open the agent creation form from the sidebar.
2. Enter the agent name and description.
3. Provide a custom system prompt.
4. Configure MCP tool access.
5. Configure caching if needed.
6. Save as a draft, or save and submit for approval in one step.
7. Once approved, select the agent and begin chatting.

### Example Agent 1: Project Assistant

**Purpose:** Answer general questions about project requirements, architecture, and objectives.

Typical questions:

- What are the main project requirements?
- Give me a complete project overview.
- Explain the architecture in simple terms.
- Summarize the project requirements and architecture.

### Example Agent 2: Project Technical Analyst

**Purpose:** Analyze the technical architecture and implementation requirements.

Typical questions:

- Explain the project's technical components.
- Compare the requirements with the architecture.
- Identify potential technical limitations.
- Recommend architectural improvements.

### Example Custom System Prompt

```text
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
```

## 7. MCP Capabilities

The frontend retrieves available MCP capabilities from the backend and lists them in the sidebar under **Available Tools**.

### Native MCP Tools

The backend currently exposes:

`get_project_overview`

The agent can execute it through the Groq-facing function:

`mcp_tool__get_project_overview`

Native tools are shown in the frontend with the `mcp_tool__` prefix. The prefix is removed when the name is sent to the backend.

### MCP Resources

| Resource | URI |
|---|---|
| Project Requirements | `project://requirements` |
| Project Architecture | `project://architecture` |

Resources are read through the `read_mcp_resource` function.

### MCP Prompts

| Prompt | Purpose |
|---|---|
| `summarize_project` | Retrieve reusable project summarization instructions |
| `explain_technical` | Retrieve reusable technical explanation instructions |

Prompts are retrieved through the `get_mcp_prompt` function.

## 8. Auto and Manual Modes

### Auto Mode

Auto mode allows Groq to determine which available MCP operations should be used.

Example question:

```text
Read both project resources and explain how the
architecture supports the project requirements.
```

The backend may execute multiple MCP operations before returning the final response.

### Manual Mode

Manual mode allows users to select an MCP operation through the frontend.

1. Select an approved agent.
2. Switch from Auto to Manual.
3. Choose the relevant MCP operation.
4. Enter a question.
5. Inspect the execution log.

When an agent is saved with selected tools, the frontend restores that selection in Manual mode when the agent is chosen.

**Current limitation:** Manual mode restricts available native MCP tools but does not force Groq to call the selected tool. Resource and prompt selections are not yet fully enforced.

## 9. Chat Interface

The chat interface sends questions to the Default Assistant or the selected approved agent.

The backend processes each request using:

- The selected agent configuration and system prompt.
- Available MCP capabilities.
- Groq function calling.
- MCP execution results.

Responses are rendered as Markdown, including tables, lists, links, and code blocks. A status chip in the chat header shows whether the agent is ready or working.

### Starter Cards

Starter cards provide example questions for testing MCP capabilities:

- Read the project docs (`read_mcp_resource`).
- Fetch reusable instructions (`get_mcp_prompt`).
- Ask about the architecture.
- Let the agent choose (Auto).

Only starters whose tool is available from the backend are shown. With the Default Assistant, starters are sent as plain questions without MCP tool selection.

## 10. Agent Execution Panel

The execution panel displays execution information returned by the backend for the latest request.

Depending on the request, this may include:

- MCP operation selection.
- Function arguments.
- MCP tool execution.
- Resource retrieval.
- Prompt retrieval.
- Cache-related events.
- Execution errors, including failed backend requests.
- Agent response generation.

Execution information is returned through the API response rather than a dedicated WebSocket stream. The panel can be collapsed to give the chat more room.

## 11. Admin and Manager Dashboards

Signed-in Admins and Managers have a dashboard with an overview and role-specific sections, plus a shortcut back to the Playground.

### Admin Dashboard

| Section | Purpose |
|---|---|
| User Management | View, create, edit, reset passwords, and manage regular User accounts |
| Manager Management | Create, view, edit, reset passwords, and manage Manager accounts |
| Agent Reviews | Inspect submitted agents and approve or reject requests |
| Tool Management | View registered MCP tools, edit descriptions, and enable or disable operations |

### Manager Dashboard

| Section | Purpose |
|---|---|
| User Management | View, create, edit, reset passwords, and manage regular User accounts |
| Agent Reviews | Inspect submitted agents and approve or reject pending requests |

Managers cannot access Manager Management or Tool Management.

## 12. User Interface

- **Navy dark theme** with indigo accents throughout.
- **Three-panel workspace:** collapsible sidebar, chat, and collapsible execution log.
- **Sidebar:** agent selector, status groups for Draft, Pending, and Rejected agents, tool selection, a list of available tools, and a profile card with sign-in or sign-out.
- **Loading screen:** animated orbit of agents, tools, resources, and prompts with a progress bar. The estimated remaining time is based on previous successful loads, and a "taking longer than usual" state appears when the estimate is exceeded.
- **Accessibility:** visible keyboard focus styles, ARIA roles on status and alert regions, and reduced-motion support in animations.

## 13. Backend API Integration

The frontend communicates with FastAPI through `src/lib/api.ts`.

### Main API Endpoints

| Endpoint | Purpose |
|---|---|
| `GET /api/mcp/capabilities` | Retrieve available MCP capabilities |
| `/api/agents` | Create, retrieve, update, delete, and submit custom agents |
| `POST /api/chat` | Submit questions to the Default Assistant or a selected agent |

Authentication, agent review, user management, and tool management endpoints are also provided by the backend. See the interactive API documentation for the full list:

`http://localhost:8000/docs`

## 14. Prerequisites

Before running the frontend, ensure that you have:

- Node.js and npm installed.
- The MCP Playground FastAPI backend available.
- A valid Groq API key configured on the backend.
- Backend dependencies installed.
- The backend MCP server registered and accessible through FastAPI.
- A user account on the backend (see the backend repository for how accounts are created).

The current backend uses an in-process MCP connection, so a separate MCP server terminal is not required.

## 15. Installation

### Step 1: Clone the Frontend Repository

```bash
git clone <your-frontend-repository-url>
cd mcp-playground-frontend
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Configure Environment Variables

Copy the environment template:

```bash
cp .env.example .env.local
```

Configure the backend URL:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

Ensure the variable name matches the one used by `src/lib/api.ts`.

**Security:** Keep `GROQ_API_KEY` on the backend. Never place private API keys inside frontend environment variables prefixed with `NEXT_PUBLIC_`.

### Step 4: Start the Backend

In a separate terminal:

```bash
cd mcp-prompts-resources-poc
source .venv/bin/activate
uvicorn api:app --reload
```

The backend should be accessible at:

`http://localhost:8000`

### Step 5: Start the Frontend

```bash
npm run dev
```

Open:

[http://localhost:3000](http://localhost:3000)

## 16. Testing

### Authentication and Roles

- **Signed-out message:** Send a message while signed out. The login modal opens; after signing in, the message is sent automatically.
- **Role routing:** Sign in as a User, a Manager, and an Admin and confirm each lands on the expected view.
- **Manager restrictions:** As a Manager, confirm Manager Management and Tool Management are not accessible.
- **Sign out:** Confirm sign-out clears the conversation and returns to the signed-out state.

### Approval Workflow

1. Create an agent and save it as a draft. It appears under **Draft Agents**.
2. Select **Submit for Approval**. It moves to **Pending Approval**.
3. Sign in as an Admin or Manager and approve it under **Agent Reviews**.
4. Refresh the agent list in the sidebar. The agent appears under **Saved Agents** and can now run.
5. Repeat with a rejected agent and confirm it appears under **Rejected Agents** and cannot run.

### Project Assistant Tests

**Test 1 — Project Overview**

```text
Give me a complete overview of this project
using the available MCP tool.
```

Expected: The backend executes `get_project_overview`.

**Test 2 — Requirements Resource**

```text
What are the main requirements of this project?
```

Expected: The backend retrieves the requirements resource.

**Test 3 — MCP Prompt**

```text
Retrieve the summarize_project MCP prompt
and show its instructions.
```

Expected: The backend retrieves the selected MCP prompt.

### Project Technical Analyst Tests

**Test 1 — Technical Architecture**

```text
Analyze the project's architecture and explain
its major technical components.
```

Expected: The backend retrieves relevant architecture information.

**Test 2 — Requirements Comparison**

```text
Compare the project requirements with the
architecture and identify potential gaps.
```

Expected: The backend retrieves the relevant resources and performs a grounded comparison.

**Test 3 — Multi-Operation Execution**

```text
Use the project overview tool, read both project
resources, and provide a detailed technical analysis.
```

Expected: The backend executes multiple relevant MCP operations.

### Multi-Agent Switching

Switch between the two agents and verify:

- Each agent follows its own system prompt.
- Agent configuration changes are reflected correctly.
- Tool permissions remain agent-specific.
- The execution log corresponds to the selected agent's request.

### Out-of-Scope Questions

Example:

```text
Write a poem about the ocean.
```

Desired response:

```text
Out of scope: This question is outside the selected
agent's responsibilities. Please ask a question
related to this agent's purpose or select a more
suitable agent.
```

**Implementation note:** Strict out-of-scope enforcement is planned. The current implementation should not be assumed to reject all unrelated questions until backend validation is implemented and tested.

## 17. Code Verification

Run the following commands from the frontend directory.

### TypeScript Validation

```bash
npx tsc --noEmit
```

### ESLint

```bash
npm run lint
```

### Production Build

```bash
npm run build
```

### Start Production Server

```bash
npm run start
```

These commands help verify that the frontend compiles and can be built successfully.


## 18. Conclusion

The MCP Playground frontend provides a configurable, role-aware interface for experimenting with MCP-enabled AI agents.

By combining Next.js, FastAPI, Groq, and FastMCP, the project demonstrates authenticated custom agent management with an approval workflow, dynamic MCP discovery, automated tool selection, resource retrieval, prompt execution, agent execution inspection, and administrative dashboards.

The frontend and backend are maintained as separate repositories, allowing both applications to evolve independently.
