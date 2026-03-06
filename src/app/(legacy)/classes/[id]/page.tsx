"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ModernPageLayout } from "@/components/ui/modern-page-layout";
import { FadeInUp } from "@/components/ui/fade-in-up";
import { TagPill } from "@/components/ui/tag-pill";
import { Modal } from "@/components/ui/modal";
import { supabaseBrowser } from "@/lib/supabase/client";
import {
  DBClass,
  Provider,
  Review,
  GooglePlacesData,
  parseReviews,
  parseGooglePlaces,
  formatPrice,
  formatAgeRange,
  deriveContextualTags,
} from "@/lib/types/tags";

// ── Form helpers ──
function FormInput({ label, type = "text", placeholder, required, name }: {
  label: string; type?: string; placeholder?: string; required?: boolean; name: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[13px] font-medium text-gray-700">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </span>
      <input name={name} type={type} placeholder={placeholder} required={required}
        className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-[14px] text-gray-900 placeholder:text-gray-400 outline-none focus:border-[var(--tumbo-orange)] focus:ring-2 focus:ring-[var(--tumbo-orange)]/20 transition-all duration-150" />
    </label>
  );
}

/** Renders editorial content with Chipchase-style subheads and line breaks. Format: subhead then \\n\\n then paragraph (or alternating subhead/body blocks). */
function EditorialBlocks({ text, className = "" }: { text: string; className?: string }) {
  if (!text?.trim()) return null;
  // Normalize literal backslash-n from DB/API into real newlines (so \n never appears in UI)
  const backslashN = String.fromCharCode(92) + "n"; // literal \ then n
  const normalized = text.split(backslashN).join("\n");
  const blocks = normalized.split(/\n\n+/).map((b) => b.trim()).filter(Boolean);
  const nodes: React.ReactNode[] = [];
  const SUBHEAD_MAX_LEN = 80;
  let i = 0;
  while (i < blocks.length) {
    const block = blocks[i];
    const firstNewline = block.indexOf("\n");
    const hasSubheadAndBody = firstNewline > 0 && firstNewline <= SUBHEAD_MAX_LEN;
    if (hasSubheadAndBody) {
      const subhead = block.slice(0, firstNewline).trim();
      const body = block.slice(firstNewline + 1).trim();
      nodes.push(
        <div key={i} className={nodes.length ? "mt-5" : ""}>
          <p className="text-sm font-semibold text-gray-700 mb-1.5">{subhead}</p>
          <p className="text-body text-default-font leading-relaxed">{body}</p>
        </div>
      );
    } else if (block.length <= SUBHEAD_MAX_LEN && i + 1 < blocks.length && blocks[i + 1].length > SUBHEAD_MAX_LEN) {
      nodes.push(
        <div key={i} className={nodes.length ? "mt-5" : ""}>
          <p className="text-sm font-semibold text-gray-700 mb-1.5">{block}</p>
          <p className="text-body text-default-font leading-relaxed">{blocks[i + 1]}</p>
        </div>
      );
      i += 1;
    } else {
      nodes.push(
        <p key={i} className={`text-body text-default-font leading-relaxed ${nodes.length ? "mt-4" : ""}`}>{block}</p>
      );
    }
    i += 1;
  }
  return <div className={className}>{nodes}</div>;
}

function FormTextarea({ label, placeholder, required, name, rows = 3 }: {
  label: string; placeholder?: string; required?: boolean; name: string; rows?: number;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[13px] font-medium text-gray-700">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </span>
      <textarea name={name} placeholder={placeholder} required={required} rows={rows}
        className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-[14px] text-gray-900 placeholder:text-gray-400 outline-none focus:border-[var(--tumbo-orange)] focus:ring-2 focus:ring-[var(--tumbo-orange)]/20 transition-all duration-150 resize-none" />
    </label>
  );
}

