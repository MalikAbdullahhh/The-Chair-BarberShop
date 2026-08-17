# THE CHAIR — V3 Project Manifest

## Public experience depth

| Route | Art-directed sections |
|---|---:|
| Home | 17 |
| Services | 12 |
| Barbers | 12 |
| Barber Profile | 13 |
| Membership | 12 |
| Lookbook | 12 |
| House | 13 |
| Journal | 12 |
| Visit | 12 |

Booking, account, review, success, loading, 404, admin, and operational screens are separate product experiences rather than counted marketing sections.

## Motion architecture

- Branded route wipe
- Lenis smooth wheel scrolling on suitable desktop pointers only
- Reduced-motion support
- Desktop-only parallax/pinned transforms where appropriate
- Touch/mobile swipe and native-scroll alternatives
- Masked line and word reveals
- Scroll-linked typography
- Stateful layout expansion
- Hover previews and image crop movement
- Shared booking state and animated appointment construction
- Contextual desktop cursor
- Responsive animation fallbacks to prevent off-canvas content

## Media resilience

- All public imagery flows through `EditorialImage`.
- Remote sources are permitted and rendered unoptimized when necessary.
- Failed URLs fall back to local branded SVG media.
- CMS collections are padded with local art-direction data when they are too short to support a composition.

## Full-stack operations

- Node.js + Express API
- MongoDB/Mongoose persistence
- Admin authentication
- Customer authentication/onboarding
- Services/pricing management
- Barber/schedule/time-off management
- Appointment creation and rescheduling
- Slot/overlap protection
- Client management
- Review moderation
- Journal/lookbook/membership/content/settings management
- Public bootstrap API for live operational content

## V3 QA fixes

- Fixed non-home header contrast/state.
- Fixed mobile transforms continuing after desktop pinned scenes became swipe layouts.
- Reworked hover expansion that could overflow grids.
- Added intermediate laptop/tablet layout guards.
- Added image error recovery and safe CMS data padding.
- Removed emoji/dingbat glyphs.
- Removed fake video buttons when no video asset exists.
- Added working month-date picker, journal reader/filter, copy-address and directions controls.
- Preserved booking/admin conflict-safe backend behavior.
