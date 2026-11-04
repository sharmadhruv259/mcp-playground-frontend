
"use client";

import {
  Bot,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  UserCog,
  Users,
  Wrench,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

export type DashboardSection =
  | "overview"
  | "users"
  | "managers"
  | "reviews"
  | "tools";

interface DashboardSidebarProps {
  activeSection: DashboardSection;
  onSectionChange: (section: DashboardSection) => void;
  onOpenPlayground: () => void;
}

export default function DashboardSidebar({
  activeSection,
  onSectionChange,
  onOpenPlayground,
}: DashboardSidebarProps) {
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const isAdmin = user?.role === "admin";



const navigation = [
  {
    id: "overview" as const,
    label: "Overview",
    icon: LayoutDashboard,
  },
  {
    id: "users" as const,
    label: "Users",
    icon: Users,
  },
  ...(isAdmin
    ? [
        {
          id: "managers" as const,
          label: "Managers",
          icon: UserCog,
        },
      ]
    : []),
  {
    id: "reviews" as const,
    label: "Agent Reviews",
    icon: ClipboardCheck,
  },
  ...(isAdmin
    ? [
        {
          id: "tools" as const,
          label: "Tool Management",
          icon: Wrench,
        },
      ]
    : []),
];


  return (
    <aside
      className={`flex h-screen shrink-0 flex-col border-r border-white/10 bg-[#0d1422] transition-all duration-200 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      <div className="flex h-20 items-center justify-between border-b border-white/10 px-4">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="rounded-xl bg-indigo-500/15 p-2 text-indigo-400">
            <ShieldCheck size={23} />
          </div>

          {!collapsed && (
            <div className="whitespace-nowrap">
              <h1 className="text-sm font-bold text-white">
                MCP Console
              </h1>
              <p className="text-xs text-slate-500">
                {isAdmin ? "Admin Portal" : "Manager Portal"}
              </p>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => setCollapsed((previous) => !previous)}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-white/5 hover:text-white"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight size={17} />
          ) : (
            <ChevronLeft size={17} />
          )}
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {navigation.map((item) => {
          const Icon = item.icon;
          const selected = activeSection === item.id;

          return (
            <button
              key={item.id}
              type="button"
              title={collapsed ? item.label : undefined}
              onClick={() => onSectionChange(item.id)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition ${
                selected
                  ? "bg-indigo-500/15 font-medium text-indigo-300"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon size={19} className="shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      <div className="space-y-2 border-t border-white/10 p-3">
        <button
          type="button"
          title={collapsed ? "Open Playground" : undefined}
          onClick={onOpenPlayground}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-slate-300 hover:bg-white/5"
        >
          <Bot size={19} className="shrink-0" />
          {!collapsed && <span>MCP Playground</span>}
        </button>

        <button
          type="button"
          title={collapsed ? "Logout" : undefined}
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-red-400 hover:bg-red-500/10"
        >
          <LogOut size={19} className="shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>

        {!collapsed && (
          <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
            <p className="truncate text-sm font-medium text-white">
              {user?.username}
            </p>
            <p className="mt-1 text-xs capitalize text-slate-500">
              {user?.role}
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}
