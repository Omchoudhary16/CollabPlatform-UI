"use client";
import { useAuth } from "@/providers/auth-provider";
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { FaSearch, FaUserFriends, FaBuilding, FaStar } from "react-icons/fa";

interface PublicUser {
  id: string;
  fullName: string;
  role: "Brand" | "Influencer";
  categories: string[];
  brandProfile?: {
    companyName: string;
    logoUrl?: string;
    industry?: string;
    website?: string;
  };
  influencerProfile?: {
    displayName: string;
    bio?: string;
    followerCounts?: Record<string, number>;
    platformLinks?: Record<string, string>;
    mediaKitUrl?: string;
  };
}

export default function HomePage() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  // Show opposite role
  const targetRole = user?.role === "Brand" ? "Influencer" : "Brand";

  const { data: users, isLoading } = useQuery({
    queryKey: ["users", targetRole, search, selectedCategory],
    queryFn: () => {
      const params = new URLSearchParams();
      params.append("role", targetRole);
      if (search) params.append("search", search);
      if (selectedCategory) params.append("category", selectedCategory);
      return api.fetch<PublicUser[]>(`/users?${params.toString()}`);
    },
    enabled: !!user,
  });

  const allCategories = Array.from(
    new Set(users?.flatMap((u) => u.categories) || [])
  ).sort();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto space-y-6"
    >
      {/* Hero section */}
      <div className="text-center py-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Discover {targetRole === "Influencer" ? "Influencers" : "Brands"}
        </h1>
        <p className="text-gray-500 mt-2">
          Find the perfect collaboration partner based on your categories.
        </p>
      </div>

      {/* Search and filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center">
        <div className="relative flex-1 w-full">
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 transition"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full sm:w-48 border border-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-400 transition"
        >
          <option value="">All Categories</option>
          {allCategories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Users grid */}
      {isLoading && (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {users?.map((u) => (
          <motion.div
            key={u.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-md hover:shadow-xl transition-all"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {u.role === "Brand"
                  ? u.brandProfile?.companyName?.[0] || u.fullName[0]
                  : u.influencerProfile?.displayName?.[0] || u.fullName[0]}
              </div>
              <div>
                <h3 className="font-semibold text-lg">
                  {u.role === "Brand"
                    ? u.brandProfile?.companyName || u.fullName
                    : u.influencerProfile?.displayName || u.fullName}
                </h3>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  {u.role === "Brand" ? (
                    <><FaBuilding className="text-xs" /> {u.brandProfile?.industry || "Brand"}</>
                  ) : (
                    <><FaStar className="text-xs" /> {Object.values(u.influencerProfile?.followerCounts || {}).reduce((a,b)=>a+b,0).toLocaleString()} followers</>
                  )}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1 mb-4">
              {u.categories.slice(0, 3).map((cat) => (
                <span key={cat} className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-xs">
                  {cat}
                </span>
              ))}
              {u.categories.length > 3 && (
                <span className="text-xs text-gray-400">+{u.categories.length - 3}</span>
              )}
            </div>
            <Link
              href={`/users/${u.id}`}
              className="block w-full text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 rounded-xl hover:shadow-lg transition"
            >
              View Profile
            </Link>
          </motion.div>
        ))}
      </div>
      {users?.length === 0 && !isLoading && (
        <p className="text-center text-gray-500 py-10">No users found. Try different filters.</p>
      )}
    </motion.div>
  );
}