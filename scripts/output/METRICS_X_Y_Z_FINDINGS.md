# Mobility Scoring Follow-Up Ideas

## Shoulder IR/ER (ROM) scoring options

- Problem: Shoulder IR and Shoulder ER are true ROM measurements, so forcing them into a flat 1-3 bucket can hide useful differences.
- Option A (simple): Keep raw ROM visible and derive a separate 1-3 grade from age/position norms.
- Option B (balanced): Use percentile-based points for each ROM metric (for example, 0-100 percentile mapped to 1-3).
- Option C (best biomechanics signal): Score from Total Arc and side-to-side asymmetry rather than IR or ER alone.
- Option D (hybrid): Show two values per shoulder metric: raw ROM (`112 deg`) and score (`2/3`), then use score in group totals.

## Suggested implementation direction

- Keep current table layout and data model.
- Add optional normalization fields for Shoulder IR/ER only (for example `rawValue`, `normalizedScore`, `normalizationMethod`).
- Leave all non-shoulder mobility/stability components as direct `x/3` scoring.
