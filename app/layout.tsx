"use client";  // important because providers use hooks
import "./globals.css";   // <-- Add this line
import { QueryProvider } from "@/providers/query-provider";
import { AuthProvider } from "@/providers/auth-provider";
import { SignalRProvider } from "@/providers/signalr-provider";
import { Toaster } from "react-hot-toast";


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          <AuthProvider>
            <SignalRProvider>
              {children}
              <Toaster position="top-right" />
            </SignalRProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}