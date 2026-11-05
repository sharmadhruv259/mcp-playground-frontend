
import type {
  AuthUser,
  LoginCredentials,
  TokenResponse,
} from "@/types/auth";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"
).replace(/\/+$/, "");

const TOKEN_STORAGE_KEY = "mcp-playground:access-token";

// Keep the JWT access token in memory and sessionStorage.
let accessToken: string | null = null;

/**
 * Store the JWT access token.
 *
 * Args:
 *     token (string): JWT returned by the authentication API.
 *
 * Returns:
 *     void: Stores the token in memory and sessionStorage.
 */
export function setAccessToken(token: string): void {
  accessToken = token;

  if (typeof window !== "undefined") {
    try {
      window.sessionStorage.setItem(
        TOKEN_STORAGE_KEY,
        token
      );
    } catch {
      // Continue using the in-memory token.
    }
  }
}

/**
 * Retrieve the current JWT access token.
 *
 * Returns:
 *     string | null: JWT from memory or sessionStorage,
 *     or null when no token is available.
 */
export function getAccessToken(): string | null {
  if (accessToken) {
    return accessToken;
  }

  if (typeof window !== "undefined") {
    try {
      accessToken = window.sessionStorage.getItem(
        TOKEN_STORAGE_KEY
      );
    } catch {
      return null;
    }
  }

  return accessToken;
}

/**
 * Clear the current JWT access token.
 *
 * Returns:
 *     void: Removes the token from memory and sessionStorage.
 */
export function clearAccessToken(): void {
  accessToken = null;

  if (typeof window !== "undefined") {
    try {
      window.sessionStorage.removeItem(
        TOKEN_STORAGE_KEY
      );
    } catch {
      // In-memory token has already been cleared.
    }
  }
}

/**
 * Extract a readable error message from an API response.
 *
 * Args:
 *     response (Response): HTTP response returned by the API.
 *
 * Returns:
 *     Promise<string>: Error description.
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
 *
 * Args:
 *     credentials (LoginCredentials): Username and password.
 *
 * Returns:
 *     Promise<TokenResponse>: Validated authentication response.
 *
 * Raises:
 *     Error: If authentication fails or the response is invalid.
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
 *
 * Args:
 *     token (string): JWT access token.
 *
 * Returns:
 *     Promise<AuthUser>: Validated authenticated user.
 *
 * Raises:
 *     Error: If the request fails or the profile is invalid.
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
 * Args:
 *     credentials (SignupCredentials): Username and password.
 *
 * Returns:
 *     Promise<SignupResponse>: Newly registered user profile.
 *
 * Raises:
 *     Error: If registration fails.
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
