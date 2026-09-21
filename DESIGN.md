# Design System & Visual Guidelines: Resala Children's Day

## 1. Visual Pillars

### I. Mobile-First Thumb Ergonomics
- **Touch Target Floor**: Interactive controls must have a minimum bounding box of 44×44px; primary CTAs are 48px to 56px tall.
- **Thumb Zone Hierarchy**: Frequently used actions (roll call buttons, save action, search, tab bar) reside within the natural bottom two-thirds of the screen.
- **Touch-Friendly Controls**: Use segmented controls, large toggle cards (`BubbleToggle`), and tactile steppers over tiny native dropdowns or native checkboxes.

### II. Egyptian Charity Identity & Warmth
- **Primary Blue (`oklch(0.42 0.16 255)` / `#253487`)**: Solid, dependable, recognizable Resala blue. Used for dominant headings, active states, and brand anchors.
- **Children's Day Yellow & Orange (`oklch(0.90 0.18 95)` & `oklch(0.68 0.20 55)`)**: Celebratory, energetic accents representing childhood playfulness and the Skills/Projects track.
- **Illustrated Silhouettes**: Deterministic, friendly pastel avatars (sky, mint, butter, peach, lilac, rose) that make children distinguishable at a glance without bias.
- **Soft Curved Surfaces**: 24px–28px card corners (`rounded-3xl`), pill badges, and warm tinted backgrounds (`bg-[oklch(0.98_0.015_255)]`).

### III. Semantic & Glanceable Feedback
- **Present / Positive**: Emerald Green (`oklch(0.72 0.19 150)`) with star glyphs.
- **Absent / Critical**: Crisp Red (`oklch(0.64 0.22 25)`) with cloud/cancel glyphs.
- **Excused / Warning**: Warm Amber (`oklch(0.80 0.16 85)`).
- **Attentiveness Expressions**: 5 SVG face states ranging from sleepy (0–19%) to delighted (80–100%).

### IV. Motion & Tactility
- **Micro-Interactions**: Subtle `active:scale-[0.98]` on cards and `active:scale-95` on action buttons.
- **State Feedback**: Spring animations on point additions (`animate-float-up`), gentle horizontal shake on point decrements.
- **Accessibility**: Respect `prefers-reduced-motion` across all particle bursts and micro-animations.

## 2. Typography
- **Font**: Figtree (`--font-figtree`, `--font-sans`).
- **Scale**:
  - Greeting / Hero: 32px–36px Bold
  - Section Titles: 18px–20px Black / ExtraBold
  - Card Titles: 15px–16px Bold
  - Body / Subtext: 13px–14px Regular / Medium
  - Micro-metadata & Badges: 10px–11px Semibold, Uppercase tracking
