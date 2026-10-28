
"use client";

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";

import {
  BookOpen,
  Bot,
  Lightbulb,
  MessageSquareText,
  Send,
  Sparkles,
  UserRound,
  type LucideIcon,
} from "lucide-react";

import type { StarterPrompt } from "@/constants/starters";
import type { ChatMessage } from "@/types/chat";

interface ChatPanelProps {
  messages?: ChatMessage[];
  loading?: boolean;
  starters?: StarterPrompt[];
  onSelectStarter?: (starter: StarterPrompt) => void;
  onSendMessage: (message: string) => void | Promise<void>;
}

const STARTER_ICONS: Record<string, LucideIcon> = {
  "read-docs": BookOpen,
  "get-prompt": MessageSquareText,
  "project-insights": Lightbulb,
  "auto-overview": Sparkles,
};

/**
 * Display the agent conversation, starter prompts, and input.
 *
 * Args:
 *     props (ChatPanelProps): Messages, loading state,
 *         starter prompts, and event callbacks.
 *
 * Returns:
 *     JSX.Element: Chat panel with starter cards,
 *         conversation history, and message input.
 *
 * Raises:
 *     None: Missing arrays are handled safely.
 */
export default function ChatPanel({
  messages = [],
  loading = false,
  starters = [],
  onSelectStarter,
  onSendMessage,
}: ChatPanelProps) {
  const [input, setInput] = useState("");

  const bottomRef = useRef<HTMLDivElement>(null);

  const safeMessages = Array.isArray(messages)
    ? messages
    : [];

  const safeStarters = Array.isArray(starters)
    ? starters
    : [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  /**
   * Submit a nonempty message to the agent.
   *
   * Args:
   *     event (FormEvent<HTMLFormElement>): Form
   *         submission event.
   *
   * Returns:
   *     void: Submits the message and clears the input.
   *
   * Raises:
   *     None: Empty messages and submissions while
   *         loading are ignored.
   */
  function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ): void {
    event.preventDefault();

    const message = input.trim();

    if (!message || loading) {
      return;
    }

    void onSendMessage(message);

    setInput("");
  }

  /**
   * Execute a selected starter prompt.
   *
   * Args:
   *     starter (StarterPrompt): Selected starter card.
   *
   * Returns:
   *     void: Invokes the parent's starter callback.
   *
   * Raises:
   *     None: Missing callbacks and loading are ignored.
   */
  function handleStarterClick(
    starter: StarterPrompt
  ): void {
    if (loading || !onSelectStarter) {
      return;
    }

    onSelectStarter(starter);
  }

  return (
    <section className="flex h-full min-w-0 flex-1 flex-col bg-slate-900">
      {/* Chat header */}
      <header className="flex h-14 shrink-0 items-center border-b border-white/5 px-6">
        <div>
          <h1 className="text-sm font-semibold text-white">
            Agent Playground
          </h1>

          <p className="text-xs text-slate-400">
            Test your agent and tool selection.
          </p>
        </div>
      </header>

      {/* Chat messages */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col gap-5 px-6 py-6">
          {safeMessages.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <div className="mb-4 rounded-2xl border border-indigo-500/20 bg-indigo-500/10 p-4">
                <Bot
                  size={30}
                  className="text-indigo-400"
                />
              </div>

              <h2 className="text-lg font-semibold text-white">
                MCP Agent Playground
              </h2>

              <p className="mt-2 max-w-sm text-sm leading-6 text-slate-400">
                Ask a question, or try a starter below
                to see your agent&apos;s tool calls
                appear in the execution log.
              </p>

              {/* Starter prompt cards */}
              {safeStarters.length > 0 &&
                onSelectStarter && (
                  <div className="mt-8 grid w-full max-w-2xl grid-cols-1 gap-3 text-left sm:grid-cols-2">
                    {safeStarters.map((starter) => {
                      const Icon =
                        STARTER_ICONS[starter.id] ??
                        Sparkles;

                      return (
                        <button
                          key={starter.id}
                          type="button"
                          disabled={loading}
                          onClick={() =>
                            handleStarterClick(starter)
                          }
                          className="group rounded-xl border border-white/5 bg-white/[0.03] p-4 text-left transition-colors hover:border-indigo-500/40 hover:bg-indigo-500/[0.06] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <Icon
                              size={17}
                              className="text-indigo-400"
                            />

                            <span className="max-w-[75%] truncate rounded bg-white/5 px-2 py-0.5 font-mono text-[10px] text-slate-400 transition-colors group-hover:text-indigo-300">
                              {starter.tool ?? "Auto"}
                            </span>
                          </div>

                          <p className="mt-3 text-sm font-medium text-white">
                            {starter.title}
                          </p>

                          <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-400">
                            {starter.prompt}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                )}
            </div>
          ) : (
            safeMessages.map((message) => {
              const isUser =
                message.role === "user";

              return (
                <div
                  key={message.id}
                  className={`flex items-start gap-3 ${
                    isUser
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  {!isUser && (
                    <div className="shrink-0 rounded-lg bg-indigo-500/10 p-2">
                      <Bot
                        size={16}
                        className="text-indigo-400"
                      />
                    </div>
                  )}

                  <div
                    className={`max-w-[80%] whitespace-pre-wrap break-words rounded-2xl px-4 py-2.5 text-sm leading-6 ${
                      isUser
                        ? "bg-indigo-600 text-white"
                        : "border border-white/5 bg-white/[0.04] text-slate-200"
                    }`}
                  >
                    {message.content}
                  </div>

                  {isUser && (
                    <div className="shrink-0 rounded-lg bg-white/5 p-2">
                      <UserRound
                        size={16}
                        className="text-slate-300"
                      />
                    </div>
                  )}
                </div>
              );
            })
          )}

          {/* Loading indicator */}
          {loading && (
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-indigo-500/10 p-2">
                <Bot
                  size={16}
                  className="text-indigo-400"
                />
              </div>

              <span className="animate-pulse text-sm text-slate-400">
                Thinking...
              </span>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Message input */}
      <form
        onSubmit={handleSubmit}
        className="shrink-0 px-6 pb-5 pt-2"
      >
        <div className="mx-auto flex w-full max-w-3xl items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] p-2 transition-colors focus-within:border-indigo-500/60">
          <input
            value={input}
            onChange={(event) =>
              setInput(event.target.value)
            }
            disabled={loading}
            placeholder="Ask your agent a question..."
            aria-label="Chat message"
            className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 disabled:opacity-60"
          />

          <button
            type="submit"
            disabled={!input.trim() || loading}
            aria-label="Send message"
            className="rounded-lg bg-indigo-600 p-2.5 text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Send size={16} />
          </button>
        </div>
      </form>
    </section>
  );
}
