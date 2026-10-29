
/**
 * Define MCP capability discovery response types.
 */

export interface MCPTool {
  name: string;
  description?: string | null;
  inputSchema?: Record<string, unknown>;
}

export interface MCPResource {
  uri: string;
  name: string;
  description?: string | null;
  mimeType?: string | null;
}

export interface MCPPromptArgument {
  name: string;
  description?: string | null;
  required?: boolean;
}

export interface MCPPrompt {
  name: string;
  description?: string | null;
  arguments?: MCPPromptArgument[] | null;
}

export interface MCPCapabilities {
  tools: MCPTool[];
  resources: MCPResource[];
  prompts: MCPPrompt[];
}
