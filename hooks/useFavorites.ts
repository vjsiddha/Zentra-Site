"use client";

import { useEffect, useState } from "react";
import { listenToFavorites } from "@/lib/favorites";

export function useFavorites(uid?: string | null) {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) {
      setFavoriteIds([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsub = listenToFavorites(uid, (ids) => {
      setFavoriteIds(ids);
      setLoading(false);
    });

    return () => unsub();
  }, [uid]);

  return { favoriteIds, loading };
}