
"use client";

import { useEffect, useState } from "react";

import { DEFAULT_TOOLS } from "@/constants/defaults";

import type {
  CreateToolInput,
  ToolDefinition,
} from "@/types/tools";

import {
  createToolDefinition,
  validateTool,
} from "@/utils/toolValidation";

const STORAGE_KEY = "mcp-playground-custom-tools";

/**
 * Check whether a stored value is a valid MCP-backed custom tool.
 *
 * Args:
 *     value (unknown): Value loaded from browser storage.
 *
 * Returns:
 *     boolean: True when the value matches the supported
 *         custom tool structure.
 *
 * Raises:
 *     None: Invalid values return false.
 */
function isMCPContextTool(
  value: unknown
): value is ToolDefinition {
  if (
    typeof value !== "object" ||
    value === null
  ) {
    return false;
  }

  const tool = value as Partial<ToolDefinition>;

  if (
    tool.source !== "custom" ||
    typeof tool.name !== "string" ||
    !tool.name.trim() ||
    typeof tool.description !== "string" ||
    typeof tool.prompt_instructions !== "string" ||
    !tool.prompt_instructions.trim()
  ) {
    return false;
  }

  if (
    !tool.parameters ||
    tool.parameters.type !== "object" ||
    typeof tool.parameters.properties !== "object" ||
    tool.parameters.properties === null ||
    !Array.isArray(tool.parameters.required)
  ) {
    return false;
  }

  if (
    !tool.action ||
    tool.action.type !== "mcp_context" ||
    !Array.isArray(tool.action.resource_uris)
  ) {
    return false;
  }

  const validResources = tool.action.resource_uris.every(
    (uri) => typeof uri === "string" && uri.trim().length > 0
  );

  if (!validResources) {
    return false;
  }

  const validPrompt =
    tool.action.prompt_name === undefined ||
    (typeof tool.action.prompt_name === "string" &&
      tool.action.prompt_name.trim().length > 0);

  if (!validPrompt) {
    return false;
  }

  return (
    tool.action.resource_uris.length > 0 ||
    Boolean(tool.action.prompt_name)
  );
}

/**
 * Manage built-in and MCP-backed custom tools with browser persistence.
 *
 * Args:
 *     None: Uses default tools and browser storage.
 *
 * Returns:
 *     object: Registered tools and tool management functions.
 *
 * Raises:
 *     None: Storage errors are handled without crashing the UI.
 */
export function useTools() {
  const [tools, setTools] = useState<ToolDefinition[]>(DEFAULT_TOOLS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);

      if (stored) {
        const parsed: unknown = JSON.parse(stored);

        if (Array.isArray(parsed)) {
          const customTools = parsed.filter(isMCPContextTool);

          // Exclude names already registered as built-in tools.
          const builtinNames = new Set(
            DEFAULT_TOOLS.map((tool) => tool.name)
          );

          const uniqueNames = new Set<string>();

          const validTools = customTools.filter((tool) => {
            if (
              builtinNames.has(tool.name) ||
              uniqueNames.has(tool.name)
            ) {
              return false;
            }

            uniqueNames.add(tool.name);
            return true;
          });

          setTools([...DEFAULT_TOOLS, ...validTools]);
        }
      }
    } catch (error) {
      console.error("Failed to load custom tools:", error);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    try {
      const customTools = tools.filter(
        (tool) => tool.source === "custom"
      );

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(customTools)
      );
    } catch (error) {
      console.error("Failed to save custom tools:", error);
    }
  }, [tools, hydrated]);

  /**
   * Validate and register a custom MCP-backed tool.
   *
   * Args:
   *     input (CreateToolInput): New custom tool definition.
   *
   * Returns:
   *     string | null: Validation error or null on success.
   *
   * Raises:
   *     None: Validation errors are returned as strings.
   */
  function addTool(input: CreateToolInput): string | null {
    const error = validateTool(input, tools);

    if (error) {
      return error;
    }

    setTools((previous) => [
      ...previous,
      createToolDefinition(input),
    ]);

    return null;
  }

  /**
   * Remove a custom tool from the registry.
   *
   * Args:
   *     name (string): Name of the custom tool to remove.
   *
   * Returns:
   *     void: Updates the registered tools.
   *
   * Raises:
   *     None: Built-in tools are protected from deletion.
   */
  function removeTool(name: string): void {
    setTools((previous) =>
      previous.filter(
        (tool) =>
          tool.source === "builtin" || tool.name !== name
      )
    );
  }

  return {
    tools,
    addTool,
    removeTool,
  };
}
