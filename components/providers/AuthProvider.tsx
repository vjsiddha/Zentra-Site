"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { User } from "firebase/auth";
import { subscribeToAuth } from "@/lib/auth";

type AuthCtx = { user: User | null; loading: boolean };
const Ctx = createContext<AuthCtx>({ user: null, loading: true });

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeToAuth(u => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  return <Ctx.Provider value={{ user, loading }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
