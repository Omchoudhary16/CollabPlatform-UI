import { TokenResponse } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5015/api";

class ApiClient {
  private getAccessToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("accessToken");
  }

  private async refreshAccessToken(): Promise<void> {
    const refresh = localStorage.getItem("refreshToken");
    if (!refresh) throw new Error("No refresh token");
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        accessToken: this.getAccessToken(),
        refreshToken: refresh,
      }),
    });
    if (!res.ok) throw new Error("Refresh failed");
    const data: TokenResponse = await res.json();
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
  }

  async fetch<T>(url: string, options: RequestInit = {}): Promise<T> {
    const token = this.getAccessToken();
    const headers = new Headers({
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    });

    let response = await fetch(`${API_BASE}${url}`, { ...options, headers });

    if (response.status === 401) {
      try {
        await this.refreshAccessToken();
        const newToken = this.getAccessToken();
        headers.set("Authorization", `Bearer ${newToken}`);
        response = await fetch(`${API_BASE}${url}`, { ...options, headers });
      } catch {
        localStorage.clear();
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        throw new Error("Session expired");
      }
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || `Request failed with status ${response.status}`);
    }

    return response.json();
  }
}

export const api = new ApiClient();