import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OpsFlow",
  description: "Your AI-powered operations hub",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#09090D" }}>
        {children}
      </body>
    </html>
  );
}