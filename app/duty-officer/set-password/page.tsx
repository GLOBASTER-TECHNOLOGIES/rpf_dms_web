"use client";

import React, { useState } from "react";
import axios from "axios";
import { Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const SetPasswordPage = () => {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      const officerId = localStorage.getItem("officerId");

      await axios.put("/api/officer/update", {
        id: officerId,
        newPassword: password,
      });

      toast.success("Password set successfully");

      router.push("/dashboard");

    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to set password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">

      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-10">

        <h1 className="text-2xl font-bold text-black text-center">
          Set Your Password
        </h1>

        <p className="text-sm text-slate-600 text-center mt-2">
          You must set a new password before continuing
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />

            <input
              type={show ? "text" : "password"}
              placeholder="New Password"
              className="w-full pl-10 pr-10 py-3 border border-slate-300 rounded-xl text-black placeholder:text-slate-400 focus:ring-2 focus:ring-slate-900 focus:outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button
              type="button"
              onClick={() => setShow(!show)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
            >
              {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />

            <input
              type={show ? "text" : "password"}
              placeholder="Confirm Password"
              className="w-full pl-10 py-3 border border-slate-300 rounded-xl text-black placeholder:text-slate-400 focus:ring-2 focus:ring-slate-900 focus:outline-none"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-slate-800 transition"
          >
            {loading && <Loader2 className="animate-spin" size={18} />}
            {loading ? "Setting Password..." : "Set Password"}
          </button>

        </form>

      </div>

    </div>
  );
};

export default SetPasswordPage;