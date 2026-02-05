import type { Metadata } from "next";
import "./globals.css";

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
        {children}
      </body>
    </html>
  );
}
