
import type {
  AgentConfig,
  AgentRecord,
  AgentReviewResponse,
  AgentUpdateRequest,
} from "@/types/agents";

import type { ExecutionEvent } from "@/types/chat";
import type { MCPCapabilities } from "@/types/mcp";

import type {
  CreateManagerInput,
  ManagerAccount,
} from "@/types/admin";

import type {
  AuthUser,
  UserRole,
} from "@/types/auth";

import type {
  ManagedTool,
  UpdateManagedToolInput,
} from "@/types/tool-management";

import { getAccessToken } from "@/lib/auth";

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:8000"
).replace(/\/+$/, "");

/* =========================================================
   TYPES
========================================================= */

export interface ChatResponse {
  answer: string;
  events: ExecutionEvent[];
}

interface ChatRequest {
  message: string;
  agent_id?: string;
}

export interface CreateRegularUserPayload {
  username: string;
  password: string;
}

export interface UpdateRegularUserPayload {
  username?: string;
  is_active?: boolean;
}

export interface UpdateManagerPayload {
  username?: string;
  is_active?: boolean;
}

/* =========================================================
   SHARED API REQUEST
========================================================= */

/**
 * Send an authenticated HTTP request to the FastAPI backend.
 *
 * @param endpoint - Backend API endpoint.
 * @param options - Optional fetch configuration.
 * @returns Parsed backend response.
 * @throws Error if authentication or the request fails.
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAccessToken();

  const headers = new Headers(options.headers);

  if (
    !headers.has("Content-Type") &&
    options.body != null
  ) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      ...options,
      headers,
      cache: "no-store",
    }
  );

  if (!response.ok) {
    const errorBody = await response
      .json()
      .catch(() => null);

    const detail = errorBody?.detail;

    if (Array.isArray(detail)) {
      const messages = detail.map(
        (error: {
          loc?: (string | number)[];
          msg?: string;
        }) => {
          const field =
            error.loc?.join(".") ?? "unknown";

          return `${field}: ${
            error.msg ?? "Invalid value"
          }`;
        }
      );

      throw new Error(messages.join("\n"));
    }

    if (response.status === 401) {
      throw new Error(
        "Your session is missing or has expired. Please sign in again."
      );
    }

    throw new Error(
      typeof detail === "string"
        ? detail
        : `Backend request failed (${response.status}).`
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

/* =========================================================
   ADMIN ACCOUNT MANAGEMENT
========================================================= */

/**
 * Retrieve accounts visible to the administrator.
 *
 * @param role - Optional role filter.
 * @returns Matching accounts.
 * @throws Error if the request fails.
 */
export async function getAdminUsers(
  role?: UserRole
): Promise<AuthUser[]> {
  const query = role
    ? `?role=${encodeURIComponent(role)}`
    : "";

  return apiRequest<AuthUser[]>(
    `/api/admin/users${query}`,
    {
      method: "GET",
    }
  );
}

/**
 * Create a Manager account using Admin credentials.
 *
 * @param input - Manager username and password.
 * @returns Newly created Manager account.
 * @throws Error if account creation fails.
 */
export async function createManager(
  input: CreateManagerInput
): Promise<ManagerAccount> {
  return apiRequest<ManagerAccount>(
    "/api/admin/managers",
    {
      method: "POST",
      body: JSON.stringify(input),
    }
  );
}

/**
 * Retrieve a Manager account by ID.
 *
 * @param managerId - Manager identifier.
 * @returns Matching Manager account.
 * @throws Error if the Manager is unavailable.
 */
export async function getManager(
  managerId: string
): Promise<AuthUser> {
  return apiRequest<AuthUser>(
    `/api/admin/managers/${encodeURIComponent(managerId)}`,
    {
      method: "GET",
    }
  );
}

/**
 * Update a Manager account.
 *
 * @param managerId - Manager identifier.
 * @param payload - Updated username or active status.
 * @returns Updated Manager account.
 * @throws Error if updating fails.
 */
