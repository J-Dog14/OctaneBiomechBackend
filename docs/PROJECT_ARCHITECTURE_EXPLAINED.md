# Project Architecture & Relationship Explained

## Overview: Two Projects, Different Roles

You have **two complementary projects** that serve different purposes in your data pipeline:

1. **UAIS (Python/R)** - Data Processing & ETL Pipeline
2. **OctaneBiomechBackend (TypeScript/Next.js)** - API Service for Data Consumption

They work together but are **NOT replacements** for each other. Here's the breakdown:

---

## 🐍 UAIS Project: The Data Pipeline

### What It Does:
UAIS is your **data ingestion and processing pipeline**. It:

1. **Reads raw data** from various sources:
   - Excel files (Proteus exports, Mobility assessments, etc.)
   - Legacy SQLite databases (movement_database_v2.db, pro-sup_data.sqlite, etc.)
   - External systems (via API connections)

2. **Processes and transforms** the data:
   - Parses Excel files with complex structures
   - Runs R scripts for kinematics calculations (pitching, hitting)
   - Matches athletes across systems using UUIDs
   - Validates and cleans data

3. **Writes to Neon database**:
   - Creates/updates athlete records in `d_athletes` table
   - Inserts measurement data into fact tables (`f_athletic_screen`, `f_pro_sup`, etc.)
   - Maintains `source_athlete_map` for cross-system identity

### Key Characteristics:
- **Script-based**: Runs as batch jobs (`run_all_etl.py`)
- **Local execution**: Runs on your machine or a server
- **Write-heavy**: Creates and updates database records
- **Python/R ecosystem**: Uses pandas, numpy, R for statistical analysis
- **File-based inputs**: Reads from local file system or network shares

### Example Workflow:
```
1. New Proteus export arrives → data/proteus/inbox/proteus_export_20260112.xlsx
2. You run: python python/scripts/run_all_etl.py
3. UAIS:
   - Parses the Excel file
   - Matches athletes by name/UUID
   - Calculates metrics
   - Inserts into Neon: f_proteus table
```

### "Local to My Machine" Scripts Explained:
When someone says scripts are "local to your machine," they likely mean:
- **File paths** are hardcoded to your Windows paths (`C:\Users\Joey\...`)
- **Database connections** point to local SQLite files or your specific Neon instance
- **Dependencies** might not be fully documented (missing from requirements.txt)
- **Environment setup** requires manual configuration that's not in the repo

**However**, if these scripts are in your Git repo, others CAN access them. The issue is:
- They might not work on another machine without path/config changes
- They might require local files that aren't in the repo
- They might need environment variables or credentials not documented

---

## 🚀 OctaneBiomechBackend: The API Service

### What It Does:
OctaneBiomechBackend is a **read-only API service** that:

1. **Exposes your Neon database** via HTTP endpoints
2. **Provides secure access** to biomechanics data
3. **Serves other applications** (like "Octane" - your main app)
4. **Validates requests** using TypeScript types and Zod schemas

### Key Characteristics:
- **API-first**: HTTP endpoints, not scripts
- **Read-only**: Never writes to the database
- **Type-safe**: TypeScript catches errors at compile time
- **Deployed service**: Runs on Vercel (cloud), accessible from anywhere
- **Server-to-server**: Designed for other apps to call it, not humans

### Example Workflow:
```
1. Your "Octane" app needs athlete data
2. Octane makes HTTP request:
   GET https://biomech-api.vercel.app/api/biomech/sessions?orgId=123
   Headers: X-API-Key: secret-key
3. OctaneBiomechBackend:
   - Validates API key
   - Queries Neon database
   - Returns JSON response
```

---

## 🔄 How They Work Together

```
┌─────────────────────────────────────────────────────────────┐
│                    DATA FLOW DIAGRAM                         │
└─────────────────────────────────────────────────────────────┘

┌──────────────┐         ┌──────────────┐         ┌──────────┐
│  Raw Data    │         │     UAIS     │         │   Neon   │
│  Sources     │────────▶│  (Python/R)  │────────▶│ Database │
│              │         │              │         │          │
│ • Excel      │         │ • Parse      │         │ • d_athletes│
│ • SQLite     │         │ • Transform  │         │ • f_* tables│
│ • External   │         │ • Calculate  │         │          │
└──────────────┘         └──────────────┘         └────┬─────┘
                                                        │
                                                        │ (reads)
                                                        ▼
                                              ┌──────────────────┐
                                              │ OctaneBiomech    │
                                              │ Backend (API)    │
                                              │                  │
                                              │ • TypeScript     │
                                              │ • Next.js        │
                                              │ • Prisma         │
                                              └────────┬─────────┘
                                                       │
                                                       │ (HTTP API)
                                                       ▼
                                              ┌──────────────────┐
                                              │   Octane App     │
                                              │   (Your Main App)│
                                              │                  │
                                              │ • Frontend       │
                                              │ • User Interface │
                                              └──────────────────┘
```

