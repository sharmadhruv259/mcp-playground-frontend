"use client";

import type { ReactNode } from "react";

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
  UserRound,
  LogIn,
  LogOut,
  Clock3,
  XCircle,
  FilePenLine,
  RefreshCw,
  Send,
  CheckCircle2,
  type LucideIcon,
} from "lucide-react";

import ToolSelector from "@/components/tools/ToolSelector";

import type {
  AgentConfig,
  AgentRecord,
} from "@/types/agents";

import type {
  ToolDefinition,
  ToolMode,
} from "@/types/tools";

interface SidebarProps {
  collapsed: boolean;
  username?: string;
  role?: string;
  onLogin: () => void;
  onLogout: () => void;
  mode: ToolMode;
  selectedTool: string | null;
  tools: ToolDefinition[];

  // Approved agents only.
  agents: AgentConfig[];

  // All approval records visible to the user.
  draftAgents: AgentRecord[];
  pendingAgents: AgentRecord[];
  rejectedAgents: AgentRecord[];

  selectedAgentId: string | null;
  agentLoading: boolean;
  onSelectAgent: (id: string) => void;
  onCreateAgent: () => void;
  onEditAgent: () => void;
  onDeleteAgent: () => void;

  onSubmitDraft: (id: string) => void;
  onRefreshAgents: () => void;

  onToggle: () => void;
  onNewChat: () => void;
  onModeChange: (mode: ToolMode) => void;
  onToolChange: (name: string) => void;
}

const TOOL_PREFIX = "mcp_tool__";

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60";

type Tone = "indigo" | "emerald" | "slate" | "amber" | "red";

const TONES: Record<Tone, { tile: string; badge: string }> = {
  indigo: {
    tile: "bg-indigo-500/10 text-indigo-300",
    badge: "bg-indigo-500/10 text-indigo-300",
  },
  emerald: {
    tile: "bg-emerald-500/10 text-emerald-400",
    badge: "bg-emerald-500/10 text-emerald-300",
  },
  slate: {
    tile: "bg-white/5 text-slate-300",
    badge: "bg-white/5 text-slate-400",
  },
  amber: {
    tile: "bg-amber-500/10 text-amber-400",
    badge: "bg-amber-500/10 text-amber-300",
  },
  red: {
    tile: "bg-red-500/10 text-red-400",
    badge: "bg-red-500/10 text-red-300",
  },
};

/**
 * Consistent section heading: icon tile, label, then a count
 * badge or an action on the right.
 */
function SectionHeading({
  icon: Icon,
  label,
  tone,
  count,
  action,
}: {
  icon: LucideIcon;
  label: string;
  tone: Tone;
  count?: number;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <h3 className="flex items-center gap-2.5 text-sm font-semibold text-white">
        <span
          className={`flex h-7 w-7 items-center justify-center rounded-lg ${TONES[tone].tile}`}
        >
          <Icon size={14} />
        </span>
        {label}
      </h3>

      {action}

      {count !== undefined && (
        <span
          className={`min-w-[22px] rounded-full px-2 py-0.5 text-center text-[11px] font-medium ${TONES[tone].badge}`}
        >
          {count}
        </span>
      )}
    </div>
  );
}

