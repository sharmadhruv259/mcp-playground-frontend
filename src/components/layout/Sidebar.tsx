
"use client";

import {
  PanelLeftClose,
  PanelLeftOpen,
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
          aria-label={
            collapsed ? "Expand sidebar" : "Collapse sidebar"
          }
          className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white"
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
          className={`flex items-center justify-center gap-2 rounded-lg bg-indigo-600 text-sm font-medium text-white hover:bg-indigo-500 ${
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
        <div className="flex-1 space-y-7 overflow-y-auto px-4 pb-4">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-white">
              Saved Agents
            </h3>

            <select
              aria-label="Select agent"
              value={selectedAgentId ?? ""}
              disabled={agentLoading}
              onChange={(event) =>
                onSelectAgent(event.target.value)
              }
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-3 text-xs text-white outline-none focus:border-indigo-500"
            >
              <option value="">Select an agent</option>

              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.name}
                </option>
              ))}
            </select>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onCreateAgent}
                className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-white/10 px-2 py-2 text-xs text-slate-300 hover:bg-white/5"
              >
                <Plus size={14} />
                Create
              </button>

              <button
                type="button"
                onClick={onEditAgent}
                disabled={!selectedAgentId}
                className="rounded-lg border border-white/10 p-2 text-slate-300 hover:bg-white/5 disabled:opacity-40"
                aria-label="Edit agent"
              >
                <Pencil size={14} />
              </button>

              <button
                type="button"
                onClick={onDeleteAgent}
                disabled={!selectedAgentId}
                className="rounded-lg border border-white/10 p-2 text-red-400 hover:bg-white/5 disabled:opacity-40"
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
            <h3 className="text-sm font-semibold text-white">
              Available Tools
            </h3>

            {tools.length === 0 && (
              <p className="text-xs text-slate-500">
                No MCP operations discovered.
              </p>
            )}

            {tools.map((tool) => (
              <div
                key={tool.name}
                className="rounded-lg border border-white/5 bg-white/[0.03] p-3"
              >
                <p className="break-all text-xs font-medium text-indigo-300">
                  {tool.name}
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-400">
                  {tool.description}
                </p>

                <span className="mt-2 inline-block rounded bg-white/5 px-2 py-0.5 text-[10px] text-slate-400">
                  MCP
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center gap-2 p-2">
          <button
            type="button"
            onClick={onCreateAgent}
            title="Create agent"
            aria-label="Create agent"
            className="rounded-lg p-2.5 text-slate-400 hover:bg-white/5 hover:text-white"
          >
            <Plus size={18} />
          </button>
        </div>
      )}
    </aside>
  );
}
