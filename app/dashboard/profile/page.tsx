"use client";
import { useAuth } from "@/providers/auth-provider";
import { api } from "@/lib/api";
import { UpdateProfileDto, UserProfile } from "@/lib/types";
import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import { FaSave, FaTimes, FaEdit, FaGlobe, FaInstagram, FaYoutube, FaTiktok, FaLink } from "react-icons/fa";

const ALL_CATEGORIES = ["Fashion", "Beauty", "Fitness", "Tech", "Travel", "Food"];
const PLATFORM_OPTIONS = ["instagram", "youtube", "tiktok", "twitter", "facebook"];

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState<Partial<UpdateProfileDto>>({});

  useEffect(() => {
    if (user) {
      setForm({
        fullName: user.fullName,
        categories: user.categories || [],
        ...(user.role === "Brand" && user.brandProfile
          ? {
              brandProfile: {
                companyName: user.brandProfile.companyName || "",
                logoUrl: user.brandProfile.logoUrl || "",
                industry: user.brandProfile.industry || "",
                website: user.brandProfile.website || "",
                minBudget: user.brandProfile.minBudget,
                maxBudget: user.brandProfile.maxBudget,
              },
            }
          : {}),
        ...(user.role === "Influencer" && user.influencerProfile
          ? {
              influencerProfile: {
                displayName: user.influencerProfile.displayName || "",
                bio: user.influencerProfile.bio || "",
                followerCounts: user.influencerProfile.followerCounts || {},
                platformLinks: user.influencerProfile.platformLinks || {},
                mediaKitUrl: user.influencerProfile.mediaKitUrl || "",
              },
            }
          : {}),
      });
    }
  }, [user]);

  const updateProfileMutation = useMutation({
    mutationFn: (data: UpdateProfileDto) =>
      api.fetch<UserProfile>("/profile", {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: (data) => {
      updateUser(data);
      setEditMode(false);
      toast.success("Profile updated!");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const toggleCategory = (cat: string) => {
    const current = form.categories || [];
    if (current.includes(cat)) {
      setForm({ ...form, categories: current.filter((c) => c !== cat) });
    } else {
      setForm({ ...form, categories: [...current, cat] });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(form as UpdateProfileDto);
  };

  if (!user) return null;

  const isBrand = user.role === "Brand";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        My Profile
      </h1>

      {!editMode ? (
        /* ---------- VIEW MODE ---------- */
        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {isBrand
                  ? user.brandProfile?.companyName?.[0] || user.fullName[0]
                  : user.influencerProfile?.displayName?.[0] || user.fullName[0]}
              </div>
              <div>
                <h2 className="text-2xl font-semibold">
                  {isBrand ? user.brandProfile?.companyName : user.influencerProfile?.displayName}
                </h2>
                <p className="text-gray-500">{user.fullName} · <span className="capitalize">{user.role}</span></p>
              </div>
            </div>
            <button
              onClick={() => setEditMode(true)}
              className="flex items-center gap-2 text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-xl transition self-start"
            >
              <FaEdit /> Edit Profile
            </button>
          </div>

          {/* Basic info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700">
            <div>
              <span className="font-medium">Email:</span> {user.email}
            </div>
            <div>
              <span className="font-medium">Full Name:</span> {user.fullName}
            </div>
          </div>

          {/* Categories */}
          <div>
            <span className="font-medium">Categories:</span>
            <div className="flex flex-wrap gap-2 mt-1">
              {user.categories?.length > 0 ? (
                user.categories.map((cat) => (
                  <span key={cat} className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">
                    {cat}
                  </span>
                ))
              ) : (
                <span className="text-gray-400">No categories selected</span>
              )}
            </div>
          </div>

          {/* Brand specific view */}
          {isBrand && user.brandProfile && (
            <div className="border-t pt-4 space-y-2">
              <h3 className="text-lg font-semibold">Brand Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {user.brandProfile.industry && (
                  <div><span className="font-medium">Industry:</span> {user.brandProfile.industry}</div>
                )}
                {user.brandProfile.website && (
                  <div className="flex items-center gap-1">
                    <FaGlobe className="text-gray-400" />
                    <a href={user.brandProfile.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {user.brandProfile.website}
                    </a>
                  </div>
                )}
                {user.brandProfile.logoUrl && (
                  <div className="col-span-2">
                    <span className="font-medium">Logo:</span>{" "}
                    <img src={user.brandProfile.logoUrl} alt="Logo" className="h-10 inline-block rounded" />
                  </div>
                )}
                {(user.brandProfile.minBudget || user.brandProfile.maxBudget) && (
                  <div>
                    <span className="font-medium">Budget Range:</span>{" "}
                    {user.brandProfile.minBudget ? `$${user.brandProfile.minBudget}` : "?"} –{" "}
                    {user.brandProfile.maxBudget ? `$${user.brandProfile.maxBudget}` : "?"}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Influencer specific view */}
          {!isBrand && user.influencerProfile && (
            <div className="border-t pt-4 space-y-3">
              <h3 className="text-lg font-semibold">Influencer Details</h3>
              {user.influencerProfile.bio && (
                <p className="text-gray-600">{user.influencerProfile.bio}</p>
              )}
              {user.influencerProfile.followerCounts && Object.keys(user.influencerProfile.followerCounts).length > 0 && (
                <div>
                  <span className="font-medium">Followers:</span>
                  <div className="flex flex-wrap gap-3 mt-1">
                    {Object.entries(user.influencerProfile.followerCounts).map(([platform, count]) => (
                      <div key={platform} className="flex items-center gap-1 bg-gray-50 px-3 py-1 rounded-full text-sm">
                        {platform === "instagram" && <FaInstagram className="text-pink-600" />}
                        {platform === "youtube" && <FaYoutube className="text-red-600" />}
                        {platform === "tiktok" && <FaTiktok className="text-gray-800" />}
                        <span className="capitalize">{platform}:</span>
                        <span className="font-semibold">{count.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {user.influencerProfile.platformLinks && Object.keys(user.influencerProfile.platformLinks).length > 0 && (
                <div>
                  <span className="font-medium">Platform Links:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {Object.entries(user.influencerProfile.platformLinks).map(([platform, link]) => (
                      <a
                        key={platform}
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-blue-600 hover:underline text-sm"
                      >
                        <FaLink className="text-xs" />
                        <span className="capitalize">{platform}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
              {user.influencerProfile.mediaKitUrl && (
                <div>
                  <span className="font-medium">Media Kit:</span>{" "}
                  <a href={user.influencerProfile.mediaKitUrl} target="_blank" className="text-blue-600 hover:underline">
                    View Media Kit
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* ---------- EDIT MODE ---------- */
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="bg-white/80 backdrop-blur-md rounded-2xl p-6 sm:p-8 shadow-xl space-y-6"
        >
          <h2 className="text-2xl font-semibold">Edit Profile</h2>

          <div className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                value={form.fullName || ""}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 transition"
              />
            </div>

            {/* Categories */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Categories</label>
              <div className="flex flex-wrap gap-3">
                {ALL_CATEGORIES.map((cat) => (
                  <label
                    key={cat}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full border cursor-pointer transition ${
                      form.categories?.includes(cat)
                        ? "bg-blue-100 border-blue-400 text-blue-700"
                        : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={form.categories?.includes(cat) || false}
                      onChange={() => toggleCategory(cat)}
                      className="sr-only"
                    />
                    <span className="text-sm">{cat}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Brand specific edit fields */}
            {isBrand && form.brandProfile && (
              <div className="space-y-4 border-t pt-4">
                <h3 className="text-lg font-semibold">Brand Profile</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                    <input
                      type="text"
                      value={form.brandProfile.companyName || ""}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          brandProfile: { ...form.brandProfile, companyName: e.target.value },
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                    <input
                      type="text"
                      value={form.brandProfile.industry || ""}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          brandProfile: { ...form.brandProfile, industry: e.target.value },
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                    <input
                      type="url"
                      value={form.brandProfile.website || ""}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          brandProfile: { ...form.brandProfile, website: e.target.value },
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl"
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
                    <input
                      type="url"
                      value={form.brandProfile.logoUrl || ""}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          brandProfile: { ...form.brandProfile, logoUrl: e.target.value },
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl"
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Min Budget ($)</label>
                    <input
                      type="number"
                      value={form.brandProfile.minBudget || ""}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          brandProfile: {
                            ...form.brandProfile,
                            minBudget: e.target.value ? Number(e.target.value) : undefined,
                          },
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Budget ($)</label>
                    <input
                      type="number"
                      value={form.brandProfile.maxBudget || ""}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          brandProfile: {
                            ...form.brandProfile,
                            maxBudget: e.target.value ? Number(e.target.value) : undefined,
                          },
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Influencer specific edit fields */}
            {!isBrand && form.influencerProfile && (
              <div className="space-y-4 border-t pt-4">
                <h3 className="text-lg font-semibold">Influencer Profile</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
                  <input
                    type="text"
                    value={form.influencerProfile.displayName || ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        influencerProfile: { ...form.influencerProfile, displayName: e.target.value },
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                  <textarea
                    value={form.influencerProfile.bio || ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        influencerProfile: { ...form.influencerProfile, bio: e.target.value },
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl h-24"
                  />
                </div>

                {/* Follower counts */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Follower Counts</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {PLATFORM_OPTIONS.map((platform) => (
                      <div key={platform}>
                        <label className="text-xs text-gray-500 capitalize">{platform}</label>
                        <input
                          type="number"
                          min="0"
                          value={
                            form.influencerProfile?.followerCounts?.[platform] ?? ""
                          }
                          onChange={(e) => {
                            const newCounts = {
                              ...(form.influencerProfile?.followerCounts || {}),
                            };
                            if (e.target.value === "" || e.target.value === "0") {
                              delete newCounts[platform];
                            } else {
                              newCounts[platform] = Number(e.target.value);
                            }
                            setForm({
                              ...form,
                              influencerProfile: {
                                ...form.influencerProfile,
                                followerCounts: newCounts,
                              },
                            });
                          }}
                          className="w-full px-3 py-1 border border-gray-200 rounded-xl text-sm"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Platform links */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Platform Links</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {PLATFORM_OPTIONS.map((platform) => (
                      <div key={platform}>
                        <label className="text-xs text-gray-500 capitalize">{platform}</label>
                        <input
                          type="url"
                          placeholder="https://..."
                          value={form.influencerProfile?.platformLinks?.[platform] ?? ""}
                          onChange={(e) => {
                            const newLinks = {
                              ...(form.influencerProfile?.platformLinks || {}),
                            };
                            if (e.target.value === "") {
                              delete newLinks[platform];
                            } else {
                              newLinks[platform] = e.target.value;
                            }
                            setForm({
                              ...form,
                              influencerProfile: {
                                ...form.influencerProfile,
                                platformLinks: newLinks,
                              },
                            });
                          }}
                          className="w-full px-3 py-1 border border-gray-200 rounded-xl text-sm"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Media kit */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Media Kit URL</label>
                  <input
                    type="url"
                    value={form.influencerProfile.mediaKitUrl || ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        influencerProfile: { ...form.influencerProfile, mediaKitUrl: e.target.value },
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl"
                    placeholder="https://..."
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => setEditMode(false)}
              className="flex items-center gap-2 px-5 py-2 bg-gray-200 hover:bg-gray-300 rounded-xl transition"
            >
              <FaTimes /> Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={updateProfileMutation.isPending}
              className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transition disabled:opacity-60"
            >
              <FaSave />
              {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
            </motion.button>
          </div>
        </motion.form>
      )}
    </motion.div>
  );
}