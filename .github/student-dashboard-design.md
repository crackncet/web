# Student Dashboard — Mobile-First Design System

> **Mandatory Reference**: Every UI component built for the student dashboard MUST follow this document. No exceptions. This document supersedes any ad-hoc design decisions.

---

## 1. Core Philosophy

The student dashboard is built for **Indian competitive exam aspirants** who primarily use **Android smartphones** (5–6.7″ screens, 360–412px viewport width). Desktop is a secondary consideration.

### Design Priorities (in order)

1. **Thumb-reachable** — All primary actions in the lower 60% of the screen
2. **Single-hand operable** — No critical action requires a stretch to the top-left corner
3. **Data-light** — Minimal payload, lazy-load everything below the fold
4. **Landscape-aware** — Video, PDF notes, and test-taking screens MUST support forced landscape mode

---

## 2. Breakpoint Strategy

We use Tailwind's default breakpoints with a mobile-first cascade:

| Token | Width | Target Device | Layout Behaviour |
|-------|-------|---------------|------------------|
| `<sm` (default) | 0 – 639px | Phones (portrait) | Single column, bottom nav, stacked cards |
| `sm` | 640px+ | Large phones / small tablets | Minor spacing adjustments only |
| `md` | 768px+ | Tablets (portrait), phones (landscape) | Two-column grids begin, sidebar appears |
| `lg` | 1024px+ | Tablets (landscape), laptops | Full sidebar visible, 3-column grids |

> [!IMPORTANT]
> **Default styles are ALWAYS for mobile**. Never write base styles for desktop and then override downward. Every Tailwind class without a breakpoint prefix targets the phone viewport.

---

## 3. Navigation Architecture

### 3.1 Mobile (`<md`): Bottom Tab Bar

The sidebar is **completely hidden** on mobile. Navigation is a fixed bottom tab bar with 5 items max:

```
┌──────────────────────────────────────────┐
│                                          │
│           [Page Content Area]            │
│                                          │
├──────────────────────────────────────────┤
│  🏠       📚      📝      💬      👤    │
│  Home   Courses  Tests  Queries  Profile │
└──────────────────────────────────────────┘
```

**Rules:**
- Fixed to viewport bottom: `fixed bottom-0 left-0 right-0 z-50`
- Height: `h-16` (64px) — minimum iOS safe-area compliant
- Add `pb-[env(safe-area-inset-bottom)]` for notched devices
- Background: `bg-background/95 backdrop-blur-lg border-t border-border`
- Active tab uses `text-primary` with a subtle pill indicator behind the icon
- Icons: 24px (`h-6 w-6`), labels: 10px (`text-[10px]`)
- Content area must have `pb-20` to account for bottom nav height

### 3.2 Desktop (`md+`): Collapsible Sidebar

On `md+` breakpoints, the existing `SidebarProvider` + `AppSidebar` pattern activates. The bottom tab bar is hidden (`hidden md:hidden` becomes `md:flex` for sidebar).

**Rules:**
- Bottom tab bar: `flex md:hidden`
- Sidebar: `hidden md:flex`
- The `SidebarTrigger` in the top header is only visible at `md+`

### 3.3 Top Header Bar

| Viewport | Behaviour |
|----------|-----------|
| `<md` | Minimal: logo (left), notification bell + avatar (right). Height: `h-14`. No hamburger. |
| `md+` | Standard: sidebar trigger, breadcrumb/page title, actions. Height: `h-16`. |

---

## 4. Page Layouts

### 4.1 Dashboard Home (`/dashboard/student`)

The home page is a scrollable feed of cards. No tabs, no complex navigation.

**Mobile Layout (single column):**

