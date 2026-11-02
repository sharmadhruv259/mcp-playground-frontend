"use client";

import {
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
  Plug,
  Plus,
  SquarePen,
  Trash2,
  Wrench,
  Pencil,
} from "lucide-react";

import ToolSelector from "@/components/tools/ToolSelector";

import type { AgentConfig } from "@/types/agents";
import type {
  ToolDefinition,
  ToolMode,
} from "@/types/tools";

interface SidebarProps {
  collapsed: boolean;
  mode: ToolMode;
  selectedTool: string | null;
  tools: ToolDefinition[];
  agents: AgentConfig[];
  selectedAgentId: string | null;
  agentLoading: boolean;
  onSelectAgent: (id: string) => void;
  onCreateAgent: () => void;
  onEditAgent: () => void;
  onDeleteAgent: () => void;
  onToggle: () => void;
  onNewChat: () => void;
  onModeChange: (mode: ToolMode) => void;
  onToolChange: (name: string) => void;
}

const TOOL_PREFIX = "mcp_tool__";

export default function Sidebar({
  collapsed,
  mode,
  selectedTool,
  tools,
  agents,
  selectedAgentId,
  agentLoading,
  onSelectAgent,
  onCreateAgent,
  onEditAgent,
  onDeleteAgent,
  onToggle,
  onNewChat,
  onModeChange,
  onToolChange,
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
          <div className="flex items-center gap-2.5 pl-1">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-indigo-400/25 bg-indigo-500/10">
              <Wrench size={15} className="text-indigo-300" />
            </span>
            <span className="text-sm font-semibold tracking-tight text-white">
              MCP Playground
            </span>
          </div>
        )}

        <button
          type="button"
          onClick={onToggle}
          aria-label={
            collapsed ? "Expand sidebar" : "Collapse sidebar"
          }
          className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60"
        >
          {collapsed ? (
            <PanelLeftOpen size={18} />
          ) : (
            <PanelLeftClose size={18} />
          )}
        </button>
      </div>

      <div className={collapsed ? "p-2" : "p-4"}>
        <button
          type="button"
          onClick={onNewChat}
          title="New chat"
          className={`flex items-center justify-center gap-2 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 text-sm font-medium text-white shadow-lg shadow-indigo-900/40 transition-all hover:from-indigo-400 hover:to-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300/70 ${
            collapsed
              ? "mx-auto h-10 w-10"
              : "w-full px-4 py-2.5"
          }`}
        >
          <SquarePen size={16} />
          {!collapsed && "New chat"}
        </button>
      </div>

      {!collapsed ? (
        <div className="flex-1 space-y-7 overflow-y-auto px-4 pb-4 [scrollbar-color:#334155_transparent] [scrollbar-width:thin]">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-white">
              Saved Agents
            </h3>

            <div className="relative">
              <select
                aria-label="Select agent"
                value={selectedAgentId ?? ""}
                disabled={agentLoading}
                onChange={(event) =>
                  onSelectAgent(event.target.value)
                }
                className="w-full appearance-none rounded-lg border border-white/10 bg-slate-900/80 py-2.5 pl-3 pr-9 text-xs text-white outline-none transition-colors hover:border-white/20 focus:border-indigo-400/60 focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-60"
              >
                <option value="">Select an agent</option>

                {agents.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={14}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onCreateAgent}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-white/10 px-2 py-2 text-xs text-slate-300 transition-colors hover:border-indigo-400/40 hover:bg-indigo-500/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60"
              >
                <Plus size={14} />
                Create
              </button>

              <button
                type="button"
                onClick={onEditAgent}
                disabled={!selectedAgentId}
                className="rounded-lg border border-white/10 p-2 text-slate-300 transition-colors hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60 disabled:opacity-40 disabled:hover:bg-transparent"
                aria-label="Edit agent"
              >
                <Pencil size={14} />
              </button>

              <button
                type="button"
                onClick={onDeleteAgent}
                disabled={!selectedAgentId}
                className="rounded-lg border border-white/10 p-2 text-slate-400 transition-colors hover:border-red-400/40 hover:bg-red-500/10 hover:text-red-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/50 disabled:opacity-40 disabled:hover:border-white/10 disabled:hover:bg-transparent disabled:hover:text-slate-400"
                aria-label="Delete agent"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>

          <ToolSelector
            mode={mode}
            selectedTool={selectedTool}
            tools={tools}
            onModeChange={onModeChange}
            onToolChange={onToolChange}
          />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">
                Available Tools
              </h3>

              {tools.length > 0 && (
                <span className="rounded-full bg-white/5 px-2 py-0.5 text-[11px] text-slate-400">
                  {tools.length}
                </span>
              )}
            </div>

            {tools.length === 0 && (
              <p className="rounded-lg border border-dashed border-white/10 px-3 py-4 text-center text-xs text-slate-400">
                No MCP operations discovered.
              </p>
            )}

            {tools.map((tool) => {
              const hasPrefix = tool.name.startsWith(TOOL_PREFIX);
              const shortName = hasPrefix
                ? tool.name.slice(TOOL_PREFIX.length)
                : tool.name;

              return (
                <div
                  key={tool.name}
                  title={tool.description}
                  className="group rounded-xl border border-white/[0.06] bg-white/[0.03] p-3 transition-colors hover:border-indigo-400/30 hover:bg-indigo-500/[0.05]"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="min-w-0 break-all font-mono text-[13px] font-medium leading-5 text-indigo-200">
                      {hasPrefix && (
                        <span className="text-slate-500">
                          {TOOL_PREFIX}
                        </span>
                      )}
                      {shortName}
                    </p>

                    <span className="mt-0.5 flex shrink-0 items-center gap-1 rounded-md bg-indigo-500/10 px-1.5 py-0.5 text-[10px] font-medium text-indigo-300">
                      <Plug size={10} />
                      MCP
                    </span>
                  </div>

                  <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-slate-400">
                    {tool.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center gap-2 p-2">
          <button
            type="button"
            onClick={onCreateAgent}
            title="Create agent"
            aria-label="Create agent"
            className="rounded-lg p-2.5 text-slate-400 transition-colors hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60"
          >
            <Plus size={18} />
          </button>
        </div>
      )}
    </aside>
  );
}