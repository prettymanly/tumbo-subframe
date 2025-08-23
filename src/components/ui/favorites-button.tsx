"use client";

import React, { useState, useCallback } from "react";
import { FeatherHeart } from "@subframe/core";
import { Button } from "@/components/subframe/ui/components/Button";
import { cn } from "@/lib/utils";

interface FavoritesButtonProps {
  classId: string;
  initialIsFavorited?: boolean;
  onToggleFavorite?: (classId: string, isFavorited: boolean) => Promise<void>;
  className?: string;
}

export function FavoritesButton({ 
  classId, 
  initialIsFavorited = false, 
  onToggleFavorite,
  className 
}: FavoritesButtonProps) {
  const [isFavorited, setIsFavorited] = useState(initialIsFavorited);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleToggleFavorite = useCallback(async () => {
    if (isLoading) return;

    setIsLoading(true);
    setIsAnimating(true);

    try {
      const newFavoritedState = !isFavorited;
      
      // Call the provided handler if it exists
      if (onToggleFavorite) {
        await onToggleFavorite(classId, newFavoritedState);
      }
      
      // Update local state
      setIsFavorited(newFavoritedState);
      
      // Keep animation for a bit longer for visual feedback
      setTimeout(() => setIsAnimating(false), 300);
      
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      // Add error state handling here if needed
    } finally {
      setIsLoading(false);
    }
  }, [classId, isFavorited, onToggleFavorite, isLoading]);

  return (
    <Button
      className={cn(
        "h-10 w-full flex-none transition-all duration-200 group relative overflow-hidden",
        // Rest state - no stroke, no background, dark grey text
        !isFavorited && "border-0 bg-transparent text-gray-600 hover:bg-[#E2D6C7] hover:border-0 hover:text-gray-600",
        // Favorited state - filled with brand orange and white text
        isFavorited && "bg-[#FF4400] border-2 border-[#FF4400] text-white hover:bg-[#E63D00] hover:border-[#E63D00] hover:text-white",
        // Hover state
        "hover:shadow-md hover:scale-[1.02]",
        // Loading state
        isLoading && "cursor-not-allowed opacity-75",
        // Override any default button styles that might interfere
        "!border-solid",
        className
      )}
      variant="neutral-tertiary"
      size="large"
      onClick={handleToggleFavorite}
      disabled={isLoading}
      icon={
        <FeatherHeart 
          className={cn(
            "transition-all duration-300",
            // Heart pulse on hover
            "group-hover:scale-110 group-hover:animate-pulse",
            // Bounce animation on click
            isAnimating && "animate-bounce",
            // Color overrides to ensure proper contrast
            !isFavorited && "text-gray-600",
            isFavorited && "text-white"
          )}
          style={{
            fill: isFavorited ? 'currentColor' : 'none',
            stroke: 'currentColor',
            strokeWidth: isFavorited ? 0 : 2
          }}
        />
      }
    >
      <span className={cn(
        "transition-all duration-200",
        isAnimating && "scale-105",
        // Ensure text color is correct for each state
        !isFavorited && "text-gray-600",
        isFavorited && "text-white"
      )}>
        {isLoading ? (
          <span className={cn(
            "flex items-center gap-2",
            !isFavorited && "text-gray-600",
            isFavorited && "text-white"
          )}>
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle 
                className="opacity-25" 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="4"
                fill="none"
              />
              <path 
                className="opacity-75" 
                fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            {isFavorited ? 'Removing...' : 'Adding...'}
          </span>
        ) : (
          isFavorited ? 'Added to Favorites' : 'Add to Favorites'
        )}
      </span>
      
      {/* Success animation overlay */}
      {isAnimating && isFavorited && (
        <div className="absolute inset-0 bg-gradient-to-r from-orange-400/20 to-red-400/20 animate-pulse" />
      )}
    </Button>
  );
}