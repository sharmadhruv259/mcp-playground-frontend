
/**
 * Define configuration and persistence types for custom agents.
 */

export type ToolAccess = "all" | "selected";

export interface CacheConfig {
  enabled: boolean;
  ttl_seconds: number;
}

export interface AgentConfig {
  id: string;
  name: string;
  description: string;
  system_prompt: string;
  tool_access: ToolAccess;
  allowed_tools: string[];
  cache: CacheConfig;
  metadata: Record<string, unknown>;
}

export type CreateAgentInput = AgentConfig;
export type UpdateAgentInput = AgentConfig;
