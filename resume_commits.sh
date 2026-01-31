#!/bin/bash
set -e

# Resume from Step 4

# 4. Database Schema
git add backend/prisma/
git commit -m "feat(database): setup prisma schema and initial migrations" || echo "Commit 4 skipped or empty"

# 5. Backend Middleware & Utils
git add backend/src/middleware/ backend/src/utils/
git commit -m "feat(backend): implement auth middleware and utility functions" || echo "Commit 5 skipped or empty"

# 6. Backend Routes & Controllers (Auth)
git add backend/src/controllers/auth.controller.ts backend/src/routes/auth.routes.ts
git commit -m "feat(auth): implement authentication endpoints" || echo "Commit 6 skipped or empty"

# 7. Backend Routes & Controllers (Core)
git add backend/src/controllers/ backend/src/routes/ backend/src/index.ts
git commit -m "feat(api): add core resource endpoints for cruises and rooms" || echo "Commit 7 skipped or empty"

# 8. Frontend Services
git add src/services/
git commit -m "feat(frontend): add api service layer" || echo "Commit 8 skipped or empty"

# 9. Frontend Context
git add src/context/
git commit -m "feat(state): implement authentication context" || echo "Commit 9 skipped or empty"

# 10. Frontend Layout
git add src/components/Layout/
git commit -m "feat(layout): implement dark sidebar and main layout wrapper" || echo "Commit 10 skipped or empty"

# 11. Frontend UI Components (Catch all for components)
git add src/components/
git commit -m "feat(ui): add shared ui components" || echo "Commit 11 skipped or empty"

# 12. Frontend Pages - Login & Auth
git add src/pages/Login.tsx
git commit -m "feat(ui): add login page with distinct styling" || echo "Commit 12 skipped or empty"

# 13. Frontend Pages - Dashboard
git add src/pages/DashboardOverview.tsx
git commit -m "feat(dashboard): implement analytical dashboard with charts" || echo "Commit 13 skipped or empty"

# 14. Frontend Pages - Trips
git add src/pages/TripHistory.tsx src/pages/TripDetails.tsx src/pages/CreateCruise.tsx
git commit -m "feat(trips): implement trip history table and details view" || echo "Commit 14 skipped or empty"

# 15. Frontend Pages - Rooms & Staff
git add src/pages/RoomsManagement.tsx src/pages/StaffManagement.tsx src/pages/ActivitiesManagement.tsx
git commit -m "feat(features): add room, staff, and activity management pages" || echo "Commit 15 skipped or empty"

# Catch All for anything missed
git add .
git commit -m "chore: cleanup and final polish" || echo "Final cleanup skipped"

echo "Resumed commits generated. Ready to push."
