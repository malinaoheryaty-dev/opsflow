"use client";
// SAVE AS: components/ui/MobileNav.tsx

import { usePathname } from "next/navigation";
import { KuromiIcon, NAV_ICONS } from "@/components/ui/KuromiIcons";

const K = {
  bg:      "#0d0b14",
  surface: "#161224",
  border:  "rgba(160,100,255,0.15)",
  pink:    "#ff6eb4",
  purple:  "#9b5de5",
  purple2: "#c084fc",
  muted:   "rgba(224,210,255,0.35)",
};

const MOBILE_NAV = [
  { href: "/",        label: "Home"    },
  { href: "/tasks",   label: "Tasks"   },
  { href: "/notes",   label: "Notes"   },
  { href: "/discord", label: "Discord" },
  { href: "/reports", label: "Reports" },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="mobile-nav"
      style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        height: 70, zIndex: 150,
        background: K.surface,
        borderTop: `1px solid ${K.border}`,
        display: "flex", alignItems: "center", justifyContent: "space-around",
        padding: "0 8px 8px",
        backdropFilter: "blur(20px)",
      }}
    >
      {MOBILE_NAV.map(item => {
        const active = pathname === item.href;
        return (
          <a
            key={item.href}
            href={item.href}
            style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              gap: 4, padding: "8px 16px", borderRadius: 12,
              textDecoration: "none",
              background: active ? "rgba(155,93,229,0.15)" : "transparent",
              transition: "all 0.2s ease",
            }}
          >
            <KuromiIcon
              name={NAV_ICONS[item.href]}
              size={20}
              color={active ? K.purple2 : K.muted}
            />
            <span style={{
              fontSize: 10, fontWeight: active ? 700 : 400,
              color: active ? K.purple2 : K.muted,
              transition: "color 0.2s",
            }}>
              {item.label}
            </span>
          </a>
        );
      })}
    </nav>
  );
}