
import type { AuthUser } from "@/types/auth";

export interface CreateManagerInput {
  username: string;
  password: string;
}

export type ManagerAccount = AuthUser;
