# Learning Plan for Advanced Architectural Concepts

This document outlines a step‑by‑step approach to explore and experiment with key backend and frontend concepts **without impacting production**. Follow the workflow in the accompanying artifact `learning_plan.md` located in the Antigravity brain directory.

---

## Quick Start Checklist
1. **Create a learning branch**
   ```bash
   git checkout -b learning/advanced-concepts
   ```
2. **Add feature flags** (`featureFlags.ts` and `.env.local`).
3. **Run Supabase locally** (`supabase start`).
4. **Implement a cached page** (see section 4 of the workflow).
5. **Run tests** (`npm test && npx playwright test`).
6. **Deploy preview** (`vercel --previews`).
7. **Validate** and either merge or delete the branch.

---

## Topics Covered
1. **Caching (ISR)** – static generation with revalidation.
2. **Indexing** – PostgreSQL index creation.
3. **SQL vs NoSQL** – using `jsonb`.
4. **Database Scaling** – read/write patterns.
5. **Replication & Sharding** – read‑replica setup.
6. **Data Consistency & CAP Theorem** – eventual vs strong.
7. **CDN** – Vercel edge caching.
8. **Load Balancing** – Vercel preview load tests.
9. **Microservices & API Gateway** – extracting APIs.

---

*Feel free to edit this file as you progress through the learning plan.*