```
┌─────────────────────────────────────┐
│ 👋 Hi, Rahul                        │   ← Greeting + streak
│ 🔥 5-day streak                     │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ 📊 Quick Stats                  │ │   ← Horizontal scroll of stat chips
│ │ [Courses: 3] [Tests: 12] [..]  │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ 📅 Upcoming                     │ │   ← Next test / next live lecture
│ │ JEE Mock Test #4                │ │
│ │ Tomorrow, 10:00 AM              │ │
│ │ [Start Test →]                  │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ 📖 Continue Learning            │ │   ← Last accessed topic
│ │ Physics → Optics → Refraction  │ │
│ │ [Resume →]                      │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

**Desktop Layout (`lg+`): 12-column grid**

```
┌────────────────────────────────────────────────────────┐
│  col-span-8                    │  col-span-4           │
│  ┌────────────────────────┐    │  ┌──────────────────┐ │
│  │ Quick Stats (row)      │    │  │ Upcoming          │ │
│  └────────────────────────┘    │  │ (sidebar card)    │ │
│  ┌────────────────────────┐    │  └──────────────────┘ │
│  │ Continue Learning      │    │  ┌──────────────────┐ │
│  │ (wider card)           │    │  │ Analytics brief   │ │
│  └────────────────────────┘    │  └──────────────────┘ │
└────────────────────────────────────────────────────────┘
```

### 4.2 My Courses (`/dashboard/student/my-courses`)

**Mobile:** Vertical list of course cards. Each card shows:
- Course banner (aspect-[16/9], rounded-xl, object-cover)
- Title (text-base font-semibold, line-clamp-1)
- Exam badge + enrolled date
- Progress bar (if applicable)
- Full-width tap target → navigates to course detail

**Desktop (`lg+`):** `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4`

### 4.3 Course Detail (`/dashboard/student/my-courses/[courseId]`)

**Mobile:** Vertical accordion of subjects → chapters → topics.

```
┌─────────────────────────────────────┐
│ ← Back          Course Title        │   ← Sticky header
├─────────────────────────────────────┤
│ [Subject Tabs — horizontal scroll]  │   ← Pill tabs, sticky below header
├─────────────────────────────────────┤
│ ▶ Chapter 1: Mechanics             │
│   ├ Topic 1: Newton's Laws    📹🗒  │   ← Icons for available materials
│   ├ Topic 2: Friction         📹   │
│   └ Topic 3: Circular Motion  🔒   │   ← Lock if scheduled_unlock_at > now
│ ▶ Chapter 2: Thermodynamics        │
│   └ ...                            │
└─────────────────────────────────────┘
```

**Topic Tap → opens a bottom sheet** (on mobile) with:
- Video lecture button (if videoLectureId)
- Notes button (if notesAssetId)
- DPP Practice button (if dppBankId)
- Live lecture info (if liveLectureId)

**Desktop:** Same structure but topic tap opens an inline right panel instead of a bottom sheet.

### 4.4 Video Player Page

> [!CAUTION]
> **This page MUST support landscape mode.** On mobile, when the user taps fullscreen or rotates their device, the player must fill the viewport. Use `screen.orientation.lock('landscape')` when entering fullscreen on supported browsers.

**Mobile Portrait Layout:**

```
┌─────────────────────────────────────┐
│ ┌─────────────────────────────────┐ │
│ │        Video Player             │ │   ← aspect-video, sticky top
│ │        (16:9)                   │ │
│ └─────────────────────────────────┘ │
│ Video Title                         │
│ Subject → Chapter → Topic           │
├─────────────────────────────────────┤
│ [Notes 📄]  [DPP 📝]  [Share 🔗]   │   ← Action chips below player
├─────────────────────────────────────┤
│ Related Topics in this Chapter      │
│ ├ Topic 1 (current)                 │
│ ├ Topic 2                           │
│ └ Topic 3                           │
└─────────────────────────────────────┘
```

**Mobile Landscape / Fullscreen:**
- Video player takes 100vw × 100vh
- Overlay controls: play/pause center, seek bar bottom, back button top-left
- No chrome, no header, no bottom nav
- Exit fullscreen returns to portrait layout

**Desktop:** Side-by-side layout:
```
┌──────────────────────────────────────────────────┐
│  col-span-8                │  col-span-4         │
│  ┌──────────────────────┐  │  Related Topics     │
│  │ Video Player (16:9)  │  │  ├ Topic 1          │
│  └──────────────────────┘  │  ├ Topic 2          │
│  Title + Actions            │  └ Topic 3          │
└──────────────────────────────────────────────────┘
```

### 4.5 Notes / PDF Viewer Page

> [!CAUTION]
> **PDF/Notes viewer MUST support landscape mode** for readability on mobile. Use the same orientation lock strategy as the video player.

**Mobile Portrait:** Full-width embedded PDF viewer (iframe or react-pdf) with:
- Sticky top bar: back, title, download button
- Pinch-to-zoom enabled
- Landscape prompt toast on load: "Rotate your device for better reading"

**Mobile Landscape:** Full viewport PDF, no chrome.

**Desktop:** Centered max-width container with page navigation sidebar.

### 4.6 My Test Series (`/dashboard/student/my-test-series`)

Same card-list pattern as My Courses. Each card shows:
- Test series banner
- Name + exam badge
- Total tests count + next upcoming test date
- Tap → navigates to test series detail

### 4.7 Test Series Detail (`/dashboard/student/my-test-series/[testSeriesId]`)

**Mobile:** List of test cards sorted by scheduled date.

```
┌─────────────────────────────────────┐
│ ← Back     Test Series Name         │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ 📝 JEE Mock Test #4            │ │
│ │ 📅 Jun 15, 10:00 AM            │ │
│ │ ⏱ 180 min                      │ │
│ │ Status: ● Upcoming             │ │
│ │ [Start Test]                    │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ 📝 JEE Mock Test #3            │ │
│ │ Status: ✅ Completed            │ │
│ │ Score: 245/360                  │ │
│ │ [View Analysis]                 │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### 4.8 CBT Test-Taking Screen

