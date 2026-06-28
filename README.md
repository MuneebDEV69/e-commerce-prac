# E-com Frontend (Static Scaffold)

This repo contains a monorepo scaffold for a Next.js (App Router) + Tailwind CSS storefront prototype.

What was scaffolded:
- `apps/storefront` - Next.js app skeleton (TypeScript + Tailwind)
- `packages/ui` and `packages/domain` - placeholder shared packages

Run `npm install` and `npm run dev` in `apps/storefront` after installing dependencies.

```
npm run dev          # frontend
npm run build        # production build
npm run db:seed      # seed database
npm run db:studio    # data GUI
npm run db:generate  # regenerate prisma client
```