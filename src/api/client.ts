import type { Account, AuthSession, Conversation, Product, UserProfile } from "../types";

export class ApiError extends Error {
  readonly status: number;
  readonly responseBody: string;

  constructor(status: number, responseBody: string) {
    super(`API request failed with status ${status}`);
    this.name = "ApiError";
    this.status = status;
    this.responseBody = responseBody;
  }
}

export type ProductFilterParams = {
  query?: string;
  category?: string;
  city?: string;
  maxDistance?: number;
  minPrice?: number;
  maxPrice?: number;
  state?: string;
};

export function createApiClient(
  baseUrl: string,
  fetchRequest: typeof fetch = fetch,
  auth: { getToken: () => string | null; onUnauthorized: (token: string) => void } = {
    getToken: () => null,
    onUnauthorized: () => {},
  },
) {
  const base = baseUrl.replace(/\/+$/, "");

  async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
    if (!path || path.startsWith("/") || path.split("/").some((part) => part === "..")) {
      throw new Error("API paths must be relative to the API base URL");
    }

    const headers = new Headers(options.headers);
    const publicAccountRequest = [
      "accounts/login",
      "accounts/register",
      "accounts/forgot-password",
      "accounts/reset-password",
    ].includes(path);
    const storedToken = publicAccountRequest ? null : auth.getToken();
    if (storedToken && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${storedToken}`);
    }
    if (!headers.has("Accept")) {
      headers.set("Accept", "application/json");
    }
    if (options.body && typeof options.body === "string" && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    const response = await fetchRequest(`${base}/${path}`, { ...options, headers });
    const body = await response.text();

    if (!response.ok) {
      const authorization = headers.get("Authorization");
      if (response.status === 401 && authorization?.startsWith("Bearer ")) {
        auth.onUnauthorized(authorization.slice("Bearer ".length));
      }
      throw new ApiError(response.status, body);
    }

    if (!body.trim()) {
      return undefined as T;
    }

    try {
      return JSON.parse(body) as T;
    } catch {
      throw new Error("API returned an invalid JSON response");
    }
  }

  return {
    request,

    login: (email: string, password: string) =>
      request<AuthSession>("accounts/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }),

    register: (username: string, email: string, password: string) =>
      request<Account>("accounts/register", {
        method: "POST",
        body: JSON.stringify({ username, email, password }),
      }),

    getCurrentAccount: async (token: string) => {
      const account = await request<Account>("accounts/me", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!account || typeof account.id !== "number" || typeof account.username !== "string" ||
          typeof account.email !== "string" || typeof account.isVerified !== "boolean" ||
          typeof account.createdAt !== "string" || !Number.isFinite(Date.parse(account.createdAt)) ||
          typeof account.role !== "string") {
        throw new Error("API returned an invalid account.");
      }
      return account;
    },

    deleteCurrentAccount: (reason?: string) =>
      request<void>("accounts/me", {
        method: "DELETE",
        body: JSON.stringify({ reason }),
      }),

    forgotPassword: (email: string) =>
      request<{ message: string }>("accounts/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      }),

    resetPassword: (token: string, newPassword: string) =>
      request<{ message: string }>("accounts/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, newPassword }),
      }),

    // Products API
    getProducts: (params?: ProductFilterParams) => {
      const search = new URLSearchParams();
      if (params?.query) search.set("q", params.query);
      if (params?.category) search.set("category", params.category);
      if (params?.city) search.set("city", params.city);
      if (params?.minPrice != null) search.set("minPrice", String(params.minPrice));
      if (params?.maxPrice != null) search.set("maxPrice", String(params.maxPrice));
      if (params?.state) search.set("state", params.state);
      const queryStr = search.toString();
      return request<Product[]>(`products${queryStr ? `?${queryStr}` : ""}`, { method: "GET" });
    },

    getProductById: (id: number | string) =>
      request<Product>(`products/${id}`, { method: "GET" }),

    createProduct: (product: Partial<Product>) =>
      request<Product>("products", {
        method: "POST",
        body: JSON.stringify(product),
      }),

    deleteProduct: (id: number | string) =>
      request<{ success: boolean }>(`products/${id}`, { method: "DELETE" }),

    // Conversations / Chat API
    getConversations: () => request<Conversation[]>("conversations", { method: "GET" }),

    getConversationById: (id: string) =>
      request<Conversation>(`conversations/${id}`, { method: "GET" }),

    sendMessage: (conversationId: string, message: { text: string; sender?: "me" | "them" }) =>
      request<Conversation>(`conversations/${conversationId}/messages`, {
        method: "POST",
        body: JSON.stringify(message),
      }),

    // User / Account API
    getUserProfile: () => request<UserProfile>("user/profile", { method: "GET" }),

    updateUserProfile: (profile: Partial<UserProfile>) =>
      request<UserProfile>("user/profile", {
        method: "PUT",
        body: JSON.stringify(profile),
      }),
  };
}
