"use client";
// SAVE AS: components/ui/KuromiIcons.tsx
// Custom SVG icons styled in Kuromi palette
// Usage: <KuromiIcon name="dashboard" size={20} />

const K = {
  pink:    "#ff6eb4",
  purple:  "#9b5de5",
  purple2: "#c084fc",
  lavender:"#e0aaff",
  white:   "#f5f0ff",
  dark:    "#0d0b14",
};

type IconName =
  | "dashboard" | "tasks" | "notes" | "discord"
  | "team" | "reports" | "settings" | "gmail"
  | "calendar" | "ai" | "star" | "plus"
  | "check" | "skull" | "heart" | "bow"
  | "sparkle" | "moon" | "signout" | "search";

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  style?: React.CSSProperties;
}

const icons: Record<IconName, (color: string, size: number) => JSX.Element> = {

  // Dashboard — cute grid with bow
  dashboard: (c, s) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="7" height="7" rx="2" fill={c} opacity="0.9"/>
      <rect x="14" y="3" width="7" height="7" rx="2" fill={c} opacity="0.6"/>
      <rect x="3" y="14" width="7" height="7" rx="2" fill={c} opacity="0.6"/>
      <rect x="14" y="14" width="7" height="7" rx="2" fill={c} opacity="0.9"/>
      {/* Tiny bow on top-right square */}
      <circle cx="17.5" cy="6.5" r="1" fill={K.pink} opacity="0.8"/>
    </svg>
  ),

  // Tasks — checklist with star
  tasks: (c, s) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <rect x="4" y="3" width="16" height="18" rx="3" stroke={c} strokeWidth="1.5" fill="none"/>
      <path d="M8 8.5l1.5 1.5 3-3" stroke={K.pink} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="15" y1="9" x2="17" y2="9" stroke={c} strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
      <path d="M8 13.5l1.5 1.5 3-3" stroke={K.pink} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.6"/>
      <line x1="15" y1="14" x2="17" y2="14" stroke={c} strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
      <line x1="8" y1="19" x2="16" y2="19" stroke={c} strokeWidth="1.5" strokeLinecap="round" opacity="0.3"/>
    </svg>
  ),

  // Notes — notebook with heart
  notes: (c, s) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <rect x="5" y="3" width="14" height="18" rx="2" stroke={c} strokeWidth="1.5" fill="none"/>
      <line x1="9" y1="3" x2="9" y2="21" stroke={c} strokeWidth="1.5" opacity="0.4"/>
      <line x1="12" y1="8" x2="17" y2="8" stroke={c} strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>
      <line x1="12" y1="12" x2="17" y2="12" stroke={c} strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
      <path d="M12 15.5c0-1 1.5-2 1.5 0s-1.5 2.5-1.5 2.5-1.5-1.5-1.5-2.5 1.5-1 1.5 0z" fill={K.pink} opacity="0.8"/>
    </svg>
  ),

  // Discord — speech bubble with star
  discord: (c, s) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M20.317 4.492c-1.53-.69-3.17-1.2-4.885-1.49a.075.075 0 0 0-.079.036c-.21.369-.444.85-.608 1.23a18.566 18.566 0 0 0-5.487 0 12.36 12.36 0 0 0-.617-1.23A.077.077 0 0 0 8.562 3c-1.714.29-3.354.8-4.885 1.491a.07.07 0 0 0-.032.027C.533 9.093-.32 13.555.099 17.961a.08.08 0 0 0 .031.055 20.03 20.03 0 0 0 5.993 2.98.078.078 0 0 0 .084-.026c.462-.62.874-1.275 1.226-1.963.021-.04.001-.088-.041-.104a13.201 13.201 0 0 1-1.872-.878.075.075 0 0 1-.008-.125c.126-.093.252-.19.372-.287a.075.075 0 0 1 .078-.01c3.927 1.764 8.18 1.764 12.061 0a.075.075 0 0 1 .079.009c.12.098.245.195.372.288a.075.075 0 0 1-.006.125c-.598.344-1.22.635-1.873.877a.075.075 0 0 0-.041.105c.36.687.772 1.341 1.225 1.962a.077.077 0 0 0 .084.028 19.963 19.963 0 0 0 6.002-2.981.076.076 0 0 0 .032-.054c.5-5.094-.838-9.52-3.549-13.442a.06.06 0 0 0-.031-.028z" fill={c} opacity="0.85"/>
    </svg>
  ),

  // Team — two people with bow
  team: (c, s) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <circle cx="9" cy="7" r="3" stroke={c} strokeWidth="1.5" fill="none"/>
      <path d="M3 21c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke={c} strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      <circle cx="17" cy="8" r="2.5" stroke={K.pink} strokeWidth="1.5" fill="none" opacity="0.8"/>
      <path d="M14 21c0-2.761 1.343-5 3-5s3 2.239 3 5" stroke={K.pink} strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.8"/>
    </svg>
  ),

  // Reports — bar chart with sparkle
  reports: (c, s) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="14" width="4" height="7" rx="1" fill={c} opacity="0.5"/>
      <rect x="10" y="9" width="4" height="12" rx="1" fill={c} opacity="0.7"/>
      <rect x="17" y="5" width="4" height="16" rx="1" fill={c} opacity="0.9"/>
      <path d="M19 3l.5 1 1 .5-1 .5-.5 1-.5-1-1-.5 1-.5z" fill={K.pink} opacity="0.9"/>
    </svg>
  ),

  // Settings — gear with heart center
  settings: (c, s) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" stroke={c} strokeWidth="1.5" fill="none"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" stroke={c} strokeWidth="1.5" fill="none" opacity="0.7"/>
    </svg>
  ),

  // Gmail — envelope with bow
  gmail: (c, s) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <rect x="2" y="5" width="20" height="14" rx="2" stroke={c} strokeWidth="1.5" fill="none"/>
      <path d="M2 7l10 7 10-7" stroke={c} strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      <path d="M11 12c.5-.8 2-.8 2 0" stroke={K.pink} strokeWidth="1.5" strokeLinecap="round" opacity="0.8"/>
    </svg>
  ),

  // Calendar — with heart on today
  calendar: (c, s) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="4" width="18" height="17" rx="2" stroke={c} strokeWidth="1.5" fill="none"/>
      <line x1="3" y1="9" x2="21" y2="9" stroke={c} strokeWidth="1.5" opacity="0.6"/>
      <line x1="8" y1="2" x2="8" y2="6" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="16" y1="2" x2="16" y2="6" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M12 14.5c0-.8 1.2-1.6 1.2 0S12 16.5 12 16.5s-1.2-1.2-1.2-2 1.2-.8 1.2 0z" fill={K.pink} opacity="0.9"/>
    </svg>
  ),

  // AI — magic wand with sparkles
  ai: (c, s) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M15 4l5 5-9 9-5-5z" stroke={c} strokeWidth="1.5" fill="none" strokeLinejoin="round"/>
      <line x1="4" y1="20" x2="7" y2="17" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M19 2l.5 1.5 1.5.5-1.5.5L19 6l-.5-1.5L17 4l1.5-.5z" fill={K.pink} opacity="0.9"/>
      <path d="M5 8l.4 1 1 .4-1 .4L5 11l-.4-1L3.6 9.6l1-.4z" fill={K.purple2} opacity="0.8"/>
    </svg>
  ),

  // Star — Kuromi bow star
  star: (c, s) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" fill={c} opacity="0.85"/>
    </svg>
  ),

  // Plus — with bow
  plus: (c, s) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke={c} strokeWidth="1.5" fill="none" opacity="0.4"/>
      <line x1="12" y1="8" x2="12" y2="16" stroke={c} strokeWidth="2" strokeLinecap="round"/>
      <line x1="8" y1="12" x2="16" y2="12" stroke={c} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),

  // Check — circle check with pink fill
  check: (c, s) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke={c} strokeWidth="1.5" fill="none"/>
      <path d="M8 12l3 3 5-5" stroke={K.pink} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),

  // Skull — Kuromi signature skull
  skull: (c, s) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M12 3C7.58 3 4 6.58 4 11c0 2.5 1.12 4.73 2.9 6.25V19a1 1 0 001 1h8a1 1 0 001-1v-1.75C18.88 15.73 20 13.5 20 11c0-4.42-3.58-8-8-8z" fill={c} opacity="0.2" stroke={c} strokeWidth="1.5"/>
      <circle cx="9" cy="11" r="1.5" fill={K.dark}/>
      <circle cx="15" cy="11" r="1.5" fill={K.dark}/>
      <path d="M10 16h4" stroke={K.dark} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M11 16v2M13 16v2" stroke={K.dark} strokeWidth="1" strokeLinecap="round"/>
    </svg>
  ),

  // Heart — cute heart
  heart: (c, s) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" fill={c} opacity="0.85"/>
    </svg>
  ),

  // Bow — Kuromi's signature bow
  bow: (c, s) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M12 12c-2-3-7-4-8-1s3 5 8 1z" fill={c} opacity="0.85"/>
      <path d="M12 12c2-3 7-4 8-1s-3 5-8 1z" fill={c} opacity="0.85"/>
      <circle cx="12" cy="12" r="2" fill={K.pink}/>
      <path d="M10 6c0-2 4-2 4 0s-2 4-2 6c0-2-2-4-2-6z" fill={c} opacity="0.5"/>
    </svg>
  ),

  // Sparkle — 4-point star sparkle
  sparkle: (c, s) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M12 2v4M12 18v4M2 12h4M18 12h4" stroke={c} strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
      <path d="M12 2l1 4-1 .5-1-.5z" fill={c}/>
      <path d="M5.64 5.64l2.83 2.83-.71.71-2.83-2.83z" stroke={c} strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
      <path d="M15.54 8.46l2.83-2.82" stroke={c} strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
      <path d="M8.46 15.54l-2.82 2.83" stroke={c} strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
      <path d="M15.54 15.54l2.83 2.83" stroke={c} strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
      <circle cx="12" cy="12" r="2.5" fill={c}/>
    </svg>
  ),

  // Moon — crescent moon
  moon: (c, s) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill={c} opacity="0.85"/>
      <path d="M19 5l.5 1.5 1.5.5-1.5.5L19 9l-.5-1.5L17 7l1.5-.5z" fill={K.pink} opacity="0.8"/>
    </svg>
  ),

  // Sign out arrow
  signout: (c, s) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke={c} strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      <polyline points="16 17 21 12 16 7" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <line x1="21" y1="12" x2="9" y2="12" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),

  // Search — magnifying glass
  search: (c, s) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="11" r="7" stroke={c} strokeWidth="1.5" fill="none"/>
      <line x1="16.5" y1="16.5" x2="22" y2="22" stroke={c} strokeWidth="2" strokeLinecap="round"/>
      <path d="M8 11c0-1.66 1.34-3 3-3" stroke={K.pink} strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>
    </svg>
  ),
};

export function KuromiIcon({ name, size = 20, color = K.purple2, style }: IconProps) {
  const render = icons[name];
  if (!render) return null;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0, ...style }}>
      {render(color, size)}
    </span>
  );
}

// ─── Nav icon map for sidebar ─────────────────────────────────
export const NAV_ICONS: Record<string, IconName> = {
  "/":         "dashboard",
  "/tasks":    "tasks",
  "/notes":    "notes",
  "/discord":  "discord",
  "/team":     "team",
  "/reports":  "reports",
  "/settings": "settings",
};

export default KuromiIcon;
