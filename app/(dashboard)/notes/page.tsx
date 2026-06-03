"use client";

import { useState } from "react";

const notes = [
  {
    title: "Daily Brain Dump",
    tag: "Personal",
    text: "Capture quick thoughts, reminders, and ideas for today.",
  },
  {
    title: "Client Notes",
    tag: "Work",
    text: "Meeting notes, action items, and follow-ups.",
  },
  {
    title: "Ideas Vault",
    tag: "Creative",
    text: "Random ideas for OpsFlow, content, automations, and projects.",
  },
];

export default function NotesPage() {
  const [selected, setSelected] = useState(notes[0]);

  return (
    <main className="kuromi-page">
      <header className="kuromi-topbar">
        <div>
          <div className="panel-eyebrow">OpsFlow Notes</div>
          <h1>
            Notes <span>Vault</span> ♡
          </h1>
          <p>Organize thoughts, work notes, ideas, and daily brain dumps.</p>
        </div>

        <div className="topbar-actions">
          <div className="search-pill">⌕ Search notes...</div>
          <button className="icon-btn">✦</button>
          <button className="icon-btn">+</button>
        </div>
      </header>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "320px 1fr",
          gap: 16,
        }}
      >
        <div className="kuromi-card" style={{ padding: 20 }}>
          <div className="panel-title-row">
            <span>My Notes</span>
            <span>♡</span>
          </div>

          <div style={{ display: "grid", gap: 10 }}>
            {notes.map((note) => (
              <button
                key={note.title}
                onClick={() => setSelected(note)}
                style={{
                  textAlign: "left",
                  padding: 14,
                  borderRadius: 18,
                  border:
                    selected.title === note.title
                      ? "1px solid rgba(255,110,180,.4)"
                      : "1px solid rgba(224,170,255,.12)",
                  background:
                    selected.title === note.title
                      ? "rgba(255,110,180,.12)"
                      : "rgba(255,255,255,.035)",
                  color: "#f8f1ff",
                  cursor: "pointer",
                }}
              >
                <div style={{ fontWeight: 800, marginBottom: 4 }}>
                  {note.title}
                </div>
                <div style={{ fontSize: 12, color: "rgba(235,220,255,.52)" }}>
                  {note.tag}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="kuromi-card" style={{ padding: 24, minHeight: 560 }}>
          <div className="panel-title-row">
            <span>{selected.title}</span>
            <span>{selected.tag}</span>
          </div>

          <textarea
            defaultValue={selected.text}
            style={{
              width: "100%",
              minHeight: 420,
              resize: "vertical",
              border: "1px solid rgba(224,170,255,.14)",
              borderRadius: 22,
              background: "rgba(255,255,255,.035)",
              color: "#f8f1ff",
              padding: 18,
              lineHeight: 1.7,
              outline: "none",
            }}
          />

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}>
            <button
              style={{
                border: "none",
                borderRadius: 16,
                padding: "11px 18px",
                color: "#fff",
                fontWeight: 800,
                background: "linear-gradient(135deg, #9b5de5, #ff6eb4)",
                cursor: "pointer",
              }}
            >
              Save Note
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}