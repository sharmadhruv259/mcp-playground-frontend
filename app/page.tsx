
"use client";

import { useRef, useState } from "react";

import Sidebar from "@/components/layout/Sidebar";
import ChatPanel from "@/components/chat/ChatPanel";
import ExecutionLog from "@/components/execution/ExecutionLog";
import CreateToolForm from "@/components/tools/CreateToolForm";

import { DEFAULT_TOOL_SELECTION } from "@/constants/defaults";
import {
  STARTER_PROMPTS,
  type StarterPrompt,
} from "@/constants/starters";

import { useTools } from "@/hooks/useTools";
import { sendChatMessage } from "@/lib/api";

import type {
  ChatMessage,
  ExecutionEvent,
} from "@/types/chat";

import type {
  ToolDefinition,
  ToolMode,
} from "@/types/tools";

/**
 * Render the MCP Playground application.
 *
 * Returns:
 *     JSX.Element: Three-panel MCP Playground interface.
 */
export default function Home() {
  const [sidebarCollapsed, setSidebarCollapsed] =
    useState(false);

  const [logCollapsed, setLogCollapsed] =
    useState(false);

  const [showCreateTool, setShowCreateTool] =
    useState(false);

  const [loading, setLoading] = useState(false);

  const [chatKey, setChatKey] = useState(0);

  const [mode, setMode] = useState<ToolMode>(
    DEFAULT_TOOL_SELECTION.mode
  );

  const [selectedTool, setSelectedTool] = useState<
    string | null
  >(DEFAULT_TOOL_SELECTION.selectedTool);

  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const [events, setEvents] = useState<ExecutionEvent[]>([]);

  const requestIdRef = useRef(0);
  const loadingRef = useRef(false);

  const { tools, addTool, removeTool } = useTools();

  const availableTools: ToolDefinition[] =
    Array.isArray(tools) ? tools : [];

  /**
   * Send a user message to the FastAPI backend.
   *
   * Args:
   *     message (string): User's question.
   *     override (object, optional): Tool mode and selection
   *         supplied by a starter card.
   *
   * Returns:
   *     Promise<void>: Updates chat messages and execution logs.
   *
   * Raises:
   *     None: Backend errors are caught and displayed.
   */
  async function handleSendMessage(
    message: string,
    override?: {
      mode: ToolMode;
      selectedTool: string | null;
    }
  ): Promise<void> {
    const trimmedMessage = message.trim();

    if (!trimmedMessage || loadingRef.current) {
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

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmedMessage,
    };

    setMessages((previous) => [
      ...previous,
      userMessage,
    ]);

    try {
      const result = await sendChatMessage(
        trimmedMessage,
        activeMode,
        activeTool,
        availableTools
      );

      if (requestId !== requestIdRef.current) {
        return;
      }

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: result.answer,
      };

      setMessages((previous) => [
        ...previous,
        assistantMessage,
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
          content: `Backend error: ${description}`,
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

  /**
   * Start a new conversation.
   *
   * Returns:
   *     void: Resets chat messages, execution events,
   *         selected tools, and the chat input.
   */
  function handleNewChat(): void {
    requestIdRef.current += 1;
    loadingRef.current = false;

    setMessages([]);
    setEvents([]);
    setLoading(false);

    setMode(DEFAULT_TOOL_SELECTION.mode);
    setSelectedTool(
      DEFAULT_TOOL_SELECTION.selectedTool
    );

    setChatKey((previous) => previous + 1);
  }

  /**
   * Select a starter card and send its prompt.
   *
   * Args:
   *     starter (StarterPrompt): Selected starter card.
   *
   * Returns:
   *     void: Updates the tool selection and submits
   *         the starter prompt.
   */
  function handleStarterSelect(
    starter: StarterPrompt
  ): void {
    if (loadingRef.current) {
      return;
    }

    const nextMode: ToolMode = starter.tool
      ? "manual"
      : "auto";

    const nextTool = starter.tool;

    setMode(nextMode);
    setSelectedTool(nextTool);

    void handleSendMessage(starter.prompt, {
      mode: nextMode,
      selectedTool: nextTool,
    });
  }

  /**
   * Change the tool selection mode.
   *
   * Args:
   *     value (ToolMode): Selected mode.
   *
   * Returns:
   *     void: Updates Auto or Manual mode.
   */
  function handleModeChange(
    value: ToolMode
  ): void {
    setMode(value);

    if (value === "auto") {
      setSelectedTool(null);
    }
  }

  /**
   * Delete a custom tool.
   *
   * Args:
   *     name (string): Tool name to remove.
   *
   * Returns:
   *     void: Removes the tool and clears its selection.
   */
  function handleDeleteTool(
    name: string
  ): void {
    removeTool(name);

    if (selectedTool === name) {
      setSelectedTool(null);
    }
  }

  // Show starter cards only when their required tools exist.
  // The Auto starter is always available.
  const availableStarters = STARTER_PROMPTS.filter(
    (starter) =>
      starter.tool === null ||
      availableTools.some(
        (tool) => tool.name === starter.tool
      )
  );

  return (
    <main className="flex h-screen overflow-hidden bg-slate-950">
      <Sidebar
        collapsed={sidebarCollapsed}
        mode={mode}
        selectedTool={selectedTool}
        tools={availableTools}
        onToggle={() =>
          setSidebarCollapsed(
            (previous) => !previous
          )
        }
        onNewChat={handleNewChat}
        onModeChange={handleModeChange}
        onToolChange={setSelectedTool}
        onCreateTool={() =>
          setShowCreateTool(true)
        }
        onDeleteTool={handleDeleteTool}
      />

      <ChatPanel
        key={chatKey}
        messages={messages}
        loading={loading}
        starters={availableStarters}
        onSelectStarter={handleStarterSelect}
        onSendMessage={handleSendMessage}
      />

      <ExecutionLog
        events={events}
        collapsed={logCollapsed}
        onToggle={() =>
          setLogCollapsed(
            (previous) => !previous
          )
        }
      />

      {showCreateTool && (
        <CreateToolForm
          onClose={() =>
            setShowCreateTool(false)
          }
          onCreate={addTool}
        />
      )}
    </main>
  );
}