export async function updateManager(
  managerId: string,
  payload: UpdateManagerPayload
): Promise<AuthUser> {
  return apiRequest<AuthUser>(
    `/api/admin/managers/${encodeURIComponent(managerId)}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    }
  );
}

/**
 * Reset a Manager account password.
 *
 * @param managerId - Manager identifier.
 * @param newPassword - Replacement password.
 * @returns Promise that resolves after password reset.
 * @throws Error if resetting fails.
 */
export async function resetManagerPassword(
  managerId: string,
  newPassword: string
): Promise<void> {
  await apiRequest<void>(
    `/api/admin/managers/${encodeURIComponent(managerId)}/reset-password`,
    {
      method: "POST",
      body: JSON.stringify({
        new_password: newPassword,
      }),
    }
  );
}

/**
 * Delete a Manager account.
 *
 * @param managerId - Manager identifier.
 * @returns Promise that resolves after deletion.
 * @throws Error if deletion fails.
 */
export async function deleteManager(
  managerId: string
): Promise<void> {
  await apiRequest<void>(
    `/api/admin/managers/${encodeURIComponent(managerId)}`,
    {
      method: "DELETE",
    }
  );
}

/* =========================================================
   REGULAR USER MANAGEMENT
   Available to Admin and Manager
========================================================= */

/**
 * Retrieve all regular User accounts.
 *
 * @returns Registered regular User accounts.
 * @throws Error if authorization or retrieval fails.
 */
export async function getManagedUsers():
  Promise<AuthUser[]> {
  return apiRequest<AuthUser[]>(
    "/api/management/users",
    {
      method: "GET",
    }
  );
}

/**
 * Retrieve a regular User account by ID.
 *
 * @param userId - Account identifier.
 * @returns Matching User account.
 * @throws Error if the account is unavailable.
 */
export async function getManagedUser(
  userId: string
): Promise<AuthUser> {
  return apiRequest<AuthUser>(
    `/api/management/users/${encodeURIComponent(userId)}`,
    {
      method: "GET",
    }
  );
}

/**
 * Create a regular User account.
 *
 * @param payload - Username and initial password.
 * @returns Newly created User account.
 * @throws Error if creation fails.
 */
export async function createManagedUser(
  payload: CreateRegularUserPayload
): Promise<AuthUser> {
  return apiRequest<AuthUser>(
    "/api/management/users",
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
}

/**
 * Update a regular User account.
 *
 * @param userId - Account identifier.
 * @param payload - Updated username or active status.
 * @returns Updated User account.
 * @throws Error if updating fails.
 */
export async function updateManagedUser(
  userId: string,
  payload: UpdateRegularUserPayload
): Promise<AuthUser> {
  return apiRequest<AuthUser>(
    `/api/management/users/${encodeURIComponent(userId)}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    }
  );
}

/**
 * Reset a regular User account password.
 *
 * @param userId - Account identifier.
 * @param newPassword - Replacement password.
 * @returns Promise that resolves after password reset.
 * @throws Error if resetting fails.
 */
export async function resetManagedUserPassword(
  userId: string,
  newPassword: string
): Promise<void> {
  await apiRequest<void>(
    `/api/management/users/${encodeURIComponent(userId)}/reset-password`,
    {
      method: "POST",
      body: JSON.stringify({
        new_password: newPassword,
      }),
    }
  );
}

/**
 * Delete a regular User account.
 *
 * @param userId - Account identifier.
 * @returns Promise that resolves after deletion.
 * @throws Error if deletion fails.
 */
export async function deleteManagedUser(
  userId: string
): Promise<void> {
  await apiRequest<void>(
    `/api/management/users/${encodeURIComponent(userId)}`,
    {
      method: "DELETE",
    }
  );
}

/* =========================================================
   MCP CAPABILITIES
========================================================= */

/**
 * Retrieve available MCP tools, resources, and prompts.
 *
 * @returns Discovered MCP capabilities.
 * @throws Error if discovery fails.
 */
export async function getMCPCapabilities():
  Promise<MCPCapabilities> {
  return apiRequest<MCPCapabilities>(
    "/api/mcp/capabilities"
  );
}

/* =========================================================
   AGENT MANAGEMENT
========================================================= */

/**
 * Retrieve saved agents.
 *
 * @returns Saved agent configurations.
 * @throws Error if the request fails.
 */
export async function getAgents():
  Promise<AgentConfig[]> {
  return apiRequest<AgentConfig[]>(
    "/api/agents"
  );
}

/**
 * Retrieve saved agent records with approval metadata.
 *
 * @returns Saved agent records.
 * @throws Error if retrieval fails.
 */
export async function getAgentRecords():
  Promise<AgentRecord[]> {
  return apiRequest<AgentRecord[]>(
    "/api/agents/records"
  );
}

/**
 * Retrieve a saved agent by ID.
 *
 * @param agentId - Saved agent identifier.
 * @returns Saved agent configuration.
 * @throws Error if the agent is unavailable.
 */
export async function getAgent(
  agentId: string
): Promise<AgentConfig> {
  return apiRequest<AgentConfig>(
    `/api/agents/${encodeURIComponent(agentId)}`
  );
}

/**
 * Create and persist a custom agent.
 *
 * @param agent - Agent configuration.
 * @returns Newly created agent.
 * @throws Error if creation fails.
 */
export async function createAgent(
  agent: AgentConfig
): Promise<AgentConfig> {
  return apiRequest<AgentConfig>(
    "/api/agents",
    {
      method: "POST",
      body: JSON.stringify(agent),
    }
  );
}

/**
 * Update an existing saved agent.
 *
 * @param agentId - Saved agent identifier.
 * @param request - Updated agent configuration and version.
 * @returns Updated agent configuration.
 * @throws Error if updating fails.
 */
