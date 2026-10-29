
import type { AgentConfig } from "@/types/agents";
import type { ExecutionEvent } from "@/types/chat";
import type { MCPCapabilities } from "@/types/mcp";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:8000";

export interface ChatResponse {
  answer: string;
  events: ExecutionEvent[];
}

interface ChatRequest {
  message: string;
  agent_id: string;
}

/**
 * Send an HTTP request to the FastAPI backend.
 *
 * Args:
 *     endpoint (string): API endpoint path.
 *     options (RequestInit): Optional fetch configuration.
 *
 * Returns:
 *     Promise<T>: Parsed backend response.
 *
 * Raises:
 *     Error: If the request fails.
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
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

/**
 * Retrieve available MCP tools, resources, and prompts.
 *
 * Returns:
 *     Promise<MCPCapabilities>: Discovered capabilities.
 *
 * Raises:
 *     Error: If MCP discovery fails.
 */
export async function getMCPCapabilities():
  Promise<MCPCapabilities> {
  return apiRequest<MCPCapabilities>(
    "/api/mcp/capabilities"
  );
}

/**
 * Retrieve saved agents.
 *
 * Returns:
 *     Promise<AgentConfig[]>: Saved agents.
 *
 * Raises:
 *     Error: If the request fails.
 */
export async function getAgents():
  Promise<AgentConfig[]> {
  return apiRequest<AgentConfig[]>(
    "/api/agents"
  );
}

/**
 * Retrieve a saved agent by ID.
 *
 * Args:
 *     agentId (string): Saved agent identifier.
 *
 * Returns:
 *     Promise<AgentConfig>: Saved agent.
 *
 * Raises:
 *     Error: If the agent is unavailable.
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
 * Args:
 *     agent (AgentConfig): Agent configuration.
 *
 * Returns:
 *     Promise<AgentConfig>: Saved agent.
 *
 * Raises:
 *     Error: If creation fails.
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
 * Args:
 *     agentId (string): Saved agent identifier.
 *     agent (AgentConfig): Updated configuration.
 *
 * Returns:
 *     Promise<AgentConfig>: Updated agent.
 *
 * Raises:
 *     Error: If updating fails.
 */
export async function updateAgent(
  agentId: string,
  agent: AgentConfig
): Promise<AgentConfig> {
  return apiRequest<AgentConfig>(
    `/api/agents/${encodeURIComponent(agentId)}`,
    {
      method: "PUT",
      body: JSON.stringify(agent),
    }
  );
}

/**
 * Delete a saved agent.
 *
 * Args:
 *     agentId (string): Saved agent identifier.
 *
 * Returns:
 *     Promise<void>: Completes after deletion.
 *
 * Raises:
 *     Error: If deletion fails.
 */
export async function deleteAgent(
  agentId: string
): Promise<void> {
  return apiRequest<void>(
    `/api/agents/${encodeURIComponent(agentId)}`,
    {
      method: "DELETE",
    }
  );
}

/**
 * Send a message to a saved custom agent.
 *
 * Args:
 *     message (string): User's question.
 *     agentId (string): Selected saved agent ID.
 *
 * Returns:
 *     Promise<ChatResponse>: Answer and execution events.
 *
 * Raises:
 *     Error: If execution fails.
 */
export async function sendChatMessage(
  message: string,
  agentId: string
): Promise<ChatResponse> {
  const payload: ChatRequest = {
    message,
    agent_id: agentId,
  };

  return apiRequest<ChatResponse>(
    "/api/chat",
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
}
