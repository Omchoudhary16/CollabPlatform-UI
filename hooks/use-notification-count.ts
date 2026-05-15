"use client";
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/providers/auth-provider";
import { useSignalR } from "@/providers/signalr-provider";
import { api } from "@/lib/api";

export function useNotificationCount() {
  const { user } = useAuth();
  const { connection } = useSignalR();
  const [count, setCount] = useState(0);

  // Fetch initial count on mount / user change
  useEffect(() => {
    if (!user) {
      setCount(0);
      return;
    }
    api
      .fetch<{ count: number }>("/notifications/count")
      .then((data) => setCount(data.count))
      .catch(() => setCount(0));
  }, [user]);

  // Listen for new requests via SignalR
  useEffect(() => {
    if (!connection) return;
    const handler = (request: any) => {
      setCount((prev) => prev + 1);
    };
    connection.on("NewCollaborationRequest", handler);
    return () => {
      connection.off("NewCollaborationRequest", handler);
    };
  }, [connection]);

  // Allow resetting (e.g., after viewing requests)
  const resetCount = useCallback(() => setCount(0), []);

  return { count, resetCount };
}