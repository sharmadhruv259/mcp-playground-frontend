
"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { getMCPCapabilities } from "@/lib/api";
import type { MCPCapabilities } from "@/types/mcp";

export function useMCPCapabilities() {
  const [capabilities, setCapabilities] =
    useState<MCPCapabilities>({
      tools: [],
      resources: [],
      prompts: [],
    });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshCapabilities = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await getMCPCapabilities();

      setCapabilities(result);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to discover MCP capabilities."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshCapabilities();
  }, [refreshCapabilities]);

  return {
    capabilities,
    loading,
    error,
    refreshCapabilities,
  };
}
