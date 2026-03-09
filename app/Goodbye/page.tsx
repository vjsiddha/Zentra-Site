"use client";

import { useRouter } from "next/navigation";
import { CheckCircle } from "lucide-react";

export default function GoodbyePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>

        <h1 className="text-3xl font-black text-gray-900 mb-4">
          Account Deleted
        </h1>

        <p className="text-gray-600 mb-8">
          Your account and all associated data have been permanently deleted. 
          Thank you for using Zentra!
        </p>

        <div className="space-y-3">
          <button
            onClick={() => router.push("/")}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition"
          >
            Return to Home
          </button>

          <button
            onClick={() => router.push("/signin")}
            className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition"
          >
            Create New Account
          </button>
        </div>
      </div>
    </div>
  );
}