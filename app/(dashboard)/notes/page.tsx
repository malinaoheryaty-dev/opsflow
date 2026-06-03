"use client";

import { useMemo, useState } from "react";
import { KuromiIcon } from "@/components/ui/KuromiIcons";

type NoteTag = "All" | "Personal" | "Work" | "Ideas" | "Meeting";

type Note = {
  id: string;
  title: string;
  tag: Exclude<NoteTag, "All">;
  updatedAt: string;
  accent: string;
  body: string;
  checklist: string[];
};

const notes: Note[] = [
  {
    id: "daily-brain-dump",
    title: "Daily Brain Dump",
    tag: "Personal",
    updatedAt: "Today, 9:12 AM",
    accent: "#ff6eb4",
    body:
      "Capture quick thoughts, tiny reminders, and everything that needs a softer place before it becomes a task.",
    checklist: ["Top 3 priorities", "Random reminders", "Mood check"],
  },
  {
    id: "client-follow-ups",
    title: "Client Follow-ups",
    tag: "Work",
    updatedAt: "Today, 8:30 AM",
    accent: "#c084fc",
    body:
      "Notes from client conversations, promised next steps, and the little context details that make follow-up feel personal.",
    checklist: ["Send proposal recap", "Confirm timeline", "Attach reference docs"],
  },
  {
    id: "opsflow-ideas",
    title: "OpsFlow Ideas Vault",
    tag: "Ideas",
    updatedAt: "Yesterday",
    accent: "#fbbf24",
    body:
      "Potential improvements for the dashboard, automations, AI assistant prompts, and future pages.",
    checklist: ["Notes UI polish", "Reports page widgets", "Inbox triage flow"],
  },
  {
    id: "weekly-sync",
    title: "Weekly Sync Notes",
    tag: "Meeting",
    updatedAt: "May 31",
    accent: "#4ade80",
    body:
      "Standing sync notes for decisions, blockers, owners, and the next batch of tasks to pull into the board.",
    checklist: ["Decisions", "Blockers", "Owners"],
  },
];

const tags: NoteTag[] = ["All", "Personal", "Work", "Ideas", "Meeting"];

const templates = [
  { title: "Meeting Notes", meta: "Agenda, decisions, action items" },
  { title: "Project Brief", meta: "Goal, scope, timeline, risks" },
  { title: "Daily Reset", meta: "Focus, errands, reminders" },
];

