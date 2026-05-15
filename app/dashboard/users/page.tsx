"use client";
import { useAuth } from "@/providers/auth-provider";
import { api } from "@/lib/api";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { FaPaperPlane, FaCheck, FaTimes, FaGlobe, FaInstagram, FaYoutube } from "react-icons/fa";
import { toast } from "react-hot-toast";
import { useState } from "react";

interface UserProfile {
  id: string;
  fullName: string;
  role: string;
  categories: string[];
  brandProfile?: any;
  influencerProfile?: any;
}

export default function UserDetailPage() {
  const { id } = useParams() as { id: string };
  const { user } = useAuth();
  const [campaignDetails, setCampaignDetails] = useState("");

  const { data: profile, isLoading } = useQuery({
    queryKey: ["user", id],
    queryFn: () => api.fetch<UserProfile>(`/users/${id}`),
  });


  const sendMutation = useMutation({
    mutationFn: (data: { influencerId: string; campaignDetails: string }) =>
      api.fetch("/collaborations/request", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      toast.success("Request sent!");
      setCampaignDetails("");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  if (isLoading) return <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!profile) return <p>User not found.</p>;

  const isBrand = profile.role === "Brand";
  const canSendRequest = user?.role === "Brand" && profile.role === "Influencer";

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
            {isBrand
              ? profile.brandProfile?.companyName?.[0] || profile.fullName[0]
              : profile.influencerProfile?.displayName?.[0] || profile.fullName[0]}
          </div>
          <div>
            <h1 className="text-3xl font-bold">
              {isBrand
                ? profile.brandProfile?.companyName || profile.fullName
                : profile.influencerProfile?.displayName || profile.fullName}
            </h1>
            <p className="text-gray-500 flex items-center gap-2 mt-1">
              <span className="capitalize bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs">{profile.role}</span>
              {isBrand && profile.brandProfile?.industry && <span>· {profile.brandProfile.industry}</span>}
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {profile.categories.map((cat) => (
            <span key={cat} className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">{cat}</span>
          ))}
        </div>

        {/* Brand specific details */}
        {isBrand && profile.brandProfile && (
          <div className="mt-6 space-y-2 text-gray-700">
            {profile.brandProfile.website && (
              <p className="flex items-center gap-2"><FaGlobe /><a href={profile.brandProfile.website} target="_blank" className="text-blue-600 hover:underline">{profile.brandProfile.website}</a></p>
            )}
            {profile.brandProfile.minBudget && <p>Budget Range: ${profile.brandProfile.minBudget} - ${profile.brandProfile.maxBudget}</p>}
          </div>
        )}

        {/* Influencer specific details */}
        {!isBrand && profile.influencerProfile && (
          <div className="mt-6 space-y-3">
            {profile.influencerProfile.bio && <p className="text-gray-600">{profile.influencerProfile.bio}</p>}
            {profile.influencerProfile.followerCounts && (
              <div className="flex flex-wrap gap-4">
                {Object.entries(profile.influencerProfile.followerCounts).map(([platform, count]) => (
                  <div key={platform} className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-xl">
                    {platform === "instagram" && <FaInstagram className="text-pink-600" />}
                    {platform === "youtube" && <FaYoutube className="text-red-600" />}
                    <span className="capitalize">{platform}</span>
                    <span className="font-semibold">{(count as number).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
            {profile.influencerProfile.mediaKitUrl && (
              <a href={profile.influencerProfile.mediaKitUrl} target="_blank" className="inline-block mt-2 text-blue-600 hover:underline">📎 View Media Kit</a>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="mt-8 flex gap-3">
          {canSendRequest && (
            <>
              <button
                onClick={() => setCampaignDetails("")}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition"
                data-bs-toggle="modal" data-bs-target="#sendModal"
              >
                <FaPaperPlane /> Send Collaboration Request
              </button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}