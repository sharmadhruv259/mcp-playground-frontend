
"use client";

import type { ReactNode } from "react";
import { Bell, ShieldCheck } from "lucide-react";

import { useAuth } from "@/context/AuthContext";

import DashboardSidebar, {
  type DashboardSection,
} from "@/components/dashboard/DashboardSidebar";

interface DashboardLayoutProps {
  activeSection: DashboardSection;
  onSectionChange: (section: DashboardSection) => void;
  onOpenPlayground: () => void;
  title: string;
  description: string;
  children: ReactNode;
}

export default function DashboardLayout({
  activeSection,
  onSectionChange,
  onOpenPlayground,
  title,
  description,
  children,
}: DashboardLayoutProps) {
  const { user } = useAuth();

  return (
    <div className="flex h-screen overflow-hidden bg-[#080d18] text-white">
      <DashboardSidebar
        activeSection={activeSection}
        onSectionChange={onSectionChange}
        onOpenPlayground={onOpenPlayground}
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-20 shrink-0 items-center justify-between border-b border-white/10 bg-[#0b1120] px-6">
          <div>
            <h1 className="text-xl font-semibold text-white">
              {title}
            </h1>
            <p className="mt-1 text-xs text-slate-400">
              {description}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden rounded-lg border border-indigo-500/20 bg-indigo-500/10 px-3 py-1.5 text-xs font-medium capitalize text-indigo-300 sm:inline">
              {user?.role}
            </span>

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-500/15 text-indigo-300">
              <ShieldCheck size={18} />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
