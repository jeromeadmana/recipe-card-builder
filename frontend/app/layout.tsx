import type { Metadata } from "next";
import "./globals.css";
import DemoBanner from "@/components/common/DemoBanner";

export const metadata: Metadata = {
  title: "Recipe Card Builder",
  description: "Create beautiful recipe cards with drag and drop",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <DemoBanner />
        {children}
      </body>
    </html>
  );
}
