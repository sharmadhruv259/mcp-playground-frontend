
export type ManagedToolKind = "read" | "write";

export interface ManagedTool {
  name: string;
  description: string;
  handler: string;
  kind: ManagedToolKind;
  enabled: boolean;
  built_in: boolean;
  deleted: boolean;
}

export interface UpdateManagedToolInput {
  description?: string;
  enabled?: boolean;
}
