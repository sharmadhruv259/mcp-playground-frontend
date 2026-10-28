
import type {
  CreateToolInput,
  ToolDefinition,
  ToolParameter,
  ToolParameterSchema,
} from "@/types/tools";

const TOOL_NAME_PATTERN = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

/**
 * Validate a user-defined MCP-backed tool.
 *
 * Args:
 *     input (CreateToolInput): Tool definition submitted by the user.
 *     existingTools (ToolDefinition[]): Tools already registered.
 *
 * Returns:
 *     string | null: Validation error message, or null when valid.
 *
 * Raises:
 *     None: Validation failures are returned as error messages.
 */
export function validateTool(
  input: CreateToolInput,
  existingTools: ToolDefinition[]
): string | null {
  const name = input.name.trim();

  if (!name) {
    return "Tool name is required.";
  }

  if (!TOOL_NAME_PATTERN.test(name)) {
    return "Tool name must contain letters, numbers, or underscores and cannot start with a number.";
  }

  if (existingTools.some((tool) => tool.name === name)) {
    return "A tool with this name already exists.";
  }

  if (!input.description.trim()) {
    return "Tool description is required.";
  }

  // Validate user-defined Groq prompt instructions.
  if (!input.prompt_instructions.trim()) {
    return "Custom prompt instructions are required.";
  }

  // Validate the MCP-backed action.
  if (input.action.type !== "mcp_context") {
    return "Unsupported tool action.";
  }

  if (
    input.action.resource_uris.length === 0 &&
    !input.action.prompt_name?.trim()
  ) {
    return "Select at least one MCP resource or an MCP prompt.";
  }

  const resourceUris = input.action.resource_uris.map((uri) =>
    uri.trim()
  );

  if (resourceUris.some((uri) => !uri)) {
    return "MCP resource URIs cannot be empty.";
  }

  if (new Set(resourceUris).size !== resourceUris.length) {
    return "Duplicate MCP resource URIs are not allowed.";
  }

  if (
    input.action.prompt_arguments &&
    !input.action.prompt_name?.trim()
  ) {
    return "MCP prompt arguments require an MCP prompt name.";
  }

  // Validate tool parameters.
  const parameterNames = new Set<string>();

  for (const parameter of input.parameters) {
    const parameterName = parameter.name.trim();

    if (!TOOL_NAME_PATTERN.test(parameterName)) {
      return `Invalid parameter name: ${parameterName || "(empty)"}.`;
    }

    if (parameterNames.has(parameterName)) {
      return `Duplicate parameter name: ${parameterName}.`;
    }

    if (!parameter.description.trim()) {
      return `Description is required for parameter: ${parameterName}.`;
    }

    parameterNames.add(parameterName);
  }

  return null;
}

/**
 * Convert custom parameters into a JSON Schema definition.
 *
 * Args:
 *     parameters (ToolParameter[]): Parameters configured by the user.
 *
 * Returns:
 *     ToolParameterSchema: JSON Schema describing tool inputs.
 *
 * Raises:
 *     None: No exceptions are intentionally raised.
 */
export function buildParameterSchema(
  parameters: ToolParameter[]
): ToolParameterSchema {
  const properties: ToolParameterSchema["properties"] = {};
  const required: string[] = [];

  for (const parameter of parameters) {
    const name = parameter.name.trim();

    properties[name] = {
      type: parameter.type,
      description: parameter.description.trim(),
    };

    if (parameter.required) {
      required.push(name);
    }
  }

  return {
    type: "object",
    properties,
    required,
  };
}

/**
 * Convert validated form input into a custom MCP tool definition.
 *
 * Args:
 *     input (CreateToolInput): Validated custom tool input.
 *
 * Returns:
 *     ToolDefinition: Tool definition for the frontend registry.
 *
 * Raises:
 *     None: No exceptions are intentionally raised.
 */
export function createToolDefinition(
  input: CreateToolInput
): ToolDefinition {
  return {
    name: input.name.trim(),
    description: input.description.trim(),
    source: "custom",
    parameters: buildParameterSchema(input.parameters),

    prompt_instructions: input.prompt_instructions.trim(),

    action: {
      type: "mcp_context",

      resource_uris: input.action.resource_uris.map((uri) =>
        uri.trim()
      ),

      ...(input.action.prompt_name?.trim()
        ? {
            prompt_name: input.action.prompt_name.trim(),
          }
        : {}),

      ...(input.action.prompt_name?.trim() &&
      input.action.prompt_arguments
        ? {
            prompt_arguments: Object.fromEntries(
              Object.entries(input.action.prompt_arguments).map(
                ([key, value]) => [key.trim(), value.trim()]
              )
            ),
          }
        : {}),
    },
  };
}
