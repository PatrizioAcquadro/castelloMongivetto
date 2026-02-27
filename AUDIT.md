# Castello Mongivetto — Website Audit

Full codebase review covering bugs, security, performance, accessibility, SEO, code quality, and simplification opportunities.

---

## Table of Contents

1. [Critical Bugs](#1-critical-bugs)
2. [Security](#2-security)
3. [SEO & Social](#3-seo--social)
4. [Accessibility (a11y)](#4-accessibility)
5. [Performance](#5-performance)
6. [Code Quality & Simplification](#6-code-quality--simplification)
7. [CSS Issues](#7-css-issues)
8. [Missing Infrastructure](#8-missing-infrastructure)
9. [Priority Matrix](#9-priority-matrix)

---

## 1. Critical Bugs

### 1.1 Honeypot field is non-functional
**File:** `components/contact/ContactFormClient.tsx:88,157`

The honeypot `<input>` is rendered in the DOM but is **uncontrolled** — its value is never read. The payload always hardcodes `website: ''`. If a bot fills it in, the server never sees the filled value, so the honeypot spam check is completely bypassed.

**Fix:** Track the honeypot value with `useState` or a `ref` and send the actual value in the payload.

### 1.2 `js-ready` class hardcoded — blank page without JS
**File:** `app/layout.tsx:33`

```tsx
<html lang="it" className={`js-ready ${cormorant.variable} ${sourceSans.variable}`}>
```

The CSS at `globals.css:1701` sets `.js-ready [data-reveal] { opacity: 0 }`. Because `js-ready` is baked into the server HTML, users with JS disabled (or before hydration) see **invisible content**. The class was meant to be added by JS *after* load, not statically.

**Fix:** Remove `js-ready` from the static markup. Add it via a tiny inline `<script>` in `<head>`, or add a `<noscript><style>` override.

### 1.3 Dead spam validation — message length check unreachable
**File:** `lib/contact/spam.ts:96 vs 68`

`cleanText()` on line 68 already truncates the message to `MAX_MESSAGE_LENGTH` via `.slice(0, maxLength)`. The subsequent check `if (payload.message.length > MAX_MESSAGE_LENGTH)` on line 96 can **never** be true. A user submitting a 50,000-char message gets silently truncated with no error.

**Fix:** Either validate the raw length *before* calling `cleanText`, or remove the dead check and accept truncation as intended behavior.

### 1.4 Lightbox always rendered in DOM when closed
**File:** `components/gallery/Lightbox.tsx:115-163`

The lightbox dialog (`role="dialog"`, `aria-modal="true"`) is always present in the DOM. When closed, it has `aria-hidden="true"` but all interactive elements (buttons) inside remain **keyboard-focusable**. A Tab-navigating user will enter an invisible lightbox.

**Fix:** Either conditionally render (`{isOpen && <div...>}`), add the `inert` attribute when closed, or set `tabIndex={-1}` on all interactive children when not open.

### 1.5 `formStartedAt` can be set to a future value
**File:** `lib/contact/spam.ts:83`

There is no upper-bound check on `formStartedAt`. An attacker can send `formStartedAt: 99999999999999` (far future), making `elapsed` negative, which bypasses the "too fast" check without triggering `missingTiming`.

**Fix:** Add a check that `formStartedAt` is not in the future (e.g., `formStartedAt > Date.now()`).

---

## 2. Security

### 2.1 No CSRF protection on contact API
**File:** `app/api/contact/route.ts`

The API route has no CSRF token validation. Any third-party site can POST to `/api/contact` from a user's browser. While `spam.ts` checks the `Origin` header, the origin check itself has issues (see 2.2).

**Fix:** Add strict `Origin` header validation in the route handler.

### 2.2 `.vercel.app` wildcard too permissive
**File:** `lib/contact/spam.ts:185`

```ts
host.endsWith('.vercel.app')
```

Any attacker can create a Vercel project and send requests with `Origin: https://evil.vercel.app`. This bypasses the origin check entirely.

**Fix:** Restrict to the exact project preview pattern, e.g., `host.startsWith('castello-mongivetto-') && host.endsWith('.vercel.app')`.

### 2.3 PII logged in plaintext (GDPR concern)
**File:** `app/api/contact/route.ts:57,67,92-94,152-157`

Multiple `console.warn` and `console.log` calls include the client's **email address and IP** in Vercel's function logs. For an Italian site subject to EU/GDPR regulations, this is a compliance risk.

**Fix:** Hash or truncate PII before logging, or ensure Vercel log retention settings comply with your GDPR policy.

### 2.4 No security headers
**File:** `next.config.ts`

No custom HTTP headers are configured. Missing:
- `X-Frame-Options: SAMEORIGIN` (you embed Google Maps, so not DENY)
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Strict-Transport-Security`
- Basic `Content-Security-Policy`

**Fix:** Add a `headers()` function in `next.config.ts`.

### 2.5 No request body size limit on contact API
**File:** `app/api/contact/route.ts:27`

```ts
const body = await request.json().catch(() => null)
```

An attacker could send a multi-MB JSON payload. `cleanText` truncates fields, but the JSON parser must parse the entire body first. Vercel has a 4.5MB default limit, but that's excessive for a contact form.

**Fix:** Check `Content-Length` header early and reject oversized requests.

---

## 3. SEO & Social

### 3.1 Missing `robots.txt`
No `public/robots.txt` or `app/robots.ts`. Search engines cannot find the sitemap or know which paths to skip (like `/api/`).

**Fix:** Add `app/robots.ts` exporting a Next.js metadata robots config.

### 3.2 Missing `sitemap.xml`
No `public/sitemap.xml` or `app/sitemap.ts`. For a 4-page site, a sitemap ensures all pages are indexed promptly.

**Fix:** Add `app/sitemap.ts` listing all 4 pages.

### 3.3 Missing favicon
No `favicon.ico`, `apple-touch-icon.png`, or icon metadata. Browsers request `/favicon.ico` and get a 404 on every page load.

**Fix:** Add `app/favicon.ico` and configure `icons` in root layout metadata.

### 3.4 No Open Graph / social sharing metadata
**File:** `app/layout.tsx:23-25`, all pages

No `openGraph.images`, no `twitter` card, no `og:image`. When someone shares any page on social media, there is no preview image or structured title.

**Fix:** Add OG metadata to root layout (with `title.template`) and per-page overrides. Create an `og-image.png` in `public/`.

### 3.5 No `title.template` in root layout
**File:** `app/layout.tsx:23-25`

Only `metadataBase` is set. There is no `title.default` or `title.template`, meaning no consistent title formatting like "Page | Castello Mongivetto".

**Fix:**
```tsx
title: {
  default: 'Castello Mongivetto | Dimora Storica in Piemonte',
  template: '%s | Castello Mongivetto',
}
```

### 3.6 No structured data (JSON-LD)
For a historic landmark, adding JSON-LD structured data (`Place`, `LandmarksOrHistoricalBuildings`, `LocalBusiness`) would significantly improve search result presentation (rich snippets, knowledge panels).

### 3.7 No canonical URLs
No `alternates.canonical` is set on any page. This can cause duplicate content issues if the site is accessible via both `www` and non-`www` or via Vercel preview URLs.

---

## 4. Accessibility

### 4.1 No focus trap in Lightbox modal
**File:** `components/gallery/Lightbox.tsx`

The lightbox uses `role="dialog"` and `aria-modal="true"`, but there is **no focus trap**. A keyboard user can Tab out of the lightbox into the page content behind it. This violates WCAG 2.4.3 (Focus Order).

**Fix:** Implement a focus trap (e.g., loop focus between first and last focusable element inside the dialog).

### 4.2 No focus trap in ImmersiveTour overlay
**File:** `components/gallery/ImmersiveTour.tsx`

When the tour opens in overlay mode, focus is moved to the close button (line 152), but keyboard focus can escape the overlay.

**Fix:** Same focus trap solution as the Lightbox.

### 4.3 Incorrect ARIA tabs pattern in ImmersiveTour
**File:** `components/gallery/ImmersiveTour.tsx:289-307`

```tsx
<div role="tablist">
  <button role="tab" aria-selected={...}>
```

The ARIA tabs pattern requires `role="tabpanel"` elements with `aria-controls` linking each tab to its panel, plus arrow-key navigation. The tour has none of these — it is a **step indicator**, not tabs.

**Fix:** Remove `role="tablist"`/`role="tab"`. Use a group of buttons with `aria-current="step"` instead.

### 4.4 Focus not returned to trigger element on Lightbox close
**File:** `components/gallery/Lightbox.tsx:46-47`

When the lightbox closes, focus is not returned to the gallery button that opened it. The user loses their place on the page.

**Fix:** Save a ref to the triggering element, restore focus to it on close.

### 4.5 Hidden gallery items still keyboard-focusable
**File:** `components/gallery/GalleryClient.tsx:120-139`

Hidden (filtered-out) gallery items have `aria-hidden="true"` but are still `<button>` elements — focusable via Tab.

**Fix:** Add `tabIndex={!isVisible ? -1 : 0}` to prevent keyboard focus on hidden items.

### 4.6 Breadcrumbs not semantic
**Files:** `app/storia/page.tsx:19`, `app/galleria/page.tsx:20`, `app/contatti/page.tsx:21`

Breadcrumbs use `<p>` with text. Should use `<nav aria-label="Breadcrumb">` with `<ol>` for proper screen reader support (WAI-ARIA breadcrumb pattern).

### 4.7 Heading hierarchy skips
- **`app/page.tsx:67`** — jumps from `<h1>` to `<h3>` in history teaser section (missing `<h2>`)
- **`app/contatti/page.tsx:82`** — `<h3>` then `<h4>` under `<h1>`, skipping `<h2>`

### 4.8 Form fields have no per-field error messages
**File:** `components/contact/ContactFormClient.tsx:161-253`

Inputs get `aria-invalid="true"` but there is no `aria-describedby` linking to an error message element. Screen readers know a field is invalid but not *why*.

**Fix:** Add per-field error `<span>` elements with `id` and link via `aria-describedby`.

### 4.9 Form focus style has insufficient contrast
**File:** `app/globals.css:1376-1382`

```css
outline: none;
box-shadow: 0 0 0 3px rgba(183, 141, 74, 0.14);
```

The replacement focus indicator is only 14% opacity — likely fails WCAG 2.1 non-text contrast (3:1 minimum).

**Fix:** Increase the box-shadow opacity or add a visible outline.

### 4.10 Alert auto-dismisses without user control
**File:** `components/contact/ContactFormClient.tsx:49`

Success/error messages disappear after 10 seconds. WCAG 2.2.1 (Timing Adjustable) recommends not auto-dismissing or giving user control.

### 4.11 Footer `aria-label` on non-landmark element
**File:** `components/layout/Footer.tsx:7`

```tsx
<div className="footer-grid" aria-label="Informazioni utili">
```

`aria-label` on a `<div>` has no effect — screen readers ignore it. Use `<section>` or add `role="region"`.

---

## 5. Performance

### 5.1 Font Awesome full bundle via CDN
**File:** `app/layout.tsx:36-38`

Loading the entire Font Awesome CSS (~75KB minified) from a third-party CDN for only ~12 icons. This blocks rendering and creates a third-party SPOF.

**Fix:** Replace with inline SVGs for the ~12 icons used, or self-host a subset.

### 5.2 Five images over 500KB (total ~5MB)
**Files in `public/images/`:**

| File | Size |
|------|------|
| `archivio-incisione-lapidea-1834.jpg` | 1.6 MB |
| `archivio-ruderi-didascalia.jpg` | 1.1 MB |
| `archivio-ingresso-storico.jpg` | 889 KB |
| `archivio-coscritti-prato-1937.jpg` | 828 KB |
| `archivio-coscritti-ruderi-1937.jpg` | 567 KB |

**Fix:** Resize originals to max display size, convert to WebP/AVIF. Even if `next/image` optimizes at runtime, the originals still consume deployment storage.

### 5.3 Rate limiting is ineffective on Vercel serverless
**File:** `lib/contact/rateLimit.ts:10-11`

```ts
const ipRateLimitStore = new Map<string, number[]>()
const recentSubmissionStore = new Map<string, number>()
```

In-memory Maps reset on every cold start. Each Lambda instance has its own empty store. Rate limiting is essentially decorative.

**Fix:** For real protection, use Vercel KV or Upstash Redis. For a low-traffic site, the current approach provides minimal protection against naive bots on warm instances — acceptable but should be documented as a known limitation.

### 5.4 No AVIF image format support configured
**File:** `next.config.ts`

No `images.formats` configuration. Next.js defaults to WebP only. Enabling AVIF (`formats: ['image/avif', 'image/webp']`) provides 30-50% better compression.

### 5.5 First timeline image uses `loading="lazy"` even if above fold
**File:** `app/storia/page.tsx:41`

On desktop, the first timeline image may be visible on initial load. Using `loading="lazy"` on it delays its rendering unnecessarily.

---

## 6. Code Quality & Simplification

### 6.1 NavigationClient is imperative DOM code in a React wrapper
**File:** `components/layout/NavigationClient.tsx`

The **entire** navigation behavior — open/close toggle, focus management, resize handling, event listeners — is written as imperative DOM manipulation inside a `useEffect`. This is essentially a vanilla JS script transplanted into React. It reads `aria-expanded` from the DOM instead of React state, queries elements with `querySelector`, and attaches/removes event listeners manually.

**Fix:** Rewrite with `useState` for `isOpen`, React event handlers (`onClick`, `onKeyDown`), and conditional classes in JSX.

### 6.2 Six separate `useState` for form fields
**File:** `components/contact/ContactFormClient.tsx:21-26`

Six individual `useState` calls for name, email, phone, subject, message, privacy. The reset logic (lines 130-136) requires six separate setter calls.

**Fix:** Use a single `useReducer` or a form state object. Reset becomes a single dispatch.

### 6.3 `visibleItems` not memoized — cascading instability
**File:** `components/gallery/GalleryClient.tsx:50-52`

`visibleItems` is recalculated every render without `useMemo`. This cascades: `lightboxItems` and `currentSceneId` also recalculate, and `useCallback` hooks depending on them are recreated every render (defeating their purpose).

**Fix:** Wrap `visibleItems` in `useMemo(... [activeFilter])`.

### 6.4 Timer leaks in ContactFormClient
**File:** `components/contact/ContactFormClient.tsx:42-55`

`showAlert` creates **three** timeouts (10ms delay, 10s auto-hide, 260ms fade-out). Only the 10s timer is tracked in `alertTimerRef`. The others are fire-and-forget and can cause state updates after unmount.

**Fix:** Track all timers and clear them in a cleanup function / on unmount.

### 6.5 `transitionTimerRef` not cleaned up on unmount
**File:** `components/gallery/ImmersiveTour.tsx:113,134-137`

If the component unmounts during a transition, `setCurrentSceneIndex` and `setIsTransitioning` are called on an unmounted component.

**Fix:** Clear `transitionTimerRef` in the cleanup effect alongside `document.body.classList.remove('tour-open')`.

### 6.6 VisitHeightSync doesn't use ResizeObserver despite docs claiming it does
**File:** `components/contact/VisitHeightSync.tsx`

The CLAUDE.md says "ResizeObserver height sync" but the component uses `window.addEventListener('resize')`. It only responds to viewport resize, not content changes (font loading, dynamic text).

**Fix:** Use a `ResizeObserver` on the `detailsCard` element instead of window resize.

### 6.7 Hardcoded labels array in ImmersiveTour
**File:** `components/gallery/ImmersiveTour.tsx:218`

```ts
const labels = ['Soglia', 'Torre', 'Interni', 'Lapide 1834', 'Comunita', 'Cortile']
```

Parallel array that can fall out of sync with `TOUR_SCENES`. Should derive from the scenes data (e.g., `shortLabel` field).

### 6.8 `suppressHydrationWarning` on `<body>` without reason
**File:** `app/layout.tsx:40`

No visible reason for hydration mismatch on `<body>`. This masks real hydration bugs.

**Fix:** Remove unless there is a documented reason. Add a comment if kept.

### 6.9 Deprecated `window.pageYOffset` used
**File:** `components/shared/AnchorScrollInit.tsx:22`

`window.pageYOffset` is deprecated. Use `window.scrollY` (functionally identical).

### 6.10 `#top` anchor scroll works by accident
**File:** Footer links to `#top`, `AnchorScrollInit` handles it. If no element with `id="top"` exists, `querySelector('#top')` returns null, the handler returns early **without** calling `preventDefault()`, and the browser's default behavior scrolls to top anyway. Works by accident, not by design.

Note: `layout.tsx:40` does set `id="top"` on `<body>`, so this actually works. But the `AnchorScrollInit` code path is fragile.

---

## 7. CSS Issues

### 7.1 Dead CSS selectors
**File:** `app/globals.css`

| Selector | Line | Status |
|----------|------|--------|
| `body[data-page="gallery"] ...` | 705 | `<body>` never gets `data-page` attribute |
| `.section--dark` (and nested rules) | 447-481 | No element uses this class |
| `.u-mt-lg`, `.u-mt-md`, `.u-m-0`, `.u-mb-md` | 486-500 | Unused utility classes |
| `.split-layout--reverse` | 557-559 | Unused |
| `.highlights-summary` | 595-599 | Unused |

### 7.2 Hardcoded colors instead of CSS variables
Throughout `globals.css`, many colors are hardcoded instead of using defined custom properties:
- Line 256: `color: #fff` (should be `var(--color-text-inverse)`)
- Line 407: `color: #241d13` on `.btn-primary`
- Line 731: `background: #fff` on `.filter-btn:hover`
- Line 1431: `color: #9d2038` on `.field-error`

Makes theming or global color adjustments difficult.

### 7.3 Inconsistent media query direction
The file uses **both** `max-width` (desktop-first) and `min-width` (mobile-first) breakpoints. This creates a bidirectional approach that is hard to maintain:
- `max-width`: 1080px, 920px, 720px, 430px, 360px
- `min-width`: 921px, 960px, 1080px

**Fix:** Standardize on one direction for consistency.

### 7.4 `white-space: nowrap` overflow on mid-size tablets
**File:** `app/globals.css:651-654`

`.cta-panel__subtitle--single-line` has `white-space: nowrap`. The mobile override kicks in at 720px, but tablets between 720px-920px can see horizontal overflow of long Italian text.

### 7.5 Reduced motion race condition with reveal animations
The `prefers-reduced-motion: reduce` media query (line 2205) sets `transition-duration: 0.01ms`, but `.js-ready [data-reveal]` still initially sets `opacity: 0`. During hydration (before `RevealAnimations.tsx` runs), content is invisible for reduced-motion users.

### 7.6 ~2200 lines in a single CSS file
All styles for the entire site live in one `globals.css`. While this avoids module complexity, it is hard to navigate, maintain, and find dead code.

---

## 8. Missing Infrastructure

### 8.1 No ESLint / Prettier
**File:** `package.json`

No `lint` script, no ESLint or Prettier dependencies. No automated code quality checks.

**Fix:** Add `eslint` + `eslint-config-next` and a `lint` script.

### 8.2 No `manifest.json` / PWA support
No web app manifest. iOS bookmark and Android "add to home screen" show no custom icon or name.

### 8.3 Disposable email domain list is very small
**File:** `lib/contact/email.ts:3-16`

Only 12 disposable email domains listed. Also, subdomain bypass is possible (e.g., `sub.mailinator.com`).

**Fix:** Check if domain *ends with* a disposable domain. Consider a larger list or external service.

### 8.4 No `Retry-After` header on 429 responses
**File:** `app/api/contact/route.ts`

Rate-limited responses return 429 but no `Retry-After` header.

### 8.5 DNS lookups are sequential
**File:** `lib/contact/email.ts:18-41`

MX, A, and AAAA lookups run sequentially. A and AAAA could run in parallel if MX fails.

---

## 9. Priority Matrix

### P0 — Fix Now (Bugs & Security)
| # | Issue | Section |
|---|-------|---------|
| 1 | Honeypot field non-functional | 1.1 |
| 2 | `js-ready` hardcoded — blank page for no-JS | 1.2 |
| 3 | Missing favicon (404 on every page) | 3.3 |
| 4 | No focus trap in Lightbox/Tour modals | 4.1, 4.2 |
| 5 | Lightbox always in DOM, focusable when closed | 1.4 |
| 6 | `.vercel.app` wildcard too permissive | 2.2 |

### P1 — Important (SEO & Accessibility)
| # | Issue | Section |
|---|-------|---------|
| 7 | Missing `robots.txt` and `sitemap.xml` | 3.1, 3.2 |
| 8 | No Open Graph / social metadata | 3.4 |
| 9 | No security headers | 2.4 |
| 10 | PII logged in plaintext | 2.3 |
| 11 | Hidden gallery items keyboard-focusable | 4.5 |
| 12 | Incorrect ARIA tabs pattern | 4.3 |
| 13 | Heading hierarchy skips | 4.7 |
| 14 | Form focus style insufficient contrast | 4.9 |
| 15 | No `title.template` in root metadata | 3.5 |

### P2 — Should Fix (Performance & Code Quality)
| # | Issue | Section |
|---|-------|---------|
| 16 | Font Awesome full bundle (~75KB) | 5.1 |
| 17 | 5 images over 500KB (~5MB total) | 5.2 |
| 18 | NavigationClient is imperative DOM code | 6.1 |
| 19 | `visibleItems` not memoized | 6.3 |
| 20 | Timer leaks in ContactFormClient | 6.4 |
| 21 | Rate limiting ineffective on serverless | 5.3 |
| 22 | Dead CSS selectors | 7.1 |
| 23 | Add ESLint + Prettier | 8.1 |
| 24 | Dead spam validation code | 1.3 |
| 25 | `formStartedAt` future value bypass | 1.5 |

### P3 — Nice to Have
| # | Issue | Section |
|---|-------|---------|
| 26 | Breadcrumbs not semantic | 4.6 |
| 27 | Per-field error messages with `aria-describedby` | 4.8 |
| 28 | AVIF image support | 5.4 |
| 29 | JSON-LD structured data | 3.6 |
| 30 | Canonical URLs | 3.7 |
| 31 | Hardcoded colors → CSS variables | 7.2 |
| 32 | VisitHeightSync should use ResizeObserver | 6.6 |
| 33 | Standardize media query direction | 7.3 |
| 34 | Six `useState` → `useReducer` for form | 6.2 |
| 35 | Deprecated `window.pageYOffset` | 6.9 |
| 36 | Disposable email subdomain bypass | 8.3 |
| 37 | Alert auto-dismiss timing | 4.10 |
| 38 | `suppressHydrationWarning` without reason | 6.8 |
