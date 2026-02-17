# Safeguards – Octane implementation status

This doc describes what **Octane Biomech Backend** implements for the UAIS/Octane safeguards. The full spec (90% name match, duplicate athlete prevention, duplicate session prompt) is in the **UAIS** repo: `docs/SAFEGUARDS_90_NAME_MATCH_AND_DUPLICATE_PREVENTION.md`.

---

## What UAIS implements (reference)

- **Safeguard 1 – 90% name match:** Shared athlete resolution in `python/common/athlete_manager.py`; all pipelines use the same threshold so multi-run data attaches to the same athlete.
- **Safeguard 2 – No duplicate athlete on create:** Before creating a new athlete, UAIS checks for existing by name/email and reuses that athlete instead of creating a duplicate.
- **Safeguard 4 – Duplicate session prompt:** Before inserting a session for Existing Athlete, UAIS checks if that `athlete_uuid` + `session_date` already exists in the relevant fact table. If so, it prints a parseable line and waits for stdin:
  - **Parseable format:** `DUPLICATE_SESSION:YYYY-MM-DD` (e.g. `DUPLICATE_SESSION:2026-02-17`).
  - UAIS then reads one line from stdin: `yes` to continue with insert, `no` to skip/abort.

---

## What Octane implements

### 1. Duplicate-session modal (Safeguard 4 – Octane side)

**Where:** [app/dashboard/uais-maintenance/page.tsx](app/dashboard/uais-maintenance/page.tsx)

- While streaming UAIS job output (single Run or Run selected), the client **detects** the line `DUPLICATE_SESSION:YYYY-MM-DD` via the regex `DUPLICATE_SESSION:(\d{4}-\d{2}-\d{2})`.
- When detected, a **modal** is shown: *"It looks like you already ran this data for the following date: **YYYY-MM-DD**. Are you sure you want to continue?"* with **Yes** and **No** buttons.
- **Yes** sends `yes` to the job via `POST /api/dashboard/uais/input` (existing API). **No** sends `no`. The UAIS process is blocking on stdin, so the response unblocks it.
- Backdrop click is treated as **No**.

Detection runs in both flows:

- **Single run:** `readStream(jobId)` accumulates output and checks each chunk.
- **Run selected:** The inner stream loop accumulates output and checks in the same way.

### 2. Optional pre-run duplicate check (New Athlete)

**API:** `GET /api/dashboard/athletes/check-duplicates?name=...` or `?email=...`  
**Where:** [app/api/dashboard/athletes/check-duplicates/route.ts](app/api/dashboard/athletes/check-duplicates/route.ts)

- Accepts `name` and/or `email` (at least one required). Email is normalized (trim, lowercase).
- Queries `d_athletes` by name (contains, case-insensitive) and/or exact normalized email.
- Returns up to 10 matches: `{ matches: [{ athlete_uuid, name, email }] }`.

**UI:** [app/dashboard/uais-maintenance/page.tsx](app/dashboard/uais-maintenance/page.tsx)

- When **New Athlete** is selected, an optional "Check for duplicates" text input and **Check** button are shown.
- User can type a name or email; **Check** calls the API and shows either "No matches." or "N possible existing athlete(s). Use Existing Athlete instead?" with links to those athletes.
- Does not block Run; advisory only. UAIS still enforces duplicate-athlete prevention when creating.

---

## Summary

| Safeguard              | UAIS | Octane |
|------------------------|------|--------|
| 90% name match         | Yes  | —      |
| No duplicate athlete   | Yes  | Optional pre-check API + UI |
| Duplicate session prompt | Yes (print + wait stdin) | Yes (detect, modal, send yes/no) |
