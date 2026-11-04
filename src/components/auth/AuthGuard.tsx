
"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/context/AuthContext";

interface AuthGuardProps {
  children: ReactNode;
}

export default function AuthGuard({
  children,
}: AuthGuardProps) {
  const router = useRouter();

  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
