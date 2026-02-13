"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ModernPageLayout } from "@/components/ui/modern-page-layout";
import { FadeInUp } from "@/components/ui/fade-in-up";
import { TagPill } from "@/components/ui/tag-pill";
import { Accordion } from "@/components/subframe/ui/components/Accordion";
import { WarmFilterBadge } from "@/components/ui/warm-filter-badge";
import { FeatherBedDouble } from "@subframe/core";
import { FeatherTv2 } from "@subframe/core";
import { FeatherCigarette } from "@subframe/core";
import { FeatherAccessibility } from "@subframe/core";
import { FeatherAirVent } from "@subframe/core";
import { Avatar } from "@/components/subframe/ui/components/Avatar";
import { FeatherStar } from "@subframe/core";
import { Badge } from "@/components/subframe/ui/components/Badge";
import { FeatherBookmark } from "@subframe/core";
import { IconButton } from "@/components/subframe/ui/components/IconButton";
import { Tags } from "@/components/subframe/ui/components/Tags";
import { FavoritesButton } from "@/components/ui/favorites-button";
import { Modal } from "@/components/ui/modal";

// ── Form input helper ──
function FormInput({
  label,
  type = "text",
  placeholder,
  required,
  name,
}: {
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  name: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[13px] font-medium text-gray-700">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </span>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-[14px] text-gray-900 placeholder:text-gray-400 outline-none focus:border-[var(--tumbo-orange)] focus:ring-2 focus:ring-[var(--tumbo-orange)]/20 transition-all duration-150"
      />
    </label>
  );
}

function FormTextarea({
  label,
  placeholder,
  required,
  name,
  rows = 3,
}: {
  label: string;
  placeholder?: string;
  required?: boolean;
  name: string;
  rows?: number;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[13px] font-medium text-gray-700">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </span>
      <textarea
        name={name}
        placeholder={placeholder}
        required={required}
        rows={rows}
        className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-[14px] text-gray-900 placeholder:text-gray-400 outline-none focus:border-[var(--tumbo-orange)] focus:ring-2 focus:ring-[var(--tumbo-orange)]/20 transition-all duration-150 resize-none"
      />
    </label>
  );
}

