
import type {
  AgentRecord,
  ApprovalStatus,
} from "@/types/agents";

/**
 * Return whether an agent is approved for execution.
 */
export function canExecuteAgent(
  record: AgentRecord | null | undefined
): boolean {
  return record?.approval_status === "approved";
}

/**
 * Return a readable label for an approval status.
 */
export function getApprovalStatusLabel(
  status: ApprovalStatus
): string {
  switch (status) {
    case "draft":
      return "Draft";
    case "pending":
      return "Pending Approval";
    case "approved":
      return "Approved";
    case "rejected":
      return "Rejected";
  }
}
