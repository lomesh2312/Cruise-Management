#!/bin/bash
set -e

# 1. Config & Dependencies
git add package.json package-lock.json tailwind.config.js postcss.config.js src/index.css src/App.css
git commit -m "chore: update project configuration, dependencies, and base styles" || echo "Commit 1 skipped"

# 2. Main Entry Points
git add src/App.tsx
git commit -m "refactor: update main application routing and structure" || echo "Commit 2 skipped"

# 3. Backend Initialization
git add backend/package.json backend/tsconfig.json
git commit -m "feat(backend): initialize backend project structure" || echo "Commit 3 skipped"

# 4. Backend Configuration
git add backend/src/config/ backend/src/types/
git commit -m "feat(backend): add database config and type definitions" || echo "Commit 4 skipped"

# 5. Database Schema
git add backend/prisma/
git commit -m "feat(database): setup prisma schema and initial migrations" || echo "Commit 5 skipped"

# 6. Backend Middleware
git add backend/src/middleware/ backend/src/utils/
git commit -m "feat(backend): implement auth middleware and utility functions" || echo "Commit 6 skipped"

# 7. Backend Routes & Controllers (Auth)
git add backend/src/controllers/authController.ts backend/src/routes/authRoutes.ts
git commit -m "feat(auth): implement authentication endpoints" || echo "Commit 7 skipped"

# 8. Backend Routes & Controllers (Core)
git add backend/src/controllers/ backend/src/routes/ backend/src/index.ts
git commit -m "feat(api): add core resource endpoints for cruises and rooms" || echo "Commit 8 skipped"

# 9. Frontend Services
git add src/services/
git commit -m "feat(frontend): add api service layer" || echo "Commit 9 skipped"

# 10. Frontend Context
git add src/context/
git commit -m "feat(state): implement authentication context" || echo "Commit 10 skipped"

# 11. Frontend Layout
git add src/components/Layout/
git commit -m "feat(layout): implement dark sidebar and main layout wrapper" || echo "Commit 11 skipped"

# 12. Frontend Pages - Login & Auth
git add src/pages/Login.tsx
git commit -m "feat(ui): add login page with distinct styling" || echo "Commit 12 skipped"

# 13. Frontend Pages - Dashboard
git add src/pages/DashboardOverview.tsx
git commit -m "feat(dashboard): implement analytical dashboard with charts" || echo "Commit 13 skipped"

# 14. Frontend Pages - Trips
git add src/pages/TripHistory.tsx src/pages/TripDetails.tsx src/pages/CreateCruise.tsx
git commit -m "feat(trips): implement trip history table and details view" || echo "Commit 14 skipped"

# 15. Frontend Pages - Rooms & Staff
git add src/pages/RoomsManagement.tsx src/pages/StaffManagement.tsx src/pages/ActivitiesManagement.tsx
git commit -m "feat(features): add room, staff, and activity management pages" || echo "Commit 15 skipped"

# Catch All for anything missed
git add .
git commit -m "chore: cleanup and final polish" || echo "Final cleanup skipped"

echo "All commits generated. Ready to push."
