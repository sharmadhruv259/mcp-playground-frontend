
export interface StarterPrompt {
  id: string;
  title: string;
  prompt: string;

  /** Tool name for Manual mode, or null for Auto mode. */
  tool: string | null;
}

export const STARTER_PROMPTS: StarterPrompt[] = [
  {
    id: "read-docs",
    title: "Read the project docs",
    prompt:
      "Read the project documentation and summarize what this project does.",
    tool: "read_mcp_resource",
  },
  {
    id: "get-prompt",
    title: "Fetch reusable instructions",
    prompt:
      "Get the reusable prompt instructions from the MCP server.",
    tool: "get_mcp_prompt",
  },
  {
    id: "project-insights",
    title: "Ask about the architecture",
    prompt:
      "What are the key architecture decisions and requirements of this project?",
    tool: "get_project_insights",
  },
  {
    id: "auto-overview",
    title: "Let the agent choose",
    prompt: "Give me a quick overview of this project.",
    tool: null,
  },
];
