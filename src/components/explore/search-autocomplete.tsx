"use client";

/**
 * SearchAutocomplete — Spotlight-style search with grouped suggestions
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Features:
 *   - Debounced input (150ms)
 *   - Grouped suggestions: Categories, Tags, Classes
 *   - Keyboard navigation (arrow keys, Enter, Escape)
 *   - "Search for X" footer option
 *   - Recent searches (localStorage, max 5)
 *   - Portal-based dropdown to avoid layout shifts
 *   - CSS transitions for smooth open/close
 */

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import type { DBClass } from "@/lib/types/tags";
import {
  buildSearchIndex,
  autocomplete,
  type SearchIndex,
  type AutocompleteSuggestion,
  type AutocompleteResult,
} from "@/lib/search/search-engine";

// ── Constants ──
const DEBOUNCE_MS = 150;
const MAX_RECENT = 5;
const RECENT_KEY = "tumbo_recent_searches";
const DROPDOWN_MAX_HEIGHT = 420;

// ── Dimension colors for tag pills ──
const DIMENSION_COLORS: Record<string, string> = {
  content: "var(--tumbo-tag-content, #7E401A)",
  philosophy: "var(--tumbo-tag-philosophy, #FF3C00)",
  experience: "var(--tumbo-tag-experience, #F1B313)",
  child: "var(--tumbo-tag-child, #FF6966)",
};

// ── Types ──
interface FlatItem {
  type: "recent" | "category" | "tag" | "class" | "search-for";
  suggestion?: AutocompleteSuggestion;
  label: string;
  recentQuery?: string;
}

export interface SearchAutocompleteProps {
  allClasses: DBClass[];
  providerMap: Record<string, { name: string }>;
  /** Called when user selects a category — parent filters by category */
  onSelectCategory: (category: string) => void;
  /** Called when user selects a class — navigate to class detail */
  onSelectClass: (classId: string) => void;
  /** Called when user selects a tag — parent filters by tag */
  onSelectTag: (tagLabel: string) => void;
  /** Called when user submits a text search — parent runs full search */
  onSearch: (query: string) => void;
  /** Current input value (controlled) */
  value: string;
  /** onChange for controlled input */
  onChange: (value: string) => void;
}

