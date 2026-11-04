
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

export default function RolePortal({
  children,
}: RolePortalProps) {
  const { user, isAuthenticated } = useAuth();
  const [showPlayground, setShowPlayground] = useState(false);

  useEffect(() => {
    setShowPlayground(false);
  }, [user?.id]);

  if (!isAuthenticated || !user) {
    return <>{children}</>;
  }

  if (showPlayground || user.role === "user") {
    return <>{children}</>;
  }

  if (user.role === "admin") {
    return (
      <AdminDashboard
        onOpenPlayground={() => setShowPlayground(true)}
      />
    );
  }

  if (user.role === "manager") {
    return (
      <ManagerDashboard
        onOpenPlayground={() => setShowPlayground(true)}
      />
    );
  }

  return <>{children}</>;
}
