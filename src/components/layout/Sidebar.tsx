"use client";

import {
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  SquarePen,
  Trash2,
  Wrench,
} from "lucide-react";

import ToolSelector from "@/components/tools/ToolSelector";

import type { ToolDefinition, ToolMode } from "@/types/tools";

interface SidebarProps {
  collapsed: boolean;
  mode: ToolMode;
  selectedTool: string | null;
  tools: ToolDefinition[];
  onToggle: () => void;
  onNewChat: () => void;
  onModeChange: (mode: ToolMode) => void;
  onToolChange: (name: string) => void;
  onCreateTool: () => void;
  onDeleteTool: (name: string) => void;
}

/**
 * Display the collapsible MCP Playground configuration sidebar.
 *
 * Args:
 *     props (SidebarProps): Sidebar state, available tools,
 *         and event handler callbacks.
 *
 * Returns:
 *     JSX.Element: Left sidebar with new chat and tool controls.
 *
 * Raises:
 *     None: No exceptions are intentionally raised.
 */
export default function Sidebar({
  collapsed,
  mode,
  selectedTool,
  tools,
  onToggle,
  onNewChat,
  onModeChange,
  onToolChange,
  onCreateTool,
  onDeleteTool,
}: SidebarProps) {
  return (
    <aside
      className={`flex h-full shrink-0 flex-col border-r border-white/5 bg-slate-950 transition-[width] duration-200 ${
        collapsed ? "w-14" : "w-72"
      }`}
    >
      <div
        className={`flex h-14 shrink-0 items-center border-b border-white/5 px-3 ${
          collapsed ? "justify-center" : "justify-between"
        }`}
      >
        {!collapsed && (
          <div className="flex items-center gap-2 pl-1">
            <Wrench size={17} className="text-indigo-400" />
            <span className="text-sm font-semibold text-white">
              MCP Playground
            </span>
          </div>
        )}

        <button
          type="button"
          onClick={onToggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
        >
          {collapsed ? (
            <PanelLeftOpen size={18} />
          ) : (
            <PanelLeftClose size={18} />
          )}
        </button>
      </div>

      <div className={`shrink-0 ${collapsed ? "p-2" : "p-4"}`}>
        <button
          type="button"
          onClick={onNewChat}
          aria-label="New chat"
          title="New chat"
          className={`flex items-center justify-center gap-2 rounded-lg bg-indigo-600 text-sm font-medium text-white transition-colors hover:bg-indigo-500 ${
            collapsed ? "mx-auto h-10 w-10" : "w-full px-4 py-2.5"
          }`}
        >
          <SquarePen size={16} />
          {!collapsed && "New chat"}
        </button>
      </div>

      {!collapsed ? (
        <div className="flex-1 space-y-7 overflow-y-auto px-4 pb-4">
          <ToolSelector
            mode={mode}
            selectedTool={selectedTool}
            tools={tools}
            onModeChange={onModeChange}
            onToolChange={onToolChange}
          />

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-white">
              Available Tools
            </h3>

            {tools.map((tool) => (
              <div
                key={tool.name}
                className="rounded-lg border border-white/5 bg-white/[0.03] p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="break-all text-xs font-medium text-indigo-300">
                    {tool.name}
                  </p>

                  {tool.source === "custom" && (
                    <button
                      type="button"
                      onClick={() => onDeleteTool(tool.name)}
                      aria-label={`Delete ${tool.name}`}
                      className="shrink-0 text-slate-500 transition-colors hover:text-red-400"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>

                <p className="mt-1 text-xs leading-5 text-slate-400">
                  {tool.description}
                </p>

                <span className="mt-2 inline-block rounded bg-white/5 px-2 py-0.5 text-[10px] text-slate-400">
                  {tool.source === "builtin" ? "Built-in" : "Custom"}
                </span>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={onCreateTool}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 px-4 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
          >
            <Plus size={16} />
            Create New Tool
          </button>
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center gap-2 p-2">
          <button
            type="button"
            onClick={onCreateTool}
            aria-label="Create new tool"
            title="Create new tool"
            className="rounded-lg p-2.5 text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
          >
            <Plus size={18} />
          </button>
        </div>
      )}
    </aside>
  );
}