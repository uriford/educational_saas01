import type { LoginFormData } from "../types";

export async function login(data: LoginFormData) {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Login failed.");
  }

  return response.json();
}