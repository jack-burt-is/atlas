import { useState, useEffect, useCallback } from "react";
import type { User } from "@atlas/shared";
import { fetchMe, logout as apiLogout } from "../api/auth";
import { getSessionToken, clearSessionToken } from "../api/auth-store";

interface AuthState {
  user: User | null;
  loading: boolean;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({ user: null, loading: true });

  const refresh = useCallback(async () => {
    const token = await getSessionToken();
    if (!token) {
      setState({ user: null, loading: false });
      return;
    }
    try {
      const { user } = await fetchMe();
      setState({ user, loading: false });
    } catch {
      await clearSessionToken();
      setState({ user: null, loading: false });
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const logout = useCallback(async () => {
    await apiLogout();
    setState({ user: null, loading: false });
  }, []);

  const setUser = useCallback((user: User) => {
    setState({ user, loading: false });
  }, []);

  return { ...state, logout, setUser, refresh };
}
