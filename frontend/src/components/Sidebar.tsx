"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, Heart, LayoutDashboard } from "lucide-react";

const links = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/activities", label: "Activities", icon: Activity },
  { href: "/health", label: "Health", icon: Heart },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[220px] shrink-0 bg-slate-800 border-r border-slate-700 flex flex-col p-4 gap-1">
      <div className="px-2 py-4 mb-2">
        <h1 className="text-lg font-bold text-white tracking-tight">
          🏃 Garmin
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">Personal Dashboard</p>
      </div>

      {links.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              active
                ? "bg-blue-600 text-white"
                : "text-slate-300 hover:bg-slate-700 hover:text-white"
            }`}
          >
            <Icon size={18} />
            {label}
          </Link>
        );
      })}
    </aside>
  );
}