> [!CAUTION]
> **The test screen MUST lock to landscape orientation** on mobile devices. Portrait is NOT acceptable for test-taking. The UI is designed exclusively for horizontal screens.

**Landscape Layout (Mobile & Desktop unified):**

```
┌──────────────────────────────────────────────────────────────┐
│ Timer: 02:45:30    │   Q 14 of 90    │  [Flag] [Clear] [Sub]│
├────────────────────┼─────────────────────────────────────────┤
│ Question Navigator │                                         │
│ [1][2][3][4]       │   Question text goes here...            │
│ [5][6][7][8]       │                                         │
│ ...                │   (A) Option A                          │
│                    │   (B) Option B                          │
│ Legend:            │   (C) Option C                          │
│ ● Answered         │   (D) Option D                          │
│ ○ Unanswered       │                                         │
│ 🚩 Flagged         │   [< Prev]                   [Next >]  │
└────────────────────┴─────────────────────────────────────────┘
```

**Rules:**
- Question navigator is a collapsible left panel (toggle via hamburger on very small landscape screens)
- Timer is always visible, fixed position
- Swipe left/right between questions on touch devices
- No bottom nav, no header, no sidebar — full immersive mode
- Submit button requires a confirmation modal

### 4.9 Queries Page (`/dashboard/student/queries`)

**Mobile:** Simple chat-like interface.
- List of past queries as cards (title, status badge, date)
- FAB button (bottom-right, above bottom nav) to create new query
- New query form: full-screen modal sheet

**Desktop:** Split view — query list on left, detail/form on right.

### 4.10 Analytics Page (`/dashboard/student/analytics`)

**Mobile:** Vertically stacked metric cards and charts.
- Use horizontal scroll for multi-metric stat rows
- Charts: full-width, aspect-[4/3], with touch-friendly tooltips
- Tab pills for switching between Course analytics and Test analytics

**Desktop:** Grid layout with charts side by side.

---

## 5. Component Specifications

### 5.1 Card Component (Mobile Standard)

```
Padding:       p-4 (16px)
Border Radius: rounded-xl (12px)
Background:    bg-card
Border:        border border-border
Shadow:        shadow-sm
Spacing:       gap-3 between cards (space-y-3)
Tap target:    min-h-[44px] for any interactive element inside
```

### 5.2 Bottom Sheet (Mobile Only)

Used for: topic actions, filters, confirmations.

```
Overlay:       bg-black/40 backdrop-blur-sm
Sheet:         bg-background rounded-t-2xl
Handle:        w-10 h-1 bg-muted-foreground/30 rounded-full mx-auto mt-2
Max height:    max-h-[85vh]
Drag:          Swipe down to dismiss
```

### 5.3 Stat Chip

```
Layout:        inline-flex items-center gap-1.5 px-3 py-1.5
Background:    bg-primary/10
Text:          text-xs font-medium text-primary
Border Radius: rounded-full
```

