import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { currentUser, logout as dbLogout, isAdmin } from "../data/db";
import type { DemoUser } from "../data/db";

interface AuthValue {
  user: DemoUser | null;
  admin: boolean;
  ready: boolean;
  refresh: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthValue>({
  user: null, admin: false, ready: false, refresh: () => {}, logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<DemoUser | null>(null);
  const [admin, setAdmin] = useState(false);
  const [ready, setReady] = useState(false);

  const refresh = () => {
    currentUser().then(setUser);
    isAdmin().then(setAdmin);
  };

  useEffect(() => {
    Promise.all([currentUser(), isAdmin()]).then(([u, a]) => {
      setUser(u);
      setAdmin(a);
      setReady(true);
    });
  }, []);

  const logout = () => {
    dbLogout().then(() => {
      setUser(null);
      setAdmin(false);
    });
  };

  return <AuthContext.Provider value={{ user, admin, ready, refresh, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
