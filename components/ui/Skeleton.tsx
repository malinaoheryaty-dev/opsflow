"use client";
// SAVE AS: components/ui/Skeleton.tsx

// ─── Base skeleton block ──────────────────────────────────────
export function Skeleton({ width, height, borderRadius = 8, style }: {
  width?: string | number;
  height?: string | number;
  borderRadius?: number;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className="skeleton"
      style={{ width, height: height ?? 16, borderRadius, ...style }}
    />
  );
}

// ─── Skeleton for a task row ──────────────────────────────────
export function TaskSkeleton() {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: "11px 14px", borderRadius: 12, marginBottom: 6,
      background: "rgba(255,255,255,0.02)",
      border: "1px solid rgba(255,255,255,0.05)",
    }}>
      <Skeleton width={18} height={18} borderRadius={5} />
      <Skeleton width="60%" height={14} />
      <Skeleton width={50} height={20} borderRadius={100} style={{ marginLeft: "auto" }} />
      <Skeleton width={36} height={14} borderRadius={4} />
    </div>
  );
}

// ─── Skeleton for a stat card ─────────────────────────────────
export function StatCardSkeleton() {
  return (
    <div style={{
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: 18, padding: "20px 22px", flex: 1,
    }}>
      <Skeleton width={80} height={11} style={{ marginBottom: 10 }} />
      <Skeleton width={60} height={32} borderRadius={6} style={{ marginBottom: 6 }} />
      <Skeleton width={100} height={11} />
    </div>
  );
}

// ─── Skeleton for an email row ────────────────────────────────
export function EmailSkeleton() {
  return (
    <div style={{
      padding: "12px 14px", borderRadius: 10, marginBottom: 8,
      background: "rgba(255,255,255,0.02)",
      border: "1px solid rgba(255,255,255,0.05)",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <Skeleton width={100} height={12} />
        <Skeleton width={40} height={11} />
      </div>
      <Skeleton width="80%" height={13} style={{ marginBottom: 6 }} />
      <Skeleton width="95%" height={11} style={{ marginBottom: 4 }} />
      <Skeleton width="70%" height={11} />
    </div>
  );
}

// ─── Skeleton for a note card ─────────────────────────────────
export function NoteSkeleton() {
  return (
    <div style={{
      padding: "12px 14px", borderRadius: 10, marginBottom: 8,
      background: "rgba(255,255,255,0.02)",
      border: "1px solid rgba(255,255,255,0.05)",
    }}>
      <Skeleton width="60%" height={14} style={{ marginBottom: 8 }} />
      <Skeleton width="100%" height={11} style={{ marginBottom: 4 }} />
      <Skeleton width="85%" height={11} style={{ marginBottom: 4 }} />
      <Skeleton width="40%" height={11} />
    </div>
  );
}

// ─── Full dashboard skeleton ──────────────────────────────────
export function DashboardSkeleton() {
  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Skeleton width={280} height={28} borderRadius={8} style={{ marginBottom: 8 }} />
        <Skeleton width={200} height={14} borderRadius={6} />
      </div>

      {/* Stat cards */}
      <div style={{ display: "flex", gap: 14, marginBottom: 20 }}>
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>

      {/* Main grid */}
      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr 300px", gap: 16 }}>
        {/* Left col */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 18, padding: 20 }}>
            <Skeleton width={120} height={14} style={{ marginBottom: 14 }} />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4, marginBottom: 12 }}>
              {Array(35).fill(0).map((_, i) => <Skeleton key={i} height={24} borderRadius={6} />)}
            </div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 18, padding: 20 }}>
            <Skeleton width={80} height={14} style={{ marginBottom: 14 }} />
            <EmailSkeleton />
            <EmailSkeleton />
            <EmailSkeleton />
          </div>
        </div>

        {/* Middle col */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 18, padding: 22 }}>
            <Skeleton width={180} height={14} style={{ marginBottom: 18 }} />
            <Skeleton width="100%" height={80} borderRadius={8} style={{ marginBottom: 12 }} />
          </div>
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 18, padding: 22 }}>
            <Skeleton width={100} height={14} style={{ marginBottom: 14 }} />
            <TaskSkeleton />
            <TaskSkeleton />
            <TaskSkeleton />
            <TaskSkeleton />
          </div>
        </div>

        {/* Right col */}
        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 18, padding: 20 }}>
          <Skeleton width={160} height={14} style={{ marginBottom: 16 }} />
          <Skeleton width="100%" height={60} borderRadius={10} style={{ marginBottom: 12 }} />
          <Skeleton width="100%" height={40} borderRadius={8} style={{ marginBottom: 8 }} />
          <Skeleton width="100%" height={40} borderRadius={8} style={{ marginBottom: 8 }} />
          <Skeleton width="100%" height={40} borderRadius={8} />
        </div>
      </div>
    </div>
  );
}