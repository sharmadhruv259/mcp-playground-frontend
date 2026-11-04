"use client";

import { useState } from "react";
import {
  ArrowUpRight,
  ClipboardCheck,
  Shield,
  Users,
} from "lucide-react";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import type { DashboardSection } from "@/components/dashboard/DashboardSidebar";
import UserManagement from "@/components/dashboard/UserManagement";
import AgentReviews from "@/components/dashboard/AgentReviews";
import { useAuth } from "@/context/AuthContext";

interface ManagerDashboardProps {
  onOpenPlayground: () => void;
}

export default function ManagerDashboard({
  onOpenPlayground,
}: ManagerDashboardProps) {
  const { user } = useAuth();

  const [activeSection, setActiveSection] =
    useState<DashboardSection>("overview");

  if (user?.role !== "manager") {
    return null;
  }

  /* =========================================================
     DASHBOARD TITLES
  ========================================================= */

  const titles: Record<DashboardSection, string> = {
    overview: "Manager Overview",
    users: "User Management",
    managers: "Manager Management",
    reviews: "Agent Reviews",
    tools: "Tool Management",
  };

  /* =========================================================
     DASHBOARD DESCRIPTIONS
  ========================================================= */

  const descriptions: Record<DashboardSection, string> = {
    overview: "Manage agent approvals and workflows.",
    users:
      "View, create, edit, and manage registered User accounts.",
    managers:
      "Manager account administration.",
    reviews:
      "Review, approve, and reject submitted MCP agents.",
    tools:
      "MCP Tool Management is restricted to administrators.",
  };

  /* =========================================================
     MANAGER NAVIGATION
  ========================================================= */

  const handleSectionChange = (
    section: DashboardSection
  ) => {
    // Managers cannot access Admin-only sections.
    if (section === "managers" || section === "tools") {
      return;
    }

    setActiveSection(section);
  };

  return (
    <DashboardLayout
      activeSection={activeSection}
      onSectionChange={handleSectionChange}
      onOpenPlayground={onOpenPlayground}
      title={titles[activeSection]}
      description={descriptions[activeSection]}
    >
      {/* =====================================================
          MANAGER OVERVIEW
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
                <Shield size={13} />
                Manager
              </span>

              <h2 className="mt-4 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                Welcome back, {user.username}
              </h2>

              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300/80">
                Manage registered users, review agent submissions,
                and access your MCP workflows.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {/* USER MANAGEMENT CARD */}

            <button
              type="button"
              onClick={() => setActiveSection("users")}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.015] p-5 text-left transition-all duration-200 hover:-translate-y-1 hover:border-indigo-400/40 hover:shadow-[0_18px_40px_-18px_rgba(99,102,241,0.6)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60"
            >
              <ArrowUpRight
                size={16}
                className="absolute right-4 top-4 -translate-x-1 translate-y-1 text-slate-500 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:text-indigo-300 group-hover:opacity-100"
              />

              <span className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/35 to-indigo-500/5 text-indigo-200 ring-1 ring-inset ring-white/10">
                <Users size={22} />
              </span>

              <h3 className="font-semibold text-white">
                User Management
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                View, create, edit, reset passwords,
                and manage regular User accounts.
              </p>
            </button>

            {/* AGENT REVIEWS CARD */}

            <button
              type="button"
              onClick={() => setActiveSection("reviews")}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.015] p-5 text-left transition-all duration-200 hover:-translate-y-1 hover:border-emerald-400/40 hover:shadow-[0_18px_40px_-18px_rgba(16,185,129,0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60"
            >
              <ArrowUpRight
                size={16}
                className="absolute right-4 top-4 -translate-x-1 translate-y-1 text-slate-500 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:text-emerald-300 group-hover:opacity-100"
              />

              <span className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/35 to-emerald-500/5 text-emerald-200 ring-1 ring-inset ring-white/10">
                <ClipboardCheck size={22} />
              </span>

              <h3 className="font-semibold text-white">
                Agent Reviews
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Inspect submitted agents, review configurations,
                and approve or reject pending requests.
              </p>
            </button>

            {/* MANAGER PERMISSIONS CARD (informational) */}

            <div className="relative overflow-hidden rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-5">
              <span className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/35 to-violet-500/5 text-violet-200 ring-1 ring-inset ring-white/10">
                <Shield size={22} />
              </span>

              <h3 className="font-semibold text-white">
                Manager Permissions
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                You can manage regular User accounts and
                review agent submissions. Manager and Admin
                account administration, including MCP Tool
                Management, remains restricted.
              </p>
            </div>
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
          AGENT REVIEWS
      ===================================================== */}

      {activeSection === "reviews" && (
        <AgentReviews />
      )}
    </DashboardLayout>
  );
}