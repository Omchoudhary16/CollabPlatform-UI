"use client";
import { useAuth } from "@/providers/auth-provider";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { BrandMatch, InfluencerMatch } from "@/lib/types";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { FaPaperPlane, FaTimes, FaHandshake } from "react-icons/fa";

export default function MatchesPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [sendModal, setSendModal] = useState<{ id: string; name: string } | null>(null);
  const [campaignDetails, setCampaignDetails] = useState("");

  const endpoint = user?.role === "Brand" ? "/matches/influencers" : "/matches/brands";

  const { data: matches, isLoading } = useQuery({
    queryKey: ["matches", user?.role],
    queryFn: () => api.fetch<(BrandMatch | InfluencerMatch)[]>(endpoint),
    enabled: !!user,
  });

  const sendMutation = useMutation({
    mutationFn: (data: { influencerId: string; campaignDetails: string }) =>
      api.fetch("/collaborations/request", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      toast.success("Request sent!");
      setSendModal(null);
      setCampaignDetails("");
      queryClient.invalidateQueries({ queryKey: ["requests"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  if (isLoading) return (
    <div className="flex justify-center mt-20">
      <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto space-y-6"
    >
      <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        Matches
      </h1>
      {matches?.length === 0 && (
        <p className="text-gray-500">No matches yet. Add categories to your profile.</p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {matches?.map((match: any, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            whileHover={{ y: -5 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-md hover:shadow-xl transition-all"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                {"companyName" in match ? match.companyName[0] : match.displayName[0]}
              </div>
              <div>
                <h3 className="font-semibold text-lg">
                  {"companyName" in match ? match.companyName : match.displayName}
                </h3>
                <p className="text-sm text-gray-500">
                  {match.commonCategoryCount} common categories
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1 mb-4">
              {/* You can show matched categories if available */}
            </div>
            {user?.role === "Brand" && (
              <button
                onClick={() => setSendModal({ id: match.influencerId, name: match.displayName })}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 rounded-xl hover:shadow-lg transition"
              >
                <FaPaperPlane /> Send Request
              </button>
            )}
          </motion.div>
        ))}
      </div>

      {/* Send Request Modal */}
      <AnimatePresence>
        {sendModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Send Request to {sendModal.name}</h2>
                <button onClick={() => setSendModal(null)}>
                  <FaTimes className="text-gray-500 hover:text-gray-800" />
                </button>
              </div>
              <textarea
                className="w-full border border-gray-200 rounded-xl p-3 mb-4 h-32 focus:ring-2 focus:ring-blue-400 transition"
                placeholder="Describe your campaign..."
                value={campaignDetails}
                onChange={(e) => setCampaignDetails(e.target.value)}
              />
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setSendModal(null)}
                  className="px-4 py-2 bg-gray-200 rounded-xl hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => sendMutation.mutate({ influencerId: sendModal.id, campaignDetails })}
                  disabled={sendMutation.isPending}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl shadow hover:shadow-lg transition disabled:opacity-60"
                >
                  {sendMutation.isPending ? "Sending..." : "Send"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}