// ── Claim Listing Modal ──
function ClaimListingModal({ open, onClose, className: classTitle }: { open: boolean; onClose: () => void; className: string }) {
  const [submitted, setSubmitted] = useState(false);
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); setSubmitted(true); };
  const handleClose = () => { setSubmitted(false); onClose(); };

  return (
    <Modal open={open} onClose={handleClose}>
      {submitted ? (
        <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
          <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center">
            <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          </div>
          <span className="text-[16px] font-bold text-gray-900">Claim request submitted</span>
          <span className="text-[13px] text-gray-500 max-w-xs">We&apos;ll review your request and get back to you within 2-3 business days.</span>
          <button onClick={handleClose} className="mt-2 px-6 py-2.5 rounded-lg text-[13px] font-semibold text-white bg-[var(--tumbo-orange)] hover:opacity-90 transition-opacity">Done</button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="px-6 pt-6 pb-4">
            <h2 className="text-[18px] font-bold text-gray-900">Claim this listing</h2>
            <p className="text-[13px] text-gray-500 mt-1">Verify you&apos;re the owner of <strong>{classTitle}</strong>.</p>
          </div>
          <div className="flex flex-col gap-4 px-6 pb-6">
            <FormInput label="Your full name" name="name" placeholder="Jane Tan" required />
            <FormInput label="Email address" name="email" type="email" placeholder="jane@studio.com" required />
            <FormInput label="Phone number" name="phone" type="tel" placeholder="+65 9123 4567" />
            <FormInput label="Your role" name="role" placeholder="Owner, Instructor, Manager..." required />
            <FormTextarea label="How can we verify you?" name="verification" placeholder="e.g. I'm listed on the company website..." required />
          </div>
          <div className="flex gap-3 px-6 py-4 border-t border-neutral-100">
            <button type="button" onClick={handleClose} className="flex-1 py-2.5 rounded-lg text-[13px] font-semibold text-gray-500 hover:bg-neutral-50 transition-colors">Cancel</button>
            <button type="submit" className="flex-1 py-2.5 rounded-lg text-[13px] font-semibold text-white bg-[var(--tumbo-orange)] hover:opacity-90 transition-opacity">Submit claim</button>
          </div>
        </form>
      )}
    </Modal>
  );
}

// ── Report Listing Modal ──
function ReportListingModal({ open, onClose, className: classTitle }: { open: boolean; onClose: () => void; className: string }) {
  const [submitted, setSubmitted] = useState(false);
  const [reason, setReason] = useState("");
  const reasons = ["Information is incorrect", "Class no longer exists", "Duplicate listing", "Inappropriate content", "Spam or fake", "Other"];
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); setSubmitted(true); };
  const handleClose = () => { setSubmitted(false); setReason(""); onClose(); };

  return (
    <Modal open={open} onClose={handleClose}>
      {submitted ? (
        <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
            <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          </div>
          <span className="text-[16px] font-bold text-gray-900">Report submitted</span>
          <span className="text-[13px] text-gray-500 max-w-xs">Thank you for helping us keep Tümbo accurate.</span>
          <button onClick={handleClose} className="mt-2 px-6 py-2.5 rounded-lg text-[13px] font-semibold text-white bg-[var(--tumbo-orange)] hover:opacity-90 transition-opacity">Done</button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="px-6 pt-6 pb-4">
            <h2 className="text-[18px] font-bold text-gray-900">Report listing</h2>
            <p className="text-[13px] text-gray-500 mt-1">Let us know what&apos;s wrong with <strong>{classTitle}</strong>.</p>
          </div>
          <div className="flex flex-col gap-4 px-6 pb-6">
            <div className="flex flex-col gap-1.5">
              <span className="text-[13px] font-medium text-gray-700">Reason<span className="text-red-400 ml-0.5">*</span></span>
              <div className="flex flex-col gap-1.5">
                {reasons.map((r) => (
                  <button key={r} type="button" onClick={() => setReason(r)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-[13px] transition-all duration-150 ${reason === r ? "bg-[var(--tumbo-cream)] text-gray-900 font-medium ring-1 ring-[var(--tumbo-orange)]/30" : "bg-neutral-50 text-gray-600 hover:bg-neutral-100"}`}
                  >{r}</button>
                ))}
              </div>
            </div>
            <FormTextarea label="Additional details" name="details" placeholder="Any extra context..." rows={2} />
            <FormInput label="Your email (optional)" name="email" type="email" placeholder="So we can follow up" />
          </div>
          <div className="flex gap-3 px-6 py-4 border-t border-neutral-100">
            <button type="button" onClick={handleClose} className="flex-1 py-2.5 rounded-lg text-[13px] font-semibold text-gray-500 hover:bg-neutral-50 transition-colors">Cancel</button>
            <button type="submit" disabled={!reason} className="flex-1 py-2.5 rounded-lg text-[13px] font-semibold text-white bg-[var(--tumbo-orange)] hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all">Submit report</button>
          </div>
        </form>
      )}
    </Modal>
  );
}

// ── Content Sources type ──
interface ContentSources {
  description?: string[] | null;
  reviews?: string[] | null;
  child_profile?: string[] | null;
  outcomes?: string[] | null;
  vibe_line?: string[] | null;
  price?: string[] | null;
  age_range?: string[] | null;
  photo?: string[] | null;
  content_tags?: {
    subject?: string;
    philosophy?: string;
    experience?: string;
    child?: string;
  } | null;
  neighbourhood_note?: string | null;
}

function parseContentSources(raw?: string | null): ContentSources | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// ── Source pills — outlined TagPill style in brand orange ──
function SourceNote({ sources }: { sources: string[] }) {
  if (!sources || sources.length === 0) return null;

  const pillClass = "inline-flex items-center gap-1 rounded-full px-2 py-[3px] text-[11px] font-medium whitespace-nowrap border border-[var(--tumbo-orange)] text-[var(--tumbo-orange)] transition-colors duration-150";

  return (
    <div className="flex items-center gap-1.5 flex-wrap mt-4">
      {sources.map((source, i) => {
        const isEditorial = source === "Tumbo editorial";
        const isSkoolopedia = source === "Skoolopedia";
        const isInstagram = source.startsWith("Instagram");

        let url: string | null = null;
        if (!isEditorial && !isSkoolopedia && !isInstagram) {
          url = source.startsWith("http") ? source : `https://${source}`;
        } else if (isSkoolopedia) {
          url = "https://skoolopedia.com";
        } else if (isInstagram) {
          const handle = source.replace("Instagram ", "");
          url = `https://instagram.com/${handle.replace("@", "")}`;
        }

        if (url) {
          return (
            <a key={i} href={url} target="_blank" rel="noopener noreferrer"
              className={`${pillClass} hover:bg-[var(--tumbo-orange)] hover:text-white`}>
              {source}
            </a>
          );
        }

        return <span key={i} className={pillClass}>{source}</span>;
      })}
    </div>
  );
}

// ── Star Rating Component ──
function StarRating({ rating, count }: { rating: number; count?: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <svg key={i} className={`w-4 h-4 ${i < Math.floor(rating) ? "text-[var(--tumbo-orange)]" : i < rating ? "text-[var(--tumbo-orange)]/60" : "text-[var(--tumbo-hover)]"}`} fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        ))}
      </div>
      <span className="text-[14px] font-semibold text-gray-900">{rating.toFixed(1)}</span>
      {count != null && <span className="text-[13px] text-gray-400">({count} reviews)</span>}
    </div>
  );
}

