# Fairway Social

The social network for golfers. See who's playing live, share your rounds, trade equipment, and connect with golfers who share your passion.

## Features

- **Live Course Activity** - See who's on the course right now, find open groups
- **Scorecards & Leaderboards** - Track scores, compete daily/weekly/monthly
- **Photo Feed** - Share your golf day with photos and updates
- **Equipment Marketplace** - Buy and sell clubs, bags, and gear
- **Golf Networking** - Professional profiles, connections, direct messaging
- **Round Coordination** - Invite friends, find playing partners, organize outings

## Tech Stack

- [Next.js 15](https://nextjs.org/) (App Router)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Supabase](https://supabase.com/) (Auth, Database, Storage)
- [Lucide Icons](https://lucide.dev/)

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/SleftdogCEO/fairway-social.git
cd fairway-social
npm install
```

### 2. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Run the schema in `supabase/schema.sql` in the SQL Editor
3. Copy your project URL and anon key

### 3. Configure environment

```bash
cp .env.local.example .env.local
```

Fill in your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Database Schema

The full schema is in [`supabase/schema.sql`](./supabase/schema.sql). Key tables:

| Table | Purpose |
|-------|---------|
| `profiles` | User profiles with golf + professional info |
| `courses` | Golf courses |
| `rounds` | Planned, active, and completed rounds |
| `round_invites` | Invitations to play together |
| `posts` | Social feed with photos |
| `likes` / `comments` | Post engagement |
| `listings` | Equipment marketplace |
| `connections` | Professional network |
| `messages` | Direct messaging |

## Contributing

This is an open source project. PRs welcome!

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/cool-thing`)
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

MIT
