export type ToolMode = "auto" | "manual";

export type ToolSource = "builtin" | "custom";

export type ToolActionType = "mcp_context";

export type ToolParameterType =
  | "string"
  | "number"
  | "boolean";

export interface ToolParameter {
  name: string;
  description: string;
  type: ToolParameterType;
  required: boolean;
}

export interface ToolAction {
  type: ToolActionType;

  resource_uris: string[];
  prompt_name?: string;
  prompt_arguments?: Record<string, string>;
}

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

export interface ToolDefinition {
  name: string;
  description: string;
  source: ToolSource;
  parameters: ToolParameterSchema;
  prompt_instructions?: string;
  action?: ToolAction;
}

export interface CreateToolInput {
  name: string;
  description: string;
  parameters: ToolParameter[];
  prompt_instructions: string;
  action: ToolAction;
}


export interface ToolSelection {
  mode: ToolMode;
  selectedTool: string | null;
}
