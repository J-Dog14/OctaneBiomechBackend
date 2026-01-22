# API Endpoints Reference

Base URL: `https://your-api-domain.vercel.app` (or `http://localhost:3000` for local)

All endpoints require the `X-API-Key` header with a valid API key.

---

## Health Check

**GET** `/api/health`

No authentication required. Returns database connectivity status.

**Response:**
```json
{
  "dbOk": true
}
```

---

## UAIS Endpoints

### List Athletes

**GET** `/api/uais/athletes?limit=50&cursor=<uuid>&q=<search>`

Returns paginated list of athletes.

**Query Parameters:**
- `limit` (optional): Number of results (1-200, default: 50)
- `cursor` (optional): UUID for pagination
- `q` (optional): Search by name

**Response:**
```json
{
  "athletes": [...],
  "nextCursor": "...",
  "hasMore": true
}
```

---

### Arm Action

**GET** `/api/uais/arm-action?athleteUuid=<uuid>`

Returns arm action data with highest score for the athlete.

**Response:**
```json
{
  "athleteUuid": "...",
  "sessionDate": "2024-01-15",
  "armAbductionAtFootplant": 45.2,
  "maxAbduction": 50.0,
  "shoulderAngleAtFootplant": 90.0,
  "maxEr": 120.0,
  "armVelo": 85.5,
  "maxTorsoRotVelo": 1200.0,
  "torsoAngleAtFootplant": 15.0,
  "score": 85.5
}
```

---

### Athletic Screen

**GET** `/api/uais/athletic-screen?athleteUuid=<uuid>`

Returns athletic screen data from CMJ, DJ, PPU, and SLV tables.

**Response:**
```json
{
  "athleteUuid": "...",
  "cmj": {
    "sessionDate": "2024-01-15",
    "jhIn": 12.5,
    "ppWPerKg": 45.2,
    "kurtosis": 2.1,
    "timeToRpdMaxS": 0.15,
    "rpdMaxWPerS": 1200.5,
    "aucJ": 85.3
  },
  "dj": {
    "sessionDate": "2024-01-15",
    "jhIn": 15.2,
    "ppWPerKg": 48.1,
    "kurtosis": 2.3,
    "timeToRpdMaxS": 0.12,
    "rpdMaxWPerS": 1350.2,
    "aucJ": 92.1,
    "ct": 0.18,
    "rsi": 84.4
  },
  "ppu": {...},
  "slv": {...}
}
```

---

### Proteus

**GET** `/api/uais/proteus?athleteUuid=<uuid>`

Returns Proteus data filtered by movement type (Straight Arm Trunk Rotation or Shot Put variants).

**Response:**
```json
{
  "athleteUuid": "...",
  "rows": [
    {
      "id": 123,
      "sessionDate": "2024-01-15",
      "movement": "Straight Arm Trunk Rotation",
      "peakPower": 1250.5,
      "avgPower": 980.2,
      "peakAcceleration": 45.3
    }
  ]
}
```

---

### Hitting

**GET** `/api/uais/hitting?athleteUuid=<uuid>`

Returns hitting kinematics data for the most recent session.

**Response:**
```json
{
  "athleteUuid": "...",
  "sessionDate": "2024-01-15",
  "metrics": {
    "maxPelvisAngVel": 1250.5,
    "maxThoraxAngVel": 980.2,
    "maxLeadForearmAngVel": 1350.1,
    "maxBatAngVel": 4200.3,
    "pelvisShouldersSeparationAtDownswing": 45.2,
    "pelvisShouldersSeparationAtFootContact": 38.7,
    "trunkAngleAtSetup": 12.5,
    "trunkAngleAtFootContact": 15.3
  }
}
```

---

### Mobility

**GET** `/api/uais/mobility?athleteUuid=<uuid>`

Returns mobility data organized by subcategories.

**Response:**
```json
{
  "athleteUuid": "...",
  "sessionDate": "2024-01-15",
  "subcategories": {
    "Shoulder/Arm Mobility": {
      "backToWallShoulderFlexion": 180.5,
      "horizontalAbduction": 45.2,
      "elbowExtensionRom": 0.0,
      "elbowFlexionRom": 150.0,
      "forearmSupinationRom": 90.0,
      "forearmPronationRom": 80.0,
      "shoulderIr": 60.0,
      "shoulderEr": 90.0,
      "youngStretch": 12.5
    },
    "Hip Mobility": {...},
    "T-Spine": {...},
    "Injury Prevention": {...},
    "Neural Tension": {...}
  }
}
```

---

## Octane Endpoints

### Pitching Payload

**GET** `/api/octane/pitching-payload?athleteUuid=<uuid>`

Returns legacy-style pitching payload matching `output_payload.json` format.

**Response:**
```json
{
  "athleteUuid": "...",
  "level": "HS",
  "score": 95.5,
  "metrics": [...]
}
```

---

### Report Payloads

**GET** `/api/octane/report-payloads?athleteUuid=<uuid>`

**GET** `/api/octane/report-payloads?limit=10`

Returns athlete report payloads with assessment counts.

---

## Error Responses

All endpoints return consistent error formats:

```json
{
  "error": "Error message here"
}
```

**Status Codes:**
- `200`: Success
- `400`: Bad Request (validation error)
- `401`: Unauthorized (missing/invalid API key)
- `404`: Not Found (athlete/session not found)
- `500`: Internal Server Error