export async function updateAgent(
  agentId: string,
  request: AgentUpdateRequest
): Promise<AgentConfig> {
  return apiRequest<AgentConfig>(
    `/api/agents/${encodeURIComponent(agentId)}`,
    {
      method: "PUT",
      body: JSON.stringify(request),
    }
  );
}

/**
 * Delete a saved agent.
 *
 * @param agentId - Saved agent identifier.
 * @returns Promise that resolves after deletion.
 * @throws Error if deletion fails.
 */
export async function deleteAgent(
  agentId: string
): Promise<void> {
  await apiRequest<void>(
    `/api/agents/${encodeURIComponent(agentId)}`,
    {
      method: "DELETE",
    }
  );
}

/* =========================================================
   CHAT
========================================================= */

/**
 * Send a message to the Default Assistant or custom agent.
 *
 * When no agent ID is provided, the backend uses the
 * built-in Default Assistant without MCP tools.
 *
 * When an agent ID is provided, the backend executes
 * the selected custom MCP-enabled agent.
 *
 * @param message - User message.
 * @param agentId - Saved agent ID or null for Default Assistant.
 * @returns Answer and execution events.
 * @throws Error if execution fails.
 */
export async function sendChatMessage(
  message: string,
  agentId: string | null = null
): Promise<ChatResponse> {
  const payload: ChatRequest = {
    message,
  };

  if (agentId !== null) {
    payload.agent_id = agentId;
  }

  return apiRequest<ChatResponse>(
    "/api/chat",
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
}

/* =========================================================
   AGENT APPROVAL WORKFLOW
========================================================= */

/**
 * Submit an agent draft for approval.
 *
 * @param agentId - Saved agent identifier.
 * @param expectedVersion - Current agent version.
 * @returns Updated agent review response.
 * @throws Error if submission fails.
 */
export async function submitAgent(
  agentId: string,
  expectedVersion: number
): Promise<AgentReviewResponse> {
  return apiRequest<AgentReviewResponse>(
    `/api/agents/${encodeURIComponent(agentId)}/submit`,
    {
      method: "POST",
      body: JSON.stringify({
        expected_version: expectedVersion,
      }),
    }
  );
}

/**
 * Approve a pending agent as an authorized reviewer.
 *
 * @param agentId - Saved agent identifier.
 * @param expectedVersion - Current agent version.
 * @returns Updated agent review response.
 * @throws Error if approval fails.
 */
export async function approveAgent(
  agentId: string,
  expectedVersion: number
): Promise<AgentReviewResponse> {
  return apiRequest<AgentReviewResponse>(
    `/api/agents/${encodeURIComponent(agentId)}/approve`,
    {
      method: "POST",
      body: JSON.stringify({
        expected_version: expectedVersion,
      }),
    }
  );
}

/**
 * Reject a pending agent as an authorized reviewer.
 *
 * @param agentId - Saved agent identifier.
 * @param expectedVersion - Current agent version.
 * @returns Updated agent review response.
 * @throws Error if rejection fails.
 */
export async function rejectAgent(
  agentId: string,
  expectedVersion: number
): Promise<AgentReviewResponse> {
  return apiRequest<AgentReviewResponse>(
    `/api/agents/${encodeURIComponent(agentId)}/reject`,
    {
      method: "POST",
      body: JSON.stringify({
        expected_version: expectedVersion,
      }),
    }
  );
}


/* =========================================================
   ADMIN MCP TOOL MANAGEMENT
========================================================= */

/**
 * Retrieve all registered MCP tools visible to Admin.
 *
 * @returns Registered MCP tool configurations.
 * @throws Error if retrieval or authorization fails.
 */
export async function getAdminTools(): Promise<ManagedTool[]> {
  return apiRequest<ManagedTool[]>(
    "/api/admin/tools",
    {
      method: "GET",
    }
  );
}

/**
 * Update an MCP tool's editable configuration.
 *
 * @param toolName - Registered MCP tool name.
 * @param payload - Updated description or enabled status.
 * @returns Updated MCP tool configuration.
 * @throws Error if the update fails.
 */
export async function updateAdminTool(
  toolName: string,
  payload: UpdateManagedToolInput
): Promise<ManagedTool> {
  return apiRequest<ManagedTool>(
    `/api/admin/tools/${encodeURIComponent(toolName)}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    }
  );
}

/**
 * Enable or disable a registered MCP tool.
 *
 * @param toolName - Registered MCP tool name.
 * @param enabled - Desired availability.
 * @returns Updated MCP tool configuration.
 * @throws Error if the status update fails.
 */
export async function setAdminToolEnabled(
  toolName: string,
  enabled: boolean
): Promise<ManagedTool> {
  return apiRequest<ManagedTool>(
    `/api/admin/tools/${encodeURIComponent(toolName)}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({ enabled }),
    }
  );
}
