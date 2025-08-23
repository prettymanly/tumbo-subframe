# 1. Class Detail Info Card Redesign

**Date**: 2024-08-22  
**Designer**: User  
**Status**: Planning  

---

## 🎯 WHY: Problems Being Solved

### Current Issues:
1. **Visual Misalignment** - Info card sits too high, doesn't align with main content flow
2. **Button Hierarchy** - "Follow" button in white doesn't match other secondary actions
3. **Missing Functionality** - "Message" button exists but no messaging system
4. **Lost Context on Scroll** - Key booking info disappears when scrolling (desktop)
5. **Mobile Flow Issues** - Info card placement could be better optimized
6. **Missing Business Owner CTA** - No way for providers to claim their listings
7. **Bland Presentation** - Could use more personality/branding

### User Impact:
- Parents lose sight of key details (price, schedule) while reading reviews
- Confusion from non-functional "Message" button
- Providers have no way to take ownership of their listings

---

## 🎨 WHAT: Design Changes

### Visual Alignment
- **Top of info card** aligns with **"Where creativity meets confidence" component**
- Creates better visual flow between main content and sidebar

### Sticky Behavior
- **Desktop**: Info card becomes sticky on scroll, key details always visible
- **Mobile**: Info card repositioned between title/tags and vibe component

### Branding Touch
- **Orange hand PNG** holding the card from right side of page
- Adds personality and reinforces Tümbo branding
- Subtle, not overwhelming

### Button Hierarchy Fix
- **"Follow"** changes from white to grey (matches Message/Website styling)
- **Remove "Message"** button (non-functional)
- Keep: Follow, Website

### Provider Ownership
- **Add above "Report listing"**: "Claim this page if you're the business"
- Similar styling to report link
- Encourages provider engagement

### Mobile Optimization
- Info card moves to logical position in mobile flow
- Between hero/title section and detailed content

---

## 🔄 TRADEOFFS CONSIDERED

### Minimal Tradeoffs:
- **Orange hand** could be seen as "too playful" for serious parents
  - **Mitigation**: Keep it subtle, tasteful design
- **Sticky behavior** might feel intrusive on some screen sizes
  - **Mitigation**: Only on desktop, reasonable breakpoints
- **"Claim this page"** might confuse non-business visitors
  - **Mitigation**: Clear, professional wording

### No Significant Tradeoffs:
- Alignment fix is pure UX improvement
- Button hierarchy fix reduces confusion
- Mobile reordering improves flow

---

## 📱 RESPONSIVE STRATEGY

### Desktop (>1024px):
- Info card sticky on scroll
- Orange hand visible
- Full button set (Follow, Website)

### Tablet (768-1024px):
- Info card sticky behavior
- Smaller orange hand or hidden
- Same button set

### Mobile (<768px):
- Info card repositioned (not sticky)
- No orange hand
- Stacked button layout

---

## 🎯 SUCCESS CRITERIA

This design succeeds if:
- [ ] Info card top aligns with vibe component
- [ ] Sticky behavior works smoothly on desktop
- [ ] Button hierarchy is clearer
- [ ] Mobile flow feels natural
- [ ] Orange hand adds personality without overwhelming
- [ ] Provider claim CTA is discoverable

---

## 🗂️ COMPONENT DATA MAPPING

### Info Card Components & Data Sources:

#### Provider Section:
```typescript
// Data from: providers table
{
  provider_name: string;        // "Art Studio Kids"
  provider_logo: string;        // Avatar image URL
  verified_status: boolean;     // Shows "Verified" badge
  provider_slug: string;        // For Follow/Website links
  website_url?: string;         // External website
}
```

#### Class Details Section:
```typescript
// Data from: classes table
{
  price_per_class: number;      // "$25"
  age_min: number;              // "3"
  age_max: number;              // "6"
  price_range_min?: number;     // "$38"
  duration_minutes: number;     // "45 minutes"
  class_size_min: number;       // "6"
  class_size_max: number;       // "8"
  contact_phone?: string;       // "+65 1234 5678"
}
```

#### Schedule Section:
```typescript
// Data from: sessions table (joined)
{
  sessions: Array<{
    weekday: number;            // 0-6 (Sun-Sat)
    start_time: string;         // "10:00 AM"
    end_time: string;           // "10:45 AM"
    frequency: string;          // "weekly"
  }>
}
```

#### Actions Section:
```typescript
// Computed/Static
{
  is_favorited: boolean;        // User's favorite status
  can_claim: boolean;           // Show claim CTA (if not verified)
  report_url: string;           // Report listing URL
}
```

---

## 🔧 TECHNICAL CONSIDERATIONS

### Sticky Implementation:
- Use CSS `position: sticky` with proper top offset
- Respect header height and viewport constraints
- Smooth transition, no jarring movement

### Orange Hand Asset:
- Use existing: `/photos/illustrations/Class Detail Hand.png`
- Position: Right side of info card, appearing to "hold" or "pinch" the card
- Reference design: `/photos/illustrations/Class Detail Example.png`
- Should appear to grip the card from the right edge

### Mobile Repositioning:
- Use CSS Grid or Flexbox order properties
- Ensure logical tab order maintained
- Test with screen readers

---

## 📋 IMPLEMENTATION CHECKLIST

- [ ] Create orange hand asset
- [ ] Update info card positioning CSS
- [ ] Implement sticky behavior (desktop only)
- [ ] Fix button hierarchy (Follow to grey)
- [ ] Remove Message button
- [ ] Add "Claim this page" CTA
- [ ] Test responsive behavior
- [ ] Verify data mapping matches Supabase schema

---

## 🔄 NEXT STEPS

1. Get approval on this design plan
2. Create orange hand asset or find suitable stock
3. Implement changes following component documentation
4. Test across devices
5. Update COMPONENTS.md with new patterns