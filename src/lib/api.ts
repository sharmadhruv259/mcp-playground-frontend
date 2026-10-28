
import type { ExecutionEvent } from "@/types/chat";

import type {
  ToolDefinition,
  ToolMode,
} from "@/types/tools";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:8000";

/**
 * Represent a custom MCP-backed tool sent to FastAPI.
 */
interface CustomToolPayload {
  name: string;
  description: string;
  parameters: ToolDefinition["parameters"];

  // User-defined instructions for Groq.
  prompt_instructions: string;

  // MCP resource and prompt configuration.
  action: NonNullable<ToolDefinition["action"]>;
}

/**
 * Represent the chat request sent to FastAPI.
 */
interface ChatRequest {
  message: string;
  mode: ToolMode;
  selected_tool: string | null;
  custom_tools: CustomToolPayload[];
}

/**
 * Represent the chat response returned by FastAPI.
 */
export interface ChatResponse {
  answer: string;
  events: ExecutionEvent[];
}

/**
 * Send a message and MCP-backed custom tools to FastAPI.
 *
 * Args:
 *     message (string): User's question.
 *     mode (ToolMode): Automatic or manual tool selection.
 *     selectedTool (string | null): Manually selected tool.
 *     tools (ToolDefinition[]): Available frontend tools.
 *
 * Returns:
 *     Promise<ChatResponse>: Generated answer and execution events.
 *
 * Raises:
 *     Error: If the backend request fails or returns invalid data.
 */
export async function sendChatMessage(
  message: string,
  mode: ToolMode,
  selectedTool: string | null,
  tools: ToolDefinition[]
): Promise<ChatResponse> {
  const customTools: CustomToolPayload[] = tools
    .filter(
      (
        tool
      ): tool is ToolDefinition & {
        action: NonNullable<ToolDefinition["action"]>;
        prompt_instructions: string;
      } =>
        tool.source === "custom" &&
        tool.action?.type === "mcp_context" &&
        typeof tool.prompt_instructions === "string" &&
        tool.prompt_instructions.trim().length > 0
    )
    .map((tool) => ({
      name: tool.name,
      description: tool.description,
      parameters: tool.parameters,
      prompt_instructions: tool.prompt_instructions,
      action: tool.action,
    }));

  const payload: ChatRequest = {
    message,
    mode,
    selected_tool: mode === "manual" ? selectedTool : null,
    custom_tools: customTools,
  };

  const response = await fetch(
    `${API_BASE_URL}/api/chat`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
  const errorBody = await response.json().catch(() => null);

  console.log("FastAPI validation error:", errorBody);

  const detail = errorBody?.detail;

  if (Array.isArray(detail)) {
    const messages = detail.map(
      (error: {
        loc?: (string | number)[];
        msg?: string;
      }) => {
        const field = error.loc?.join(".") ?? "unknown";
        return `${field}: ${error.msg ?? "Invalid value"}`;
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

  return (await response.json()) as ChatResponse;
}
