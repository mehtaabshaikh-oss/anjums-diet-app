# Learning Concepts Reference

This document provides **simple explanations** of the architectural topics you are exploring in the `anjums‑diet‑app` project, together with **what we did** to experiment with each concept. Keep this file handy as a quick reference while you work through the learning plan.

---

## 1. Caching (ISR – Incremental Static Regeneration)
**What it is**: Caching stores a copy of a page so the server doesn’t have to rebuild it on every request. ISR lets a page be generated once, then refreshed after a set time (e.g., every 60 seconds).
**What we did**:
- Picked a public page (`/app/public/recipes/page.tsx`).
- Wrapped the data fetch with `fetch(..., { next: { revalidate: 60 } })`.
- Added a feature‑flag (`NEXT_PUBLIC_ENABLE_CACHING`) so we can turn caching on/off.
- Verified the `Cache‑Control` header locally and on a Vercel preview.

---

## 2. Indexing (PostgreSQL)
**What it is**: An index is a data structure that makes look‑ups faster, similar to an index at the back of a book.
**What we did**:
- Created a migration: `CREATE INDEX idx_recipes_user_id ON recipes(user_id);`
- Ran `supabase db push` to apply the migration.
- Checked query performance with `EXPLAIN ANALYZE` before and after the index.

---

## 3. SQL vs NoSQL
**What it is**: SQL databases store data in tables with fixed schemas. NoSQL stores flexible, often document‑style data (e.g., JSON) without a rigid schema.
**What we did**:
- Added a `jsonb` column to a table for free‑form data.
- Wrote a tiny API route that saves and reads JSON from that column.
- Compared query speed and developer ergonomics with a traditional relational table.

---

## 4. Database Scaling (Read/Write Patterns)
**What it is**: Scaling means handling more traffic. Read‑heavy workloads need many simultaneous reads; write‑heavy workloads need fast writes.
**What we did**:
- Simulated traffic using the `hey` load‑testing tool (or `k6`).
- Ran the test against a Vercel preview URL.
- Observed connection‑pool settings in `supabase/config.toml` and noted any bottlenecks.

---

## 5. Database Replication
**What it is**: Replication copies data from a primary database to one or more read‑only replicas, allowing reads to be spread across many servers.
**What we did**:
- Enabled Supabase’s read‑replica feature via the dashboard.
- Added a simple read‑only endpoint that points to the replica.
- Measured latency differences between primary and replica reads.

---

## 6. Database Sharding
**What it is**: Sharding splits a large dataset into separate “shards” (chunks) that are stored on different servers, often by a key such as `user_id`.
**What we did**:
- Drafted a markdown diagram showing a hash‑based sharding strategy on `user_id`.
- Documented the steps you would take to create separate Supabase projects for each shard (conceptual, not executed).

---

## 7. Data Consistency & CAP Theorem
**What it is**: Consistency means all reads see the same data. The CAP theorem says a distributed system can only guarantee two of three: Consistency, Availability, Partition tolerance.
**What we did**:
- Added a short note in `docs/consistency.md` explaining *eventual* vs *strong* consistency.
- Implemented a toggle that forces `SELECT … FOR UPDATE` in a critical transaction to demonstrate strong consistency.

---

## 8. CDN (Content Delivery Network)
**What it is**: A CDN caches static assets (images, JS, CSS) at edge locations worldwide, delivering them faster to users.
**What we did**:
- Inspected Vercel’s edge‑cache headers (`x-vercel-cache`).
- Set long‑term `Cache‑Control: public, max-age=31536000` on static assets.
- Verified that assets are served from the CDN by checking response headers.

---

## 9. Load Balancing
**What it is**: A load balancer distributes incoming traffic across multiple server instances to avoid overloading any single one.
**What we did**:
- Deployed a preview URL with `vercel --previews` (Vercel automatically load‑balances).
- Ran a load test against the preview URL and observed even request distribution.

---

## 10. Microservices
**What it is**: Instead of one monolithic app, microservices break functionality into small, independent services that communicate over APIs.
**What we did**:
- Extracted the `diet‑plans` API into its own folder under `src/app/api/diet-plans/`.
- Treated it as a separate service that could be deployed independently later.

---

## 11. API Gateway
**What it is**: An API gateway sits in front of multiple microservices, handling routing, authentication, rate‑limiting, etc.
**What we did**:
- Created a lightweight `api-gateway.ts` that proxies requests to the new `diet‑plans` service.
- Added a simple auth check in the gateway before forwarding the request.

---

## 12. Putting It All Together
The **learning plan workflow** (see `/.agents/workflows/learning_plan.md`) strings these experiments together in a safe, isolated branch. After each step you can:
1. Run the local test suite (`npm test && npx playwright test`).
2. Deploy a preview (`vercel --previews`).
3. Verify the behavior.
4. Either merge the changes or delete the branch to keep production untouched.

---

*Keep this file as a reference while you explore each concept. Feel free to add notes, screenshots, or performance numbers as you go.*