export function SearchAutocomplete({
  allClasses,
  providerMap,
  onSelectCategory,
  onSelectClass,
  onSelectTag,
  onSearch,
  value,
  onChange,
}: SearchAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Build search index once when data loads ──
  const searchIndex = useMemo<SearchIndex | null>(() => {
    if (allClasses.length === 0) return null;
    return buildSearchIndex(allClasses, providerMap);
  }, [allClasses, providerMap]);

  // ── Load recent searches from localStorage ──
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) setRecentSearches(parsed.slice(0, MAX_RECENT));
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const saveRecent = useCallback((query: string) => {
    const q = query.trim();
    if (!q || q.length < 2) return;
    setRecentSearches((prev) => {
      const filtered = prev.filter((r) => r !== q);
      const next = [q, ...filtered].slice(0, MAX_RECENT);
      try {
        localStorage.setItem(RECENT_KEY, JSON.stringify(next));
      } catch {
        // Ignore
      }
      return next;
    });
  }, []);

  const removeRecent = useCallback((query: string) => {
    setRecentSearches((prev) => {
      const next = prev.filter((r) => r !== query);
      try {
        localStorage.setItem(RECENT_KEY, JSON.stringify(next));
      } catch {
        // Ignore
      }
      return next;
    });
  }, []);

  // ── Debounce ──
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedQuery(value);
    }, DEBOUNCE_MS);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [value]);

  // ── Autocomplete results ──
  const acResult = useMemo<AutocompleteResult>(() => {
    if (!searchIndex || !debouncedQuery.trim()) {
      return { categories: [], tags: [], classes: [] };
    }
    return autocomplete(searchIndex, debouncedQuery);
  }, [searchIndex, debouncedQuery]);

  // ── Flatten items for keyboard navigation ──
  const flatItems = useMemo<FlatItem[]>(() => {
    const items: FlatItem[] = [];
    const q = debouncedQuery.trim();

    if (!q) {
      // Show recent searches when empty
      for (const recent of recentSearches) {
        items.push({ type: "recent", label: recent, recentQuery: recent });
      }
      return items;
    }

    // Categories
    for (const cat of acResult.categories) {
      items.push({ type: "category", suggestion: cat, label: cat.label });
    }

    // Tags
    for (const tag of acResult.tags) {
      items.push({ type: "tag", suggestion: tag, label: tag.label });
    }

    // Classes
    for (const cls of acResult.classes) {
      items.push({ type: "class", suggestion: cls, label: cls.label });
    }

    // "Search for X" at the bottom
    items.push({ type: "search-for", label: q });

    return items;
  }, [debouncedQuery, acResult, recentSearches]);

  // ── Reset highlight when results change ──
  useEffect(() => {
    setHighlightIndex(-1);
  }, [flatItems]);

  // ── Handle selection ──
  const handleSelect = useCallback(
    (item: FlatItem) => {
      setIsOpen(false);

      switch (item.type) {
        case "recent":
          onChange(item.recentQuery || "");
          onSearch(item.recentQuery || "");
          break;
        case "category":
          saveRecent(item.label);
          onChange("");
          onSelectCategory(item.label);
          break;
        case "tag":
          saveRecent(item.label);
          onChange("");
          onSelectTag(item.label);
          break;
        case "class":
          saveRecent(item.label);
          onChange("");
          if (item.suggestion?.classId) {
            onSelectClass(item.suggestion.classId);
          }
          break;
        case "search-for":
          saveRecent(item.label);
          onSearch(item.label);
          break;
      }

      inputRef.current?.blur();
    },
    [onChange, onSearch, onSelectCategory, onSelectClass, onSelectTag, saveRecent]
  );

  // ── Keyboard handler ──
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen) {
        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
          setIsOpen(true);
          e.preventDefault();
          return;
        }
      }

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setHighlightIndex((prev) =>
            prev < flatItems.length - 1 ? prev + 1 : 0
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setHighlightIndex((prev) =>
            prev > 0 ? prev - 1 : flatItems.length - 1
          );
          break;
        case "Enter":
          e.preventDefault();
          if (highlightIndex >= 0 && highlightIndex < flatItems.length) {
            handleSelect(flatItems[highlightIndex]);
          } else if (value.trim()) {
            saveRecent(value.trim());
            onSearch(value.trim());
            setIsOpen(false);
            inputRef.current?.blur();
          }
          break;
        case "Escape":
          setIsOpen(false);
          inputRef.current?.blur();
          break;
      }
    },
    [isOpen, flatItems, highlightIndex, handleSelect, value, onSearch, saveRecent]
  );

  // ── Click outside to close ──
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ── Scroll highlighted item into view ──
  useEffect(() => {
    if (highlightIndex < 0 || !dropdownRef.current) return;
    const items = dropdownRef.current.querySelectorAll("[data-acitem]");
    const target = items[highlightIndex] as HTMLElement | undefined;
    if (target) {
      target.scrollIntoView({ block: "nearest" });
    }
  }, [highlightIndex]);

  const hasContent = flatItems.length > 0;
  const showDropdown = isOpen && hasContent;

  return (
    <div ref={containerRef} style={{ position: "relative", flex: 1, maxWidth: "540px" }}>
      <style>{`
        .tumbo-ac-dropdown {
          position: absolute;
          top: calc(100% + 6px);
          left: 0;
          right: 0;
          background: white;
          border-radius: 16px;
          box-shadow: 0 8px 40px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06);
          overflow: hidden;
          z-index: 100;
          opacity: 0;
          transform: translateY(-4px);
          pointer-events: none;
          transition: opacity 0.15s ease, transform 0.15s ease;
        }
        .tumbo-ac-dropdown.open {
          opacity: 1;
          transform: translateY(0);
          pointer-events: auto;
        }
        .tumbo-ac-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 16px;
          cursor: pointer;
          transition: background-color 0.08s ease;
          font-size: 14px;
          color: #1a1a1a;
          line-height: 1.3;
        }
        .tumbo-ac-item:hover,
        .tumbo-ac-item.highlighted {
          background-color: #f5f5f5;
        }
        .tumbo-ac-section-label {
          padding: 10px 16px 4px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: #999;
        }
        .tumbo-ac-section-label:not(:first-child) {
          border-top: 1px solid #f0f0f0;
          margin-top: 4px;
          padding-top: 12px;
        }
        .tumbo-ac-pill {
          display: inline-flex;
          align-items: center;
          padding: 2px 8px;
          border-radius: 100px;
          font-size: 11px;
          font-weight: 600;
          white-space: nowrap;
          line-height: 1.4;
        }
        .tumbo-ac-icon {
          flex-shrink: 0;
          width: 18px;
          height: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #999;
        }
        .tumbo-ac-meta {
          margin-left: auto;
          font-size: 12px;
          color: #999;
          flex-shrink: 0;
        }
        .tumbo-ac-recent-remove {
          opacity: 0;
          transition: opacity 0.1s;
          background: none;
          border: none;
          cursor: pointer;
          color: #999;
          font-size: 16px;
          padding: 2px 6px;
          line-height: 1;
        }
        .tumbo-ac-item:hover .tumbo-ac-recent-remove {
          opacity: 1;
        }
      `}</style>

      {/* Search input container */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          background: "var(--color-bg-card)",
          border: "1.5px solid var(--color-shadow-md)",
          borderRadius: "100px",
          overflow: "hidden",
          transition: "border-color 0.15s, box-shadow 0.15s",
          ...(isOpen
            ? {
                borderColor: "var(--tumbo-orange, #FF6B35)",
                boxShadow: "0 0 0 3px rgba(255, 107, 53, 0.1)",
              }
            : {}),
        }}
      >
        <div
          style={{
            padding: "0 16px",
            display: "flex",
            alignItems: "center",
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--color-neutral-400)"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
        <input
          ref={inputRef}
          type="text"
          placeholder="Search classes, activities, providers..."
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            fontSize: "14px",
            padding: "13px 0",
            background: "transparent",
            color: "var(--color-text-primary)",
            fontFamily: "inherit",
          }}
          autoComplete="off"
          spellCheck={false}
        />
        {value && (
          <button
            onClick={() => {
              onChange("");
              setIsOpen(false);
              inputRef.current?.focus();
            }}
            style={{
              padding: "0 14px",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "var(--color-neutral-400)",
              fontSize: "18px",
            }}
            aria-label="Clear search"
          >
            &times;
          </button>
        )}
      </div>

      {/* Dropdown */}
      <div
        ref={dropdownRef}
        className={`tumbo-ac-dropdown ${showDropdown ? "open" : ""}`}
        style={{ maxHeight: DROPDOWN_MAX_HEIGHT, overflowY: "auto" }}
        role="listbox"
      >
        {renderDropdownContent(
          flatItems,
          debouncedQuery,
          highlightIndex,
          handleSelect,
          acResult,
          removeRecent
        )}
      </div>
    </div>
  );
}

