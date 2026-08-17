# THE CHAIR — Professional V3

Full-stack barber booking platform with an editorial public experience and an integrated operations/admin system.

## Structure

- `frontend/` — Next.js App Router, TypeScript, Framer Motion, Lenis, Tailwind CSS
- `backend/` — Node.js, Express.js, MongoDB/Mongoose

## V3 stability and UX pass

This revision focuses on fixing the previously fragile route and interaction behavior rather than adding another visual layer on top.

- Non-home routes now use a readable solid/adaptive header from the first viewport.
- Desktop scroll-linked transforms are disabled when the layout changes into mobile/touch swipe patterns.
- Sticky/pinned scenes have bounded responsive fallbacks instead of translating content off-screen.
- Hover-expansion compositions use state/layout motion rather than unsafe fixed widths.
- Core imagery uses a safe `EditorialImage` wrapper. Remote CMS/media failures fall back to local branded assets without collapsing the layout.
- Public live-data collections are padded with art-directed fallback content, so a partially populated MongoDB CMS cannot break sections that require a minimum number of services, barbers, looks, or journal stories.
- Interactive-looking controls now have actions. The booking month calendar works, visit address can be copied, directions opens a map search, journal stories open in a reader, journal index filters work, and newsletter UI has a local confirmation state.
- Fake play controls were converted into editorial film metadata where no actual video asset exists.
- Decorative emoji/dingbat characters were removed from the professional UI.
- Tablet/intermediate-width layouts received dedicated stability rules.
- Keyboard focus styles and touch-safe alternatives remain enabled.

## Public routes

- `/`
- `/services`
- `/barbers`
- `/barbers/[slug]`
- `/membership`
- `/lookbook`
- `/house`
- `/journal`
- `/visit`
- `/booking`
- `/booking/success`
- `/account`
- `/review`

## Admin routes

- `/admin/login`
- `/admin`
- `/admin/appointments`
- `/admin/services`
- `/admin/barbers`
- `/admin/clients`
- `/admin/reviews`
- `/admin/journal`
- `/admin/lookbook`
- `/admin/memberships`
- `/admin/content`
- `/admin/settings`

## Run locally

### Backend

```bash
cd backend
cp .env.example .env
npm install
npm run seed
npm run dev
```

### Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Open `http://localhost:3000`.

## Seed admin

- Email: `admin@thechair.local`
- Password: `ChangeMe123!`

Change the seed credentials before any real deployment.

## Image system

The designed fallback photography URLs are centralized in `frontend/data/media.ts`. Every public image renders through `frontend/components/media/EditorialImage.tsx`. If a remote image or a CMS-entered URL fails, the component automatically switches to a local branded fallback in `frontend/public/media/`, preserving the composition and preventing broken-image UI.

## Validation performed for this package

- Backend source files checked with `node --check`.
- Frontend TS/TSX parsed with the TypeScript compiler API.
- Local alias imports checked for missing files.
- CSS brace structure checked.
- Emoji/dingbat codepoint scan performed across frontend source.
- Public section-count audit performed.

A complete `next build` was not executed in the packaging environment because frontend dependencies could not be installed there. Run `npm install && npm run build` locally before deployment.
