"use client";

import { signInWithGoogle } from "@/lib/auth";
import PageShell from "@/components/PageShell";
import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SignInPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) router.replace("/"); // go to dashboard
  }, [loading, user, router]);

  return (
    <PageShell>
      <div className="flex items-center justify-center">
        <div className="w-full max-w-sm rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h1 className="mb-4 text-xl font-semibold">Sign in to Zentra</h1>
          <button
            onClick={signInWithGoogle}
            className="w-full rounded-full bg-[#0E5B87] px-5 py-3 text-white font-medium hover:opacity-90 transition"
          >
            Continue with Google
          </button>
        </div>
      </div>
    </PageShell>
  );
}