export default function Sidebar({
  collapsed,
  username,
  role,
  onLogin,
  onLogout,
  mode,
  selectedTool,
  tools,
  agents,
  draftAgents,
  pendingAgents,
  rejectedAgents,
  selectedAgentId,
  agentLoading,
  onSelectAgent,
  onCreateAgent,
  onEditAgent,
  onDeleteAgent,
  onSubmitDraft,
  onRefreshAgents,
  onToggle,
  onNewChat,
  onModeChange,
  onToolChange,
}: SidebarProps) {
  return (
    <aside
      className={`relative flex h-full shrink-0 flex-col border-r border-white/5 bg-slate-950 transition-[width] duration-200 ${
        collapsed ? "w-14" : "w-80"
      }`}
    >
      {/* Soft ambient glow behind the header */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-indigo-600/[0.10] to-transparent"
      />

      {/* Header */}
      <div
        className={`relative flex h-14 shrink-0 items-center border-b border-white/5 ${
          collapsed ? "justify-center px-3" : "justify-between px-4"
        }`}
      >
        {!collapsed && (
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-indigo-300/25 bg-gradient-to-br from-indigo-500/35 to-violet-500/10 shadow-[0_0_24px_-4px_rgba(99,102,241,0.7)]">
              <Wrench size={16} className="text-indigo-100" />
            </span>
            <span className="text-[15px] font-semibold tracking-tight text-white">
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
          className={`rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/5 hover:text-white ${FOCUS_RING}`}
        >
          {collapsed ? (
            <PanelLeftOpen size={18} />
          ) : (
            <PanelLeftClose size={18} />
          )}
        </button>
      </div>

      {/* New chat */}
      <div className={`relative ${collapsed ? "p-2" : "px-4 pb-3 pt-4"}`}>
        <button
          type="button"
          onClick={onNewChat}
          title="New chat"
          className={`flex items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-sm font-medium text-white shadow-lg shadow-indigo-900/40 transition-all hover:from-indigo-400 hover:to-indigo-500 hover:shadow-indigo-700/40 ${FOCUS_RING} ${
            collapsed
              ? "mx-auto h-10 w-10"
              : "w-full px-4 py-3"
          }`}
        >
          <SquarePen size={16} />
          {!collapsed && "New chat"}
        </button>
      </div>

      {!collapsed ? (
        <div className="relative flex-1 space-y-5 overflow-y-auto px-4 pb-4 pt-1 [scrollbar-color:#334155_transparent] [scrollbar-width:thin]">

          {/* Saved / approved agents */}
          <section className="space-y-3">
            <SectionHeading
              icon={CheckCircle2}
              label="Saved Agents"
              tone="emerald"
              action={
                <button
                  type="button"
                  onClick={onRefreshAgents}
                  disabled={agentLoading}
                  title="Refresh agent statuses"
                  aria-label="Refresh agents"
                  className={`rounded-md p-1.5 text-slate-400 transition-colors hover:bg-white/5 hover:text-white disabled:opacity-40 ${FOCUS_RING}`}
                >
                  <RefreshCw
                    size={14}
                    className={agentLoading ? "animate-spin" : ""}
                  />
                </button>
              }
            />

            <div className="relative">
              <select
                aria-label="Select approved agent"
                value={selectedAgentId ?? ""}
                disabled={agentLoading}
                onChange={(event) =>
                  onSelectAgent(event.target.value)
                }
                className="w-full appearance-none rounded-xl border border-white/10 bg-slate-900/80 py-3 pl-3.5 pr-10 text-xs text-white outline-none transition-colors hover:border-white/20 focus:border-indigo-400/60 focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-60"
              >
                <option value="">Default Assistant</option>

                {agents.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={14}
                className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>

            {agents.length === 0 && (
              <p className="rounded-lg border border-dashed border-white/10 px-3 py-2.5 text-center text-xs text-slate-400">
                No approved agents yet.
              </p>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onCreateAgent}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-white/10 px-2 py-2.5 text-xs font-medium text-slate-300 transition-colors hover:border-indigo-400/40 hover:bg-indigo-500/10 hover:text-white ${FOCUS_RING}`}
              >
                <Plus size={14} />
                Create
              </button>

              <button
                type="button"
                onClick={onEditAgent}
                disabled={!selectedAgentId}
                className={`rounded-lg border border-white/10 px-3 text-slate-300 transition-colors hover:bg-white/5 hover:text-white disabled:opacity-40 disabled:hover:bg-transparent ${FOCUS_RING}`}
                aria-label="Edit agent"
                title="Edit selected agent"
              >
                <Pencil size={14} />
              </button>

              <button
                type="button"
                onClick={onDeleteAgent}
                disabled={!selectedAgentId}
                className={`rounded-lg border border-white/10 px-3 text-slate-400 transition-colors hover:border-red-400/40 hover:bg-red-500/10 hover:text-red-300 disabled:opacity-40 disabled:hover:border-white/10 disabled:hover:bg-transparent disabled:hover:text-slate-400 ${FOCUS_RING}`}
                aria-label="Delete agent"
                title="Delete selected agent"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </section>

          {/* Approval status groups, kept together in one panel */}
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4">

            {/* Draft agents */}
            <section className="space-y-2.5 border-t border-white/5 pt-4 first:border-t-0 first:pt-0">
              <SectionHeading
                icon={FilePenLine}
                label="Draft Agents"
                tone="slate"
                count={draftAgents.length}
              />

              {draftAgents.length === 0 ? (
                <p className="pl-[38px] text-xs text-slate-400">
                  No draft agents.
                </p>
              ) : (
                draftAgents.map((record) => (
                  <div
                    key={record.configuration.id}
                    className="space-y-2 rounded-xl border border-white/10 border-l-slate-400/60 bg-white/[0.03] p-3 [border-left-width:3px]"
                  >
                    <p className="break-words text-xs font-medium text-white">
                      {record.configuration.name}
                    </p>

                    <p className="text-[11px] text-slate-400">
                      Not submitted for review
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        onSubmitDraft(record.configuration.id)
                      }
                      disabled={agentLoading}
                      className={`flex w-full items-center justify-center gap-1.5 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 px-2 py-2 text-xs font-medium text-white shadow-md shadow-indigo-900/30 transition-all hover:from-indigo-400 hover:to-indigo-500 disabled:opacity-50 ${FOCUS_RING}`}
                    >
                      <Send size={12} />
                      Submit for Approval
                    </button>
                  </div>
                ))
              )}
            </section>

            {/* Pending agents */}
            <section className="mt-4 space-y-2.5 border-t border-white/5 pt-4">
              <SectionHeading
                icon={Clock3}
                label="Pending Approval"
                tone="amber"
                count={pendingAgents.length}
              />

              {pendingAgents.length === 0 ? (
                <p className="pl-[38px] text-xs text-slate-400">
                  No pending agents.
                </p>
              ) : (
                pendingAgents.map((record) => (
                  <div
                    key={record.configuration.id}
                    className="rounded-xl border border-amber-500/15 border-l-amber-400/70 bg-amber-500/[0.05] p-3 [border-left-width:3px]"
                  >
                    <p className="break-words text-xs font-medium text-white">
                      {record.configuration.name}
                    </p>
                    <p className="mt-1 flex items-center gap-1.5 text-[11px] text-amber-300">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400" />
                      Awaiting Admin / Manager approval
                    </p>
                  </div>
                ))
              )}
            </section>

            {/* Rejected agents */}
            <section className="mt-4 space-y-2.5 border-t border-white/5 pt-4">
              <SectionHeading
                icon={XCircle}
                label="Rejected Agents"
                tone="red"
                count={rejectedAgents.length}
              />

              {rejectedAgents.length === 0 ? (
                <p className="pl-[38px] text-xs text-slate-400">
                  No rejected agents.
                </p>
              ) : (
                rejectedAgents.map((record) => (
                  <div
                    key={record.configuration.id}
                    className="rounded-xl border border-red-500/15 border-l-red-400/70 bg-red-500/[0.05] p-3 [border-left-width:3px]"
                  >
                    <p className="break-words text-xs font-medium text-white">
                      {record.configuration.name}
                    </p>
                    <p className="mt-1 text-[11px] text-red-300">
                      Rejected by reviewer
                    </p>
                  </div>
                ))
              )}
            </section>
          </div>

          {/* Tool selection */}
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4">
            <ToolSelector
              mode={mode}
              selectedTool={selectedTool}
              tools={tools}
              onModeChange={onModeChange}
              onToolChange={onToolChange}
            />
          </div>

          {/* Available MCP tools */}
          <section className="space-y-3">
            <SectionHeading
              icon={Plug}
              label="Available Tools"
              tone="indigo"
              count={tools.length > 0 ? tools.length : undefined}
            />

            {tools.length === 0 && (
              <p className="rounded-lg border border-dashed border-white/10 px-3 py-4 text-center text-xs text-slate-400">
                No MCP operations discovered.
              </p>
            )}

            {tools.map((tool) => {
              const shortName = tool.name.startsWith(TOOL_PREFIX)
                ? tool.name.slice(TOOL_PREFIX.length)
                : tool.name;

              return (
                <div
                  key={tool.name}
                  title={`${tool.name}\n${tool.description}`}
                  className="group flex gap-3 rounded-xl border border-white/[0.07] bg-white/[0.03] p-3 transition-all duration-200 hover:-translate-y-px hover:border-indigo-400/30 hover:bg-indigo-500/[0.06]"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-300 transition-colors group-hover:bg-indigo-500/20">
                    <Plug size={14} />
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-[12.5px] font-medium leading-5 text-indigo-200 [overflow-wrap:anywhere]">
                      {shortName}
                    </p>

                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-400">
                      {tool.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </section>
        </div>
      ) : (
        <div className="relative flex flex-1 flex-col items-center gap-2 p-2">
          <button
            type="button"
            onClick={onCreateAgent}
            title="Create agent"
            aria-label="Create agent"
            className={`rounded-lg p-2.5 text-slate-400 transition-colors hover:bg-white/5 hover:text-white ${FOCUS_RING}`}
          >
            <Plus size={18} />
          </button>
        </div>
      )}

      {/* User profile */}
      <div className="relative shrink-0 border-t border-white/10 bg-slate-950 p-3">
        {collapsed ? (
          <div className="flex justify-center">
            <button
              type="button"
              onClick={username ? onLogout : onLogin}
              aria-label={username ? "Logout" : "Login"}
              title={username ? "Logout" : "Login"}
              className={`rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/10 hover:text-white ${FOCUS_RING}`}
            >
              {username ? <LogOut size={16} /> : <LogIn size={16} />}
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.03] p-2.5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-indigo-300/25 bg-gradient-to-br from-indigo-500/40 to-violet-500/20 text-sm font-semibold uppercase text-indigo-100">
              {username ? (
                username.charAt(0)
              ) : (
                <UserRound size={17} />
              )}
            </span>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">
                {username ?? "Guest"}
              </p>

              {role ? (
                <span className="mt-0.5 inline-block rounded-full bg-indigo-500/10 px-2 py-px text-[10px] font-medium capitalize text-indigo-300">
                  {role}
                </span>
              ) : (
                <p className="truncate text-[11px] text-slate-400">
                  Not signed in
                </p>
              )}
            </div>

            {username ? (
              <button
                type="button"
                onClick={onLogout}
                aria-label="Logout"
                title="Logout"
                className={`rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/10 hover:text-white ${FOCUS_RING}`}
              >
                <LogOut size={16} />
              </button>
            ) : (
              <button
                type="button"
                onClick={onLogin}
                aria-label="Login"
                title="Login"
                className={`flex items-center gap-1.5 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 px-3 py-1.5 text-xs font-medium text-white shadow-md shadow-indigo-900/30 transition-all hover:from-indigo-400 hover:to-indigo-500 ${FOCUS_RING}`}
              >
                <LogIn size={13} />
                Sign in
              </button>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}