### 5.4 Progress Bar

```
Track:         h-1.5 bg-muted rounded-full
Fill:          h-1.5 bg-primary rounded-full transition-all duration-500
```

### 5.5 Touch Targets

> [!WARNING]
> **Every interactive element MUST have a minimum touch target of 44×44px** (Apple HIG / Google Material guideline). This includes buttons, links, icons, list items, and tabs. Use padding to achieve this even if the visual element is smaller.

---

## 6. Spacing & Typography Scale

### Spacing (mobile-first)

| Token | Mobile | Desktop (`lg+`) |
|-------|--------|-----------------|
| Page padding | `px-4` (16px) | `px-6` (24px) |
| Section gap | `space-y-4` (16px) | `space-y-6` (24px) |
| Card internal | `p-4` (16px) | `p-5` (20px) |
| Grid gap | `gap-3` (12px) | `gap-4` (16px) |

### Typography

| Element | Mobile | Desktop |
|---------|--------|---------|
| Page title | `text-xl font-bold` | `text-2xl font-bold` |
| Section title | `text-base font-semibold` | `text-lg font-semibold` |
| Card title | `text-sm font-semibold` | `text-base font-semibold` |
| Body text | `text-sm` | `text-sm` |
| Caption/meta | `text-xs text-muted-foreground` | `text-xs text-muted-foreground` |

---

## 7. Orientation & Immersive Mode Rules

### Screens that MUST support forced landscape:

| Screen | Trigger | Behaviour |
|--------|---------|-----------|
| Video Player (fullscreen) | Tap fullscreen icon or rotate device | Lock to landscape, hide all chrome |
| PDF/Notes Viewer (fullscreen) | Tap fullscreen icon or rotate device | Lock to landscape, hide all chrome |
| CBT Test Screen | On entry | Force landscape, no portrait allowed |

### Implementation Pattern:

```typescript
// Hook: useOrientationLock.ts
const lockLandscape = async () => {
  try {
    await screen.orientation.lock("landscape");
  } catch {
    // Graceful fallback: show a "please rotate" overlay
  }
};

const unlockOrientation = () => {
  try {
    screen.orientation.unlock();
  } catch {}
};
```

**Chrome Hiding Rules:**
- When in immersive mode: hide bottom tab bar, hide top header
- Use a layout context flag: `isImmersive` from `StudentLayoutContext`
- Components check `isImmersive` and conditionally render

---

## 8. Loading & Empty States

### Skeleton Rules

- Use `animate-pulse` skeletons matching the exact layout of the loaded content
- Cards: rounded-xl skeleton with inner line skeletons
- Lists: 3–5 skeleton items
- Never show a blank white screen

### Empty State Rules

- Center-aligned illustration (use `lucide-react` icons at 48px) + message
- Message: `text-sm text-muted-foreground text-center`
- CTA button below if applicable (e.g., "Browse Courses")

---

## 9. Color & Theme Consistency

Use ONLY the design tokens from `globals.css`. Never hardcode colors.

| Purpose | Token |
|---------|-------|
| Primary action | `bg-primary text-primary-foreground` |
| Secondary surface | `bg-secondary text-secondary-foreground` |
| Muted text | `text-muted-foreground` |
| Card background | `bg-card` |
| Borders | `border-border` |
| Destructive | `bg-destructive text-destructive-foreground` |
| Success (custom) | `text-emerald-600 dark:text-emerald-400` |
| Warning (custom) | `text-amber-600 dark:text-amber-400` |

---

## 10. Performance Rules

1. **Images**: All banners use `next/image` with `sizes` prop matching breakpoints. Use `placeholder="blur"` where possible.
2. **Lists**: Virtualize any list > 20 items (use `@tanstack/react-virtual`).
3. **Code-split**: Use `next/dynamic` for:
   - Video player component
   - PDF viewer component
   - Charts / analytics components
   - CBT test engine
4. **Prefetch**: Prefetch the next likely page using `<Link prefetch>`.
5. **API**: Use TanStack Query with `staleTime: 5 * 60 * 1000` (5 min) for enrollment data.

---

## 11. Accessibility Checklist

