import { create } from "zustand";

interface User {
  id: string | undefined;
  name: string;
  email: string;
  role: string;
  phone: string | null;
  avatar: string | null;
  is_verified: boolean;
  email_verified_at: string | null;
  phone_verified_at: string | null;
}

interface AuthState {
  user: User | null;
  token: string | null;
  guestUuid: string | null;
  setAuth: (user: User, token: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
  initGuestUuid: () => void;
}

function getOrCreateGuestUuid(): string {
  const stored = localStorage.getItem("guest_uuid");
  if (stored) return stored;
  const newUuid = crypto.randomUUID();
  localStorage.setItem("guest_uuid", newUuid);
  return newUuid;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: JSON.parse(localStorage.getItem("user") || "null"),
  token: localStorage.getItem("token"),
  guestUuid: localStorage.getItem("guest_uuid"),
  setAuth: (user, token) => {
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("token", token);
    set({ user, token });
  },
  setUser: (user) => {
    localStorage.setItem("user", JSON.stringify(user));
    set({ user });
  },
  logout: () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    set({ user: null, token: null });
  },
  isAuthenticated: () => !!get().token,
  initGuestUuid: () => {
    const uuid = getOrCreateGuestUuid();
    set({ guestUuid: uuid });
  },
}));
