Plan: Athletic-Screen-First Handoff Document for Octane

Goal

Add one new file in the UAIS repo that serves as the handoff to Octane Biomech Backend: a markdown document an agent (or developer) in Octane can use to finish implementing the Athletic-Screen-First Athlete Workflow on the frontend/backend side. The handoff will be based on the existing plan at .cursor/plans/athletic-screen-first_athlete_workflow_6092e12a.plan.md.

Where to create the file





Path: docs/OCTANE_ATHLETIC_SCREEN_FIRST_HANDOFF.md (in UAIS repo).



Rationale: Keeps it with UAIS docs and the plan; the user can open the Octane repo, give the agent this file (or its path), and the agent implements in Octane.

Document structure and content

The handoff will be a single .md file with the following sections. Content will be derived from the plan and from the current Octane/UAIS implementation.



1. Purpose and reference





Purpose: "This document is for an agent or developer working in the Octane Biomech Backend repo. It describes what remains to implement in Octane so the Athletic-Screen-First Athlete Workflow is complete."



Reference: State that the source of truth is the Athletic-Screen-First Athlete Workflow plan (and, if useful, paste or link the plan’s overview and Section 7.4 so the agent has the exact Octane requirements in one place).



2. What UAIS (upstream) already does — contract for Octane

Summarize so the Octane agent knows how UAIS behaves and what it expects from Octane:





Environment variable ATHLETE_UUID: When Octane sets this for a spawned UAIS process, UAIS uses it as "Existing Athlete" and attaches all data to that UUID without creating a new athlete. When unset, UAIS uses "New Athlete" behavior (create/match by email and 90% name, merge-by-email).



Pipelines that accept ATHLETE_UUID: Athletic Screen, Readiness Screen, Pro Sup, Arm Action, Curveball, Mobility (each main/ingest reads process.env.ATHLETE_UUID or equivalent and passes it in). Pitching in UAIS can be limited by athlete via --athlete-name or path resolution; hitting similarly if implemented.



Warehouse schema: analytics.d_athletes has nullable email (normalized); public.f_pitching_trials has handedness (Left/Right). No change required in Octane for schema; only ensure Prisma/API expose email if the popup or athlete list needs it.



What UAIS does not do: UAIS does not run multiple pipelines in a single process or in a fixed order. It does not show a browser UI or popup. So orchestration order (which pipeline runs first, second, …) and the email popup are Octane’s responsibility.



3. What Octane already has (no need to redo)

List current behavior so the agent does not duplicate work:





Run API: POST /api/dashboard/uais/run with body { runnerId: string, athleteUuid?: string }. When athleteUuid is present, it is passed to createJob(runner, { athleteUuid }).



runJob: createJob(runner, options?) with CreateJobOptions = { athleteUuid?: string | null }; the spawned process receives ATHLETE_UUID in its environment.



UAIS Maintenance page (app/dashboard/uais-maintenance/page.tsx in Octane): "Add/Run New Data" with New Athlete / Existing Athlete; for Existing, a searchable dropdown that fetches /api/dashboard/athletes?q=... and lets the user select one athlete; when the user clicks Run on a runner, the request includes the selected athlete_uuid for Existing Athlete. There is no multi-select of sources and no sequential run of multiple runners; each runner has its own "Run" button.



4. Runner IDs and canonical run order (from plan)





Runner IDs (from lib/uais/runners.ts): athletic-screen, readiness-screen, pro-sup, pitching, hitting, arm-action, curveball, mobility, proteus.



Canonical order for "run selected sources" (plan Sections 2 and 5.1):  





Athletic Screen, 2) Readiness Screen, 3) Pro Sup, 4) Pitching, 5) Hitting, 6) Arm Action, 7) Curveball. (Mobility can be placed with other screens; Proteus is out of scope for athlete profile flow.)



Include this as an ordered list or constant so Octane can sort/sequence "selected sources" when implementing batch run.



5. What Octane must implement (step-by-step)

Turn plan Sections 6, 7.4, and 3 into concrete tasks.

5.1 Multi-select sources and "Run selected"





Add a multi-select (checkboxes or similar) for "Which data to run" using the runner list (or a subset: athletic screen, readiness, pro sup, pitching, hitting, arm action, curveball, mobility).



Add a single "Run selected" (or "Run all selected") action that:





For Existing Athlete: passes the same selected athlete_uuid to every run.



Runs the selected runners in the canonical order (Section 4): start the first job; when its stream/job completes, start the next with the same athlete_uuid (if Existing), and so on until all selected runners have been run.