- [ ] All interactive elements have 44×44px minimum touch targets
- [ ] Focus ring visible on all focusable elements
- [ ] Color contrast ratio ≥ 4.5:1 for text, ≥ 3:1 for large text
- [ ] Screen reader labels on icon-only buttons (`aria-label`)
- [ ] Bottom sheet has `role="dialog"` and focus trap
- [ ] Video player has keyboard controls and captions support
- [ ] Test question navigation is keyboard accessible

---

## 12. File Structure Convention

```
web/app/dashboard/student/
├── layout.tsx                         # Layout with bottom nav + sidebar toggle
├── page.tsx                           # Dashboard home
├── _components/
│   ├── student-sidebar.tsx            # Desktop sidebar (existing)
│   ├── bottom-nav.tsx                 # Mobile bottom tab bar
│   ├── student-header.tsx             # Top header bar
│   └── orientation-overlay.tsx        # "Please rotate" overlay
├── _store/
│   └── student-ui.store.ts           # Zustand: isImmersive, activeTab, etc.
├── my-courses/
│   ├── page.tsx
│   ├── _components/
│   │   ├── course-card.tsx
│   │   └── course-card-skeleton.tsx
│   ├── _api/
│   │   └── classroom.api.ts
│   ├── _queries/
│   │   └── classroom.queries.ts
│   └── [courseId]/
│       ├── page.tsx                   # Course syllabus detail
│       ├── _components/
│       │   ├── subject-tabs.tsx
│       │   ├── chapter-accordion.tsx
│       │   ├── topic-row.tsx
│       │   └── topic-action-sheet.tsx
│       └── topics/
│           └── [topicId]/
│               ├── video/page.tsx     # Video player page
│               └── notes/page.tsx     # PDF viewer page
├── my-test-series/
│   ├── page.tsx
│   ├── _components/
│   │   ├── test-series-card.tsx
│   │   └── test-series-card-skeleton.tsx
│   └── [testSeriesId]/
│       ├── page.tsx                   # Test list
│       └── _components/
│           └── test-card.tsx
├── queries/
│   └── page.tsx
└── analytics/
    └── page.tsx
```

---

## 13. Implementation Checklist (Build Order)

> [!TIP]
> Build mobile-only first. Do NOT add desktop breakpoints until the mobile UI is fully functional and reviewed.

### Phase 1: Shell & Navigation
- [ ] Bottom tab bar component
- [ ] Refactor layout.tsx to conditionally show bottom nav vs sidebar
- [ ] Student header (minimal mobile version)
- [ ] `isImmersive` context in StudentLayoutContext

### Phase 2: Dashboard Home
- [ ] Greeting card
- [ ] Quick stats horizontal scroll
- [ ] Upcoming test/lecture card
- [ ] Continue learning card

### Phase 3: My Courses
- [ ] API layer (`_api/classroom.api.ts`)
- [ ] TanStack queries (`_queries/classroom.queries.ts`)
- [ ] Course card + skeleton
- [ ] Course list page (mobile)

### Phase 4: Course Detail
- [ ] Subject tabs (horizontal scroll pills)
- [ ] Chapter accordion
- [ ] Topic row with material icons
- [ ] Topic action bottom sheet

### Phase 5: Video Player
- [ ] Video player page with streaming proxy
- [ ] Fullscreen / landscape lock
- [ ] Related topics sidebar (mobile: below, desktop: right panel)

### Phase 6: Notes Viewer
- [ ] PDF viewer with pinch-to-zoom
- [ ] Fullscreen / landscape lock
- [ ] Download button

### Phase 7: My Test Series
- [ ] Test series card + list page
- [ ] Test series detail with test cards

### Phase 8: Desktop Breakpoints
- [ ] Add `md:` and `lg:` overrides to all Phase 1–7 components
- [ ] Grid layouts for cards
- [ ] Side panels instead of bottom sheets

### Phase 9: Analytics & Queries
- [ ] Analytics charts page
- [ ] Query list + creation form

### Phase 10: CBT Test Engine
- [ ] Landscape-locked test shell
- [ ] Question navigator panel
- [ ] Timer component
- [ ] Question display + option selection
- [ ] Submission flow