### The Complete Flow:

1. **Data Ingestion (UAIS)**:
   - New data arrives (Excel, database exports, etc.)
   - You run UAIS scripts locally
   - UAIS processes and writes to Neon

2. **Data Storage (Neon)**:
   - All processed data lives here
   - Both projects connect to the same Neon database
   - UAIS writes, OctaneBiomechBackend reads

3. **Data Consumption (OctaneBiomechBackend)**:
   - Your Octane app needs to display data
   - Instead of connecting directly to Neon (security risk), it calls the API
   - API validates requests, queries Neon, returns data

---

## 🎯 Why Two Projects? Why Not One?

### Separation of Concerns:

| Aspect | UAIS (Python) | OctaneBiomechBackend (TypeScript) |
|--------|---------------|-----------------------------------|
| **Purpose** | Data processing | Data serving |
| **Execution** | Batch jobs (run when needed) | Always-on service |
| **Database** | Reads AND writes | Read-only |
| **Language** | Python/R (data science) | TypeScript (web APIs) |
| **Deployment** | Local/server scripts | Cloud (Vercel) |
| **Users** | Data engineers/analysts | Frontend apps |
| **Input** | Files, databases | HTTP requests |
| **Output** | Database records | JSON responses |

### Benefits of Separation:

1. **Security**:
   - Octane app doesn't need direct database access
   - API can enforce authentication, rate limiting, validation
   - Database credentials stay on the server

2. **Scalability**:
   - API can be deployed globally (CDN)
   - Multiple apps can use the same API
   - Database connections are pooled efficiently

3. **Type Safety**:
   - TypeScript ensures API contracts are correct
   - Zod validates requests at runtime
   - Catches errors before they hit production

4. **Maintainability**:
   - Clear boundaries: "This processes data, this serves data"
   - Different teams can work on each
   - Easier to test and debug

---

## 🔍 Practical Examples

### Example 1: New Athlete Data Arrives

**Scenario**: You receive a new Proteus export file.

**UAIS Workflow**:
```bash
# 1. File arrives
data/proteus/inbox/proteus_export_20260112.xlsx

# 2. Run ETL
cd C:\Users\Joey\PycharmProjects\UAIS
python python/scripts/run_all_etl.py

# 3. UAIS processes:
#    - Parses Excel
#    - Matches athlete by name → finds UUID
#    - Calculates metrics
#    - Inserts into Neon: f_proteus table
```

**OctaneBiomechBackend Role**:
- Not involved in this step
- Just sits there, ready to serve data

**After Processing**:
```bash
# Octane app wants to show this data
# Makes API call:
GET https://biomech-api.vercel.app/api/biomech/sessions?orgId=123&athleteId=uuid-here
# Returns the data UAIS just inserted
```

### Example 2: Team Member Needs to Run Data

**The Problem**:
- UAIS scripts have hardcoded paths: `C:\Users\Joey\PycharmProjects\UAIS\data\...`
- Team member's path: `C:\Users\Sarah\Documents\UAIS\data\...`
- Scripts fail because paths don't match

**Why OctaneBiomechBackend is Better for Team**:
- No local paths needed
- Just needs API key (in environment variable)
- Works from any machine, any location
- TypeScript types guide them: "This endpoint needs orgId, athleteId, etc."

**But UAIS Still Needed**:
- Someone still needs to process raw data files
- That person needs UAIS running locally
- But once data is in Neon, everyone uses the API

### Example 3: Future: Second Neon Database

**Your Goal**: "Communicate between Neon DB (current) and another Neon DB (future)"

**How This Works**:
```
Current Setup:
UAIS → Neon DB 1 (biomechanics data)
OctaneBiomechBackend → Reads from Neon DB 1

Future Setup:
UAIS → Neon DB 1 (biomechanics) + Neon DB 2 (other data)
OctaneBiomechBackend → Reads from Neon DB 1
New API Service → Reads from Neon DB 2
Octane App → Calls both APIs
```

