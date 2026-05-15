"use client";
import { createContext, useContext, useEffect, useState, useRef } from "react";
import { HubConnectionBuilder, HubConnection, LogLevel } from "@microsoft/signalr";
import { useAuth } from "./auth-provider";
import { toast } from "react-hot-toast";

interface SignalRContextType {
  connection: HubConnection | null;
}

const SignalRContext = createContext<SignalRContextType>({ connection: null });

export function SignalRProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [connection, setConnection] = useState<HubConnection | null>(null);
  const connectionRef = useRef<HubConnection | null>(null);

  useEffect(() => {
    if (!user || typeof window === "undefined") return;

    const conn = new HubConnectionBuilder()
      .withUrl(`${process.env.NEXT_PUBLIC_SIGNALR_URL}/hubs/notifications`, {
        accessTokenFactory: () => localStorage.getItem("accessToken") || "",
      })
      .configureLogging(LogLevel.Information)
      .withAutomaticReconnect()
      .build();

    conn
      .start()
      .then(() => {
        connectionRef.current = conn;
        setConnection(conn);
      })
      .catch((err) => console.error("SignalR connection error:", err));

    conn.on("NewCollaborationRequest", (request) => {
      toast(
        `New collaboration request from ${request.companyName || "someone"}!`,
        { duration: 5000 }
      );
    });

    return () => {
      conn.stop();
      connectionRef.current = null;
    };
  }, [user]);

  return (
    <SignalRContext.Provider value={{ connection }}>
      {children}
    </SignalRContext.Provider>
  );
}

export const useSignalR = () => useContext(SignalRContext);