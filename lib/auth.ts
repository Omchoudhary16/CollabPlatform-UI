import { api } from "./api";

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const data = await api.fetch<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  localStorage.setItem("accessToken", data.accessToken);
  localStorage.setItem("refreshToken", data.refreshToken);
  return data;
}

export async function register(email: string, password: string, fullName: string, role: string): Promise<AuthResponse> {
  const data = await api.fetch<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, fullName, role }),
  });
  localStorage.setItem("accessToken", data.accessToken);
  localStorage.setItem("refreshToken", data.refreshToken);
  return data;
}

export function logout() {
  localStorage.clear();
  window.location.href = "/login";
}