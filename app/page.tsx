
"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import Sidebar from "@/components/layout/Sidebar";
import ChatPanel from "@/components/chat/ChatPanel";
import ExecutionLog from "@/components/execution/ExecutionLog";
import AgentForm from "@/components/agents/AgentForm";
import FullScreenLoader from "@/components/layout/FullScreenLoader";

import {
  STARTER_PROMPTS,
  type StarterPrompt,
} from "@/constants/starters";

import { useAgents } from "@/hooks/useAgents";
import { useMCPCapabilities } from "@/hooks/useMCPCapabilities";
import { sendChatMessage } from "@/lib/api";

import type { AgentConfig } from "@/types/agents";
import type {
  ChatMessage,
  ExecutionEvent,
} from "@/types/chat";
import type {
  ToolDefinition,
  ToolMode,
} from "@/types/tools";

const MCP_TOOL_PREFIX = "mcp_tool__";

const RESOURCE_FUNCTION = "read_mcp_resource";
const PROMPT_FUNCTION = "get_mcp_prompt";

/**
 * Convert a frontend MCP tool name into its native name.
 *
 * Native MCP tools are stored without the Groq prefix.
 * Resources and prompts are separate MCP operations.
 */
function getNativeMCPToolName(
  toolName: string | null
): string | null {
  if (!toolName) {
    return null;
  }

  if (!toolName.startsWith(MCP_TOOL_PREFIX)) {
    return null;
  }

  const nativeName = toolName.slice(
    MCP_TOOL_PREFIX.length
  );

  return nativeName || null;
}

/**
 * Convert a saved native MCP tool name into its
 * frontend display name.
 */
function getFrontendMCPToolName(
  nativeName: string | null
): string | null {
  if (!nativeName) {
    return null;
  }

  if (nativeName.startsWith(MCP_TOOL_PREFIX)) {
    return nativeName;
  }

  return `${MCP_TOOL_PREFIX}${nativeName}`;
}

