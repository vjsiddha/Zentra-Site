# Zentra Dev

This repo contains the ongoing migration of Zentra’s Figma designs into a live Next.js/Tailwind codebase, developed in GitHub Codespaces.  
The site is being built module-by-module, with a focus on replicating the Figma UI first, then wiring up interactivity and data.

---

## Current Pages & Status

### 1. **Home / Landing**
- ✅ Hero section (headline, subtext, CTA button)
- ✅ Features / value props grid
- ⚠️ Missing: responsive polish on animations

### 2. **Lesson Pages (example: Lesson 1.4)**
- ✅ Layout & content sections
- ✅ Images integrated via `next/image`
- ✅ ButtonGroup for navigation actions
- ⚠️ Missing: interactive quiz / lesson progress

### 3. **Dashboard**
- ⚠️ Skeleton structure drafted (nav + container)
- ❌ No cards/widgets yet (progress, streaks, XP, next lesson)

### 4. **Profile / Settings**
- ⚠️ Page exists but only as a placeholder
- ❌ No functional profile form or data wiring yet

### 5. **Authentication**
- ⚠️ Firebase Auth planned
- ❌ Not connected yet; all routes are currently public

---

## What Works Right Now
- Next.js app router + TailwindCSS theming
- Core components: buttons, cards, section headers
- Desktop layouts for Home + Lesson pages
- Images optimized with `next/image`
- Shadcn/ui + Lucide icons integrated
- Basic ESLint + Prettier setup

---

## What’s Missing / Broken
- Dashboard widgets (progress cards, XP tracker, streaks)
- Lesson interactivity (quizzes, progress bars)
- Profile page functionality (form, toasts, notifications)
- Firebase Auth + route guards
- Analytics/event tracking
- Accessibility pass (contrast, focus, alt text)

---

## Next Steps
1. **Lesson interactivity** → add quiz component + progress tracking.  
2. **Dashboard buildout** → implement cards for progress, next lesson, and streaks.  
3. **Profile page** → scaffold form with validation and toast notifications.  
4. **Firebase integration** → set up Auth provider + protect lesson routes.  
5. **Analytics scaffold** → decide provider (PostHog/GA), add `track()` calls.  
6. **Accessibility polish** → audit color contrast, keyboard navigation, alt text.  
7. **Motion system** → add Framer Motion for hero, modals, and section reveals.

---

## 🛠 Tech Stack
- **Framework:** Next.js 14 (App Router)  
- **Styling:** TailwindCSS + custom theme tokens  
- **UI Kit:** shadcn/ui + Lucide icons  
- **State/Data (planned):** Firebase Auth & Firestore  
- **Deployment:** Vercel (preview builds)  

---

## Progress Summary
Right now, Zentra has:
- **2 pages functional** (Home, Lesson content)  
- **2 pages stubbed** (Dashboard, Profile)  
- **Core components reusable** (buttons, cards, headers)  
- **Interactivity + data layer not yet wired**  

---