Keep the existing per-runner "Run" button for single-run use.

5.2 New Athlete: run selected in order





For New Athlete, "Run selected" must not pass athlete_uuid (so UAIS creates/matches by email and name).



Run selected sources in the same canonical order so that athletic screen runs first when selected; UAIS can then create the athlete and subsequent runs (e.g. pitching/hitting) can attach to that athlete when UAIS resolves by name or when a future enhancement passes athlete identity between steps.

5.3 Email popup when no email found (New Athlete)





Requirement (plan Section 3 and 7.4): If we are adding a new athlete and no email was present in any of the files/sources that were run, the Octane UI must prompt the user to enter an email (or continue without). If they continue without, show the warning: "This athlete will not be able to be linked to the app."



Implementation options for the Octane agent:





Option A: After "Run selected" finishes for New Athlete, call an API (e.g. from Octane to the warehouse or a small UAIS endpoint) to get the "last created/updated" athlete for the current run; if that athlete has no email, show the popup. Then, if the user submits an email, PATCH that athlete’s email (via Octane API or UAIS).



Option B: Have UAIS scripts print a known line/token to stdout when they finish a new-athlete run and no email was found (e.g. UAIS_NO_EMAIL_PROMPT). Octane’s stream reader watches for that token and opens the popup. Submit path as in A.



Option C: For New Athlete, always show a short "Add email for this athlete?" step after "Run selected" (with link to athlete if available), with optional email input and "Continue without email" plus the warning. Simpler but less precise.



Popup content: Optional email input; primary action to submit email (if provided); secondary "Continue without email" with the exact warning text above.

5.4 Submitting email from the popup





Provide a way to save the entered email to the warehouse (analytics.d_athletes.email). Options:





Add or use a PATCH endpoint in Octane that updates an athlete’s email (e.g. PATCH /api/dashboard/athletes/[uuid] with { email: string }), ensuring normalization (lowercase, trim) and that the warehouse schema is respected (no unique constraint on email).



Or add a small endpoint in UAIS that accepts athlete_uuid and email and updates d_athletes; Octane calls it after the user submits the popup. The handoff will state that either approach is acceptable.

5.5 Existing Athlete: enforce athlete selection





When Existing Athlete is selected and the user clicks "Run selected", require that an athlete is selected in the dropdown; otherwise show an inline error (e.g. "Select an athlete").

5.6 UX and copy





Ensure the athlete dropdown list is alphabetical (plan Section 6); confirm that /api/dashboard/athletes returns items ordered by name (or document that Octane should request/sort by name).



Optional: Short copy near "Add/Run New Data" explaining that for New Athlete, running athletic screen first is recommended, and for Existing Athlete, select an athlete and which sources to run.



6. API contract summary (for Octane)





Start a single run: POST /api/dashboard/uais/run with { runnerId: string, athleteUuid?: string }. Returns { jobId }; client then consumes stream and/or waits for job completion.



No batch endpoint: The plan does not require a new "batch run" API; Octane can implement "Run selected" by calling the existing run endpoint once per selected runner, in order, with the same athlete_uuid when in Existing Athlete mode.



Athletes list: GET /api/dashboard/athletes?q=...&limit=50 (and optional cursor) for the searchable dropdown; response includes items with athlete_uuid, name, and optionally email for display or popup prefill.



7. Checklist for the Octane agent





A short checklist summarizing the implementation tasks (multi-select, run in order, Existing vs New behavior, popup, submit email, athlete required for Existing, alphabetical list, optional copy).



8. Files in Octane to focus on





List the main files the agent should touch: e.g. app/dashboard/uais-maintenance/page.tsx (or wherever "Add/Run New Data" lives), and optionally app/api/dashboard/athletes/ for PATCH email if implemented there; mention that app/api/dashboard/uais/run/route.ts and lib/uais/runJob.ts already support athleteUuid and need no change for single-run or sequential run.



Implementation note (for when the plan is executed)





The actual content of each section above will be written into docs/OCTANE_ATHLETIC_SCREEN_FIRST_HANDOFF.md in full, using the plan file and the current Octane/UAIS code as the source. No code changes in Octane or UAIS logic—only adding this one new markdown file in UAIS.



If the handoff is later moved or copied into the Octane repo (e.g. docs/ATHLETIC_SCREEN_FIRST_COMPLETION.md), that can be done by the user or the Octane agent; the plan only creates the file in UAIS.