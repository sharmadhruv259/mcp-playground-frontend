
/**
 * Define the supported tool selection modes.
 */
export type ToolMode = "auto" | "manual";

/**
 * Define whether a tool is built-in or user-created.
 */
export type ToolSource = "builtin" | "custom";

/**
 * Define the supported custom tool action types.
 */
export type ToolActionType = "mcp_context";

/**
 * Define supported tool parameter data types.
 */
export type ToolParameterType =
  | "string"
  | "number"
  | "boolean";

/**
 * Represent a parameter configured by the user.
 */
export interface ToolParameter {
  name: string;
  description: string;
  type: ToolParameterType;
  required: boolean;
}

/**
 * Represent the MCP configuration executed by a custom tool.
 */
export interface ToolAction {
  type: ToolActionType;

  // MCP resources to retrieve when the tool executes.
  resource_uris: string[];

  // Optional reusable MCP prompt.
  prompt_name?: string;

  // Optional arguments for the MCP prompt.
  prompt_arguments?: Record<string, string>;
}

/**
 * Represent the JSON Schema for tool input parameters.
 */
export interface ToolParameterSchema {
  type: "object";

  properties: Record<
    string,
    {
      type: ToolParameterType;
      description: string;
    }
  >;

  required: string[];
}

/**
 * Represent a registered Groq-facing tool.
 */
export interface ToolDefinition {
  name: string;
  description: string;
  source: ToolSource;
  parameters: ToolParameterSchema;

  // Instructions entered by the user during tool creation.
  prompt_instructions?: string;

  // MCP context retrieval configuration.
  action?: ToolAction;
}

/**
 * Represent the form data used to create a custom tool.
 */
export interface CreateToolInput {
  name: string;
  description: string;
  parameters: ToolParameter[];

  // User-defined instructions for Groq.
  prompt_instructions: string;

  // MCP resources and optional prompt.
  action: ToolAction;
}

/**
 * Represent the current tool selection configuration.
 */
export interface ToolSelection {
  mode: ToolMode;
  selectedTool: string | null;
}
