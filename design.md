# Vectra Design Specifications 🎨

This document describes the design tokens, visual aesthetics, layout patterns, and animations that make up the Vectra platform.

---

## 1. Color Palette System (HSL & Vanilla CSS)

Vectra uses a clean, premium, high-contrast light-mode workspace with subtle dark-mode accents. The colors are defined using HSL values in [globals.css](file:///c:/Vectra -AI SaaS Prospecting/vectra/packages/ui/src/styles/globals.css) to ensure flexibility and seamless blending.

| Token Name | HSL Value | Description / Usage |
| :--- | :--- | :--- |
| **Primary** | `240 5.9% 10%` | Solid dark zinc color used for primary buttons, bold headers, and key emphasis. |
| **Background** | `0 0% 100%` | Pure white background for main page containers. |
| **Foreground** | `240 10% 3.9%` | Charcoal text for readable typography. |
| **Card / Panel** | `0 0% 100%` | White background with border accents. |
| **Muted Grey** | `240 4.8% 95.9%` | Light gray backgrounds used in layouts (`#FAFAFA` and `bg-zinc-50`). |
| **Accent Green** | `142 76% 36%` | Used for active statuses, credits indicators, and successful badges. |
| **Border Accent** | `240 5.9% 90%` | Default light borders (`border-zinc-200`) separating panel windows. |

---

## 2. Typography & Font Families

The typography system is powered by Next.js font packages, ensuring modern layout presentation:
- **Primary Body Font**: `Geist Sans` - A premium, modern sans-serif optimized for developer interfaces and SaaS dashboards.
- **Code/Mono Font**: `Geist Mono` - A clean monospace font used for credit listings, logs, and prompt terminal screens.

---

## 3. Custom Micro-Animations

To create a premium feel, Vectra incorporates several micro-animations:

### Pulse & Ping Active States
- Sourcing input active indicator: A pulsing green circle on the sourcing badge `Wrangle's Profiles` (`animate-ping`).
- Onboarding status: Glowing radar indicators for active onboarding tour steps.

### Fade-In Transitions
- Copilot summary text cards and timelines animate gracefully upon render using an ease-out transition.
- Dynamic sidebars slide on mobile devices.

---

## 4. Layout Architecture: Splits, Panels & Dashboard Components

Layout spacing focuses on content-density without clutter:
- **Left Navigation Sidebar**: Locked width (`w-64`), containing user workspace metadata, navigation items with stable IDs, credits meter, and workspace session profile.
- **Split-Screen Panel View**: Implemented using resizable containers (`ResizablePanelGroup`) to segment natural language parameters on the left and interactive results lists on the right.
- **Floating Controls**: Fixed footer overlays with linear gradients that blend with background elements, ensuring smooth scroll experiences.
- **Triple-Pane Inbox Layout**: A high-density grid (`w-80` list panel, `flex-1` messaging panel, and `w-80` detail/action panel) for conversations, messaging history, and AI reply assistants.
- **Analytics KPI Stat Cards & SVG/CSS Charts**: A responsive grid containing visual KPIs and a customized vector chart comparison element for weekly activity tracking.

---

## 5. Tour Guide Interaction System

The Tour Guide component ([TourGuide.tsx](file:///c:/Vectra -AI SaaS Prospecting/vectra/apps/web/components/TourGuide.tsx)) guides users through multi-page onboarding steps:
- **Redirection Logic**: Automatically detects pathname changes and triggers page transitions using Next.js `useRouter`.
- **Target Highlighting**: Positions tooltips relative to targeted DOM IDs (e.g. `#sourcing-chat-input`, `#library-database-container`).
- **Recalculation**: Registers event listeners on window resize and path changes to update coordinates.
