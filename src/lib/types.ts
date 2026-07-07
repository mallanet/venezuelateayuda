import type { Category, HelpModality, ListingType, QuantityUnit } from "@prisma/client";

export interface PublicListing {
  id: string;
  type: ListingType;
  title: string;
  description: string;
  category: Category;
  state: string;
  municipality: string;
  lat: number;
  lng: number;
  createdAt: string;
  authorName: string;
  authorDisplayName: string;
  authorAvatarUrl: string;
  radiusKm: number;
  quantity: number;
  quantityUnit: QuantityUnit;
  modality: HelpModality;
  isAbroad: boolean;
}

export interface PublicProfessional {
  id: string;
  displayName: string;
  avatarUrl: string;
  state: string;
  municipality: string;
  bio: string | null;
  categories: Category[];
  listingsCount: number;
  primaryCategory: Category | null;
}
