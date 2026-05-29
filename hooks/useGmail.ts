"use client";
import { useState, useEffect } from "react";

export interface Email {
  id: string;
  subject: string;
  from: string;
  date: string;
  snippet: string;
}

export function useGmail() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    fetch("/api/gmail")
      .then(res => res.json())
      .then(data => {
        if (data.error === "Gmail not connected") {
          setConnected(false);
        } else if (data.emails) {
          setEmails(data.emails);
          setConnected(true);
        }
      })
      .catch(() => setError("Failed to load emails"))
      .finally(() => setLoading(false));
  }, []);

  return { emails, loading, error, connected };
}