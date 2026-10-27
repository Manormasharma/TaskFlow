import { api } from "./api";
import type { User } from "@/types";

export const getMe = () => api<User>("/auth/me");

export const login = (email: string, password: string) =>
  api<User>("/auth/login", "POST", { email, password });

export const register = (name: string, email: string, password: string) =>
  api<User>("/auth/register", "POST", { name, email, password });

export const logout = () => api<null>("/auth/logout", "POST");
