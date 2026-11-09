import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Alibi Vault // Scotland Yard 221B Interrogation Bureau",
  description: "Autonomous AI Suspect Bounty Vault & Victorian Evidence Economy on NEAR Protocol",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-[#16110E] text-[#ECE8DF]">{children}</body>
    </html>
  );
}
