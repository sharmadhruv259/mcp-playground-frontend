
import type {
  AuthUser,
  LoginCredentials,
  TokenResponse,
} from "@/types/auth";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"
).replace(/\/+$/, "");

// Keep the JWT access token in memory.
let accessToken: string | null = null;

/**
 * Store the JWT access token.
 */
export function setAccessToken(token: string): void {
  accessToken = token;
}

/**
 * Retrieve the current JWT access token.
 */
export function getAccessToken(): string | null {
  return accessToken;
}

/**
 * Clear the current JWT access token.
 */
export function clearAccessToken(): void {
  accessToken = null;
}

/**
 * Extract a readable error message from an API response.
 */
async function readError(response: Response): Promise<string> {
  try {
    const data: unknown = await response.json();

    if (
      typeof data === "object" &&
      data !== null &&
      "detail" in data
    ) {
      const detail = data.detail;

      if (typeof detail === "string") {
        return detail;
      }
    }

    return `Request failed (${response.status}).`;
  } catch {
    return `Request failed (${response.status}).`;
  }
}

/**
 * Authenticate a user using the FastAPI login endpoint.
 */
export async function login(
  credentials: LoginCredentials
): Promise<TokenResponse> {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(await readError(response));
  }

  const data: TokenResponse = await response.json();

  // Validate the backend TokenResponse model.
  if (
    typeof data.access_token !== "string" ||
    data.access_token.length === 0 ||
    typeof data.token_type !== "string" ||
    data.token_type.toLowerCase() !== "bearer" ||
    typeof data.expires_in !== "number" ||
    !Number.isFinite(data.expires_in) ||
    data.expires_in <= 0
  ) {
    throw new Error("Invalid authentication response.");
  }

  return data;
}

/**
 * Retrieve the authenticated user's profile.
 */
export async function getCurrentUser(
  token: string
): Promise<AuthUser> {
  const response = await fetch(`${API_URL}/api/auth/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(await readError(response));
  }

  const data: AuthUser = await response.json();

  // Validate the backend User model.
  if (
    typeof data.id !== "string" ||
    typeof data.username !== "string" ||
    !["user", "manager", "admin"].includes(data.role) ||
    typeof data.is_active !== "boolean"
  ) {
    throw new Error("Invalid user profile response.");
  }

  if (!data.is_active) {
    throw new Error("Your account is inactive.");
  }

  return data;
}


export interface SignupCredentials {
  username: string;
  password: string;
}

export interface SignupResponse {
  id: string;
  username: string;
  role: "user" | "manager" | "admin";
  is_active: boolean;
}

/**
 * Register a new account with the User role.
 *
 * @param credentials - Username and password.
 * @returns The newly registered user profile.
 * @throws Error if registration fails.
 */
export async function signup(
  credentials: SignupCredentials
): Promise<SignupResponse> {
  const baseUrl = (
    process.env.NEXT_PUBLIC_API_URL ??
    "http://localhost:8000"
  ).replace(/\/+$/, "");

  const response = await fetch(`${baseUrl}/api/auth/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const detail = body?.detail;

    if (Array.isArray(detail)) {
      throw new Error(
        detail
          .map((item: { msg?: string }) =>
            item.msg ?? "Invalid signup information"
          )
          .join("\n")
      );
    }

    throw new Error(
      typeof detail === "string"
        ? detail
        : "Unable to create account."
    );
  }

  return (await response.json()) as SignupResponse;
}