**Or**:
```
OctaneBiomechBackend could:
- Read from Neon DB 1 (current)
- Also read from Neon DB 2 (future)
- Combine data in API responses
- Octane app gets unified data from one API
```

---

## 📋 Key Differences Summary

### UAIS (Python/R):
- ✅ **Does**: Data processing, ETL, calculations
- ✅ **Input**: Files, databases, external APIs
- ✅ **Output**: Database writes
- ✅ **Runs**: On-demand (batch jobs)
- ✅ **Location**: Your machine or server
- ✅ **Language**: Python/R (data science tools)
- ⚠️ **Issues**: Local paths, hardcoded configs, manual setup

### OctaneBiomechBackend (TypeScript):
- ✅ **Does**: Serves data via HTTP API
- ✅ **Input**: HTTP requests with API keys
- ✅ **Output**: JSON responses
- ✅ **Runs**: Always-on (deployed service)
- ✅ **Location**: Vercel (cloud)
- ✅ **Language**: TypeScript (web development)
- ✅ **Benefits**: Type-safe, validated, secure, team-friendly

---

## 🛠️ What "Local to My Machine" Really Means

### The Confusion:
You said: "If someone does a pull request from my repo, how wouldn't they have access to it?"

**Answer**: They DO have access to the code, but:

1. **File Paths**:
   ```python
   # In your script:
   excel_path = r"C:\Users\Joey\PycharmProjects\UAIS\data\proteus\inbox\file.xlsx"
   
   # On Sarah's machine:
   # This path doesn't exist! Script fails.
   ```

2. **Database Connections**:
   ```python
   # Your .env (not in repo):
   DATABASE_URL=postgresql://your-neon-connection
   
   # Sarah needs to:
   # - Get her own Neon connection string
   # - Set up .env file
   # - But if paths are hardcoded, still fails
   ```

3. **Missing Dependencies**:
   ```python
   # requirements.txt might be missing:
   # - pandas==2.1.0  # You have it, but not listed
   # - Some R packages
   # - System libraries
   ```

### The Solution (Why TypeScript Project is Better):

**OctaneBiomechBackend**:
- ✅ No file paths (reads from database)
- ✅ Environment variables (documented, easy to set)
- ✅ All dependencies in package.json
- ✅ Works the same on any machine
- ✅ TypeScript catches errors before runtime

**But UAIS Still Needed For**:
- Processing raw files (someone has to do it)
- Running R calculations
- Initial data ingestion

---

## 🎓 Practical Applications

### When to Use UAIS:
- 📥 New data files arrive (Excel, CSV, etc.)
- 🔄 Need to process/transform data
- 🧮 Running statistical calculations (R scripts)
- 📊 Batch updates to database
- 🔍 Data quality checks and fixes

### When to Use OctaneBiomechBackend:
- 🌐 Building a web app that displays data
- 📱 Mobile app needs biomechanics data
- 🔗 Integrating with other services
- 👥 Multiple team members need data access
- 🔒 Need secure, validated data access

### When to Use Both:
- ✅ Complete data pipeline:
  1. UAIS processes new data → writes to Neon
  2. OctaneBiomechBackend serves that data → Octane app displays it

---

## 🚀 Next Steps & Recommendations

### For UAIS:
1. **Document file paths** in config files (not hardcoded)
2. **Use environment variables** for all paths/connections
3. **Complete requirements.txt** with all dependencies
4. **Add setup script** that checks environment
5. **Create README** with setup instructions

### For OctaneBiomechBackend:
1. ✅ Already well-structured
2. ✅ Type-safe and validated
3. ✅ Ready for team collaboration
4. **Next**: Build out more endpoints as needed
5. **Next**: Add rate limiting, monitoring

### For Your Workflow:
1. **Keep UAIS** for data processing (it's necessary)
2. **Use OctaneBiomechBackend** for serving data (it's better for team)
3. **Document** which scripts need local setupf
4. **Consider** moving UAIS to a server/VM so it's not "local to your machine"

---

## 💡 Summary

**UAIS** = Your data processing engine (Python/R, batch jobs, writes to DB)
**OctaneBiomechBackend** = Your data serving API (TypeScript, always-on, reads from DB)

They're **complementary**, not replacements:
- UAIS gets data INTO the database
- OctaneBiomechBackend gets data OUT of the database

Both connect to the same Neon database, but serve different purposes in your architecture.