// ── Dropdown content renderer ──

function renderDropdownContent(
  flatItems: FlatItem[],
  query: string,
  highlightIndex: number,
  onSelect: (item: FlatItem) => void,
  acResult: AutocompleteResult,
  onRemoveRecent: (q: string) => void
): React.ReactNode {
  if (flatItems.length === 0) return null;

  const q = query.trim();
  const sections: React.ReactNode[] = [];
  let itemIndex = 0;

  // Recent searches (when no query)
  if (!q && flatItems.some((f) => f.type === "recent")) {
    sections.push(
      <div key="recent-label" className="tumbo-ac-section-label">
        Recent searches
      </div>
    );
    for (const item of flatItems.filter((f) => f.type === "recent")) {
      const idx = itemIndex;
      sections.push(
        <div
          key={`recent-${item.label}`}
          className={`tumbo-ac-item ${highlightIndex === idx ? "highlighted" : ""}`}
          data-acitem
          onClick={() => onSelect(item)}
          onMouseEnter={() => {}}
          role="option"
          aria-selected={highlightIndex === idx}
        >
          <div className="tumbo-ac-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <span style={{ flex: 1 }}>{item.label}</span>
          <button
            className="tumbo-ac-recent-remove"
            onClick={(e) => {
              e.stopPropagation();
              onRemoveRecent(item.label);
            }}
            aria-label={`Remove ${item.label} from recent`}
          >
            &times;
          </button>
        </div>
      );
      itemIndex++;
    }
    return sections;
  }

  // Categories section
  if (acResult.categories.length > 0) {
    sections.push(
      <div key="cat-label" className="tumbo-ac-section-label">
        Categories
      </div>
    );
    for (const item of flatItems.filter((f) => f.type === "category")) {
      const idx = itemIndex;
      sections.push(
        <div
          key={`cat-${item.label}`}
          className={`tumbo-ac-item ${highlightIndex === idx ? "highlighted" : ""}`}
          data-acitem
          onClick={() => onSelect(item)}
          role="option"
          aria-selected={highlightIndex === idx}
        >
          <div className="tumbo-ac-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
          </div>
          <span style={{ fontWeight: 500 }}>{item.label}</span>
          <span className="tumbo-ac-meta">
            {item.suggestion?.count} classes
          </span>
        </div>
      );
      itemIndex++;
    }
  }

  // Tags section
  if (acResult.tags.length > 0) {
    sections.push(
      <div key="tag-label" className="tumbo-ac-section-label">
        Tags
      </div>
    );
    for (const item of flatItems.filter((f) => f.type === "tag")) {
      const idx = itemIndex;
      const dim = item.suggestion?.dimension || "content";
      const color = DIMENSION_COLORS[dim] || DIMENSION_COLORS.content;
      sections.push(
        <div
          key={`tag-${item.label}`}
          className={`tumbo-ac-item ${highlightIndex === idx ? "highlighted" : ""}`}
          data-acitem
          onClick={() => onSelect(item)}
          role="option"
          aria-selected={highlightIndex === idx}
        >
          <div className="tumbo-ac-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
              <line x1="7" y1="7" x2="7.01" y2="7" />
            </svg>
          </div>
          <span style={{ fontWeight: 500 }}>{item.label}</span>
          <span
            className="tumbo-ac-pill"
            style={{
              background: color + "18",
              color: color,
              marginLeft: "auto",
            }}
          >
            {dim}
          </span>
        </div>
      );
      itemIndex++;
    }
  }

  // Classes section
  if (acResult.classes.length > 0) {
    sections.push(
      <div key="cls-label" className="tumbo-ac-section-label">
        Classes
      </div>
    );
    for (const item of flatItems.filter((f) => f.type === "class")) {
      const idx = itemIndex;
      sections.push(
        <div
          key={`cls-${item.suggestion?.classId || item.label}`}
          className={`tumbo-ac-item ${highlightIndex === idx ? "highlighted" : ""}`}
          data-acitem
          onClick={() => onSelect(item)}
          role="option"
          aria-selected={highlightIndex === idx}
        >
          <div className="tumbo-ac-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {item.label}
            </div>
            {item.suggestion?.provider && (
              <div style={{ fontSize: 12, color: "#999", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                by {item.suggestion.provider}
              </div>
            )}
          </div>
          {item.suggestion?.category && (
            <span
              className="tumbo-ac-pill"
              style={{
                background: "#f0f0f0",
                color: "#666",
              }}
            >
              {item.suggestion.category}
            </span>
          )}
        </div>
      );
      itemIndex++;
    }
  }

  // "Search for X" at the bottom
  const searchForItem = flatItems.find((f) => f.type === "search-for");
  if (searchForItem) {
    const idx = itemIndex;
    sections.push(
      <div
        key="search-for"
        style={{
          borderTop: "1px solid #f0f0f0",
          marginTop: 4,
        }}
      >
        <div
          className={`tumbo-ac-item ${highlightIndex === idx ? "highlighted" : ""}`}
          data-acitem
          onClick={() => onSelect(searchForItem)}
          role="option"
          aria-selected={highlightIndex === idx}
        >
          <div className="tumbo-ac-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <span>
            Search for <strong>&ldquo;{searchForItem.label}&rdquo;</strong>
          </span>
          <span className="tumbo-ac-meta" style={{ fontSize: 11 }}>
            Enter
          </span>
        </div>
      </div>
    );
  }

  return sections;
}
