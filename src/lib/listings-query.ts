import type { Prisma } from "@prisma/client";
import { isAbroadState } from "@/lib/abroad";
import { getAvatarUrl } from "@/lib/avatar";
import { type listingsQuerySchema } from "@/lib/validation";
import type { PublicListing } from "@/lib/types";
import type { z } from "zod";

type ListingsQuery = z.infer<typeof listingsQuerySchema>;

export function buildApprovedListingsWhere(
  filters: ListingsQuery
): Prisma.HelpListingWhereInput {
  const where: Prisma.HelpListingWhereInput = { status: "APROBADA" };
  if (filters.type) where.type = filters.type;
  if (filters.category) where.category = filters.category;
  if (filters.state) where.state = filters.state;
  const search = filters.q?.toLowerCase();
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { municipality: { contains: search, mode: "insensitive" } },
      { user: { profile: { displayName: { contains: search, mode: "insensitive" } } } },
    ];
  }
  return where;
}

type ListingRow = {
  id: string;
  type: PublicListing["type"];
  title: string;
  description: string;
  category: PublicListing["category"];
  state: string;
  municipality: string;
  lat: number;
  lng: number;
  quantity: number;
  quantityUnit: PublicListing["quantityUnit"];
  modality: PublicListing["modality"];
  createdAt: Date;
  user: {
    id: string;
    profile: { displayName: string; avatarUrl: string | null; radiusKm: number } | null;
  };
};

export function mapListingRowToPublic(listing: ListingRow): PublicListing {
  const displayName = listing.user.profile?.displayName ?? "Anónimo";
  return {
    id: listing.id,
    type: listing.type,
    title: listing.title,
    description: listing.description,
    category: listing.category,
    state: listing.state,
    municipality: listing.municipality,
    lat: listing.lat,
    lng: listing.lng,
    createdAt: listing.createdAt.toISOString(),
    authorName: displayName.split(" ")[0] ?? displayName,
    authorDisplayName: displayName,
    authorAvatarUrl: getAvatarUrl(displayName, listing.user.profile?.avatarUrl, listing.user.id),
    radiusKm: listing.user.profile?.radiusKm ?? 10,
    quantity: listing.quantity,
    quantityUnit: listing.quantityUnit,
    modality: listing.modality,
    isAbroad: isAbroadState(listing.state),
  };
}
