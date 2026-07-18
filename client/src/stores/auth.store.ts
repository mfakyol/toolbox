// Auth domain store. Holds the session user + runtime auth config and the
// actions that mutate them. Services do the IO (returning Result); the store
// translates a failed Result into a thrown error for the action's caller so the
// calling form can show it, and keeps the happy path in state.
import { create } from "zustand";
import * as authService from "@/services/auth.service";
import type { AuthUser } from "@/services/auth.service";
import { fetchConfig } from "@/services/config.service";
import { ApiError } from "@/services/result";

interface AuthState {
  user: AuthUser | null;
  // When false, the app is open: no login gate, no admin/users area.
  authRequired: boolean;
  loading: boolean;
  // Reads the runtime config and restores the session. Called once on boot.
  init: () => Promise<void>;
  login: (email: string, password: string, rememberMe: boolean) => Promise<void>;
  logout: () => Promise<void>;
  changePassword: (current: string, next: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  authRequired: true,
  loading: true,

  init: async () => {
    const [cfg, me] = await Promise.all([fetchConfig(), authService.fetchMe()]);
    set({
      authRequired: cfg.success ? cfg.data.authRequired : true,
      user: me.success ? me.data.user : null,
      loading: false,
    });
  },

  login: async (email, password, rememberMe) => {
    const r = await authService.login(email, password, rememberMe);
    if (!r.success) throw new ApiError(r.error, r.code);
    set({ user: r.data.user });
  },

  logout: async () => {
    await authService.logout();
    set({ user: null });
  },

  changePassword: async (current, next) => {
    const r = await authService.changePassword(current, next);
    if (!r.success) throw new ApiError(r.error, r.code);
    set({ user: r.data.user });
  },
}));

// Convenience hook for components that want the whole auth slice. Components in
// hot render paths can call `useAuthStore(selector)` directly for narrow slices.
export const useAuth = () => useAuthStore();
