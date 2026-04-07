# Connect2Talk - Real-time Voice Chat Platform

## Overview
Connect2Talk is a browser-based, real-time voice chat platform for language practice. Users join public voice rooms organized by language and skill level, with a lightweight social layer (friends, followers, DMs). Rooms are visible to everyone; creating/joining requires Replit Auth login.

## Tech Stack
- **Frontend**: React + Vite + Tailwind CSS + shadcn/ui
- **Backend**: Node.js + Express + Socket.IO
- **Database**: PostgreSQL with Drizzle ORM
- **Auth**: Replit Auth (Google, GitHub, X, Apple, email/password)
- **Real-time**: WebRTC for voice, Socket.IO for signaling/presence
- **Routing**: wouter (client-side)

## Project Structure
```
client/src/
  App.tsx              - Root component with providers
  hooks/
    use-auth.ts         - Replit Auth hook (useAuth)
  lib/
    theme.tsx           - Dark/light theme provider
    socket.tsx          - Socket.IO context provider
    utils.ts            - getUserDisplayName, getUserInitials helpers
    queryClient.ts      - TanStack Query client
  components/
    room-card.tsx       - Voice room card with room-theme gradient border + participant decorations
    create-room-dialog.tsx - Room creation dialog
    voice-room.tsx      - Active voice room with WebRTC + chat + tools + room theme panel
    profile-decorations.tsx - ProfileDecoration component + ROOM_THEMES + getRoomThemeStyle helpers
    social-panel.tsx    - Friends/followers side panel
    dm-view.tsx         - Direct messaging view
    profile-dropdown.tsx - Profile menu with decoration picker, avatar ring, flair badge
    notifications-dropdown.tsx - Notifications bell dropdown
    theme-toggle.tsx    - Dark/light mode toggle
  pages/
    lobby.tsx           - Main lobby (visible to all, auth-gated actions)
    landing.tsx         - Landing page (unused, lobby is default)
    room.tsx            - Voice room page (auth required)
    dm.tsx              - Direct messages page (auth required)

server/
  index.ts             - Express server entry
  routes.ts            - API routes + Socket.IO handlers
  storage.ts           - Database storage interface (IStorage)
  db.ts                - Drizzle database connection
  replit_integrations/  - Replit Auth middleware

shared/
  schema.ts            - Drizzle schemas + TypeScript types
  models/auth.ts       - Users + sessions table definitions
```

## Key Features
1. Replit Auth (Google/GitHub/X/Apple/email login)
2. Public lobby - rooms visible without login
3. Voice rooms organized by language + level (13 languages including Armenian)
4. WebRTC peer-to-peer voice communication
5. In-room text chat with tabbed side panel (Chat/People/YouTube) + @mention support
6. Screen share (fills main content area when active)
7. YouTube watch-together (fills main content area, search in side panel)
8. YouTube tab auto-loads featured/trending videos without search
9. Follow/unfollow from within voice rooms (People tab)
10. Host controls (kick/force-mute users)
11. Real-time presence (online/offline)
12. Direct messaging between users
13. Social layer (follow/unfollow, notifications)
14. Profile management (display name, avatar upload via multer)
15. Room auto-delete 90s after last participant leaves
16. Dark mode with futuristic cyan/purple theme
17. Collapse/expand language filter (not scrollbar)
18. Large circular participant avatars with gradient rings
19. Mic muted by default (isMuted starts true, track disabled on getUserMedia)
20. Multi-ring speaking wave animation on active speakers
21. 15-second disconnect grace period to prevent phantom removal
22. Socket.IO reconnection hardened (infinite attempts, re-emit user:online)
23. Emoji picker (emoji-picker-react) in chat - separate button
24. GIF search via GIPHY API (requires GIPHY_API_KEY secret) - separate button
25. Image upload in chat (photos via multer, /api/upload/chat-image)
26. Host can edit room settings (title/language/level/maxUsers) from room card
27. Camera/YouTube status icons on participant avatars
28. Host transfer (via participant popover - previous host becomes co-owner)
29. Role assignment (co-owner/guest) via participant popover for hosts and co-owners
30. Click-to-watch YouTube (opt-in via any participant's popover, matches video/screen behavior)
31. Screen share uses callback ref to fix black screen (srcObject timing)
32. 30-second disconnect grace period, 60s server ping timeout, client heartbeat every 10s
33. Control buttons centered in header bar between room info and panel toggles
34. User bio (editable in profile, shown in popovers and social panel)
35. @mentions use `@[Name]` bracket format for reliable highlighting
36. Social panel "All" tab shows connected users only (following + followers), not all platform users
37. Profile decorations (sparkles/fire/hearts/stars/bubbles/flowers/lightning/snow/cosmic/rainbow/cat ears) - animated particles around avatars
38. Room themes (neon/galaxy/sunset/forest/cyberpunk/ocean/cherry) - host selects via Palette button, applies gradient to room card border and background
39. profileDecoration and roomTheme fields persisted in DB and returned in all user/room API responses

## User Model
Users table (shared/models/auth.ts):
- id (varchar PK), email, firstName, lastName, displayName, profileImageUrl, bio, avatarRing, flairBadge, profileDecoration, status, createdAt, updatedAt

Rooms table (shared/schema.ts):
- id, title, language, level, maxUsers, ownerId, isPublic, activeUsers, roomTheme (varchar 50), createdAt

## Design
- Primary color: Cyan (195 100% 50%)
- Secondary color: Purple (260 60% 60%)
- Font: Space Grotesk
- Dark-first design with light mode support
- Gradient borders on room cards (cyan to purple)
- Colored avatar gradient rings per participant
- Animated pulse ring on speaking users

## User Preferences
- No landing page gate - lobby always shown
- Collapse/expand for language filters instead of scrollbar
- Armenian language included
- Horizontal card layout in voice rooms
- Rooms open in new tab from lobby (leave closes tab)
- YouTube uses real-time search (not URL paste)
