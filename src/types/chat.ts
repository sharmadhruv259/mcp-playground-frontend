
export type MessageRole = "user" | "assistant";

export type ExecutionStatus =
  | "running"
  | "completed"
  | "failed";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
}

export interface ExecutionEvent {
  id: string;
  tool: string;
  status: ExecutionStatus;
  description: string;
}
