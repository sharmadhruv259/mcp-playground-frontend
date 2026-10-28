
"use client";

import type { ToolDefinition, ToolMode } from "@/types/tools";

interface ToolSelectorProps {
  mode: ToolMode;
  selectedTool: string | null;
  tools: ToolDefinition[];
  onModeChange: (mode: ToolMode) => void;
  onToolChange: (name: string) => void;
}

/**
 * Display controls for choosing the agent tool selection mode.
 *
 * Args:
 *     props (ToolSelectorProps): Current mode, available tools,
 *         selected tool, and selection callbacks.
 *
 * Returns:
 *     JSX.Element: Tool selection controls.
 *
 * Raises:
 *     None: No exceptions are intentionally raised.
 */
export default function ToolSelector({
  mode,
  selectedTool,
  tools,
  onModeChange,
  onToolChange,
}: ToolSelectorProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-white">
          Tool Selection
        </h3>

        <p className="mt-1 text-xs text-slate-400">
          Choose how the agent selects tools.
        </p>
      </div>

      <div className="flex rounded-lg border border-slate-700 bg-slate-900 p-1">
        <button
          type="button"
          onClick={() => onModeChange("auto")}
          className={`flex-1 rounded-md px-3 py-2 text-xs font-medium transition-colors ${
            mode === "auto"
              ? "bg-indigo-600 text-white"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Auto
        </button>

        <button
          type="button"
          onClick={() => onModeChange("manual")}
          className={`flex-1 rounded-md px-3 py-2 text-xs font-medium transition-colors ${
            mode === "manual"
              ? "bg-indigo-600 text-white"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Manual
        </button>
      </div>

      {mode === "auto" ? (
        <p className="text-xs leading-5 text-slate-500">
          The agent will choose an appropriate tool based on the
          user's request once the backend is connected.
        </p>
      ) : (
        <div className="space-y-2">
          <label
            htmlFor="selected-tool"
            className="text-xs font-medium text-slate-300"
          >
            Select Tool
          </label>

          <select
            id="selected-tool"
            value={selectedTool ?? ""}
            onChange={(event) =>
              onToolChange(event.target.value)
            }
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-3 text-xs text-white outline-none focus:border-indigo-500"
          >
            <option value="">Choose a tool</option>

            {tools.map((tool) => (
              <option key={tool.name} value={tool.name}>
                {tool.name}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
