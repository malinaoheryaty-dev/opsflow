"use client";

import { useState, Suspense } from "react";
import { createClient } from "@/lib/supabase/client";
import { useSearchParams } from "next/navigation";

export const dynamic = "force-dynamic";

function LoginForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/";

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${next}`,
        scopes: [
          "email",
          "profile",
          "https://www.googleapis.com/auth/gmail.readonly",
          "https://www.googleapis.com/auth/calendar.readonly",
        ].join(" "),
      },
    });
    if (error) { setError(error.message); setLoading(false); }
  };

  return (
    <div style={{ width: 380, padding: 40 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 40 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 11,
          background: "linear-gradient(135deg, #4A9EFF, #A78BFA)",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
        }}>⚡</div>
        <span style={{ fontSize: 20, fontWeight: 700, color: "#fff" }}>OpsFlow</span>
      </div>

      <h1 style={{ fontSize: 26, fontWeight: 700, color: "#fff", marginBottom: 8 }}>Welcome back</h1>
      <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", marginBottom: 32, lineHeight: 1.6 }}>
        Your AI-powered ops hub. Sign in to continue.
      </p>

      {error && (
        <div style={{
          background: "rgba(255,68,68,0.1)", border: "1px solid rgba(255,68,68,0.25)",
          borderRadius: 10, padding: "10px 14px", marginBottom: 16,
          fontSize: 13, color: "#FF6B6B",
        }}>{error}</div>
      )}

      <button
        onClick={handleGoogleLogin}
        disabled={loading}
        style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "center",
          gap: 10, padding: "13px 20px", borderRadius: 12,
          background: loading ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.12)",
          color: "#fff", fontSize: 14.5, fontWeight: 600,
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        {loading ? "Redirecting..." : "Continue with Google"}
      </button>

      <p style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", textAlign: "center", marginTop: 24, lineHeight: 1.7 }}>
        Signing in grants Gmail and Calendar access for integrations.
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div style={{
      minHeight: "100vh", background: "#09090D",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');`}</style>
      <Suspense fallback={<div style={{ color: "rgba(255,255,255,0.3)" }}>Loading...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}