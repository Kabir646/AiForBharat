# NEXUS AI — Design System

> Reference this document when building or updating any page in the AiForBharat frontend.
> All pages must follow these conventions to maintain visual consistency.

---

## 0. Design Inspiration

Take direct visual inspiration from these two products when designing any page:

| Product | URL | What to borrow |
|---|---|---|
| **Linear** | [https://linear.app](https://linear.app) | Minimal dark UI, tight typography, command-palette feel, refined sidebar navigation, subtle gradients on hero sections |
| **Raycast** | [https://www.raycast.com](https://www.raycast.com) | Black background with crisp white text, glowing accents, clean card layouts, bold product screenshots as hero elements, glass-morphism effects |

### Key patterns to adopt from Linear & Raycast:
- **Sparse, intentional layouts** — don't fill space for the sake of it
- **Gradient spotlight effects** on hero sections (soft radial glows)
- **Keyboard-shortcut / badge accents** — small pill badges, monospace text for codes/ids
- **Sidebar with icon + label nav** — slim, no chunky items
- **Section transitions** using very subtle `border-t border-white/10` dividers
- **Screenshot/mockup as hero** — show the actual UI in a dark floating frame with glow
- **Micro-copy is precise** — labels are short, capitalized, high contrast

---

## 1. Design Philosophy

- **Dark-first, minimal**: Pure black (`#000`) backgrounds, white text on black.
- **Operational / military aesthetic**: Tight tracking, monospace accents, glowing status indicators.
- **No rounded-pill cards**: Prefer `rounded-2xl` or `rounded-xl` with very subtle borders.
- **Whitespace is content**: Sections are separated by generous padding (`py-20`) and `border-t border-white/10`.

---

## 2. Color System

All colors are black/white based. Use Tailwind opacity utilities — never hardcoded hex colors.

| Token | Value | Usage |
|---|---|---|
| Background | `bg-black` | Root page background |
| Surface | `bg-white/[0.02]` | Cards, panels |
| Surface elevated | `bg-[#0A0A0A]` or `bg-[#111]` | Inner cards, mockup containers |
| Border | `border-white/5` | Default card/panel borders |
| Border hover | `border-white/10` | Card hover state |
| Text primary | `text-white` | Headings |
| Text secondary | `text-white/70` | Sub-labels, icon text |
| Text muted | `text-white/40` – `text-white/50` | Body, descriptions |
| Text dim | `text-white/20` | Placeholders, bullet dots |
| Accent: green | `text-green-500`, `bg-green-500/10`, `border-green-500/20` | Status: online / success |
| Accent: amber | `text-amber-400` | Status badges, warnings |
| Accent: blue | `from-blue-500/20` | Glow effects only |
| Accent: purple | `bg-purple-500/30` | Chart bars only |

---

## 3. Typography

```
Font: system font-sans (no custom import needed)
```

| Element | Classes |
|---|---|
| Brand name | `text-xl font-semibold tracking-wide` |
| Page H1 | `text-5xl md:text-6xl font-bold tracking-tight leading-[1.1]` |
| Section H2 | `text-3xl font-semibold tracking-tight` |
| Card H3 | `text-xl font-semibold tracking-wide` |
| Card H4 | `font-semibold tracking-wide` |
| Body | `text-sm leading-relaxed text-white/40` |
| Badge / label | `text-xs font-medium uppercase tracking-wider` |

---

## 4. Layout & Spacing

- **Root wrapper**: `min-h-screen bg-black text-white font-sans selection:bg-white/20`
- **Page sections**: `w-full max-w-6xl px-6 py-20 border-t border-white/10`
- **Card grid**: `grid md:grid-cols-2 lg:grid-cols-3 gap-6`
- **Sidebar layout** (dashboard pages): fixed-width left nav + `flex-1` main content area

### Section separator pattern:
```tsx
<section className="w-full max-w-6xl px-6 py-20 border-t border-white/10">
```

---

## 5. Components

### 5.1 Header / Navbar
```tsx
<header className="flex justify-between items-center px-6 py-4 border-b border-white/5 backdrop-blur-sm sticky top-0 z-50 bg-black/80">
```
- Left: logo mark (`w-6 h-6 bg-white rounded-sm`) + brand name + optional sub-label
- Right: status pill + CTA button

### 5.2 Status Pill (Online indicator)
```tsx
<div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
  <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)] animate-pulse" />
  <span className="text-green-500 text-xs font-medium tracking-wide">System: Operational</span>
</div>
```

### 5.3 Primary Button (white filled)
```tsx
<button className="px-6 py-2 rounded-full bg-white text-black hover:bg-white/90 transition-colors text-sm font-medium shadow-lg shadow-white/10">
```

### 5.4 Ghost Button (glass)
```tsx
<button className="px-8 py-3 rounded-full bg-white/10 border border-white/20 hover:bg-white/20 transition-all text-sm font-medium backdrop-blur-sm shadow-[0_0_20px_rgba(255,255,255,0.05)]">
```

### 5.5 Feature / Capability Card
```tsx
<div className="p-8 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300">
  <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-6 border border-white/5">
    <Icon className="w-6 h-6 text-white/70" strokeWidth={1.5} />
  </div>
  <h3 className="text-lg font-semibold mb-3 tracking-wide">{title}</h3>
  <p className="text-white/40 text-sm leading-relaxed">{desc}</p>
</div>
```

### 5.6 Dashboard Sidebar (client/admin pages)
```tsx
{/* Sidebar wrapper */}
<aside className="w-64 h-screen bg-black border-r border-white/5 flex flex-col sticky top-0">
  {/* Nav item */}
  <button className="flex items-center gap-3 px-4 py-3 text-sm text-white/50 hover:text-white hover:bg-white/[0.04] transition-all rounded-lg mx-2">
    <Icon className="w-4 h-4" strokeWidth={1.5} />
    <span>Nav Label</span>
  </button>

  {/* Active nav item */}
  <button className="flex items-center gap-3 px-4 py-3 text-sm text-white bg-white/[0.06] border border-white/10 rounded-lg mx-2">
    <Icon className="w-4 h-4" strokeWidth={1.5} />
    <span>Active Label</span>
  </button>
</aside>
```

### 5.7 Badge / Tag
```tsx
<div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5">
  <Icon className="w-4 h-4 text-amber-400" />
  <span className="text-xs font-medium text-white/70 uppercase tracking-wider">Badge Text</span>
</div>
```

### 5.8 Mockup / Visual Container (hero section)
```tsx
<div className="relative w-full max-w-5xl aspect-[16/9] rounded-xl border border-white/10 bg-[#0A0A0A] p-2 shadow-2xl overflow-hidden group">
  {/* Glow */}
  <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20 blur-2xl opacity-50 group-hover:opacity-70 transition duration-1000" />
  {/* Inner frame with macOS dots */}
  <div className="relative w-full h-full rounded-lg border border-white/5 bg-[#111] overflow-hidden flex flex-col">
    <div className="h-10 border-b border-white/5 flex items-center px-4 gap-2 bg-[#1a1a1a]">
      <div className="w-3 h-3 rounded-full bg-red-500/30 border border-red-500/50" />
      <div className="w-3 h-3 rounded-full bg-amber-500/30 border border-amber-500/50" />
      <div className="w-3 h-3 rounded-full bg-green-500/30 border border-green-500/50" />
    </div>
    {/* Content slot */}
  </div>
</div>
```

### 5.9 Info Panel (left panel in 2-col layout)
```tsx
<div className="p-8 rounded-2xl border border-white/5 bg-white/[0.02]">
  <div className="flex items-center gap-3 mb-8">
    <div className="p-2 bg-white/5 rounded-lg border border-white/5">
      <Icon className="w-5 h-5 text-white/70" strokeWidth={1.5} />
    </div>
    <span className="font-semibold text-sm">Panel Title</span>
  </div>
  <div className="space-y-8">
    <div className="border-t border-white/5 pt-6">
      <h4 className="font-semibold mb-3 tracking-wide">Sub Section</h4>
      <ul className="space-y-3 text-sm text-white/40">
        <li className="flex gap-3 before:content-['•'] before:text-white/20">Item text</li>
      </ul>
    </div>
  </div>
</div>
```

### 5.10 Footer
```tsx
<footer className="w-full border-t border-white/5 bg-[#0A0A0A] py-16 flex flex-col items-center gap-8 text-sm text-white/40">
  {/* Footer nav links (accordion style) */}
  <button className="flex items-center justify-between w-48 hover:text-white/70 transition-colors pb-3 border-b border-white/5">
    <span className="font-medium">Platform</span>
    <ChevronDown className="w-4 h-4" />
  </button>
  {/* Copyright */}
  <div className="mt-8 text-xs tracking-wider">Copyright © NEXUS AI. All rights reserved.</div>
</footer>
```

---

## 6. Animation & Effects

| Effect | Class |
|---|---|
| Pulse glow (status dot) | `animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]` |
| Hover glow (hero) | `group-hover:opacity-70 transition duration-1000` |
| Card hover | `hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300` |
| Button press | `hover:bg-white/90 transition-colors` |
| Backdrop blur (header) | `backdrop-blur-sm` |

---

## 7. Icons

Use **Lucide React** exclusively. Always set `strokeWidth={1.5}` for a lighter, more refined look:

```tsx
import { Brain, Shield, Languages, Map, Activity } from 'lucide-react'
<Icon className="w-5 h-5 text-white/70" strokeWidth={1.5} />
```

---

## 8. Page Template

```tsx
export default function PageName() {
  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-white/20">
      {/* Sticky header */}
      <header className="flex justify-between items-center px-6 py-4 border-b border-white/5 backdrop-blur-sm sticky top-0 z-50 bg-black/80">
        {/* ... */}
      </header>

      <main className="flex flex-col items-center">
        {/* Hero or intro section */}
        <section className="w-full flex flex-col items-center pt-24 pb-20 px-6 text-center">
          {/* ... */}
        </section>

        {/* Feature section */}
        <section className="w-full max-w-6xl px-6 py-20 border-t border-white/10">
          {/* ... */}
        </section>
      </main>

      <footer className="w-full border-t border-white/5 bg-[#0A0A0A] py-16 flex flex-col items-center gap-8 text-sm text-white/40">
        {/* ... */}
      </footer>
    </div>
  )
}
```

---

## 9. Dashboard Page Template (with sidebar)

```tsx
export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-black text-white font-sans flex">
      {/* Sidebar */}
      <aside className="w-64 h-screen bg-black border-r border-white/5 flex flex-col sticky top-0 shrink-0">
        {/* Logo */}
        {/* Nav items */}
        {/* User section at bottom */}
      </aside>

      {/* Main content */}
      <main className="flex-1 min-h-screen flex flex-col">
        {/* Top bar */}
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-black/80 backdrop-blur-sm sticky top-0 z-10">
          {/* Page title + actions */}
        </header>

        {/* Page body */}
        <div className="flex-1 p-8 max-w-6xl">
          {/* Content */}
        </div>
      </main>
    </div>
  )
}
```

---

## 10. Do / Don't

| ✅ Do | ❌ Don't |
|---|---|
| `bg-white/[0.02]` for cards | `bg-gray-900` or `bg-slate-800` |
| `border-white/5` subtle borders | `border-gray-700` |
| `text-white/40` for body | `text-gray-400` |
| `strokeWidth={1.5}` on icons | Default stroke (too heavy) |
| `rounded-2xl` for cards | `rounded` or `rounded-md` |
| Lucide icons only | Heroicons, FontAwesome |
| `transition-all duration-300` | No transitions |
| Sticky header with `backdrop-blur-sm` | Fixed or non-sticky header |
