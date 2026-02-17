# UAIS Runners Troubleshooting

Quick reference for common issues when running UAIS pipelines from the Octane dashboard (UAIS Maintenance).

---

## Unicode / console encoding (Windows)

**Symptom:** Athletic Screen, Pro Sup, or Readiness Screen crash or error with:
`UnicodeEncodeError: 'charmap' codec can't encode character '\u2713'` (or `\u2717`).

**Status:** Fixed in UAIS. Those pipelines now use ASCII `[OK]` and `[X]` instead of ✓/✗. Update your UAIS repo so Athletic Screen, Pro Sup, and Readiness run without encoding errors when launched from the Octane UI.

---

## Pitching: "Rscript is not recognized"

**Symptom:** When you run **Pitching** from UAIS Maintenance, the process fails with:
`'Rscript' is not recognized as an internal or external command, operable program or batch file.`

**Cause:** The Pitching runner runs the UAIS **R** pipeline (`Rscript main.R`). The process spawned by Octane inherits the Next.js app’s environment; if the app was started from a context where R wasn’t on PATH (e.g. Cursor/VS Code), the child couldn’t find `Rscript`.

**What Octane does:** When spawning a UAIS job, Octane now **prepends R to PATH** for the child process so `Rscript` is found even when the Next.js process didn’t have it:

- If **R_HOME** is set in the environment, `R_HOME\bin` is prepended.
- On **Windows**, if R is installed in the default location (`C:\Program Files\R\R-x.x.x`), the latest installed version’s `bin` folder is detected and prepended.

So if R is installed in the default place (or R_HOME is set), no extra config is needed—just run Pitching again.

**If it still fails:**

### A. Install R in the default location

- Install [R for Windows](https://cran.r-project.org/bin/windows/base/) and use the default **Program Files** path. Octane will find it automatically.

### B. Use the UAIS Python pitching pipeline instead

If you prefer not to install R, you can point the Pitching runner at the UAIS **Python** pitching script.

1. In `config/uais-runners.json`, find the entry with `"id": "pitching"`.
2. Set **cwd** to your **UAIS repo root** (e.g. `C:\Users\Joey\PycharmProjects\UAIS`).
3. Set **command** to run the Python script, for example:
   - `python python/scripts/rebuild_pitching_trials_jsonb.py`
   - Add any required args (e.g. `--athlete-name` or similar) per the UAIS handoff doc if you need to scope by athlete.

Example (paths are examples only):

```json
{
  "id": "pitching",
  "label": "Pitching",
  "cwd": "C:\\Users\\Joey\\PycharmProjects\\UAIS",
  "command": "python python/scripts/rebuild_pitching_trials_jsonb.py"
}
```

When Octane runs a job with **Existing Athlete**, it sets `ATHLETE_UUID` in the environment; the UAIS Python script may use that or other args—see the UAIS handoff doc for the exact contract.

---

## Quick reference

| Issue | Where fixed | Action in Octane |
|-------|-------------|------------------|
| Unicode ✓/✗ crash (Windows console) | UAIS (Python scripts) | None; update UAIS. |
| Pitching: Rscript not found | Octane auto-adds R (Program Files or R_HOME) to PATH for spawned jobs | If it still fails, install R in default location or use Python runner (see above). |

For runner config format and setup, see the empty-state message on the UAIS Maintenance page and `config/uais-runners.example.json`.
