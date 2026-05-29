"use client";
// SAVE AS: components/calendar/CalendarWidget.tsx
// Then replace <MiniCalendar /> in page.tsx with <CalendarWidget />
// and add: import CalendarWidget from "@/components/calendar/CalendarWidget";

import { useState, useEffect, useRef } from "react";

const K = {
  surface:  "#161224",
  surface2: "#1e1830",
  surface3: "#251f3a",
  border:   "rgba(160,100,255,0.15)",
  pink:     "#ff6eb4",
  purple:   "#9b5de5",
  purple2:  "#c084fc",
  white:    "#f5f0ff",
  muted:    "rgba(224,210,255,0.4)",
  red:      "#f87171",
  green:    "#4ade80",
  yellow:   "#fbbf24",
};

interface CalEvent {
  id: string;
  title: string;
  description: string;
  location: string;
  start: string;
  end: string;
  allDay: boolean;
  meetLink: string;
  attendees: string[];
  htmlLink: string;
}

function formatEventTime(start: string, end: string, allDay: boolean) {
  if (allDay) return "All day";
  const s = new Date(start);
  const e = new Date(end);
  const fmt = (d: Date) => d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  return `${fmt(s)} – ${fmt(e)}`;
}

function formatEventDay(start: string, allDay: boolean) {
  const d = allDay ? new Date(start + "T00:00:00") : new Date(start);
  const today = new Date();
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === tomorrow.toDateString()) return "Tomorrow";
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

const EVENT_COLORS = [K.purple, K.pink, K.purple2, K.yellow, K.green];

