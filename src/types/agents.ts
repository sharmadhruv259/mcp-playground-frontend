
/**
 * Define configuration, persistence, and approval types
 * for custom MCP agents.
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

export type ApprovalStatus =
  | "draft"
  | "pending"
  | "approved"
  | "rejected";

export interface AgentRecord {
  configuration: AgentConfig;
  owner_id: string;
  version: number;
  approval_status: ApprovalStatus;
  approved_by?: string | null;
  approved_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface AgentReviewRequest {
  expected_version: number;
}

export interface AgentReviewResponse {
  agent_id: string;
  approval_status: ApprovalStatus;
  version: number;
  approved_by?: string;
  reviewed_by?: string;
}

export interface AgentUpdateRequest {
  agent: AgentConfig;
  expected_version: number;
}
