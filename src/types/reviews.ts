export type ReviewSource = "GOOGLE" | "WEBSITE" | "VERIFIED_PATIENT";

export type ReviewStatus = "APPROVED" | "PENDING_APPROVAL" | "REJECTED";

export interface ClinicReview {
  id: string;
  authorName: string;
  rating: number; // 1 - 5
  comment: string;
  treatment: string;
  date: string;
  source: ReviewSource;
  status: ReviewStatus;
  authorPhotoUrl?: string;
  googleReviewId?: string;
  verifiedPatient: boolean;
  clinicResponse?: string;
  clinicResponseDate?: string;
  createdAt: string;
}

export interface GoogleReviewsConfig {
  placeId: string;
  businessName: string;
  googleRating: number;
  totalReviewsCount: number;
  autoApproveGoogleReviews: boolean;
  googleMapsUrl: string;
  lastSyncedAt?: string;
  apiKey?: string;
  darkMode?: boolean;
}

export interface ReviewsStoreData {
  googleConfig: GoogleReviewsConfig;
  reviews: ClinicReview[];
  darkMode?: boolean;
}