export default function NotesPage() {
  const [selectedId, setSelectedId] = useState(notes[0].id);
  const [activeTag, setActiveTag] = useState<NoteTag>("All");
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState(notes[0].body);

  const visibleNotes = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return notes.filter((note) => {
      const tagMatch = activeTag === "All" || note.tag === activeTag;
      const queryMatch =
        !normalizedQuery ||
        note.title.toLowerCase().includes(normalizedQuery) ||
        note.body.toLowerCase().includes(normalizedQuery) ||
        note.tag.toLowerCase().includes(normalizedQuery);

      return tagMatch && queryMatch;
    });
  }, [activeTag, query]);

  const selected =
    notes.find((note) => note.id === selectedId) ?? visibleNotes[0] ?? notes[0];

  const selectNote = (note: Note) => {
    setSelectedId(note.id);
    setDraft(note.body);
  };

  return (
    <main className="kuromi-page notes-page">
      <div className="kuromi-bg-orb orb-one" />
      <div className="kuromi-bg-orb orb-two" />
      <div className="kuromi-bg-orb orb-three" />

      <header className="kuromi-topbar">
        <div>
          <div className="panel-eyebrow">OpsFlow Notes</div>
          <h1>
            Notes <span>Vault</span>
          </h1>
          <p>Organize thoughts, work notes, ideas, and daily brain dumps.</p>
        </div>

        <div className="topbar-actions notes-actions">
          <label className="search-pill notes-search">
            <KuromiIcon name="search" size={17} color="rgba(224,170,255,0.58)" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search notes..."
            />
          </label>
          <button className="icon-btn" aria-label="Favorite notes">
            <KuromiIcon name="heart" size={18} color="#ff9ed2" />
          </button>
          <button className="icon-btn" aria-label="New note">
            <KuromiIcon name="plus" size={20} color="#f8f1ff" />
          </button>
        </div>
      </header>

      <section className="notes-stats" aria-label="Notes overview">
        {[
          { label: "Total Notes", value: notes.length, icon: "notes" as const },
          { label: "Pinned Ideas", value: 3, icon: "star" as const },
          { label: "Drafts", value: 2, icon: "moon" as const },
          { label: "Synced", value: "UI", icon: "check" as const },
        ].map((stat) => (
          <article key={stat.label} className="kuromi-card notes-stat-card">
            <div className="notes-stat-icon">
              <KuromiIcon name={stat.icon} size={21} color="#ffd1ea" />
            </div>
            <div>
              <span>{stat.label}</span>
              <strong>{stat.value}</strong>
            </div>
          </article>
        ))}
      </section>

      <section className="notes-workspace">
        <aside className="kuromi-card notes-list-panel" aria-label="Note list">
          <div className="panel-title-row">
            <div>
              <span>My Notes</span>
              <p>{visibleNotes.length} visible in this view</p>
            </div>
            <KuromiIcon name="bow" size={18} color="#ff9ed2" />
          </div>

          <div className="notes-tabs" role="tablist" aria-label="Note categories">
            {tags.map((tag) => (
              <button
                key={tag}
                className={activeTag === tag ? "active" : ""}
                onClick={() => setActiveTag(tag)}
                type="button"
              >
                {tag}
              </button>
            ))}
          </div>

          <div className="notes-list">
            {visibleNotes.length > 0 ? (
              visibleNotes.map((note) => {
                const isSelected = selected.id === note.id;

                return (
                  <button
                    key={note.id}
                    className={`note-list-item ${isSelected ? "active" : ""}`}
                    onClick={() => selectNote(note)}
                    style={{ "--note-accent": note.accent } as React.CSSProperties}
                    type="button"
                  >
                    <span className="note-accent" />
                    <span className="note-list-copy">
                      <strong>{note.title}</strong>
                      <span>{note.body}</span>
                    </span>
                    <span className="note-list-meta">
                      <small>{note.tag}</small>
                      <small>{note.updatedAt}</small>
                    </span>
                  </button>
                );
              })
            ) : (
              <div className="empty-state">
                <strong>No notes found</strong>
                <span>Try another tag or search term.</span>
              </div>
            )}
          </div>
        </aside>

        <section className="kuromi-card notes-editor-panel" aria-label="Selected note editor">
          <div className="notes-editor-header">
            <div>
              <div className="panel-eyebrow">{selected.tag} Note</div>
              <h2>{selected.title}</h2>
              <p>Last edited {selected.updatedAt}</p>
            </div>
            <div className="notes-editor-tools">
              <button aria-label="Mark note complete" type="button">
                <KuromiIcon name="check" size={18} color="#4ade80" />
              </button>
              <button aria-label="Add sparkle marker" type="button">
                <KuromiIcon name="sparkle" size={18} color="#ff9ed2" />
              </button>
            </div>
          </div>

          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            aria-label="Note body"
          />

          <div className="notes-checklist">
            <div className="panel-title-row">
              <span>Quick Checklist</span>
              <span>{selected.checklist.length} items</span>
            </div>
            {selected.checklist.map((item, index) => (
              <label key={item} className="notes-check-item">
                <input type="checkbox" defaultChecked={index === 0} />
                <span>{item}</span>
              </label>
            ))}
          </div>

          <div className="notes-save-row">
            <span>UI-only note draft. Integration can plug in later.</span>
            <button type="button">Save Note</button>
          </div>
        </section>

        <aside className="notes-side-stack">
          <section className="kuromi-card notes-template-panel">
            <div className="panel-title-row">
              <span>Templates</span>
              <KuromiIcon name="sparkle" size={17} color="#ff9ed2" />
            </div>
            <div className="template-list">
              {templates.map((template) => (
                <button key={template.title} type="button">
                  <strong>{template.title}</strong>
                  <span>{template.meta}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="kuromi-card notes-focus-panel">
            <div className="notes-focus-icon">
              <KuromiIcon name="skull" size={30} color="#f8f1ff" />
            </div>
            <div>
              <div className="panel-eyebrow">Focus Prompt</div>
              <h3>Turn scattered thoughts into clear next steps.</h3>
              <p>Use this page as a calm capture space before moving work into Tasks.</p>
            </div>
          </section>
        </aside>
      </section>

      <style jsx>{`
        .notes-page {
          padding-bottom: 28px;
        }

        .notes-actions {
          flex-wrap: wrap;
          justify-content: flex-end;
        }

        .notes-search {
          gap: 10px;
          padding: 0 14px;
        }

        .notes-search input {
          width: 100%;
          min-width: 0;
          border: 0;
          background: transparent;
          color: var(--ops-white);
        }

        .notes-stats {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 14px;
          margin-bottom: 16px;
        }

        .notes-stat-card {
          min-height: 104px;
          padding: 16px;
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .notes-stat-card > * {
          position: relative;
          z-index: 1;
        }

        .notes-stat-icon {
          width: 44px;
          height: 44px;
          border-radius: 16px;
          display: grid;
          place-items: center;
          background: rgba(255, 110, 180, 0.15);
          border: 1px solid rgba(255, 110, 180, 0.18);
        }

        .notes-stat-card span {
          display: block;
          color: var(--ops-muted);
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .notes-stat-card strong {
          display: block;
          margin-top: 4px;
          font-size: 26px;
          line-height: 1;
        }

        .notes-workspace {
          display: grid;
          grid-template-columns: minmax(280px, 340px) minmax(420px, 1fr) minmax(250px, 300px);
          gap: 16px;
          align-items: start;
        }

        .notes-list-panel,
        .notes-editor-panel,
        .notes-template-panel,
        .notes-focus-panel {
          padding: 20px;
        }

        .notes-list-panel > *,
        .notes-editor-panel > *,
        .notes-template-panel > *,
        .notes-focus-panel > * {
          position: relative;
          z-index: 1;
        }

        .notes-tabs {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 14px;
        }

        .notes-tabs button {
          border: 1px solid var(--ops-border);
          border-radius: 13px;
          padding: 7px 11px;
          color: var(--ops-muted);
          background: rgba(255, 255, 255, 0.035);
          cursor: pointer;
          font-size: 12px;
          font-weight: 800;
        }

        .notes-tabs button.active {
          color: #fff;
          border-color: transparent;
          background: linear-gradient(135deg, var(--ops-purple), var(--ops-pink));
        }

        .notes-list {
          display: grid;
          gap: 10px;
          max-height: 608px;
          overflow: auto;
          padding-right: 2px;
        }

        .note-list-item {
          width: 100%;
          min-height: 104px;
          display: grid;
          grid-template-columns: 4px minmax(0, 1fr);
          gap: 12px;
          text-align: left;
          border-radius: 18px;
          border: 1px solid rgba(224, 170, 255, 0.1);
          background: rgba(255, 255, 255, 0.035);
          color: var(--ops-white);
          padding: 13px;
          cursor: pointer;
          transition: border-color 0.18s ease, background 0.18s ease, transform 0.18s ease;
        }

        .note-list-item:hover,
        .note-list-item.active {
          border-color: color-mix(in srgb, var(--note-accent) 58%, transparent);
          background: rgba(255, 110, 180, 0.09);
          transform: translateY(-1px);
        }

        .note-accent {
          grid-row: 1 / 3;
          border-radius: 999px;
          background: var(--note-accent);
          box-shadow: 0 0 14px color-mix(in srgb, var(--note-accent) 62%, transparent);
        }

        .note-list-copy {
          min-width: 0;
          display: grid;
          gap: 6px;
        }

        .note-list-copy strong {
          font-size: 14px;
        }

        .note-list-copy span {
          color: var(--ops-muted);
          font-size: 12px;
          line-height: 1.45;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .note-list-meta {
          grid-column: 2;
          display: flex;
          justify-content: space-between;
          gap: 10px;
          color: rgba(235, 220, 255, 0.42);
        }

        .note-list-meta small:first-child {
          color: var(--ops-pink-2);
          font-weight: 800;
        }

        .notes-editor-panel {
          min-height: 720px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .notes-editor-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
        }

        .notes-editor-header h2 {
          margin: 5px 0 5px;
          font-size: 28px;
          line-height: 1.1;
          letter-spacing: -0.04em;
        }

        .notes-editor-header p,
        .notes-save-row span,
        .notes-focus-panel p {
          margin: 0;
          color: var(--ops-muted);
          font-size: 12px;
          line-height: 1.5;
        }

        .notes-editor-tools {
          display: flex;
          gap: 8px;
        }

        .notes-editor-tools button {
          width: 42px;
          height: 42px;
          border-radius: 15px;
          border: 1px solid var(--ops-border);
          background: rgba(255, 255, 255, 0.04);
          cursor: pointer;
          display: grid;
          place-items: center;
        }

        .notes-editor-panel textarea {
          width: 100%;
          min-height: 330px;
          resize: vertical;
          border: 1px solid rgba(224, 170, 255, 0.14);
          border-radius: 22px;
          background: rgba(255, 255, 255, 0.035);
          color: var(--ops-white);
          padding: 18px;
          line-height: 1.75;
        }

        .notes-checklist {
          border-radius: 22px;
          border: 1px solid rgba(224, 170, 255, 0.1);
          background: rgba(255, 255, 255, 0.026);
          padding: 16px;
        }

        .notes-check-item {
          min-height: 38px;
          display: flex;
          align-items: center;
          gap: 10px;
          color: var(--ops-muted);
          font-size: 13px;
          cursor: pointer;
        }

        .notes-check-item input {
          width: 18px;
          height: 18px;
          accent-color: var(--ops-pink);
        }

        .notes-save-row {
          margin-top: auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
        }

        .notes-save-row button {
          border: 0;
          border-radius: 16px;
          padding: 12px 18px;
          color: #fff;
          font-weight: 900;
          background: linear-gradient(135deg, var(--ops-purple), var(--ops-pink));
          cursor: pointer;
          box-shadow: 0 12px 28px rgba(255, 110, 180, 0.22);
        }

        .notes-side-stack {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .template-list {
          display: grid;
          gap: 10px;
        }

        .template-list button {
          width: 100%;
          text-align: left;
          border-radius: 18px;
          border: 1px solid rgba(224, 170, 255, 0.1);
          background: rgba(255, 255, 255, 0.035);
          color: var(--ops-white);
          padding: 14px;
          cursor: pointer;
          display: grid;
          gap: 5px;
        }

        .template-list span {
          color: var(--ops-muted);
          font-size: 12px;
          line-height: 1.4;
        }

        .notes-focus-panel {
          display: grid;
          gap: 14px;
        }

        .notes-focus-icon {
          width: 66px;
          height: 66px;
          border-radius: 24px;
          display: grid;
          place-items: center;
          background:
            radial-gradient(circle at 50% 35%, rgba(255, 255, 255, 0.2), transparent 40%),
            linear-gradient(135deg, var(--ops-purple), var(--ops-pink));
          box-shadow: 0 16px 34px rgba(155, 93, 229, 0.28);
        }

        .notes-focus-panel h3 {
          margin: 6px 0 7px;
          font-size: 20px;
          line-height: 1.15;
          letter-spacing: -0.03em;
        }

        @media (max-width: 1240px) {
          .notes-workspace {
            grid-template-columns: minmax(280px, 340px) minmax(420px, 1fr);
          }

          .notes-side-stack {
            grid-column: 1 / -1;
            display: grid;
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 920px) {
          .notes-stats {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .notes-workspace,
          .notes-side-stack {
            grid-template-columns: 1fr;
          }

          .notes-editor-panel {
            min-height: auto;
          }
        }

        @media (max-width: 640px) {
          .notes-stats {
            grid-template-columns: 1fr;
          }

          .notes-editor-header,
          .notes-save-row {
            align-items: stretch;
            flex-direction: column;
          }

          .notes-save-row button {
            width: 100%;
          }
        }
      `}</style>
    </main>
  );
}