// ── Claim Listing Modal ──
function ClaimListingModal({
  open,
  onClose,
  className: classTitle,
}: {
  open: boolean;
  onClose: () => void;
  className: string;
}) {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleClose = () => {
    setSubmitted(false);
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose}>
      {submitted ? (
        <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
          <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center">
            <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span className="text-[16px] font-bold text-gray-900">Claim request submitted</span>
          <span className="text-[13px] text-gray-500 max-w-xs">
            We&apos;ll review your request and get back to you within 2-3 business days.
          </span>
          <button
            onClick={handleClose}
            className="mt-2 px-6 py-2.5 rounded-lg text-[13px] font-semibold text-white bg-[var(--tumbo-orange)] hover:opacity-90 transition-opacity"
          >
            Done
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="px-6 pt-6 pb-4">
            <h2 className="text-[18px] font-bold text-gray-900">Claim this listing</h2>
            <p className="text-[13px] text-gray-500 mt-1">
              Verify you&apos;re the owner or representative of <strong>{classTitle}</strong> to manage this listing.
            </p>
          </div>
          <div className="flex flex-col gap-4 px-6 pb-6">
            <FormInput label="Your full name" name="name" placeholder="Jane Tan" required />
            <FormInput label="Email address" name="email" type="email" placeholder="jane@studio.com" required />
            <FormInput label="Phone number" name="phone" type="tel" placeholder="+65 9123 4567" />
            <FormInput label="Your role" name="role" placeholder="Owner, Instructor, Manager..." required />
            <FormTextarea
              label="How can we verify you?"
              name="verification"
              placeholder="e.g. I'm listed on the company website, I can share business registration docs..."
              required
            />
          </div>
          <div className="flex gap-3 px-6 py-4 border-t border-neutral-100">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 py-2.5 rounded-lg text-[13px] font-semibold text-gray-500 hover:bg-neutral-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-lg text-[13px] font-semibold text-white bg-[var(--tumbo-orange)] hover:opacity-90 transition-opacity"
            >
              Submit claim
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}

// ── Report Listing Modal ──
function ReportListingModal({
  open,
  onClose,
  className: classTitle,
}: {
  open: boolean;
  onClose: () => void;
  className: string;
}) {
  const [submitted, setSubmitted] = useState(false);
  const [reason, setReason] = useState("");

  const reasons = [
    "Information is incorrect",
    "Class no longer exists",
    "Duplicate listing",
    "Inappropriate content",
    "Spam or fake",
    "Other",
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleClose = () => {
    setSubmitted(false);
    setReason("");
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose}>
      {submitted ? (
        <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
            <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span className="text-[16px] font-bold text-gray-900">Report submitted</span>
          <span className="text-[13px] text-gray-500 max-w-xs">
            Thank you for helping us keep Tümbo accurate. We&apos;ll review this shortly.
          </span>
          <button
            onClick={handleClose}
            className="mt-2 px-6 py-2.5 rounded-lg text-[13px] font-semibold text-white bg-gray-800 hover:bg-gray-700 transition-colors"
          >
            Done
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="px-6 pt-6 pb-4">
            <h2 className="text-[18px] font-bold text-gray-900">Report listing</h2>
            <p className="text-[13px] text-gray-500 mt-1">
              Let us know what&apos;s wrong with <strong>{classTitle}</strong>.
            </p>
          </div>
          <div className="flex flex-col gap-4 px-6 pb-6">
            <div className="flex flex-col gap-1.5">
              <span className="text-[13px] font-medium text-gray-700">
                Reason<span className="text-red-400 ml-0.5">*</span>
              </span>
              <div className="flex flex-col gap-1.5">
                {reasons.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setReason(r)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-[13px] transition-all duration-150 ${
                      reason === r
                        ? "bg-[var(--tumbo-cream)] text-gray-900 font-medium ring-1 ring-[var(--tumbo-orange)]/30"
                        : "bg-neutral-50 text-gray-600 hover:bg-neutral-100"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
            <FormTextarea
              label="Additional details"
              name="details"
              placeholder="Any extra context that might help us investigate..."
              rows={2}
            />
            <FormInput label="Your email (optional)" name="email" type="email" placeholder="So we can follow up if needed" />
          </div>
          <div className="flex gap-3 px-6 py-4 border-t border-neutral-100">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 py-2.5 rounded-lg text-[13px] font-semibold text-gray-500 hover:bg-neutral-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!reason}
              className="flex-1 py-2.5 rounded-lg text-[13px] font-semibold text-white bg-gray-800 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Submit report
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}

// ── Neighbourhood venues data by tab ──
const NEIGHBOURHOOD_TABS = [
  {
    id: "cafes",
    label: "Cafes",
    venues: [
      { name: "The Coastal Settlement", rating: 5.0, address: "5 Changi Business Park Central 1, #01-72/73", description: "More bubble tea than espresso bar, but a solid option for a quick pick-me-up. Try their matcha oat latte or go full sugar with a brown sugar boba. Often quiet in the mid-afternoons.", initial: "T" },
      { name: "Chock Full of Beans", rating: 5.0, address: "351 Cranwell Road", description: "A cosy corner cafe with rustic walls and the smell of fresh bakes in the air. Great for winding down while your kid's in class — their flat white and banana bread are a quiet hit.", initial: "C" },
      { name: "Dandelions", rating: 5.0, address: "4 Changi Village Rd, #01-2090", description: "Casual and kid-friendly with lots of natural light. Serves reliable brunch favourites, easy sandwiches, and decent coffee. Bonus: plenty of plug points if you're sneaking in a bit of work.", initial: "D" },
      { name: "BLVD (Changi)", rating: 5.0, address: "02-24A, 5, Changi Business Park Central 1", description: "Tucked just around the bend, this dessert cafe feels like a treat. Try their yuzu cheesecake or floral tea blends. Popular with parents waiting out a class — calm, clean, and comfy.", initial: "B" },
    ],
  },
  {
    id: "gyms",
    label: "Gyms",
    venues: [
      { name: "ActiveSG Gym @ Changi", rating: 4.5, address: "11 Changi Business Park Central 2", description: "Clean public gym with decent equipment. Good for a quick workout while waiting — showers available. Gets busy after 5pm on weekdays.", initial: "A" },
      { name: "Anytime Fitness Changi", rating: 4.3, address: "5 Changi Business Park Central 1, #02-10", description: "24-hour access with a solid mix of free weights and machines. Air-conditioned and well-maintained. Monthly passes available.", initial: "A" },
    ],
  },
  {
    id: "parks",
    label: "Parks",
    venues: [
      { name: "Changi Beach Park", rating: 4.8, address: "Nicoll Drive, along Changi Coast", description: "A long stretch of coastal park perfect for a walk, jog, or just sitting on a bench watching planes land. Quiet on weekday mornings. BBQ pits and sheltered areas available.", initial: "C" },
      { name: "Pasir Ris Park", rating: 4.6, address: "Pasir Ris Central", description: "Massive park with a mangrove boardwalk, adventure playground, and cycling paths. Great for letting kids burn off energy before or after class.", initial: "P" },
      { name: "Sun Plaza Park", rating: 4.4, address: "30 Tampines Ave 9", description: "Smaller neighbourhood park with a dog run and open fields. Nice for a quiet stroll — less crowded than the coastal parks.", initial: "S" },
    ],
  },
  {
    id: "shopping",
    label: "Shopping",
    venues: [
      { name: "Changi City Point", rating: 4.3, address: "5 Changi Business Park Central 1", description: "Right next door with a FairPrice Finest, Daiso, and plenty of food options. Great for grabbing groceries or a quick meal while waiting.", initial: "C" },
      { name: "Jewel Changi Airport", rating: 4.8, address: "78 Airport Boulevard", description: "Worth the short drive for the indoor waterfall, play areas, and premium shops. The Canopy Park has a bouncing net and hedge maze kids love.", initial: "J" },
    ],
  },
  {
    id: "libraries",
    label: "Libraries",
    venues: [
      { name: "Tampines Regional Library", rating: 4.6, address: "1 Tampines Walk, #02-01", description: "One of the largest public libraries in Singapore. Excellent children's section with reading programmes on weekends. Quiet study areas for parents too.", initial: "T" },
      { name: "library@chinatown", rating: 4.4, address: "133 New Bridge Road, #04-12", description: "Compact but well-curated collection. The kids' corner has regular storytelling sessions. Conveniently located above the MRT.", initial: "L" },
    ],
  },
];

function NeighbourhoodSection() {
  const [activeTab, setActiveTab] = useState("cafes");
  const activeData = NEIGHBOURHOOD_TABS.find((t) => t.id === activeTab)!;

  return (
    <FadeInUp as="div" className="flex w-full flex-col items-start gap-6">
      <span className="text-heading-2 font-heading-2 text-default-font">
        In The Neighbourhood
      </span>
      <span className="text-[13px] text-gray-400">
        Pulled from Google Maps
      </span>
      {/* Tabs */}
      <div className="flex w-full items-center gap-1 border-b border-neutral-200">
        {NEIGHBOURHOOD_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-[14px] font-semibold border-b-2 transition-all duration-200 bg-transparent cursor-pointer ${
              activeTab === tab.id
                ? "text-[var(--tumbo-orange)] border-[var(--tumbo-orange)]"
                : "text-gray-400 border-transparent hover:text-gray-600"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {/* Venue cards */}
      <div className="flex w-full flex-col items-start gap-4">
        {activeData.venues.map((venue) => (
          <div
            key={venue.name}
            className="flex w-full flex-col items-start gap-3 rounded-lg border border-neutral-200 bg-white p-4 hover:border-neutral-300 hover:shadow-sm transition-all duration-200"
          >
            <div className="flex w-full items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[var(--tumbo-cream)] flex items-center justify-center text-[16px] font-bold text-gray-500 flex-shrink-0">
                {venue.initial}
              </div>
              <div className="flex grow flex-col items-start gap-0.5 min-w-0">
                <span className="text-[15px] font-semibold text-gray-900">
                  {venue.name}
                </span>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <svg
                        key={i}
                        className={`w-3 h-3 ${i < Math.floor(venue.rating) ? "text-amber-400" : "text-gray-200"}`}
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    ))}
                    <span className="text-[11px] text-gray-500 ml-1">{venue.rating}</span>
                  </div>
                  <span className="text-[11px] text-gray-400 truncate">
                    {venue.address}
                  </span>
                </div>
              </div>
            </div>
            <p className="text-[13px] text-gray-500 leading-relaxed">
              {venue.description}
            </p>
          </div>
        ))}
      </div>
    </FadeInUp>
  );
}

function ClassDetailPage() {
  // TODO: Fetch class data from Supabase using useParams hook
  // For now, using static data as placeholder
  const [claimOpen, setClaimOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Lightbox keyboard navigation
  const heroPhotosRef = 5; // total photo count for key handler
  const handleLightboxKey = useCallback((e: KeyboardEvent) => {
    if (lightboxIndex === null) return;
    if (e.key === "Escape") setLightboxIndex(null);
    if (e.key === "ArrowRight" && lightboxIndex < heroPhotosRef - 1) setLightboxIndex(lightboxIndex + 1);
    if (e.key === "ArrowLeft" && lightboxIndex > 0) setLightboxIndex(lightboxIndex - 1);
  }, [lightboxIndex]);

  useEffect(() => {
    if (lightboxIndex !== null) {
      window.addEventListener("keydown", handleLightboxKey);
      return () => window.removeEventListener("keydown", handleLightboxKey);
    }
  }, [lightboxIndex, handleLightboxKey]);

  const heroPhotos = [
    { src: "https://res.cloudinary.com/subframe/image/upload/v1723780559/uploads/302/tkyvdicnwbc5ftuyysc0.png", alt: "Creative Little Artists — class in action" },
    { src: "https://res.cloudinary.com/subframe/image/upload/v1723780871/uploads/302/h25wathcuwiid5ulpu1i.png", alt: "Children painting in art class" },
    { src: "https://res.cloudinary.com/subframe/image/upload/v1723780696/uploads/302/hxk01sckxtlsjxi4n2dv.png", alt: "Art studio classroom setup" },
    { src: "https://res.cloudinary.com/subframe/image/upload/v1723780878/uploads/302/mdjcme9tm4svgmkjv4zf.png", alt: "Children's artwork display" },
    { src: "https://res.cloudinary.com/subframe/image/upload/v1723780730/uploads/302/bfoixbupgy9opiv7ljrb.png", alt: "Art materials and supplies" },
  ];

  // Bookmark component for curated picks
  const BookmarkButton = ({ className }: { className?: string }) => {
    const [isBookmarked, setIsBookmarked] = useState(false);
    
    return (
      <IconButton
        className={className}
        variant="inverse"
        onClick={() => setIsBookmarked(!isBookmarked)}
        icon={
          isBookmarked ? (
            // Filled bookmark with white stroke - custom SVG
            <svg 
              className="transition-all duration-200" 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
            >
              <path 
                d="M19 21l-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"
                fill="var(--tumbo-orange)"
                stroke="white"
                strokeWidth="1.5"
              />
            </svg>
          ) : (
            // Outline bookmark
            <FeatherBookmark className="transition-all duration-200 text-current" />
          )
        }
      />
    );
  };
  
  return (
    <ModernPageLayout>
      <div className="flex w-full flex-col items-start gap-8">
        <div className="flex w-full flex-col items-center gap-8">
          <div className="flex w-full max-w-[1024px] flex-col items-start gap-4 bg-default-background py-12">
            <div className="flex w-full flex-col items-start gap-8">
              <div className="flex w-full flex-col items-start gap-8">
                <div className="w-full items-start gap-2 rounded-xl overflow-hidden relative grid grid-cols-2 mobile:flex-col mobile:flex-nowrap mobile:gap-2">
                  {/* Main hero image */}
                  <button
                    onClick={() => setLightboxIndex(0)}
                    className="relative overflow-hidden cursor-pointer group/img border-0 p-0 bg-transparent"
                  >
                    <img
                      className="w-full h-full object-cover transition-all duration-500 ease-out group-hover/img:scale-[1.04]"
                      src={heroPhotos[0].src}
                      alt={heroPhotos[0].alt}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/10 transition-colors duration-300" />
                    <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-black/50 backdrop-blur-sm text-white text-[11px] font-medium opacity-0 group-hover/img:opacity-100 translate-y-1 group-hover/img:translate-y-0 transition-all duration-300">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                      </svg>
                      1 / {heroPhotos.length}
                    </div>
                  </button>

                  {/* Grid of 4 smaller images */}
                  <div className="items-start gap-2 grid grid-cols-2 grid-rows-2">
                    {heroPhotos.slice(1).map((photo, i) => (
                      <button
                        key={i}
                        onClick={() => setLightboxIndex(i + 1)}
                        className="relative overflow-hidden cursor-pointer group/img border-0 p-0 bg-transparent"
                      >
                        <img
                          className="w-full h-full object-cover transition-all duration-500 ease-out group-hover/img:scale-[1.06]"
                          src={photo.src}
                          alt={photo.alt}
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/10 transition-colors duration-300" />
                        <div className="absolute bottom-2 left-2 flex items-center gap-1.5 px-2 py-1 rounded-md bg-black/50 backdrop-blur-sm text-white text-[10px] font-medium opacity-0 group-hover/img:opacity-100 translate-y-1 group-hover/img:translate-y-0 transition-all duration-300">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                          </svg>
                          {i + 2} / {heroPhotos.length}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* ── Photo lightbox ── */}
                {lightboxIndex !== null && (
                  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm">
                    {/* Close */}
                    <button
                      onClick={() => setLightboxIndex(null)}
                      className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                      aria-label="Close"
                    >
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>

                    {/* Counter */}
                    <span className="absolute top-5 left-1/2 -translate-x-1/2 text-white/70 text-[13px] font-medium">
                      {lightboxIndex + 1} / {heroPhotos.length}
                    </span>

                    {/* Prev */}
                    {lightboxIndex > 0 && (
                      <button
                        onClick={() => setLightboxIndex(lightboxIndex - 1)}
                        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                        aria-label="Previous"
                      >
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                    )}

                    {/* Next */}
                    {lightboxIndex < heroPhotos.length - 1 && (
                      <button
                        onClick={() => setLightboxIndex(lightboxIndex + 1)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                        aria-label="Next"
                      >
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    )}

                    {/* Image */}
                    <img
                      src={heroPhotos[lightboxIndex].src}
                      alt={heroPhotos[lightboxIndex].alt}
                      className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg"
                    />
                  </div>
                )}
              </div>
              <div className="flex w-full flex-col items-start gap-8">
                {/* Title + tags — full width above both columns */}
                <div className="flex w-full flex-col items-start gap-4">
                  <span className="w-full text-heading-1 font-heading-1 text-default-font">
                    Creative Little Artists
                  </span>
                  <div className="flex items-center gap-2 flex-wrap">
                    <TagPill label="Creative Expression" category="content" size="md" />
                    <TagPill label="Fine Motor Skills" category="child" size="md" />
                    <TagPill label="Confidence Building" category="child" size="md" />
                  </div>
                </div>

                {/* Two-column layout — now top-aligned */}
                <div className="flex flex-wrap items-start gap-16 mobile:flex-col">
                  <div className="flex grow shrink-0 basis-0 flex-col items-start gap-10">
                      {/* Accordion */}
                      <div className="flex w-full flex-col items-start gap-4 rounded-md border border-solid border-neutral-border bg-default-background shadow-sm">
                        <Accordion
                          trigger={
                            <div className="flex w-full items-center gap-2 px-6 py-6">
                              <span className="grow shrink-0 basis-0 text-heading-2 font-heading-2 text-default-font">
                                Where creativity meets confidence
                              </span>
                            </div>
                          }
                          defaultOpen={true}
                        >
                          <div className="flex w-full grow shrink-0 basis-0 flex-col items-start gap-4 border-t border-solid border-neutral-border px-6 py-6">
                            <span className="text-body font-body text-default-font">
                              Creative Little Artists introduces young children
                              to the joy of artistic expression through
                              structured yet playful art activities. Each
                              session explores different mediums - from
                              watercolor painting to clay sculpture - allowing
                              children to discover their creative voice while
                              developing essential fine motor skills and
                              visual-spatial awareness.
                            </span>
                          </div>
                        </Accordion>
                      </div>
                      <FadeInUp as="div" className="flex flex-col items-start gap-6">
                        <span className="w-full whitespace-pre-wrap text-heading-2 font-heading-2 text-default-font">
                          {"Overheard Online\n"}
                        </span>
                        <span className="whitespace-pre-wrap text-body font-body text-default-font">
                          {
                            'Parents are consistently impressed with how this class builds both confidence and creativity in young children. Multiple families mention their kids coming home excited to show off their artwork and asking when they can go back. The small group size gets frequent praise for allowing personalized attention, while the instructor\'s patience and encouragement help even shy children open up and express themselves.\n\nThe hands-on approach and "mess-friendly" environment seem to be major hits with both kids and parents. Several reviews highlight how children who were initially hesitant about art became confident creators, with one parent noting their child went from shy observer to enthusiastic artist in just a few sessions.'
                          }
                        </span>
                        <span className="whitespace-pre-wrap text-monospace-body font-monospace-body text-default-font">
                          {"Written based on these sources\n"}
                        </span>
                        <div className="flex items-center gap-2">
                          <WarmFilterBadge label="r/ParentingAdvice" count="3" />
                          <WarmFilterBadge label={"Family Connect SG\n"} count="3" />
                          <WarmFilterBadge label="Google" count="3" />
                          <WarmFilterBadge label="KiasuParents" count="3" />
                        </div>
                      </FadeInUp>
                      <div className="flex h-px w-full flex-none flex-col items-center gap-2 bg-neutral-300" />
                      <FadeInUp as="div" className="flex flex-col items-start gap-6">
                        <span className="w-full whitespace-pre-wrap text-heading-2 font-heading-2 text-default-font">
                          {"Why "}
                          <span className="text-tumbo-orange">Emma</span>
                          {" Might Thrive Here\n"}
                        </span>
                        <span className="whitespace-pre-wrap text-body font-body text-default-font">
                          {"There's something magical about how "}
                          <span className="text-tumbo-orange">Emma</span>
                          {" approaches creative challenges — with that quiet focus and gentle persistence that tells you she's truly absorbing every detail. Her visual learning style means she'll thrive in an environment where she can see, touch, and transform materials with her own hands, building confidence through each colorful creation.\n\nPicture "}
                          <span className="text-tumbo-orange">Emma</span>
                          {" with paint-covered fingers, completely absorbed as she watches colors blend and transform on paper. This hands-on exploration gives her the immediate, tactile feedback her curious mind craves, where every brushstroke teaches her something new about texture, color, and the joy of making something uniquely hers.\n\nThe gentle, growth-focused environment celebrates "}
                          <span className="text-tumbo-orange">Emma</span>
                          {"'s natural inclination to take her time and really understand her materials. Here, there's no rush to perfection — just the encouragement to explore, experiment, and discover her own creative voice through patient, loving guidance that honors her methodical approach.\n\n"}
                          <span className="text-tumbo-orange">Emma</span>
                          {"'s love for storytelling and building will find perfect expression through mixed media art projects that let her create visual narratives. She'll develop fine motor skills while exploring color theory and composition, learning techniques that will enhance her natural gift for seeing beauty in the world around her."}
                        </span>
                      </FadeInUp>
                      <div className="flex h-px w-full flex-none flex-col items-center gap-2 bg-neutral-300" />
                      <FadeInUp as="div" className="flex w-full flex-col items-start gap-6">
                        <span className="w-full text-heading-2 font-heading-2 text-default-font">
                          What to expect
                        </span>
                        <div className="flex w-full items-start gap-6 mobile:flex-col mobile:flex-nowrap mobile:gap-4">
                          <div className="flex grow shrink-0 basis-0 flex-col items-start gap-4">
                            <div className="flex w-full items-start gap-4">
                              <FeatherBedDouble className="text-heading-2 font-heading-2 text-default-font" />
                              <span className="text-body font-body text-default-font">
                                Welcome circle and art introduction
                              </span>
                            </div>
                            <div className="flex w-full items-start gap-4">
                              <FeatherTv2 className="text-heading-2 font-heading-2 text-default-font" />
                              <span className="text-body font-body text-default-font">
                                Clean-up and sharing circle 
                              </span>
                            </div>
                            <div className="flex w-full items-start gap-4">
                              <FeatherCigarette className="text-heading-2 font-heading-2 text-default-font" />
                              <span className="text-body font-body text-default-font">
                                Independent creative time
                              </span>
                            </div>
                          </div>
                          <div className="flex grow shrink-0 basis-0 flex-col items-start gap-4">
                            <div className="flex w-full items-start gap-4">
                              <FeatherAccessibility className="text-heading-2 font-heading-2 text-default-font" />
                              <span className="text-body font-body text-default-font">
                                Take-home artwork and progress notes
                              </span>
                            </div>
                            <div className="flex w-full items-start gap-4">
                              <FeatherAirVent className="text-heading-2 font-heading-2 text-default-font" />
                              <span className="text-body font-body text-default-font">
                                Guided art exploration with teacher support
                              </span>
                            </div>
                          </div>
                        </div>
                      </FadeInUp>
                      <div className="flex h-px w-full flex-none flex-col items-center gap-2 bg-neutral-300" />
                      <FadeInUp as="div" className="flex w-full grow shrink-0 basis-0 flex-col items-start gap-4">
                        <span className="w-full text-heading-2 font-heading-2 text-default-font">
                          About the instructors
                        </span>
                        <div className="flex items-center gap-4">
                          <Avatar
                            size="large"
                            image="https://res.cloudinary.com/subframe/image/upload/v1711417507/shared/fychrij7dzl8wgq2zjq9.avif"
                          >
                            A
                          </Avatar>
                          <div className="flex flex-col items-start gap-1">
                            <span className="whitespace-pre-wrap text-body-bold font-body-bold text-default-font">
                              {"Sarah Chen\n"}
                            </span>
                            <span className="whitespace-pre-wrap text-body font-body text-subtext-color">
                              {"8+ years in art education\n"}
                            </span>
                          </div>
                        </div>
                        <span className="w-full whitespace-pre-wrap text-body font-body text-default-font">
                          {
                            "Sarah has been working with young children for over 8 years, specializing in early childhood art education and creative development.\n"
                          }
                        </span>
                      </FadeInUp>
                      <div className="flex h-px w-full flex-none flex-col items-center gap-2 bg-neutral-300" />
                      <NeighbourhoodSection />
                        <div className="flex h-px w-full flex-none flex-col items-center gap-2 bg-neutral-300" />
                        <FadeInUp as="div" className="flex w-full flex-col items-start gap-6">
                          <span className="whitespace-pre-wrap text-heading-2 font-heading-2 text-default-font">
                            {"Featured in Curated Picks\n"}
                          </span>
                          <Link href="/collections" className="block group/pick">
                            <div className="flex w-full flex-col items-start gap-4 overflow-hidden cursor-pointer">
                              <div className="flex w-full flex-col items-center justify-center gap-24 overflow-hidden rounded-lg relative">
                                <BookmarkButton className="absolute right-2 top-2 z-10" />
                                <img
                                  className="h-60 w-full flex-none object-cover group-hover/pick:scale-[1.03] group-hover/pick:brightness-95 transition-all duration-500 ease-out"
                                  src="/photos/collections/Big Energy Gentle Guidance.png"
                                  alt="Big Energy, Gentle Guidance collection"
                                />
                                {/* Hover overlay with CTA */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover/pick:opacity-100 transition-opacity duration-300 flex items-end p-4">
                                  <span className="text-[13px] font-semibold text-white">View collection →</span>
                                </div>
                              </div>
                              <div className="flex w-full flex-col items-start gap-2">
                                <div className="flex w-full grow shrink-0 basis-0 flex-col items-start gap-2">
                                  <span className="line-clamp-2 w-full text-heading-3 font-heading-3 text-default-font group-hover/pick:text-[var(--tumbo-orange)] transition-colors duration-200">
                                    Big Energy, Gentle Guidance
                                  </span>
                                  <span className="line-clamp-2 w-full text-body font-body text-default-font">
                                    For kids who bounce off the walls — and just need
                                    the right walls.
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <Tags>Emotional regulation</Tags>
                                    <Tags>High-movement</Tags>
                                    <Badge>Calm mentors</Badge>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </Link>
                          <Link href="/collections" className="block group/pick">
                            <div className="flex w-full flex-col items-start gap-4 overflow-hidden cursor-pointer">
                              <div className="flex w-full flex-col items-center justify-center gap-24 overflow-hidden rounded-lg relative">
                                <BookmarkButton className="absolute right-2 top-2 z-10" />
                                <img
                                  className="h-60 w-full flex-none object-cover group-hover/pick:scale-[1.03] group-hover/pick:brightness-95 transition-all duration-500 ease-out"
                                  src="/photos/collections/Quiet Kids Loud Ideas.png"
                                  alt="Quiet Kids, Loud Ideas collection"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover/pick:opacity-100 transition-opacity duration-300 flex items-end p-4">
                                  <span className="text-[13px] font-semibold text-white">View collection →</span>
                                </div>
                              </div>
                              <div className="flex w-full flex-col items-start gap-2">
                                <div className="flex w-full grow shrink-0 basis-0 flex-col items-start gap-2">
                                  <span className="line-clamp-2 w-full text-heading-3 font-heading-3 text-default-font group-hover/pick:text-[var(--tumbo-orange)] transition-colors duration-200">
                                    Quiet Kids, Loud Ideas
                                  </span>
                                  <span className="line-clamp-2 w-full text-body font-body text-default-font">
                                    For introverted kids who speak volumes — just not
                                    with their voice.
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <Tags>Emotional regulation</Tags>
                                    <Tags>High-movement</Tags>
                                    <Badge>Calm mentors</Badge>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </Link>
                        </FadeInUp>
                  </div>
                  <div className="flex min-w-[288px] max-w-[384px] grow shrink-0 basis-0 flex-col items-start gap-6 mobile:h-auto mobile:min-w-[288px] mobile:grow mobile:shrink-0 mobile:basis-0 mobile:order-first sticky top-6 self-start max-md:static max-md:self-auto">
                    <div className="relative flex w-full flex-col items-start gap-6 rounded-md border border-solid border-neutral-border bg-default-background px-6 py-6 shadow-lg">
                      {/* Orange Hand holding the card */}
                      <Image 
                        src="/photos/illustrations/Class Detail Hand.png"
                        alt="Decorative hand illustration"
                        width={400}
                        height={400}
                        className="absolute right-[-20.1875rem] top-[1.125rem] w-[22.5rem] h-auto z-20 max-md:hidden"
                      />
                      <Link
                        href="/providers/art-studio-kids"
                        className="flex w-full grow shrink-0 basis-0 flex-col items-start gap-2 px-8 pt-6 pb-8 group/provider"
                      >
                        <div className="flex w-full items-center gap-6">
                          <Avatar
                            size="x-large"
                            image="https://res.cloudinary.com/subframe/image/upload/v1718919568/uploads/3102/mmfbvgi9hwpewyqglgul.png"
                          >
                            A
                          </Avatar>
                          <div className="flex grow shrink-0 basis-0 flex-col items-start gap-0.5">
                            <span className="text-heading-2 font-heading-2 text-default-font group-hover/provider:text-[var(--tumbo-orange)] transition-colors duration-200">
                              Art Studio Kids
                            </span>
                            <span className="text-[12px] text-gray-400 group-hover/provider:text-gray-500 transition-colors">
                              View provider page →
                            </span>
                          </div>
                        </div>
                      </Link>
                      <div className="flex w-full flex-col items-start gap-3">
                        <div className="flex w-full items-start justify-between gap-4">
                          <span className="text-body font-medium text-tumbo-label whitespace-nowrap">
                            ADDRESS
                          </span>
                          <span className="text-body font-semibold text-gray-900 text-right">
                            10 Ubi Crescent, #01-43
                            <br />
                            <span className="text-[12px] text-gray-400 font-normal">Singapore 408564</span>
                          </span>
                        </div>
                        <div className="flex w-full items-center justify-between">
                          <span className="text-body font-medium text-tumbo-label">
                            AGE GROUP
                          </span>
                          <span className="text-body font-semibold text-gray-900">
                            3-6 years
                          </span>
                        </div>
                        <div className="flex w-full items-center justify-between">
                          <span className="text-body font-medium text-tumbo-label">
                            PRICE
                          </span>
                          <span className="text-body font-semibold text-gray-900">
                            $38/class
                          </span>
                        </div>
                        <div className="flex w-full items-center justify-between">
                          <span className="text-body font-medium text-tumbo-label">
                            SCHEDULE
                          </span>
                          <span className="whitespace-pre-wrap text-body font-semibold text-gray-900 text-right">
                            {
                              "Tuesdays 10:00 AM - 10:45 AM\nThursdays 2:30 PM - 3:15 PM\nSaturdays 9:00 AM - 9:45 AM"
                            }
                          </span>
                        </div>
                        <div className="flex w-full items-center justify-between">
                          <span className="text-body font-medium text-tumbo-label">
                            DURATION
                          </span>
                          <span className="text-body font-semibold text-gray-900">
                            45 minutes
                          </span>
                        </div>
                        <div className="flex w-full items-center justify-between">
                          <span className="text-body font-medium text-tumbo-label">
                            GROUP SIZE
                          </span>
                          <span className="text-body font-semibold text-gray-900">
                            6-8 children
                          </span>
                        </div>
                        <div className="flex w-full items-center justify-between">
                          <span className="text-body font-medium text-tumbo-label">
                            CONTACT
                          </span>
                          <span className="text-body font-semibold text-gray-900">
                            +65 1234 5678
                          </span>
                        </div>
                        <div className="flex w-full items-center justify-between">
                          <span className="text-body font-medium text-tumbo-label">
                            WEBSITE
                          </span>
                          <span className="text-body font-semibold text-gray-900">
                            website.com
                          </span>
                        </div>
                      </div>
                      <div className="flex h-px w-full flex-none flex-col items-center gap-2 bg-neutral-300" />
                      <FavoritesButton
                        classId="creative-little-architects"
                        onToggleFavorite={async (classId, isFavorited) => {
                          // TODO: Integrate with backend API
                          console.log(`${isFavorited ? 'Added' : 'Removed'} ${classId} ${isFavorited ? 'to' : 'from'} favorites`);
                          // Simulate API delay
                          await new Promise(resolve => setTimeout(resolve, 800));
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-center gap-3 w-full">
                      <button
                        onClick={() => setClaimOpen(true)}
                        className="text-[12px] font-semibold text-gray-400 hover:text-[var(--tumbo-orange)] bg-transparent border-0 cursor-pointer transition-colors duration-200"
                      >
                        Claim this listing
                      </button>
                      <span className="text-gray-300 text-[12px]">|</span>
                      <button
                        onClick={() => setReportOpen(true)}
                        className="text-[12px] font-normal text-gray-400 hover:text-gray-600 bg-transparent border-0 cursor-pointer transition-colors duration-200"
                      >
                        Report listing
                      </button>
                    </div>

                    {/* Modals */}
                    <ClaimListingModal
                      open={claimOpen}
                      onClose={() => setClaimOpen(false)}
                      className="Creative Little Artists"
                    />
                    <ReportListingModal
                      open={reportOpen}
                      onClose={() => setReportOpen(false)}
                      className="Creative Little Artists"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ModernPageLayout>
  );
}

export default ClassDetailPage;