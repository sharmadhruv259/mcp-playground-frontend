"use client";

import { useState } from "react";
import {
  ArrowUpRight,
  ClipboardCheck,
  ShieldCheck,
  UserCog,
  Users,
  Wrench,
} from "lucide-react";

import UserManagement from "@/components/dashboard/UserManagement";
import ManagerManagement from "@/components/admin/ManagerManagement";
import AgentReviews from "@/components/dashboard/AgentReviews";
import ToolManagement from "@/components/admin/ToolManagement";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

import type { DashboardSection } from "@/components/dashboard/DashboardSidebar";
import { useAuth } from "@/context/AuthContext";

interface AdminDashboardProps {
  onOpenPlayground: () => void;
}

export default function AdminDashboard({
  onOpenPlayground,
}: AdminDashboardProps) {
  const { user } = useAuth();

  const [activeSection, setActiveSection] =
    useState<DashboardSection>("overview");

  if (user?.role !== "admin") {
    return null;
  }

  /* =========================================================
     DASHBOARD TITLES
  ========================================================= */

  const titles: Record<DashboardSection, string> = {
    overview: "Dashboard Overview",
    users: "User Management",
    managers: "Manager Management",
    reviews: "Agent Reviews",
    tools: "Tool Management",
  };

  /* =========================================================
     DASHBOARD DESCRIPTIONS
  ========================================================= */

  const descriptions: Record<DashboardSection, string> = {
    overview: "Platform administration and management.",
    users:
      "View, create, edit, and manage registered User accounts.",
    managers:
      "View, create, edit, and manage Manager accounts.",
    reviews:
      "Review, approve, and reject submitted MCP agents.",
    tools:
      "Manage registered MCP operations, edit descriptions, and control tool availability.",
  };

  return (
    <DashboardLayout
      activeSection={activeSection}
      onSectionChange={setActiveSection}
      onOpenPlayground={onOpenPlayground}
      title={titles[activeSection]}
      description={descriptions[activeSection]}
    >
      {/* =====================================================
          DASHBOARD OVERVIEW
      ===================================================== */}

      {activeSection === "overview" && (
        <div className="space-y-6">
          {/* HERO */}

          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-indigo-600/25 via-slate-900/70 to-slate-950 p-6 sm:p-8">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-indigo-500/25 blur-[90px]"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-violet-600/15 blur-[90px]"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-[0.25]"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(148,163,184,0.10) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.10) 1px, transparent 1px)",
                backgroundSize: "40px 40px",
                maskImage:
                  "radial-gradient(ellipse 70% 100% at 100% 0%, black 10%, transparent 70%)",
                WebkitMaskImage:
                  "radial-gradient(ellipse 70% 100% at 100% 0%, black 10%, transparent 70%)",
              }}
            />

            <div className="relative">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-300/25 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-200">
                <ShieldCheck size={13} />
                Administrator
              </span>

              <h2 className="mt-4 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                Welcome back, {user.username}
              </h2>

              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300/80">
                Manage your MCP Playground platform from one place.
              </p>
            </div>
          </div>

          {/* MANAGEMENT CARDS */}

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              {
                label: "User Management",
                description:
                  "View, create, edit, reset passwords, and manage regular User accounts.",
                icon: Users,
                section: "users" as const,
                tint: "from-indigo-500/35 to-indigo-500/5 text-indigo-200",
              },
              {
                label: "Manager Management",
                description:
                  "Create, view, edit, reset passwords, and manage Manager accounts.",
                icon: UserCog,
                section: "managers" as const,
                tint: "from-violet-500/35 to-violet-500/5 text-violet-200",
              },
              {
                label: "Agent Reviews",
                description:
                  "View submitted agents, inspect configurations, approve or reject requests.",
                icon: ClipboardCheck,
                section: "reviews" as const,
                tint: "from-emerald-500/35 to-emerald-500/5 text-emerald-200",
              },
              {
                label: "Tool Management",
                description:
                  "View registered MCP tools, edit descriptions, and enable or disable operations.",
                icon: Wrench,
                section: "tools" as const,
                tint: "from-amber-500/35 to-amber-500/5 text-amber-200",
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.section}
                  type="button"
                  onClick={() =>
                    setActiveSection(item.section)
                  }
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.015] p-5 text-left transition-all duration-200 hover:-translate-y-1 hover:border-indigo-400/40 hover:shadow-[0_18px_40px_-18px_rgba(99,102,241,0.6)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60"
                >
                  <ArrowUpRight
                    size={16}
                    className="absolute right-4 top-4 -translate-x-1 translate-y-1 text-slate-500 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:text-indigo-300 group-hover:opacity-100"
                  />

                  <span
                    className={`mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ring-1 ring-inset ring-white/10 ${item.tint}`}
                  >
                    <Icon size={22} />
                  </span>

                  <h3 className="font-semibold text-white">
                    {item.label}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    {item.description}
                  </p>
                </button>
              );
            })}
          </div>

          {/* ADMINISTRATOR ACCESS INFORMATION */}

          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-transparent p-6 [border-left-width:3px] border-l-indigo-400/70">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/15 ring-1 ring-inset ring-indigo-300/20">
                <ShieldCheck
                  size={18}
                  className="text-indigo-300"
                />
              </span>

              <h3 className="font-semibold text-white">
                Administrator Access
              </h3>
            </div>

            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
              You can create and manage regular User accounts,
              create and manage Manager accounts, review agent
              submissions, and control MCP tool availability.
              Manager and Admin account permissions remain
              protected by backend authorization.
            </p>
          </div>
        </div>
      )}

      {/* =====================================================
          USER MANAGEMENT
      ===================================================== */}

      {activeSection === "users" && (
        <UserManagement />
      )}

      {/* =====================================================
          MANAGER MANAGEMENT
      ===================================================== */}

      {activeSection === "managers" && (
        <ManagerManagement />
      )}

      {/* =====================================================
          AGENT REVIEWS
      ===================================================== */}

      {activeSection === "reviews" && (
        <AgentReviews />
      )}

      {/* =====================================================
          TOOL MANAGEMENT
      ===================================================== */}

      {activeSection === "tools" && (
        <ToolManagement />
      )}
    </DashboardLayout>
  );
}