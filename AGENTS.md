<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# OpsFlow Project Rules

## Protect existing working functionality

Do not remove or rewrite these unless explicitly requested:

- Supabase authentication
- Supabase task system
- Gmail widget
- Calendar widget
- AI assistant panel
- Cloudflare deployment setup
- Existing route group structure under `app/(dashboard)`

Prefer extending existing files/components instead of replacing working systems.

## Design system

Maintain the current OpsFlow visual direction:

- Kuromi-inspired
- Dark purple / pink / black theme
- Rounded glassmorphism cards
- Soft neon glow
- Cute custom icons from `components/ui/KuromiIcons.tsx`

## Dashboard layout rules

Preserve these layout decisions:

- Sidebar navigation stays on the left
- Mini calendar stays on the upper-left of dashboard
- Gmail widget stays below the mini calendar
- Main dashboard cards stay in the center
- AI assistant / activity panel stays on the right when screen size allows

## Build rules

Before finishing any code change, run or consider:

- `npm run build`
- Fix TypeScript errors
- Do not ignore Next.js 16 route handler typing changes
- Do not downgrade Next.js
- Do not remove OpenNext / Cloudflare config unless explicitly requested

## Development style

When adding new pages, start with UI-only if integration is not ready.

Current planned UI pages:

- Notes
- Team
- Reports
- Inbox
- Calendar full page
- AI Assistant full page
- Discord placeholder page

Discord integration should be built last.