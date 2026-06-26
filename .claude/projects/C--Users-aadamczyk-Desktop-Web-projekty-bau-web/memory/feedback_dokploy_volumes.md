---
name: Dokploy volume mounts override container files
description: Volume mounts in Dokploy persist old files and override new deployments — never mount directories containing code/schema files
type: feedback
---

When using Dokploy volume mounts, be aware that mounted paths override container contents with previously persisted data. Never mount directories that contain code or config files (like `/app/prisma` which contains `schema.prisma`). Only mount directories for user-generated data (like `/app/public/uploads`).

**Why:** Mounted a volume to `/app/prisma` which preserved the old SQLite schema and overrode the new PostgreSQL schema on every deploy, causing hours of debugging.

**How to apply:** When recommending Dokploy volume mounts, only mount paths that contain purely user data (uploads, media). Never mount paths that overlap with application code.
