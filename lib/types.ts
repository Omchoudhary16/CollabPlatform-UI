export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  role: "Brand" | "Influencer";
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: "Brand" | "Influencer";
  categories: string[];
  brandProfile?: {
    companyName: string;
    logoUrl?: string;
    industry?: string;
    website?: string;
    minBudget?: number;
    maxBudget?: number;
  };
  influencerProfile?: {
    displayName: string;
    bio?: string;
    followerCounts?: Record<string, number>;
    platformLinks?: Record<string, string>;
    mediaKitUrl?: string;
  };
}

export interface BrandMatch {
  brandId: string;
  companyName: string;
  commonCategoryCount: number;
}

export interface InfluencerMatch {
  influencerId: string;
  displayName: string;
  commonCategoryCount: number;
}

export interface CollaborationRequestDto {
  id: string;
  brandId: string;
  companyName: string;
  influencerId: string;
  influencerName: string;
  campaignDetails: string;
  status: "Pending" | "Accepted" | "Declined" | "Completed";
  createdAt: string;
}

export interface SendRequestDto {
  influencerId: string;
  campaignDetails: string;
}

export interface UpdateProfileDto {
  fullName: string;
  categories: string[];
  brandProfile?: Partial<{
    companyName: string;
    logoUrl: string;
    industry: string;
    website: string;
    minBudget: number;
    maxBudget: number;
  }>;
  influencerProfile?: Partial<{
    displayName: string;
    bio: string;
    followerCounts: Record<string, number>;
    platformLinks: Record<string, string>;
    mediaKitUrl: string;
  }>;
}