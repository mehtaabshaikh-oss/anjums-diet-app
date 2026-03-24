---
description: How to deploy the application to production
---

1. Stop and ask the user to manually test the application locally or wait for their explicit permission to deploy.
2. DO NOT proceed any further until the user confirms the tests are successful and gives explicit approval to "deploy" or "push".
3. Add the changes `git add .`
4. Commit the changes with an appropriate message `git commit -m "..."`
5. Push the changes to the main branch `git push origin main`
6. Wait for Vercel to automatically build and deploy.
