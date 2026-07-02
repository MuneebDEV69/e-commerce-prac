# Admin-panel

Reserved workspace for a **standalone admin dashboard**.

Right now the admin UI lives inside the storefront at
`A-Frontend/src/app/admin` (protected by an ADMIN-role check). When you're ready
to split it out, this folder will hold a dedicated Next.js (or Vite) admin app
that consumes the **A-Backend** REST API (`/v1/products`, etc.) using an admin's
Supabase session token.

Until then, use the admin at: `http://localhost:3000/admin`.
