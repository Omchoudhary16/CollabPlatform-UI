"use client";
import { useAuth } from "@/providers/auth-provider";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { CollaborationRequestDto } from "@/lib/types";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import { FaCheck, FaTimes, FaClock, FaBriefcase } from "react-icons/fa";
import { useState } from "react";

export default function RequestsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"received" | "sent">("received");

  const { data: requests, isLoading } = useQuery({
    queryKey: ["requests", activeTab],
    queryFn: () => api.fetch<CollaborationRequestDto[]>(`/collaborations/${activeTab}`),
    enabled: !!user,
  });

  const acceptMutation = useMutation({
    mutationFn: (requestId: string) =>
      api.fetch(`/collaborations/${requestId}/accept`, { method: "POST" }),
    onSuccess: () => {
      toast.success("Request accepted!");
      queryClient.invalidateQueries({ queryKey: ["requests"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const declineMutation = useMutation({
    mutationFn: (requestId: string) =>
      api.fetch(`/collaborations/${requestId}/decline`, { method: "POST" }),
    onSuccess: () => {
      toast.success("Request declined.");
      queryClient.invalidateQueries({ queryKey: ["requests"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      Pending: "bg-yellow-100 text-yellow-800",
      Accepted: "bg-green-100 text-green-800",
      Declined: "bg-red-100 text-red-800",
      Completed: "bg-blue-100 text-blue-800",
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status]}`}>
        {status}
      </span>
    );
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-5xl mx-auto space-y-6">
      <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        Collaboration Requests
      </h1>
      <div className="flex border-b border-gray-200">
        {["received", "sent"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as typeof activeTab)}
            className={`px-6 py-3 font-medium text-sm capitalize transition ${
              activeTab === tab
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="flex justify-center mt-10">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      {requests?.length === 0 && !isLoading && (
        <p className="text-gray-500 text-center py-10">No requests yet.</p>
      )}
      <div className="space-y-4">
        {requests?.map((req) => (
          <motion.div
            key={req.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="flex items-start gap-4">
              <div className="hidden sm:block w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                <FaBriefcase />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-semibold text-lg">
                    {activeTab === "received" ? req.companyName : req.influencerName}
                  </h3>
                  {statusBadge(req.status)}
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {req.campaignDetails || "No details provided."}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(req.createdAt).toLocaleDateString(undefined, {
                    year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
            {activeTab === "received" && req.status === "Pending" && (
              <div className="flex gap-2 self-end sm:self-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => acceptMutation.mutate(req.id)}
                  className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-xl transition"
                >
                  <FaCheck /> Accept
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => declineMutation.mutate(req.id)}
                  className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-xl transition"
                >
                  <FaTimes /> Decline
                </motion.button>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}