
"use client";

import {
  useEffect,
  useState,
  type ReactNode,
} from "react";

import AdminDashboard from "@/components/admin/AdminDashboard";
import ManagerDashboard from "@/components/manager/ManagerDashboard";
import { useAuth } from "@/context/AuthContext";

interface RolePortalProps {
  children: ReactNode;
}

/**
 * Render the appropriate portal based on the user's role.
 *
 * Wait for authentication restoration before selecting
 * the Admin, Manager, or Playground interface.
 */
export default function RolePortal({
  children,
}: RolePortalProps) {
  const {
    user,
    isAuthenticated,
    isLoading: authLoading,
  } = useAuth();

  const [showPlayground, setShowPlayground] =
    useState(false);

  /*
   * Reset the Playground override when the
   * authenticated user changes.
   */
  useEffect(() => {
    setShowPlayground(false);
  }, [user?.id]);

  /*
   * Wait for session restoration before rendering
   * any role-specific interface.
   *
   * This prevents the MCP Playground from briefly
   * appearing when an Admin or Manager refreshes.
   */
  if (authLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-950 text-slate-100">
        <div className="flex flex-col items-center gap-4">
          <div className="h-9 w-9 animate-spin rounded-full border-2 border-slate-700 border-t-indigo-400" />

          <p className="text-sm text-slate-400">
            Restoring your session...
          </p>
        </div>
      </div>
    );
  }

  /*
   * Unauthenticated visitors use the
   * regular MCP Playground.
   */
  if (!isAuthenticated || !user) {
    return <>{children}</>;
  }

  /*
   * Regular users always use the Playground.
   * Admins and Managers can open it manually.
   */
  if (showPlayground || user.role === "user") {
    return <>{children}</>;
  }

  /*
   * Administrator Portal.
   */
  if (user.role === "admin") {
    return (
      <AdminDashboard
        onOpenPlayground={() =>
          setShowPlayground(true)
        }
      />
    );
  }

  /*
   * Manager Portal.
   */
  if (user.role === "manager") {
    return (
      <ManagerDashboard
        onOpenPlayground={() =>
          setShowPlayground(true)
        }
      />
    );
  }

  return <>{children}</>;
}
