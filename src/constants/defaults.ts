
import type {
  ToolDefinition,
  ToolSelection,
} from "@/types/tools";

export const DEFAULT_TOOL_SELECTION: ToolSelection = {
  mode: "auto",
  selectedTool: null,
};

export const DEFAULT_TOOLS: ToolDefinition[] = [
  {
    name: "read_mcp_resource",
    description: "Read project documentation from the MCP server.",
    source: "builtin",
    parameters: {
      type: "object",
      properties: {
        uri: {
          type: "string",
          description: "URI of the MCP resource to read.",
        },
      },
      required: ["uri"],
    },
  },
  {
    name: "get_mcp_prompt",
    description: "Retrieve reusable instructions from the MCP server.",
    source: "builtin",
    parameters: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "Name of the MCP prompt to retrieve.",
        },
        audience: {
          type: "string",
          description: "Target audience for the generated prompt.",
        },
      },
      required: ["name"],
    },
  },
];
