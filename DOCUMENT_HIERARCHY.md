# 📚 Document Hierarchy & Purpose

## How Documents Influence Your Workflow

### 🤖 AI Assistant Context (What I See)
```
┌─────────────────────────────────────┐
│ 1. CLAUDE.md (Always loaded)        │ ← I ALWAYS see this
│    - Technical constraints          │
│    - Project overview               │
│    - "Never use Turbopack"         │
└─────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────┐
│ 2. .cursorrules (When using Cursor) │ ← Cursor-specific
│    - Code style preferences         │
│    - Language patterns              │
└─────────────────────────────────────┘
```

### 📋 Strategic Documents (Manual Reference)
```
┌─────────────────────────────────────┐
│ APPROACH.md                         │ ← Our roadmap
│ - Phases & timeline                 │
│ - Design-first strategy             │
│ - What to build when                │
└─────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────┐
│ PLATFORM_REQUIREMENTS.md            │ ← Business requirements
│ - Legal & compliance                │
│ - Trust & safety                    │
│ - Growth features                   │
└─────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────┐
│ TECHNICAL_HEALTH.md                 │ ← Quality checklist
│ - Security checklist                │
│ - SEO checklist                     │
│ - Performance targets               │
└─────────────────────────────────────┘
```

### 🔄 Working Documents
```
┌─────────────────────────────────────┐
│ TodoWrite() Function                │ ← In-memory only!
│ - Current session tasks             │
│ - NOT saved to file                 │
│ - Resets each conversation          │
└─────────────────────────────────────┘
```

---

## 🚨 THE TRUTH: Current Gaps

### What's Actually Happening:
1. **CLAUDE.md** - ✅ I read this and follow it (no Turbopack, functional programming)
2. **APPROACH.md** - ❌ I only see this if you mention it or I search for it
3. **PLATFORM_REQUIREMENTS.md** - ❌ Not automatically considered
4. **TECHNICAL_HEALTH.md** - ❌ Not automatically checked
5. **Todo List** - ⚠️ Only exists in memory during our conversation, NOT saved!

### What This Means:
- **You're right to be concerned!** 
- When you ask for "small tweaks", I'm not checking against the bigger picture
- We could be building things that contradict our strategy

---

## 🎯 SOLUTION: Master Control Document

Let's create a single source of truth that I ALWAYS check: