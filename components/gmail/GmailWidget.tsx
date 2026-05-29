"use client";
import { useGmail } from "@/hooks/useGmail";
import { useTasks } from "@/hooks/useTasks";

function parseFrom(from: string) {
  const match = from.match(/^"?([^"<]+)"?\s*<?/);
  return match ? match[1].trim() : from;
}

function parseDate(date: string) {
  try {
    return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return date;
  }
}

export default function GmailWidget() {
  const { emails, loading, error, connected } = useGmail();
  const { createTask } = useTasks();

  const handleCreateTask = async (subject: string) => {
    await createTask({
      title: `Reply: ${subject}`,
      priority: "medium",
      source: "gmail",
      status: "todo",
    });
    alert("Task created!");
  };

  if (loading) return (
    <div style={{ padding: 20, color: "rgba(255,255,255,0.3)", fontSize: 13 }}>
      Loading emails...
    </div>
  );

  if (!connected) return (
    <div style={{ padding: 20, textAlign: "center" }}>
      <div style={{ fontSize: 28, marginBottom: 10 }}>📧</div>
      <div style={{ fontSize: 13.5, color: "rgba(255,255,255,0.4)", marginBottom: 16 }}>
        Gmail not connected yet.
      </div>
      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", lineHeight: 1.7 }}>
        Sign out and sign back in with Google to grant Gmail access. Make sure you approve all permissions on the Google consent screen.
      </div>
    </div>
  );

  if (error) return (
    <div style={{ padding: 20, color: "#FF6B6B", fontSize: 13 }}>
      Error: {error}
    </div>
  );

  if (emails.length === 0) return (
    <div style={{ padding: 20, textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: 13 }}>
      🎉 No unread emails!
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {emails.map(email => (
        <div key={email.id} style={{
          padding: "12px 14px", borderRadius: 10,
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.07)",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: "rgba(255,255,255,0.7)" }}>
              {parseFrom(email.from)}
            </span>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)" }}>
              {parseDate(email.date)}
            </span>
          </div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", fontWeight: 500, marginBottom: 4 }}>
            {email.subject}
          </div>
          <div style={{
            fontSize: 12, color: "rgba(255,255,255,0.35)", lineHeight: 1.5,
            overflow: "hidden", display: "-webkit-box",
            WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
            marginBottom: 8,
          }}>
            {email.snippet}
          </div>
          <button
            onClick={() => handleCreateTask(email.subject)}
            style={{
              background: "rgba(74,158,255,0.1)", border: "1px solid rgba(74,158,255,0.2)",
              borderRadius: 7, padding: "4px 10px", color: "#4A9EFF",
              fontSize: 11.5, fontWeight: 600, cursor: "pointer",
            }}
          >
            → Create Task
          </button>
        </div>
      ))}
    </div>
  );
}