// ReviewCard removed — reviews now shown as synthesized themes + select quotes

// ── In the Neighbourhood: tabs (F&B, Cafes, etc.) with distance; data from Google Places ──
const NEIGHBOURHOOD_TABS: { key: string; label: string }[] = [
  { key: "food", label: "F&B" },
  { key: "cafes", label: "Cafes" },
  { key: "remote_working", label: "Remote working" },
  { key: "groceries", label: "Groceries" },
  { key: "parking", label: "Parking" },
  { key: "transit", label: "Public transport" },
];

function formatDistance(m: number | null | undefined): string {
  if (m == null) return "";
  if (m < 1000) return `${m} m`;
  return `${(m / 1000).toFixed(1)} km`;
}

function NeighbourhoodSection({
  displayAddress,
  nearbyPlaces,
  neighbourhoodNote,
}: {
  displayAddress: string | null;
  nearbyPlaces: Record<string, { name: string; placeId?: string; distanceMeters?: number | null; formattedAddress?: string | null; googleMapsUri?: string | null }[] | undefined> | null;
  neighbourhoodNote?: string | null;
}) {
  const [activeTab, setActiveTab] = useState("food");
  const hasTabs = nearbyPlaces && typeof nearbyPlaces === "object" && NEIGHBOURHOOD_TABS.some((t) => Array.isArray(nearbyPlaces[t.key]) && nearbyPlaces[t.key]!.length > 0);

  const activePlaces = hasTabs && nearbyPlaces?.[activeTab] ? nearbyPlaces[activeTab]! : [];

  return (
    <FadeInUp as="div" className="flex w-full flex-col items-start gap-4 rounded-lg border border-[var(--tumbo-hover)] bg-white p-6">
      <h2 className="text-heading-2 font-heading-2 text-default-font">In the neighbourhood</h2>

      {displayAddress && (
        <div className="flex flex-col gap-1 w-full">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[var(--tumbo-cream)] text-[var(--tumbo-orange)] flex-shrink-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-medium text-gray-900 leading-snug">{displayAddress}</p>
              {(() => {
                const parts = displayAddress.split(",").map((s: string) => s.trim());
                const district = parts.length > 1 ? parts[0] : null;
                const cleanDistrict = district ? district.replace(/\d+\s*/, "").replace(/#[\d-]+\s*/, "").trim() || district : null;
                return cleanDistrict ? <p className="text-[13px] text-gray-500 mt-0.5">{cleanDistrict}</p> : null;
              })()}
            </div>
          </div>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(displayAddress)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[13px] font-medium text-[var(--tumbo-orange)] hover:underline mt-1"
          >
            Open in Google Maps →
          </a>
        </div>
      )}

      {neighbourhoodNote && (
        <div className="w-full rounded-lg bg-[var(--tumbo-cream)]/50 border border-[var(--tumbo-hover)]/50 p-4">
          <p className="text-[12px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">What parents say about the area</p>
          <p className="text-[14px] text-gray-700 leading-relaxed">{neighbourhoodNote}</p>
        </div>
      )}

      {hasTabs && (
        <>
          <div className="flex flex-wrap gap-2 w-full">
            {NEIGHBOURHOOD_TABS.filter((t) => Array.isArray(nearbyPlaces?.[t.key]) && nearbyPlaces[t.key]!.length > 0).map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setActiveTab(t.key)}
                className={`px-4 py-2 rounded-full text-[13px] font-medium transition-colors ${activeTab === t.key ? "bg-[var(--tumbo-orange)] text-white" : "bg-[var(--tumbo-cream)] text-gray-700 hover:bg-[var(--tumbo-hover)]"}`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <ul className="w-full flex flex-col gap-2">
            {activePlaces.map((place, idx) => (
              <li key={place.placeId || idx} className="flex items-center justify-between gap-3 py-2 border-b border-[var(--tumbo-hover)]/50 last:border-0">
                {place.googleMapsUri ? (
                  <a href={place.googleMapsUri} target="_blank" rel="noopener noreferrer" className="text-[14px] font-medium text-gray-900 hover:text-[var(--tumbo-orange)] truncate min-w-0">
                    {place.name}
                  </a>
                ) : (
                  <span className="text-[14px] font-medium text-gray-900 truncate">{place.name}</span>
                )}
                {place.distanceMeters != null && (
                  <span className="text-[13px] text-gray-500 whitespace-nowrap flex-shrink-0">{formatDistance(place.distanceMeters)}</span>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </FadeInUp>
  );
}

// ── Loading skeleton ──
function DetailSkeleton() {
  return (
    <ModernPageLayout>
      <div className="flex w-full flex-col items-center gap-8 py-12">
        <div className="w-full max-w-[1024px] flex flex-col gap-8 px-4">
          <div className="w-full h-80 bg-[var(--tumbo-cream)] rounded-xl animate-pulse" />
          <div className="h-8 w-2/3 bg-[var(--tumbo-cream)] rounded animate-pulse" />
          <div className="flex gap-2">
            <div className="h-7 w-20 bg-[var(--tumbo-hover)] rounded-full animate-pulse" />
            <div className="h-7 w-24 bg-[var(--tumbo-hover)] rounded-full animate-pulse" />
          </div>
          <div className="flex gap-16">
            <div className="flex-1 flex flex-col gap-4">
              <div className="h-4 w-full bg-[var(--tumbo-hover)] rounded animate-pulse" />
              <div className="h-4 w-5/6 bg-[var(--tumbo-hover)] rounded animate-pulse" />
              <div className="h-4 w-4/6 bg-[var(--tumbo-hover)] rounded animate-pulse" />
            </div>
            <div className="w-72 h-96 bg-[var(--tumbo-cream)] rounded-lg animate-pulse" />
          </div>
        </div>
      </div>
    </ModernPageLayout>
  );
}

// ── Main Page ──
export default function ClassDetailPage() {
  const params = useParams();
  const classId = params.id as string;

  const [cls, setCls] = useState<DBClass | null>(null);
  const [provider, setProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [claimOpen, setClaimOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [taxonomyTags, setTaxonomyTags] = useState<{ slug: string; label: string; dimension: "content" | "philosophy" | "experience" | "child" }[]>([]);

  // ── Fetch class + provider from Supabase ──
  useEffect(() => {
    async function fetchClass() {
      if (!classId) return;
      const supabase = supabaseBrowser();

      const { data: classData, error } = await supabase
        .from("classes")
        .select("*")
        .eq("id", classId)
        .single();

      if (error || !classData) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setCls(classData);

      // Fetch provider
      if (classData.provider_id) {
        const { data: providerData } = await supabase
          .from("providers")
          .select("*")
          .eq("id", classData.provider_id)
          .single();
        setProvider(providerData || null);
      }

      // Fetch taxonomy tags (from class_taxonomy_tags table)
      const { data: tagRows } = await supabase
        .from("class_taxonomy_tags")
        .select("tag_slug, dimension")
        .eq("class_id", classData.id);

      if (tagRows && tagRows.length > 0) {
        // Resolve slugs to labels via the taxonomy lookup
        const { TAXONOMY_BY_SLUG } = await import("@/lib/tags/taxonomy");
        const resolved = tagRows
          .map((row: { tag_slug: string; dimension: string }) => {
            const tag = TAXONOMY_BY_SLUG.get(row.tag_slug);
            return tag
              ? { slug: row.tag_slug, label: tag.label, dimension: tag.dimension }
              : null;
          })
          .filter(Boolean) as { slug: string; label: string; dimension: "content" | "philosophy" | "experience" | "child" }[];
        // Sort: content first, then philosophy, experience, child
        const dimOrder = { content: 0, philosophy: 1, experience: 2, child: 3 };
        resolved.sort((a, b) => dimOrder[a.dimension] - dimOrder[b.dimension]);
        setTaxonomyTags(resolved);
      }

      setLoading(false);
    }
    fetchClass();
  }, [classId]);

  // ── Lightbox keyboard ──
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxOpen(false);
    };
    if (lightboxOpen) {
      window.addEventListener("keydown", handler);
      return () => window.removeEventListener("keydown", handler);
    }
  }, [lightboxOpen]);

  if (loading) return <DetailSkeleton />;

  if (notFound || !cls) {
    return (
      <ModernPageLayout>
        <div className="flex w-full flex-col items-center justify-center gap-4 py-20">
          <span className="text-heading-1 font-heading-1 text-default-font">Class not found</span>
          <span className="text-body text-gray-500">This class may have been removed or the link is incorrect.</span>
          <Link href="/explore" className="mt-4 px-6 py-3 rounded-full bg-[var(--tumbo-orange)] text-white font-semibold hover:opacity-90 transition-opacity">
            Browse all classes
          </Link>
        </div>
      </ModernPageLayout>
    );
  }

  const reviews = parseReviews(cls.raw_reviews);
  const heroImage = cls.photo_url || "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=1200&q=80";
  const rawContentSources = parseContentSources(cls.discovered_from);
  const contextualTags = deriveContextualTags(cls);

  // Enrich source attribution — if Google data contributes, add "Google" to relevant source arrays
  const contentSources = rawContentSources ? { ...rawContentSources } : null;
  if (contentSources && provider?.classes_scrape_source) {
    const hasGoogle = provider.classes_scrape_source.includes("google_place_id");
    if (hasGoogle) {
      // Add Google to description sources if not already there
      if (contentSources.description && !contentSources.description.includes("Google")) {
        contentSources.description = [...contentSources.description, "Google"];
      }
      if (contentSources.reviews && !contentSources.reviews.includes("Google")) {
        contentSources.reviews = [...contentSources.reviews, "Google"];
      }
    }
  }

  // Google Places data lives on the PROVIDER, not the class
  const googleData = parseGooglePlaces(provider?.classes_scrape_source);
  const googleRating = googleData?.google_rating ?? cls.google_rating ?? null;
  const googleReviewCount = googleData?.google_review_count ?? cls.review_count ?? null;

  // Derive best available address — class location > Google address > provider street address
  const displayAddress = cls.location || googleData?.google_address || provider?.street_address || null;

  // Derive best available phone — provider phone > Google phone
  const displayPhone = provider?.phone || googleData?.google_phone || null;

  // Derive best available website — NEVER show Skoolopedia links, use Google real website
  const googleWebsite = googleData?.google_website || null;
  const provWebsite = provider?.website || null;
  const displayWebsite = (() => {
    // Priority: Google website > provider website (if not Skoolopedia)
    if (googleWebsite && !googleWebsite.includes("skoolopedia")) return googleWebsite;
    if (provWebsite && !provWebsite.includes("skoolopedia")) return provWebsite;
    return null; // no real website available — show nothing
  })();

  return (
    <ModernPageLayout>
      <div className="flex w-full flex-col items-start gap-8">
        <div className="flex w-full flex-col items-center gap-8">
          <div className="flex w-full max-w-[1024px] flex-col items-start gap-4 bg-default-background py-12 px-4">
            <div className="flex w-full flex-col items-start gap-8">
              {/* Hero Image */}
              <div className="w-full rounded-xl overflow-hidden relative">
                <button
                  onClick={() => setLightboxOpen(true)}
                  className="w-full border-0 p-0 bg-transparent cursor-pointer group/img"
                >
                  <img
                    className="w-full h-80 md:h-[420px] object-cover transition-all duration-500 ease-out group-hover/img:scale-[1.03]"
                    src={heroImage}
                    alt={cls.name}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/10 transition-colors duration-300" />
                  <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-black/50 backdrop-blur-sm text-white text-[11px] font-medium opacity-0 group-hover/img:opacity-100 translate-y-1 group-hover/img:translate-y-0 transition-all duration-300">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                    View full image
                  </div>
                </button>
              </div>

              {/* Lightbox */}
              {lightboxOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm">
                  <button onClick={() => setLightboxOpen(false)} className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors" aria-label="Close">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                  <img src={heroImage} alt={cls.name} className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg" />
                </div>
              )}

              {/* Title + Tags */}
              <div className="flex w-full flex-col items-start gap-4">
                {/* Provider name — secondary hierarchy */}
                {provider && (
                  <Link href={`/providers/${provider.id}`} className="text-[13px] font-medium text-gray-400 hover:text-[var(--tumbo-orange)] transition-colors">
                    {provider.name}
                  </Link>
                )}
                <h1 className="w-full text-heading-1 font-heading-1 text-default-font -mt-2">{cls.name}</h1>
                {cls.vibe_line && (
                  <p className="text-[16px] text-gray-500 italic">
                    {cls.vibe_line.charAt(0).toUpperCase() + cls.vibe_line.slice(1)}
                  </p>
                )}
                {/* Taxonomy tags — loaded from class_taxonomy_tags or derived fallback */}
                <div className="flex items-center gap-2 flex-wrap">
                  {taxonomyTags.length > 0 ? (
                    taxonomyTags.map((tag) => (
                      <TagPill key={tag.slug} label={tag.label} category={tag.dimension} size="md" />
                    ))
                  ) : (
                    <>
                      {cls.category && <TagPill label={cls.category} category="content" size="md" />}
                      {contextualTags.map((tag) => (
                        <TagPill key={tag.label} label={tag.label} category={tag.category} size="md" />
                      ))}
                    </>
                  )}
                  {cls.age_min != null && <TagPill label={formatAgeRange(cls.age_min, cls.age_max)} category="child" size="md" />}
                </div>
              </div>

              {/* Two-column layout */}
              <div className="flex flex-wrap items-start gap-16 mobile:flex-col w-full">
                {/* Left column — content */}
                <div className="flex grow shrink-0 basis-0 flex-col items-start gap-10 min-w-0">
                  {/* Description */}
                  {cls.description && (
                    <FadeInUp as="div" className="flex w-full flex-col items-start gap-4 rounded-lg border border-[var(--tumbo-hover)] bg-white p-6">
                      <h2 className="text-heading-2 font-heading-2 text-default-font">About this class</h2>
                      <div className="text-body text-default-font whitespace-pre-line leading-relaxed">
                        {cls.description}
                      </div>
                      {contentSources?.description && <SourceNote sources={contentSources.description} />}
                    </FadeInUp>
                  )}

                  {/* Reviews — editorial synthesis only when solid baseline (≥10 reviews per ENGINE) */}
                  {(cls.summary || reviews.length > 0) && (
                    <FadeInUp as="div" className="flex w-full flex-col items-start gap-4 rounded-lg border border-[var(--tumbo-hover)] bg-white p-6">
                      <h2 className="text-heading-2 font-heading-2 text-default-font">What parents say</h2>
                      {googleRating && <StarRating rating={googleRating} count={googleReviewCount ?? undefined} />}

                      {(reviews.length < 10 && (googleReviewCount == null || googleReviewCount < 10)) ? (
                        <p className="text-body text-gray-500 italic">We need more reviews to share our editorial synthesis. Here&apos;s what&apos;s on Google.</p>
                      ) : null}
                      {cls.summary && (reviews.length >= 10 || (googleReviewCount != null && googleReviewCount >= 10)) && (
                        <EditorialBlocks text={cls.summary} />
                      )}

                      {/* Show 1 representative review quote as supporting evidence */}
                      {reviews.length > 0 && (
                        <div className="flex w-full flex-col gap-3 mt-1 pt-4 border-t border-[var(--tumbo-hover)]">
                          {reviews
                            .filter(r => r.text.length > 50)
                            .sort((a, b) => b.text.length - a.text.length)
                            .slice(0, 1)
                            .map((review, i) => (
                              <div key={i} className="flex flex-col gap-1.5">
                                <p className="text-[13px] text-gray-500 leading-relaxed italic">
                                  &ldquo;{review.text.length > 250 ? review.text.substring(0, 250).trim() + "..." : review.text}&rdquo;
                                </p>
                                <div className="flex items-center gap-2">
                                  <span className="text-[11px] font-medium text-gray-400">{review.author}</span>
                                  <div className="flex items-center gap-0.5">
                                    {Array.from({ length: review.rating }).map((_, j) => (
                                      <svg key={j} className="w-2.5 h-2.5 text-[var(--tumbo-orange)]" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                      </svg>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      )}
                      {contentSources?.reviews && <SourceNote sources={contentSources.reviews} />}
                    </FadeInUp>
                  )}

                  {/* Typical child profile — only with solid review baseline (≥10) */}
                  {cls.typical_child_profile && (reviews.length >= 10 || (googleReviewCount != null && googleReviewCount >= 10)) && (
                    <FadeInUp as="div" className="flex w-full flex-col items-start gap-4 rounded-lg border border-[var(--tumbo-hover)] bg-white p-6">
                      <h2 className="text-heading-2 font-heading-2 text-default-font">Who thrives here</h2>
                      <EditorialBlocks text={cls.typical_child_profile} />
                      {cls.not_ideal_for && (
                        <div className="mt-2 pl-4 border-l-2 border-[var(--tumbo-hover)]">
                          <p className="text-[13px] text-[var(--tumbo-label)] leading-relaxed italic">{cls.not_ideal_for}</p>
                        </div>
                      )}
                      {contentSources?.child_profile && <SourceNote sources={contentSources.child_profile} />}
                    </FadeInUp>
                  )}

                  {cls.outcome_expectations && (reviews.length >= 10 || (googleReviewCount != null && googleReviewCount >= 10)) && (
                    <FadeInUp as="div" className="flex w-full flex-col items-start gap-4 rounded-lg border border-[var(--tumbo-hover)] bg-white p-6">
                      <h2 className="text-heading-2 font-heading-2 text-default-font">What to expect</h2>
                      <EditorialBlocks text={cls.outcome_expectations} />
                      {contentSources?.outcomes && <SourceNote sources={contentSources.outcomes} />}
                    </FadeInUp>
                  )}

                  {/* In the neighbourhood — lifestyle context: tabs (F&B, Cafes, etc.) with distance, or address-only fallback */}
                  {(displayAddress || (provider?.nearby_places && typeof provider.nearby_places === "object")) && (
                    <NeighbourhoodSection
                      displayAddress={displayAddress}
                      nearbyPlaces={provider?.nearby_places as Record<string, { name: string; placeId?: string; distanceMeters?: number | null; formattedAddress?: string | null; googleMapsUri?: string | null }[] | undefined> | null}
                      neighbourhoodNote={contentSources?.neighbourhood_note}
                    />
                  )}

                  {/* "More classes" section removed — will return with behaviour-based recommendations */}
                </div>

                {/* Right column — info card */}
                <div className="flex min-w-[288px] max-w-[384px] grow shrink-0 basis-0 flex-col items-start gap-6 mobile:min-w-full mobile:order-first sticky top-6 self-start max-md:static max-md:self-auto">
                  <div className="relative flex w-full flex-col items-start gap-6 rounded-lg border border-[var(--tumbo-hover)] bg-white px-6 py-6 shadow-lg">
                    {/* Decorative hand illustration — original PNG, extends beyond card */}
                    <img
                      src="/photos/illustrations/Class Detail Hand.png"
                      alt=""
                      width={360}
                      height={198}
                      className="absolute right-[-20.1875rem] top-[1.125rem] w-[22.5rem] h-auto z-20 max-md:hidden pointer-events-none select-none"
                    />

                    {/* Provider link */}
                    {provider && (
                      <Link
                        href={`/providers/${provider.id}`}
                        className="flex w-full items-center gap-3 p-3 rounded-lg hover:bg-[var(--tumbo-cream)] transition-colors group/provider overflow-hidden"
                      >
                        <div className="w-10 h-10 rounded-full bg-[var(--tumbo-cream)] flex items-center justify-center text-[16px] font-bold text-gray-600 flex-shrink-0">
                          {provider.name.charAt(0)}
                        </div>
                        <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                          <span className="text-[14px] font-semibold text-gray-900 group-hover/provider:text-[var(--tumbo-orange)] transition-colors truncate block">
                            {provider.name}
                          </span>
                          <span className="text-[11px] text-gray-400 group-hover/provider:text-gray-500 transition-colors">
                            View provider page →
                          </span>
                        </div>
                      </Link>
                    )}

                    {/* Info rows */}
                    <div className="flex w-full flex-col items-start gap-3">
                      {/* Category */}
                      {cls.category && (
                        <div className="flex w-full items-center justify-between">
                          <span className="text-body font-medium text-gray-400 text-[12px] uppercase tracking-wider">Category</span>
                          <span className="text-body font-semibold text-gray-900 text-[14px]">{cls.category}</span>
                        </div>
                      )}
                      {displayAddress && (
                        <div className="flex w-full items-start justify-between gap-4">
                          <span className="text-body font-medium text-gray-400 whitespace-nowrap text-[12px] uppercase tracking-wider">Address</span>
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(displayAddress)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-body font-semibold text-gray-900 text-right text-[14px] hover:text-[var(--tumbo-orange)] transition-colors group/addr"
                          >
                            {displayAddress}
                            <svg className="inline-block w-3 h-3 ml-1 opacity-0 group-hover/addr:opacity-100 transition-opacity text-[var(--tumbo-orange)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                          </a>
                        </div>
                      )}
                      {cls.age_min != null && (
                        <div className="flex w-full items-center justify-between">
                          <span className="text-body font-medium text-gray-400 text-[12px] uppercase tracking-wider">Age Group</span>
                          <span className="text-body font-semibold text-gray-900 text-[14px]">{formatAgeRange(cls.age_min, cls.age_max)}</span>
                        </div>
                      )}
                      {cls.price != null && (
                        <div className="flex w-full items-center justify-between">
                          <span className="text-body font-medium text-gray-400 text-[12px] uppercase tracking-wider">Price</span>
                          <span className="text-body font-semibold text-gray-900 text-[14px]">{formatPrice(cls.price)}</span>
                        </div>
                      )}
                      {cls.schedule && (
                        <div className="flex w-full items-start justify-between gap-4">
                          <span className="text-body font-medium text-gray-400 whitespace-nowrap text-[12px] uppercase tracking-wider">Schedule</span>
                          <span className="text-body font-semibold text-gray-900 text-right text-[14px] whitespace-pre-line">{cls.schedule}</span>
                        </div>
                      )}
                      {googleRating != null && (
                        <div className="flex w-full flex-col gap-1">
                          <div className="flex w-full items-center justify-between">
                            <span className="text-body font-medium text-gray-400 text-[12px] uppercase tracking-wider">Google Rating</span>
                            <div className="flex items-center gap-1">
                              <svg className="w-4 h-4 text-[var(--tumbo-orange)]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                              <span className="text-[14px] font-semibold text-gray-900">{googleRating.toFixed(1)}</span>
                              {googleReviewCount != null && <span className="text-[12px] text-gray-400">({googleReviewCount})</span>}
                            </div>
                          </div>
                          {provider && <span className="text-[10px] text-gray-400 text-right">Rating for {provider.name}</span>}
                        </div>
                      )}
                      {reviews.length > 0 && (
                        <div className="flex w-full items-center justify-between">
                          <span className="text-body font-medium text-gray-400 text-[12px] uppercase tracking-wider">Reviews</span>
                          <span className="text-body font-semibold text-gray-900 text-[14px]">{reviews.length} parent {reviews.length === 1 ? "review" : "reviews"}</span>
                        </div>
                      )}
                      {displayPhone && (
                        <div className="flex w-full items-center justify-between">
                          <span className="text-body font-medium text-gray-400 text-[12px] uppercase tracking-wider">Contact</span>
                          <a href={`tel:${displayPhone}`} className="text-body font-semibold text-gray-900 text-[14px] hover:text-[var(--tumbo-orange)] transition-colors">{displayPhone}</a>
                        </div>
                      )}
                      {displayWebsite && (
                        <div className="flex w-full items-center justify-between">
                          <span className="text-body font-medium text-gray-400 text-[12px] uppercase tracking-wider">Website</span>
                          <a href={displayWebsite} target="_blank" rel="noopener noreferrer"
                            className="text-[14px] font-semibold text-[var(--tumbo-orange)] hover:underline truncate max-w-[200px]">
                            {displayWebsite.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Quick actions */}
                    {(displayAddress || displayWebsite) && (
                      <div className="flex w-full gap-2">
                        {displayAddress && (
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(displayAddress)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg border border-[var(--tumbo-hover)] text-[12px] font-semibold text-gray-600 hover:border-[var(--tumbo-orange)] hover:text-[var(--tumbo-orange)] transition-colors"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            Directions
                          </a>
                        )}
                        {displayWebsite && (
                          <a
                            href={displayWebsite}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-[var(--tumbo-orange)] text-[12px] font-semibold text-white hover:opacity-90 transition-opacity"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                            Visit website
                          </a>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Claim / Report */}
                  <div className="flex items-center justify-center gap-3 w-full">
                    <button onClick={() => setClaimOpen(true)} className="text-[12px] font-semibold text-gray-400 hover:text-[var(--tumbo-orange)] bg-transparent border-0 cursor-pointer transition-colors duration-200">
                      Claim this listing
                    </button>
                    <span className="text-gray-300 text-[12px]">|</span>
                    <button onClick={() => setReportOpen(true)} className="text-[12px] font-normal text-gray-400 hover:text-gray-600 bg-transparent border-0 cursor-pointer transition-colors duration-200">
                      Report listing
                    </button>
                  </div>

                  <ClaimListingModal open={claimOpen} onClose={() => setClaimOpen(false)} className={cls.name} />
                  <ReportListingModal open={reportOpen} onClose={() => setReportOpen(false)} className={cls.name} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ModernPageLayout>
  );
}