export default function Home() {
  const [sidebarCollapsed, setSidebarCollapsed] =
    useState(false);

  const [logCollapsed, setLogCollapsed] =
    useState(false);

  const [showAgentForm, setShowAgentForm] =
    useState(false);

  const [editingAgent, setEditingAgent] =
    useState<AgentConfig | null>(null);

  // Chat request loading state.
  const [loading, setLoading] = useState(false);
  const [chatKey, setChatKey] = useState(0);

  const [mode, setMode] =
    useState<ToolMode>("auto");

  const [selectedTool, setSelectedTool] =
    useState<string | null>(null);

  const [messages, setMessages] =
    useState<ChatMessage[]>([]);

  const [events, setEvents] =
    useState<ExecutionEvent[]>([]);

  const requestIdRef = useRef(0);
  const loadingRef = useRef(false);

  // Load saved agents from the backend.
  const {
    agents,
    selectedAgent,
    selectedAgentId,
    setSelectedAgentId,
    loading: agentsLoading,
    error: agentsError,
    addAgent,
    editAgent,
    removeAgent,
  } = useAgents();

  // Discover MCP capabilities from the backend.
  const {
    capabilities,
    loading: capabilitiesLoading,
    error: capabilitiesError,
  } = useMCPCapabilities();

  /*
   * Show the full-screen loader while either
   * initialization request is still running.
   *
   * This state is independent of chat loading.
   */
  const isInitializing =
    agentsLoading || capabilitiesLoading;

  // Adapt discovered MCP operations to the sidebar.
  const availableTools = useMemo<ToolDefinition[]>(() => {
    const tools: ToolDefinition[] = [];

    for (const tool of capabilities.tools) {
      tools.push({
        name: `${MCP_TOOL_PREFIX}${tool.name}`,
        description:
          tool.description ?? "MCP server tool.",
        source: "builtin",
        parameters: {
          type: "object",
          properties: {},
          required: [],
        },
      });
    }

    if (capabilities.resources.length > 0) {
      tools.push({
        name: RESOURCE_FUNCTION,
        description:
          "Read documentation and resources from the MCP server.",
        source: "builtin",
        parameters: {
          type: "object",
          properties: {},
          required: [],
        },
      });
    }

    if (capabilities.prompts.length > 0) {
      tools.push({
        name: PROMPT_FUNCTION,
        description:
          "Retrieve reusable instructions from the MCP server.",
        source: "builtin",
        parameters: {
          type: "object",
          properties: {},
          required: [],
        },
      });
    }

    return tools;
  }, [capabilities]);

  // Restore tool permissions when switching saved agents.
  useEffect(() => {
    if (!selectedAgent) {
      setMode("auto");
      setSelectedTool(null);
      return;
    }

    if (
      selectedAgent.tool_access === "selected" &&
      selectedAgent.allowed_tools.length > 0
    ) {
      setMode("manual");

      setSelectedTool(
        getFrontendMCPToolName(
          selectedAgent.allowed_tools[0]
        )
      );
    } else {
      setMode("auto");
      setSelectedTool(null);
    }
  }, [selectedAgentId, selectedAgent]);

  function resetConversation(): void {
    requestIdRef.current += 1;
    loadingRef.current = false;

    setLoading(false);
    setMessages([]);
    setEvents([]);
    setChatKey((previous) => previous + 1);
  }

  function handleNewChat(): void {
    resetConversation();
  }

  function handleAgentChange(agentId: string): void {
    resetConversation();
    setSelectedAgentId(agentId || null);
  }

  function handleModeChange(value: ToolMode): void {
    setMode(value);

    if (value === "auto") {
      setSelectedTool(null);
    }
  }

  async function handleSaveAgent(
    input: AgentConfig
  ): Promise<void> {
    if (editingAgent) {
      await editAgent(input);
    } else {
      await addAgent(input);
    }

    resetConversation();
  }

  async function handleDeleteAgent(): Promise<void> {
    if (!selectedAgent) {
      return;
    }

    const confirmed = window.confirm(
      `Delete agent "${selectedAgent.name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await removeAgent(selectedAgent.id);
      resetConversation();
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : "Unable to delete agent."
      );
    }
  }

  async function handleSendMessage(
    message: string,
    override?: {
      mode: ToolMode;
      selectedTool: string | null;
    }
  ): Promise<void> {
    const trimmed = message.trim();

    if (!trimmed || loadingRef.current) {
      return;
    }

    loadingRef.current = true;

    const requestId = ++requestIdRef.current;

    const activeMode = override?.mode ?? mode;

    const activeTool = override
      ? override.selectedTool
      : selectedTool;

    setLoading(true);
    setEvents([]);

    setMessages((previous) => [
      ...previous,
      {
        id: crypto.randomUUID(),
        role: "user",
        content: trimmed,
      },
    ]);

    try {
      if (!selectedAgent) {
        throw new Error(
          "Create or select an agent before chatting."
        );
      }

      if (
        activeMode === "manual" &&
        (!activeTool ||
          !availableTools.some(
            (tool) => tool.name === activeTool
          ))
      ) {
        throw new Error(
          "Choose an available MCP operation in Manual mode."
        );
      }

      // Convert frontend tool names to native MCP names.
      const nativeToolName =
        activeMode === "manual"
          ? getNativeMCPToolName(activeTool)
          : null;

      /*
       * Backend allowed_tools contains only native
       * MCP tool names.
       *
       * Built-in resource/prompt operations are not
       * native MCP tools, so they cannot be placed
       * inside allowed_tools.
       */
      const updatedConfig: AgentConfig = {
        ...selectedAgent,

        tool_access:
          nativeToolName ? "selected" : "all",

        allowed_tools:
          nativeToolName
            ? [nativeToolName]
            : [],
      };

      // Persist permissions before invoking the agent.
      if (
        updatedConfig.tool_access !==
          selectedAgent.tool_access ||
        JSON.stringify(updatedConfig.allowed_tools) !==
          JSON.stringify(selectedAgent.allowed_tools)
      ) {
        await editAgent(updatedConfig);
      }

      // Execute chat using the saved agent ID.
      const result = await sendChatMessage(
        trimmed,
        selectedAgent.id
      );

      // Ignore stale responses after chat resets.
      if (requestId !== requestIdRef.current) {
        return;
      }

      setMessages((previous) => [
        ...previous,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: result.answer,
        },
      ]);

      setEvents(result.events ?? []);
    } catch (error) {
      if (requestId !== requestIdRef.current) {
        return;
      }

      const description =
        error instanceof Error
          ? error.message
          : "An unexpected error occurred.";

      setMessages((previous) => [
        ...previous,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: `No agent selected \n Please ${description}`,
        },
      ]);

      setEvents([
        {
          id: crypto.randomUUID(),
          tool: "backend_request",
          status: "failed",
          description,
        },
      ]);
    } finally {
      if (requestId === requestIdRef.current) {
        loadingRef.current = false;
        setLoading(false);
      }
    }
  }

  function handleStarterSelect(
    starter: StarterPrompt
  ): void {
    if (loadingRef.current) {
      return;
    }

    const nextMode: ToolMode = starter.tool
      ? "manual"
      : "auto";

    setMode(nextMode);
    setSelectedTool(starter.tool);

    void handleSendMessage(starter.prompt, {
      mode: nextMode,
      selectedTool: starter.tool,
    });
  }

  const availableStarters = STARTER_PROMPTS.filter(
    (starter) =>
      starter.tool === null ||
      availableTools.some(
        (tool) => tool.name === starter.tool
      )
  );

  return (
    <main className="flex h-screen overflow-hidden bg-slate-950">

      {/* Full-screen centered initialization loader */}
      {isInitializing && <FullScreenLoader />}

      <Sidebar
        collapsed={sidebarCollapsed}
        mode={mode}
        selectedTool={selectedTool}
        tools={availableTools}
        agents={agents}
        selectedAgentId={selectedAgentId}
        agentLoading={agentsLoading}
        onSelectAgent={handleAgentChange}
        onCreateAgent={() => {
          setEditingAgent(null);
          setShowAgentForm(true);
        }}
        onEditAgent={() => {
          if (!selectedAgent) return;

          setEditingAgent(selectedAgent);
          setShowAgentForm(true);
        }}
        onDeleteAgent={() => {
          void handleDeleteAgent();
        }}
        onToggle={() =>
          setSidebarCollapsed(
            (previous) => !previous
          )
        }
        onNewChat={handleNewChat}
        onModeChange={handleModeChange}
        onToolChange={setSelectedTool}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        {(agentsError || capabilitiesError) && (
          <div
            role="alert"
            className="border-b border-red-500/20 bg-red-500/10 px-5 py-2 text-xs text-red-300"
          >
            {agentsError ?? capabilitiesError}
          </div>
        )}

        <ChatPanel
          key={chatKey}
          messages={messages}
          loading={loading}
          starters={availableStarters}
          onSelectStarter={handleStarterSelect}
          onSendMessage={handleSendMessage}
        />
      </div>

      <ExecutionLog
        events={events}
        collapsed={logCollapsed}
        onToggle={() =>
          setLogCollapsed(
            (previous) => !previous
          )
        }
      />

      {showAgentForm && (
        <AgentForm
          agent={editingAgent}
          onClose={() => {
            setShowAgentForm(false);
            setEditingAgent(null);
          }}
          onSave={handleSaveAgent}
        />
      )}
    </main>
  );
}
