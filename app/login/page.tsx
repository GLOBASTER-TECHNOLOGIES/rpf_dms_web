"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/app/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(identifier, password);
      // router.push is handled inside AuthContext.login()
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">

        <div className="flex flex-col items-center mb-8">
          <Image
            src="/rpf_logo.png"
            alt="RPF Logo"
            width={120}
            height={120}
            className="mb-4 object-contain"
            priority
          />
          <h2 className="text-2xl font-bold text-gray-800">RAMS Login</h2>
          <p className="text-sm text-gray-500 mt-1">Officer / Post Authentication</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded text-sm text-center">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="identifier" className="block text-sm font-medium text-gray-700 mb-1">
              Force Number / Post Code
            </label>
            <input
              id="identifier"
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              className="w-full px-4 py-2 border text-black border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              placeholder="Enter Force Number or Post Code"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 pr-10 border text-black border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 text-white font-semibold rounded-md transition-colors ${loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
              }`}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

        </form>
      </div>
    </div>
  );
}