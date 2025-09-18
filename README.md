This is AIVA by Aetherion Dataworks — a simple, neat, mobile-first insurance interface.

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:3000 to view the app.

Main pages under `src/app/`:

- `/` — Home with 2x2 module grid
- `/policies` — List your policies and coverage
- `/claims-forms` — Downloadable forms
- `/forms-submission` — Demo submission form
- `/more-info` — FAQs and guides
- `/branch-locator` — Branches and maps links
- `/notifications` — Alerts center
- `/appointments` — Book a call/visit
- `/ai` — AIVA AI assistant
- `/profile` — User profile

Branding and gradient: `src/app/layout.tsx`

Global Tailwind styles: `src/app/globals.css`

## Learn More

## Environment

Create a `.env.local` in the project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role
# OpenAI
OPENAI_API_KEY=your-openai-api-key
```

Notes:
- The server route `/api/ai/chat` uses `OPENAI_API_KEY`.
- Policies features use Supabase URL and keys above.

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
