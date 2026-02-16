# AI/ML Project Architecture Recommendations

## Your Current Architecture

```
UAIS (Python/R) 
  └─> ETL/Data Processing
  └─> Writes to Neon DB

OctaneBiomechBackend (TypeScript/Next.js)
  └─> Read-only API
  └─> Reads from Neon DB
  └─> Serves data to Octane app

Neon Database
  └─> Single source of truth
  └─> Contains all biomechanics data
```

---

## Option 1: AI Project Using API (OctaneBiomechBackend)

**Architecture:**
```
AI/ML Project → OctaneBiomechBackend API → Neon DB
```

**Pros:**
- ✅ Clean separation of concerns
- ✅ Uses existing API infrastructure
- ✅ Good for learning API integration
- ✅ Consistent with how Octane app will work
- ✅ API handles authentication/security

**Cons:**
- ❌ Limited to what endpoints expose
- ❌ May need data not available via endpoints
- ❌ Network overhead for large datasets
- ❌ Can't do complex queries/joins
- ❌ Harder to do batch processing for training

**Best for:**
- Real-time predictions using limited features
- When you only need data from existing endpoints
- Learning API integration patterns

---

## Option 2: AI Project with Direct DB Access (Recommended)

**Architecture:**
```
AI/ML Project → Neon DB (read-only connection)
```

**Pros:**
- ✅ **Full access to all data** - any table, any field
- ✅ **Better for ML training** - can query entire datasets
- ✅ **Complex queries** - joins, aggregations, feature engineering
- ✅ **Batch processing** - efficient for training large models
- ✅ **No API limitations** - get exactly what you need
- ✅ **Separate from UAIS** - keeps ETL and ML concerns separate
- ✅ **Can still use API** - for real-time predictions if needed

**Cons:**
- ❌ Need to set up database connection
- ❌ Need to understand schema directly
- ❌ Bypasses API layer (but that's fine for ML)

**Best for:**
- **Training ML models** (needs full dataset)
- **Feature engineering** (complex queries)
- **Batch analysis** (processing large amounts of data)
- **Exploratory data analysis**

---

## Option 3: AI Project Within UAIS

**Architecture:**
```
UAIS Project
  └─> ETL/Data Processing
  └─> ML/AI Models (new)
```

**Pros:**
- ✅ Everything in one place
- ✅ Direct DB access already set up
- ✅ Can reuse existing data processing code

**Cons:**
- ❌ **Mixes concerns** - ETL + ML in same project
- ❌ Harder to deploy/scaling separately
- ❌ Can get messy with different dependencies
- ❌ Different deployment needs (ETL vs ML)

**Best for:**
- Small, simple ML tasks
- When ML is tightly coupled to ETL

---

## 🎯 Recommended Approach: Option 2 (Direct DB Access)

### Why This Makes Sense:

1. **ML Needs Full Data Access**
   - Training models requires access to entire datasets
   - You'll need to do complex feature engineering
   - Batch processing is more efficient with direct DB access

2. **Clean Architecture**
   - UAIS = ETL/Data Processing
   - OctaneBiomechBackend = API Service
   - AI/ML Project = Model Training & Inference
   - Each has a clear purpose

3. **Flexibility**
   - Can still use API for real-time predictions
   - Can query DB directly for training
   - Best of both worlds

4. **Learning Value**
   - You'll learn database querying (valuable skill)
   - Understand the full data model
   - Can compare API vs direct DB approaches

---

## Recommended Project Structure

```
Your Projects:
├── UAIS/ (Python/R)
│   └─> ETL, data processing, writes to DB
│
├── OctaneBiomechBackend/ (TypeScript/Next.js)
│   └─> Read-only API, serves data to Octane
│
└── UAIS-ML/ (Python - NEW PROJECT)
    └─> ML model training
    └─> Feature engineering
    └─> Model inference
    └─> Direct read-only DB connection
```

---

## Implementation Steps

### 1. Create New AI/ML Project

```bash
# Create new Python project
mkdir uais-ml
cd uais-ml
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
pip install pandas scikit-learn numpy sqlalchemy psycopg2-binary
```

### 2. Set Up Read-Only Database Connection

**`.env` file:**
```env
DATABASE_URL=postgresql://readonly-user:password@ep-cold-bonus-a4zk087n-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require
```

**Python connection:**
```python
import os
from sqlalchemy import create_engine
import pandas as pd

DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL)

# Query any table directly
df = pd.read_sql("""
    SELECT 
        a.athlete_uuid,
        a.age,
        a.weight,
        f.score,
        f.arm_velo
    FROM d_athletes a
    JOIN f_arm_action f ON a.athlete_uuid = f.athlete_uuid
    WHERE f.score IS NOT NULL
    ORDER BY f.session_date DESC
""", engine)
```

### 3. Use Read-Only Database User

**In Neon:**
1. Create a read-only user:
   ```sql
   CREATE USER ml_readonly WITH PASSWORD 'secure-password';
   GRANT CONNECT ON DATABASE neondb TO ml_readonly;
   GRANT USAGE ON SCHEMA public TO ml_readonly;
   GRANT USAGE ON SCHEMA analytics TO ml_readonly;
   GRANT SELECT ON ALL TABLES IN SCHEMA public TO ml_readonly;
   GRANT SELECT ON ALL TABLES IN SCHEMA analytics TO ml_readonly;
   ```

2. Create connection string for ML project:
   ```
   postgresql://ml_readonly:password@ep-cold-bonus-a4zk087n-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```

---

## Hybrid Approach (Best of Both Worlds)

You can use **both** approaches:

### For Training (Direct DB):
```python
# ML Project - Direct DB access
# Get full dataset for training
df = pd.read_sql("SELECT * FROM f_arm_action WHERE score IS NOT NULL", engine)
model.fit(df[features], df['score'])
```

### For Real-Time Predictions (API):
```python
# ML Project - Use API for predictions
import requests

response = requests.get(
    "https://octane-biomech-backend.vercel.app/api/uais/arm-action",
    params={"athleteUuid": athlete_uuid},
    headers={"X-API-Key": api_key}
)
data = response.json()
prediction = model.predict(data)
```

---

## Decision Matrix

| Need | Use API | Use Direct DB |
|------|---------|---------------|
| Training ML models | ❌ | ✅ |
| Feature engineering | ❌ | ✅ |
| Batch processing | ❌ | ✅ |
| Real-time predictions | ✅ | ✅ |
| Learning API patterns | ✅ | ❌ |
| Learning DB patterns | ❌ | ✅ |
| Full data access | ❌ | ✅ |

---

## Final Recommendation

**Create a new `UAIS-ML` project that:**
1. ✅ Connects directly to Neon DB (read-only)
2. ✅ Has full access to all tables for training
3. ✅ Can still use API for real-time predictions if needed
4. ✅ Keeps ML separate from ETL (UAIS) and API (OctaneBiomechBackend)
5. ✅ Allows you to learn database querying patterns

**This gives you:**
- Full data access for ML training
- Clean separation of concerns
- Learning opportunity (DB querying)
- Flexibility to use API when it makes sense

---

## Next Steps

1. Create new Python project: `uais-ml`
2. Set up read-only DB connection
3. Start with exploratory data analysis
4. Build feature engineering pipeline
5. Train your first model!

Want help setting up the new project structure?
