"use client";

// SAVE AS: components/Sidebar.tsx
// Kuromi-inspired OpsFlow sidebar with custom icon support.

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { KuromiIcon, NAV_ICONS } from "@/components/ui/KuromiIcons";

const navItems = [
  { href: "/", label: "Dashboard", icon: "dashboard" },
  { href: "/tasks", label: "Tasks", icon: "tasks" },
  { href: "/projects", label: "Projects", icon: "reports" },
  { href: "/clients", label: "Clients", icon: "team" },
  { href: "/calendar", label: "Calendar", icon: "calendar" },
  { href: "/inbox", label: "Inbox", icon: "gmail" },
  { href: "/documents", label: "Documents", icon: "notes" },
  { href: "/finance", label: "Finance", icon: "star" },
  { href: "/team", label: "Team", icon: "team" },
  { href: "/notes", label: "Notes", icon: "notes" },
  { href: "/ai", label: "AI Assistant", icon: "ai" },
  { href: "/settings", label: "Settings", icon: "settings" },
] as const;

const integrations = [
  { label: "Gmail", icon: "gmail" },
  { label: "Calendar", icon: "calendar" },
  { label: "Discord", icon: "discord" },
] as const;

function Icon({
  name,
  active = false,
}: {
  name: string;
  active?: boolean;
}) {
  return (
    <KuromiIcon
      name={name as keyof typeof NAV_ICONS}
      size={18}
      color={active ? "#ffd1ea" : "rgba(224,170,255,0.52)"}
    />
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        title={isOpen ? "Hide sidebar" : "Show sidebar"}
        aria-label={isOpen ? "Hide sidebar" : "Show sidebar"}
        className="ops-toggle"
        style={{
          left: isOpen ? 236 : 12,
        }}
      >
        {isOpen ? "◀" : "▶"}
      </button>

      <aside
        className="ops-sidebar"
        style={{
          width: isOpen ? 244 : 0,
        }}
      >
        <div className="ops-sidebar-inner">
          <div className="ops-logo-card">
            <div className="ops-logo-mark">
              <KuromiIcon name="skull" size={24} color="#f5f0ff" />
            </div>

            <div>
              <div className="ops-logo-title">OpsFlow</div>
              <div className="ops-logo-subtitle">KUROMI MODE</div>
            </div>
          </div>

          <div className="ops-section-label">Workspace</div>

          <nav className="ops-nav">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`ops-nav-item ${isActive ? "active" : ""}`}
                >
                  <span className="ops-nav-icon">
                    <Icon name={item.icon} active={isActive} />
                  </span>

                  <span className="ops-nav-text">{item.label}</span>

                  {["/tasks", "/notes", "/team"].includes(item.href) && (
                    <span className="ops-nav-plus">+</span>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="ops-divider" />

          <div className="ops-section-label">Integrations</div>

          <div className="ops-integration-list">
            {integrations.map((item) => (
              <button key={item.label} className="ops-integration-item">
                <span className="ops-nav-icon">
                  <Icon name={item.icon} />
                </span>
                <span>{item.label}</span>
                <span className="ops-online-dot" />
              </button>
            ))}
          </div>

          <div className="ops-sidebar-footer">
            <div className="ops-ai-card">
              <div className="ops-ai-icon">
                <KuromiIcon name="sparkle" size={18} color="#fff" />
              </div>
              <div>
                <div className="ops-ai-title">Kuromi AI</div>
                <div className="ops-ai-subtitle">Ready to help</div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
