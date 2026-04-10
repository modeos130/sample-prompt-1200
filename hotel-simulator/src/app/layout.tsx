import type { Metadata } from "next";
import "./globals.css";
import { HotelProvider } from "@/lib/store";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "Grand Horizon Hotel - Management Simulator",
  description: "A hotel management simulation application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className="font-sans bg-background text-foreground antialiased"
      >
        <HotelProvider>
          <Sidebar />
          <main className="min-h-screen md:ml-64 pt-16 md:pt-0 px-4 py-6 md:px-6 md:py-8">
            {children}
          </main>
        </HotelProvider>
      </body>
    </html>
  );
}
