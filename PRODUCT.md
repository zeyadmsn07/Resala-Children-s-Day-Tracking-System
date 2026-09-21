# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
- **Primary Users**: Resala volunteers, instructors, and class facilitators in Cairo educational centers. They operate single-handed on mobile phones in dynamic, crowded classroom environments.
- **Secondary Users**: Program heads and directors reviewing real-time class attendance, supervisor analytics, and assigning staff permissions.

## Product Purpose
The **Resala Children's Day Tracking System** monitors attendance, academic attentiveness, and behavioral development for underprivileged Egyptian children across a 4-day modular educational program. Success means instructors spend less than 60 seconds marking a class, children are tracked accurately without data loss, and directors have transparent visibility into each student's progress.

## Positioning
Unlike generic school management systems or enterprise spreadsheets, this system is a mobile-first, high-speed tracking tool tailored specifically to Egyptian non-profit educational outreach, emphasizing fast 2-tap attendance, positive/negative behavior reinforcement, and offline resilience.

## Operating Context
- Instructors hold mobile phones (viewport width 360–412px) in one hand while managing children.
- Classes run on Saturdays in Cairo community centers with variable mobile data connectivity.
- Fast workflows are essential: roll call cannot distract from teaching.

## Capabilities and Constraints
- Fast 2-tap roll call mode per class session.
- Student search with instant name and ID code matching (`S-0042`).
- Session-level tracking: Attendance (Present, Absent, Excused), Attentiveness slider (0–100%), and Behavior point counters (+1 Great Work / -1 Needs a Talk).
- Fun Day (Session 4) behavioral conduct questions.
- Role-based access: Directors (full control & whitelist management), Heads (class & member oversight), Members (attendance logging).
- Offline queueing and optimistic autosave for spotty connectivity.

## Brand Commitments
- **Organization**: Resala Charity (Egypt).
- **Core Visual Identity**: Resala Deep Blue (`oklch(0.38 0.16 258)` / `#253487`), joyful yellow & orange accents for children's activities, and friendly illustrated silhouette avatars.
- **Tagline**: *"Every child. Every session. Every step forward."*

## Evidence on Hand
- Client specification: `UI_SPEC-2.md` (v1.4 client-approved requirements).
- Task distribution document: `Development Task Distribution - Children's Day.pdf`.
- Resala branding asset: `public/resala-logo.png`.

## Product Principles
1. **Thumb-First Ergonomics**: All critical operations accessible within one-handed thumb reach; minimum 44px (preferred 48–56px) touch targets.
2. **Glanceability Under Egyptian Sun**: High contrast, crisp semantic colors (Green = Present, Red = Absent, Amber = Excused), large legible typography.
3. **Encouraging & Dignified Tone**: Focus on growth and positive reinforcement; friendly faceless avatars that celebrate every child without bias.
4. **Resilient Data Integrity**: Autosave on blur/change with clear feedback states (`Saved`, `Saving`, `Offline`, `Failed`) so no volunteer loses classroom notes.

## Accessibility & Inclusion
- WCAG AA contrast for text and controls.
- `prefers-reduced-motion` compliance across particle and spring animations.
- Touch manipulation optimizations (`touch-action: manipulation` and `touch-action: pan-y` on sliders).