// ─── Event Detail Panel ───────────────────────────────────────
function EventPanel({ event, onClose }: { event: CalEvent; onClose: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <>
      <style>{`@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 999 }} />
      <div ref={panelRef} style={{
        position: "fixed", top: 0, right: 0, width: 400, height: "100vh",
        background: "#120f1e", borderLeft: `1px solid ${K.border}`,
        zIndex: 1000, display: "flex", flexDirection: "column",
        boxShadow: "-12px 0 48px rgba(0,0,0,0.6)",
        animation: "slideIn 0.22s cubic-bezier(0.16,1,0.3,1)",
      }}>
        {/* Header */}
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${K.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: K.purple2 }}>📅 Event Details</span>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: K.muted, fontSize: 20, cursor: "pointer" }}>×</button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: K.white, margin: 0 }}>{event.title}</h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: "14px", background: "rgba(255,255,255,0.03)", borderRadius: 12, border: `1px solid ${K.border}` }}>
            <DetailRow icon="🗓" label={formatEventDay(event.start, event.allDay)} />
            <DetailRow icon="⏰" label={formatEventTime(event.start, event.end, event.allDay)} />
            {event.location && <DetailRow icon="📍" label={event.location} />}
            {event.attendees.length > 0 && (
              <DetailRow icon="👥" label={event.attendees.slice(0, 3).join(", ") + (event.attendees.length > 3 ? ` +${event.attendees.length - 3} more` : "")} />
            )}
          </div>

          {event.description && (
            <div>
              <p style={{ fontSize: 11, color: K.muted, margin: "0 0 6px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Description</p>
              <p style={{ fontSize: 13, color: "rgba(224,210,255,0.7)", lineHeight: 1.7, margin: 0, whiteSpace: "pre-wrap" }}>{event.description}</p>
            </div>
          )}

          <div style={{ display: "flex", gap: 8, marginTop: "auto" }}>
            {event.meetLink && (
              <a href={event.meetLink} target="_blank" rel="noopener noreferrer"
                style={{ flex: 1, padding: "10px", borderRadius: 10, background: "linear-gradient(135deg, #9b5de5, #ff6eb4)", color: "#fff", fontSize: 13, fontWeight: 700, textDecoration: "none", textAlign: "center" }}>
                Join Meet 🎥
              </a>
            )}
            {event.htmlLink && (
              <a href={event.htmlLink} target="_blank" rel="noopener noreferrer"
                style={{ flex: 1, padding: "10px", borderRadius: 10, background: "rgba(255,255,255,0.06)", border: `1px solid ${K.border}`, color: K.muted, fontSize: 13, fontWeight: 600, textDecoration: "none", textAlign: "center" }}>
                Open in Calendar →
              </a>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function DetailRow({ icon, label }: { icon: string; label: string }) {
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
      <span style={{ fontSize: 14, flexShrink: 0 }}>{icon}</span>
      <span style={{ fontSize: 13, color: K.white, lineHeight: 1.5 }}>{label}</span>
    </div>
  );
}

// ─── Add Event Panel ──────────────────────────────────────────
function AddEventPanel({ onClose, onAdded }: { onClose: () => void; onAdded: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const handleSave = async () => {
    if (!title.trim()) { setError("Title is required"); return; }
    setSaving(true);
    setError("");
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const start = `${date}T${startTime}:00`;
      const end = `${date}T${endTime}:00`;
      const res = await fetch("/api/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, location, start, end, allDay: false }),
      });
      const data = await res.json();
      if (data.success) {
        onAdded();
        onClose();
      } else {
        setError(data.error ?? "Failed to create event");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const inp: React.CSSProperties = {
    background: "rgba(255,255,255,0.04)", border: "1px solid rgba(160,100,255,0.2)",
    borderRadius: 10, padding: "9px 12px", color: "#f5f0ff", fontSize: 13,
    outline: "none", width: "100%", boxSizing: "border-box",
  };

  return (
    <>
      <style>{`@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 999 }} />
      <div ref={panelRef} style={{
        position: "fixed", top: 0, right: 0, width: 380, height: "100vh",
        background: "#120f1e", borderLeft: `1px solid ${K.border}`,
        zIndex: 1000, display: "flex", flexDirection: "column",
        boxShadow: "-12px 0 48px rgba(0,0,0,0.6)",
        animation: "slideIn 0.22s cubic-bezier(0.16,1,0.3,1)",
      }}>
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${K.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: K.purple2 }}>➕ New Event</span>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: K.muted, fontSize: 20, cursor: "pointer" }}>×</button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <label style={{ fontSize: 11, color: K.muted, display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.06em" }}>Title *</label>
            <input placeholder="Event title" value={title} onChange={e => setTitle(e.target.value)} style={inp} autoFocus />
          </div>
          <div>
            <label style={{ fontSize: 11, color: K.muted, display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.06em" }}>Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ ...inp, colorScheme: "dark" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <label style={{ fontSize: 11, color: K.muted, display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.06em" }}>Start</label>
              <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} style={{ ...inp, colorScheme: "dark" }} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: K.muted, display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.06em" }}>End</label>
              <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} style={{ ...inp, colorScheme: "dark" }} />
            </div>
          </div>
          <div>
            <label style={{ fontSize: 11, color: K.muted, display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.06em" }}>Location</label>
            <input placeholder="Optional" value={location} onChange={e => setLocation(e.target.value)} style={inp} />
          </div>
          <div>
            <label style={{ fontSize: 11, color: K.muted, display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.06em" }}>Description</label>
            <textarea placeholder="Optional" value={description} onChange={e => setDescription(e.target.value)} rows={3} style={{ ...inp, resize: "vertical", fontFamily: "'DM Sans', sans-serif" }} />
          </div>

          {error && <p style={{ color: K.red, fontSize: 12, margin: 0 }}>{error}</p>}

          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              background: saving ? "rgba(155,93,229,0.3)" : "linear-gradient(135deg, #9b5de5, #ff6eb4)",
              border: "none", borderRadius: 10, padding: "11px", color: "#fff",
              fontSize: 13, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer",
              opacity: saving ? 0.7 : 1, marginTop: 4,
            }}
          >
            {saving ? "Saving..." : "Add to Calendar →"}
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Main CalendarWidget ──────────────────────────────────────
export default function CalendarWidget() {
  const [events, setEvents] = useState<CalEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<CalEvent | null>(null);
  const [showAddPanel, setShowAddPanel] = useState(false);

  // Mini calendar state
  const now = new Date();
  const [calYear] = useState(now.getFullYear());
  const [calMonth] = useState(now.getMonth());
  const today = now.getDate();
  const monthName = now.toLocaleString("default", { month: "long" });
  const firstDay = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const calDays: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (calDays.length % 7 !== 0) calDays.push(null);

  const loadEvents = () => {
    setLoading(true);
    fetch("/api/calendar")
      .then(r => r.json())
      .then(data => {
        if (data.error === "Calendar not connected") {
          setConnected(false);
        } else if (data.events) {
          setEvents(data.events);
          setConnected(true);
        } else if (data.error) {
          setError(data.error);
        }
      })
      .catch(() => setError("Failed to load calendar"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadEvents(); }, []);

  // Days that have events this month
  const eventDays = new Set(
    events.map(e => {
      const d = e.allDay ? new Date(e.start + "T00:00:00") : new Date(e.start);
      if (d.getMonth() === calMonth && d.getFullYear() === calYear) return d.getDate();
      return null;
    }).filter(Boolean)
  );

  // Today's and upcoming events (next 3)
  const todayEvents = events.filter(e => {
    const d = e.allDay ? new Date(e.start + "T00:00:00") : new Date(e.start);
    return d.toDateString() === now.toDateString();
  });

  const upcomingEvents = events
    .filter(e => {
      const d = e.allDay ? new Date(e.start + "T00:00:00") : new Date(e.start);
      return d.toDateString() !== now.toDateString();
    })
    .slice(0, 3);

  const displayEvents = [...todayEvents, ...upcomingEvents].slice(0, 5);

  return (
    <>
      {/* ── Mini calendar grid ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 20 }}>🖤</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: K.white }}>{monthName} {calYear}</span>
        </div>
        <button
          onClick={() => setShowAddPanel(true)}
          style={{ background: "rgba(155,93,229,0.15)", border: "1px solid rgba(155,93,229,0.3)", borderRadius: 8, padding: "4px 10px", color: K.purple2, fontSize: 11.5, fontWeight: 600, cursor: "pointer" }}
        >
          + Add
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: 6 }}>
        {["SUN","MON","TUE","WED","THU","FRI","SAT"].map((d, i) => (
          <div key={i} style={{ textAlign: "center", fontSize: 9, color: K.muted, fontWeight: 700, letterSpacing: "0.05em", paddingBottom: 6 }}>{d}</div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "2px 0", marginBottom: 16 }}>
        {calDays.map((d, i) => {
          const isToday = d === today;
          const hasEvent = d !== null && eventDays.has(d);
          return (
            <div key={i} style={{ position: "relative", textAlign: "center", fontSize: 12, padding: "5px 2px", borderRadius: 8, background: isToday ? `linear-gradient(135deg, ${K.purple}, ${K.pink})` : "transparent", color: isToday ? "#fff" : d ? K.white : "transparent", fontWeight: isToday ? 800 : 400 }}>
              {d ?? ""}
              {hasEvent && !isToday && (
                <div style={{ position: "absolute", bottom: 2, left: "50%", transform: "translateX(-50%)", width: 4, height: 4, borderRadius: "50%", background: K.pink }} />
              )}
            </div>
          );
        })}
      </div>

      {/* ── Events list ── */}
      {loading && (
        <div style={{ color: K.muted, fontSize: 12, paddingTop: 4 }}>Loading events...</div>
      )}

      {!loading && !connected && (
        <div style={{ fontSize: 12, color: K.muted, textAlign: "center", padding: "8px 0" }}>
          Calendar not connected. Sign in with Google to see events.
        </div>
      )}

      {!loading && connected && !error && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {displayEvents.length === 0 && (
            <div style={{ fontSize: 12, color: K.muted, textAlign: "center", padding: "8px 0" }}>No upcoming events 🎉</div>
          )}
          {displayEvents.map((evt, i) => (
            <div
              key={evt.id}
              onClick={() => setSelectedEvent(evt)}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "8px 10px", borderRadius: 9,
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.05)",
                cursor: "pointer", transition: "background 0.15s, border-color 0.15s",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.background = "rgba(155,93,229,0.08)";
                (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(155,93,229,0.2)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.03)";
                (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.05)";
              }}
            >
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: EVENT_COLORS[i % EVENT_COLORS.length], flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, color: K.white, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{evt.title}</div>
                <div style={{ fontSize: 11, color: K.muted }}>{formatEventDay(evt.start, evt.allDay)} · {formatEventTime(evt.start, evt.end, evt.allDay)}</div>
              </div>
              {evt.meetLink && <span style={{ fontSize: 13 }}>🎥</span>}
            </div>
          ))}
        </div>
      )}

      {/* Panels */}
      {selectedEvent && <EventPanel event={selectedEvent} onClose={() => setSelectedEvent(null)} />}
      {showAddPanel && <AddEventPanel onClose={() => setShowAddPanel(false)} onAdded={loadEvents} />}
    </>
  );
}