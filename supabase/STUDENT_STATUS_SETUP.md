> **Status (22 Nov 2026): Applied successfully.** The connected production Supabase project already has the `blocked` column, access-guard trigger and database constraint. Migration history: `20261121232517_separate_student_blocked_status_20261122`. **Do not apply the same SQL again.** This guide remains useful when setting up a different Supabase project.

# Separate student approval and blocked status — one-time Supabase setup

The website now uses three distinct student states:

| Section | Database state | Permitted action |
| --- | --- | --- |
| **Pending Approval Requests** | \`approved=false, blocked=false\` | Approve |
| **Approved Students** | \`approved=true, blocked=false\` | Block (revokes dashboard access) |
| **Blocked Students** | \`approved=false, blocked=true\` | Move to Pending (does not automatically approve) |

## One-time activation

1. Open the Supabase project currently used in \`config.js\`.
2. In **SQL Editor**, copy and run the entire contents of \`supabase/migrations/20261122_student_status.sql\` as a project administrator.
3. Before running, if you can verify the IDs of **previously blocked accounts**, optionally fill in the *commented* backfill statement in the SQL. The old \`approved\` boolean did **not** distinguish pending from blocked: **do not guess** which users were blocked.
4. Refresh **Admin → Pending / Approved / Blocked**. The migration warning should disappear.

The SQL adds a \`blocked\` column and safeguards profile access changes with an admin-only trigger. It does not delete users or alter tests, attempts, progress, passwords, notes or PWA assets. Existing Supabase RLS policies still apply; if your current policies do not allow admin profile updates, review them separately rather than weakening security.

Until the migration is applied, **Pending** and **Approved** remain available from the old \`approved\` field. **Blocked** will not contain reliably identifiable users; Block buttons are disabled to prevent silently mixing statuses. The app shows a clear setup warning.

A blocked student sees an "Account blocked" message instead of the learning dashboard. Unblocking places the student into Pending, so admin approval is required again. No auto-approval is performed.

## Verification after setup

- Register a new test student: it appears only in Pending.
- Approve: it moves to Approved and can open the dashboard.
- Block: it moves to Blocked and cannot open the dashboard.
- Move to Pending: the blocked account returns to Pending, still without dashboard access.
- Review approved admin accounts and existing students. Never reclassify old \`approved=false\` records automatically.
