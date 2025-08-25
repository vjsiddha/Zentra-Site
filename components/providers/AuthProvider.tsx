// providers/AuthProvider.tsx (or components/providers/AuthProvider.tsx)
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { User } from "firebase/auth";
import { subscribeToAuth } from "@/lib/auth";

type AuthCtx = { user: User | null; loading: boolean };

const Ctx = createContext<AuthCtx>({ user: null, loading: true });

function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeToAuth((u) => {
      setUser(u ?? null);
      setLoading(false);
    });
    return unsub; // safe even if subscribeToAuth returns a no-op
  }, []);

  return <Ctx.Provider value={{ user, loading }}>{children}</Ctx.Provider>;
}

export default AuthProvider;
export { AuthProvider };         // <-- add this
export const useAuth = () => useContext(Ctx);
export type { AuthCtx };
