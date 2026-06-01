"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navItems = [
  { href: "/", label: "Dashboard", icon: "⚡" },
  { href: "/tasks", label: "Tasks", icon: "✅" },
  { href: "/notes", label: "Notes", icon: "📝" },
  { href: "/discord", label: "Discord", icon: "🎮" },
  { href: "/team", label: "Team", icon: "👥" },
  { href: "/reports", label: "Reports", icon: "📊" },
  { href: "/settings", label: "Settings", icon: "⚙️" },
];

const integrations = [
  { label: "Gmail", icon: "📧" },
  { label: "Calendar", icon: "📅" },
  { label: "Discord", icon: "🎮" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);

  return (
    <>
      {/* Toggle button — always visible */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        title={isOpen ? "Hide sidebar" : "Show sidebar"}
        aria-label={isOpen ? "Hide sidebar" : "Show sidebar"}
        className={`fixed top-4 z-50 flex items-center justify-center w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all duration-300 text-xs ${
          isOpen ? "left-[228px]" : "left-3"
        }`}
        style={{ transition: "left 300ms ease" }}
      >
        {isOpen ? "◀" : "▶"}
      </button>

      {/* Sidebar */}
      <aside
        className={`flex-shrink-0 h-screen flex flex-col bg-gray-950 border-r border-white/10 transition-all duration-300 overflow-hidden ${
          isOpen ? "w-56" : "w-0"
        }`}
      >
        <div className="flex flex-col h-full min-w-[224px]">
          {/* Logo */}
          <div className="p-5 flex items-center gap-2 border-b border-white/5">
            <span className="text-cyan-400 text-lg">⚡</span>
            <span className="text-white font-bold text-base tracking-tight">
              OpsFlow
            </span>
          </div>

          {/* Nav */}
          <nav className="flex-1 p-3 overflow-y-auto">
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider px-2 mb-2">
              Workspace
            </p>
            <ul className="space-y-0.5">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                        isActive
                          ? "bg-white/10 text-white font-medium"
                          : "text-gray-400 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <span className="text-base leading-none">
                        {item.icon}
                      </span>
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>

            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider px-2 mt-5 mb-2">
              Integrations
            </p>
            <ul className="space-y-0.5">
              {integrations.map((i) => (
                <li key={i.label}>
                  <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors text-left">
                    <span className="text-base leading-none">{i.icon}</span>
                    {i.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </aside>
    </>
  );
}
