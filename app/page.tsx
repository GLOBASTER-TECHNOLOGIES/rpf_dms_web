"use client";

import Link from "next/link";
import { Users, AlertTriangle, Lock } from "lucide-react";

export default function Home() {
  const roles = [
    {
      title: "SO's",
      href: "/so/dashboard",
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
      hover: "group-hover:bg-blue-100",
    },
    {
      title: "Duty Officer",
      href: "/duty-officer",
      icon: AlertTriangle,
      color: "text-amber-600",
      bg: "bg-amber-50",
      hover: "group-hover:bg-amber-100",
    },
    {
      title: "System Admin",
      href: "/admin",
      icon: Lock,
      color: "text-indigo-700",
      bg: "bg-indigo-50",
      hover: "group-hover:bg-indigo-100",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-6">

      {/* Title */}
      <h1 className="text-2xl font-bold text-slate-800 mb-10">
        RPF DMS Portal
      </h1>

      {/* Tiles */}
      <div className="flex flex-col sm:grid sm:grid-cols-3 gap-6 max-w-xl w-28">
        {roles.map((role) => {
          const Icon = role.icon;

          return (
            <Link
              key={role.href}
              href={role.href}
              className="group bg-white rounded-xl border border-slate-200 p-6 flex flex-col items-center justify-center text-center hover:shadow-md transition"
            >
              {/* Icon */}
              <div
                className={`w-12 h-12 rounded-lg flex items-center justify-center mb-3 ${role.bg} ${role.hover} transition`}
              >
                <Icon className={`w-5 h-5 ${role.color}`} />
              </div>

              {/* Title */}
              <span className="text-sm font-semibold text-slate-700">
                {role.title}
              </span>
            </Link>
          );
        })}
      </div>

    </div>
  );
}