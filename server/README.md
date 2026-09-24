# 🛡️ ThreatSift — AI-Powered Cyber Threat Intelligence (CTI) & OSINT Platform

ThreatSift is an enterprise-grade **Cyber Threat Intelligence (CTI) and Open Source Intelligence (OSINT)** backend built on **Node.js, Express, Sequelize (MySQL / phpMyAdmin)** and powered by local **Ollama AI (`Qwen3:8b`)**.

ThreatSift continuously collects raw threat data across multi-source intelligence feeds, extracts and enriches Indicators of Compromise (IOCs), maps adversary Tactics, Techniques, and Procedures (TTPs) directly to the **MITRE ATT&CK Framework**, identifies threat campaign correlations, and generates **actionable intelligence reports (STIX 2.1 & Markdown)**.

---

## 🚀 Key Features

### 1. 🤖 Local AI Engine (Ollama + `Qwen3:8b`)
- **Zero Cloud Leakage**: All threat analysis and prompt evaluations run 100% locally on your machine via Ollama.
- **Deep Threat Extraction**: Automatically extracts Threat Actors (APTs), Malware Families, Targeted Sectors, Targeted Countries, Severity, Confidence, and Attack Vectors.
- **MITRE ATT&CK Mapping**: Maps observations to MITRE Tactics (`TA0001 Initial Access`, `TA0002 Execution`, etc.) and Techniques (`T1566 Phishing`, `T1059 Command & Scripting Interpreter`).
- **Resilient Fallback**: Includes an internal heuristic and regex CTI parser to ensure high availability even if the AI engine is busy.

### 2. 🌐 Multi-Source OSINT Feeds & Data Ingestion
- Pre-configured with live security feeds:
  - **CISA Cybersecurity Advisories & Alerts**
  - **BleepingComputer Cybersecurity News**
  - **The Hacker News RSS Feed**
  - **SANS Internet Storm Center Daily Diary**
  - **NIST NVD CVE Vulnerability Feeds**
- Flexible ingestion for RSS, JSON APIs, CVE feeds, Darkweb monitors, and custom webhooks.
- Ingestion staging queue with automated/on-demand AI processing.

### 3. 🔍 IOC Extraction & Correlation Engine
- **Automated Regex + AI Extraction**: Identifies IPv4, IPv6, Domains, URLs, SHA256, SHA1, MD5, CVE IDs, Email addresses, and Bitcoin wallets.
- **Multi-Source Correlation**: Automatically links threats sharing the same C2 infrastructures, malware hashes, or threat actors.
- **Multi-Format Export**: Export indicators to **STIX 2.1 JSON**, **CSV**, and **Snort / Suricata IDS rules**.

### 4. 📄 Actionable Intelligence Reports & STIX 2.1
- **Executive Briefings**: High-level impact and risk assessment for CISOs and executives.
- **Technical CTI Advisories**: In-depth TTPs, full IOC tables, and detection signatures.
- **Incident Remediation Playbooks**: Actionable mitigation and containment checklists.
- **Standardized Export**: Full **STIX 2.1** object bundle serialization.

### 5. 🗄️ MySQL & phpMyAdmin Integration
- Built with **Sequelize ORM** targeting **MySQL**.
- Auto-creates the `threatsift_db` database and synchronizes all tables on startup.
- Clean database schema visible in phpMyAdmin: `users`, `roles`, `permissions`, `threats`, `indicators`, `threat_indicators`, `feed_sources`, `threat_feed_items`, `reports`, `alerts`, and `refresh_tokens`.

---

## 🏛️ Architecture Overview

```
backend/
├── src/
│   ├── app.js                          # Express pipeline, helmet, cors, rate-limits
│   ├── server.js                       # Server entry point & graceful shutdown
│   ├── config/
│   │   ├── database.js                 # MySQL Sequelize connection & auto-database creator
│   │   ├── env.js                      # Environment configuration & Ollama settings
│   │   └── logger.js                   # Winston structured logger
│   ├── constants/
│   │   ├── httpCodes.constant.js       # HTTP status codes
│   │   ├── permissions.constant.js     # System & CTI permissions
│   │   └── roles.constant.js           # SUPER_ADMIN, ADMIN, MANAGER, USER
│   ├── database/
│   │   ├── init.js                     # Auto-sync & initial seed orchestrator
│   │   ├── models/                     # Sequelize models
│   │   │   ├── User.js                 # User credentials & profile
│   │   │   ├── Role.js                 # Roles
│   │   │   ├── Permission.js           # Granular permissions
│   │   │   ├── UserRole.js             # User <-> Role join table
│   │   │   ├── RolePermission.js       # Role <-> Permission join table
│   │   │   ├── RefreshToken.js         # JWT rotation tracking
│   │   │   ├── FeedSource.js           # OSINT Feed Sources
│   │   │   ├── ThreatFeedItem.js       # Ingested raw items
│   │   │   ├── Threat.js               # Analyzed Threat entities
│   │   │   ├── Indicator.js            # Indicators of Compromise (IOCs)
│   │   │   ├── ThreatIndicator.js      # Threat <-> Indicator join table
│   │   │   ├── Report.js               # Actionable CTI Reports & STIX
│   │   │   └── Alert.js                # Real-time CTI Alerts
│   │   └── seeders/
│   │       ├── initialSeed.js          # Default Roles, Permissions, Admin, & OSINT Feeds
│   │       └── runSeed.js              # Standalone seed runner
│   ├── middlewares/
│   │   ├── auth.middleware.js          # JWT verification & session loader
│   │   ├── rbac.middleware.js          # authorizeRoles, requirePermissions
│   │   ├── validate.middleware.js      # Joi schema validator
│   │   ├── error.middleware.js         # Centralized error handler
│   │   └── rateLimiter.middleware.js   # Rate limiting & brute force defense
│   ├── modules/
│   │   ├── auth/                       # JWT Authentication (Register, Login, Refresh, Logout)
│   │   ├── users/                      # User management & role assignment
│   │   ├── roles/                      # Role & permission management
│   │   ├── feeds/                      # OSINT Feed Collector & Source management
│   │   ├── threats/                    # AI Threat Ingestion & Analysis
│   │   ├── iocs/                       # IOC database & CSV/STIX/Snort exporters
│   │   ├── reports/                    # Actionable CTI Report generation
│   │   ├── alerts/                     # Real-time threat alerts
│   │   ├── enrichment/                 # On-demand OSINT lookups
│   │   └── dashboard/                  # CTI Metrics & MITRE ATT&CK Analytics
│   ├── services/
│   │   ├── ai/
│   │   │   ├── ollama.service.js       # Local Ollama API client (Qwen3:8b)
│   │   │   └── ai.service.js           # CTI Prompts, IOC extractor, STIX generator
│   │   └── correlation/
│   │       └── correlation.service.js  # Campaign & shared-IOC correlation engine
│   └── utils/
│       ├── asyncHandler.js             # Async error catcher
│       ├── jwt.util.js                 # JWT access & refresh token rotation
│       ├── password.util.js            # Bcrypt password hashing
│       ├── pagination.util.js          # Pagination calculations
│       └── response.util.js            # Standardized JSON response envelope
├── tests/
│   └── auth-rbac.test.js               # Complete CTI & AI test suite
├── .env.example
├── .env
├── package.json
└── README.md
```

---

## ⚙️ Environment Configuration (`.env`)

```env
# Server
PORT=5000
NODE_ENV=development

# MySQL / phpMyAdmin (XAMPP / WAMP defaults)
DB_DIALECT=mysql
DB_HOST=localhost
DB_PORT=3306
DB_NAME=threatsift_db
DB_USER=root
DB_PASSWORD=

# Ollama Local AI
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=Qwen3:8b
OLLAMA_TIMEOUT_MS=120000

# JWT Secrets
JWT_ACCESS_SECRET=threatsift_jwt_access_super_secret_key_2026_change_in_production
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_SECRET=threatsift_jwt_refresh_super_secret_key_2026_change_in_production
JWT_REFRESH_EXPIRES_IN=7d

# Default Super Admin
SUPER_ADMIN_NAME=Super Admin
SUPER_ADMIN_EMAIL=admin@threatsift.com
SUPER_ADMIN_PASSWORD=Admin@123456
```

---

## 🚀 Quick Start

### 1. Start MySQL & Ollama
- Ensure **MySQL** is running (e.g. start MySQL in XAMPP Control Panel).
- Ensure **Ollama** is running with `Qwen3:8b` (`ollama run Qwen3:8b` or running in background).

### 2. Start the Backend Server
```bash
cd backend
npm install
npm run dev
```

### 3. Run Automated Tests
```bash
npm test
```

---

## 📚 Complete API Reference (`/api/v1`)

### 🔓 Authentication (`/api/v1/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/auth/register` | Public | Register new account (default role: `USER`) |
| `POST` | `/auth/login` | Public | Authenticate user & issue token pair |
| `POST` | `/auth/refresh-token`| Public | Rotate refresh token for a fresh token pair |
| `POST` | `/auth/logout` | Public | Revoke active refresh token |
| `GET` | `/auth/me` | Authenticated | Retrieve authenticated user profile |
| `PUT` | `/auth/change-password` | Authenticated | Update user password |

---

### 🌐 OSINT Feed Sources (`/api/v1/feeds`)
| Method | Endpoint | Permission | Description |
|---|---|---|---|
| `GET` | `/feeds` | `feeds:read` | List all configured OSINT feed sources |
| `GET` | `/feeds/:id` | `feeds:read` | Get feed source details |
| `POST` | `/feeds` | `feeds:create` | Add a new custom feed source (RSS/CVE/API) |
| `PUT` | `/feeds/:id` | `feeds:update` | Update feed settings |
| `DELETE`| `/feeds/:id` | `feeds:delete` | Delete feed source |
| `POST` | `/feeds/:id/sync` | `feeds:sync` | Trigger immediate fetch of a feed |
| `POST` | `/feeds/sync-all` | `feeds:sync` | Sync all active OSINT feed sources |
| `GET` | `/feeds/items` | `feeds:read` | List raw ingested feed items |

---

### 🛡️ AI Threat Intelligence (`/api/v1/threats`)
| Method | Endpoint | Permission | Description |
|---|---|---|---|
| `POST` | `/threats/analyze` | `threats:analyze` | Ingest and analyze threat text with **Qwen3:8b** |
| `POST` | `/threats/process-feed/:feedItemId` | `threats:analyze` | Convert a raw feed item into an analyzed Threat |
| `GET` | `/threats` | `threats:read` | List paginated threats with filters |
| `GET` | `/threats/:id` | `threats:read` | Get threat details, IOCs, and MITRE mapping |
| `PUT` | `/threats/:id` | `threats:update` | Update threat details |
| `DELETE`| `/threats/:id` | `threats:delete` | Delete threat record |

---

### 🔍 Indicators of Compromise (`/api/v1/iocs`)
| Method | Endpoint | Permission | Description |
|---|---|---|---|
| `GET` | `/iocs` | `iocs:read` | List all extracted indicators with filtering |
| `GET` | `/iocs/:id` | `iocs:read` | Get single indicator details |
| `POST` | `/iocs` | `iocs:create` | Manually add a new IOC |
| `PUT` | `/iocs/:id` | `iocs:update` | Update indicator status/reputation |
| `DELETE`| `/iocs/:id` | `iocs:delete` | Delete indicator |
| `GET` | `/iocs/export` | `iocs:export` | Export IOCs to **STIX 2.1**, **CSV**, **Snort**, or **JSON** |

---

### 📄 Actionable CTI Reports (`/api/v1/reports`)
| Method | Endpoint | Permission | Description |
|---|---|---|---|
| `POST` | `/reports/generate` | `reports:create` | Generate AI report (**Executive / Technical / Playbook**) |
| `GET` | `/reports` | `reports:read` | List generated intelligence reports |
| `GET` | `/reports/:id` | `reports:read` | Get report content & STIX 2.1 data |
| `PUT` | `/reports/:id` | `reports:update` | Edit report |
| `DELETE`| `/reports/:id` | `reports:delete` | Delete report |

---

### 🚨 Threat Alerts (`/api/v1/alerts`)
| Method | Endpoint | Permission | Description |
|---|---|---|---|
| `GET` | `/alerts` | `alerts:read` | List real-time threat alerts |
| `GET` | `/alerts/:id` | `alerts:read` | Get alert details |
| `PATCH` | `/alerts/:id/status` | `alerts:update` | Acknowledge / Resolve alert status |
| `DELETE`| `/alerts/:id` | `alerts:delete` | Dismiss alert |

---

### 🔎 On-Demand OSINT Enrichment (`/api/v1/enrichment`)
| Method | Endpoint | Permission | Description |
|---|---|---|---|
| `POST` | `/enrichment/lookup` | `enrichment:query` | Quick AI OSINT lookup on IP/Domain/Hash/CVE |
| `POST` | `/enrichment/extract-iocs` | `enrichment:query` | Extract IOCs from raw text on the fly |

---

### 📊 CTI Command Center & Analytics (`/api/v1/dashboard`)
| Method | Endpoint | Permission | Description |
|---|---|---|---|
| `GET` | `/dashboard/overview` | `dashboard:access` | CTI Overview metrics, charts, & Ollama status |
| `GET` | `/dashboard/analytics` | `analytics:read` | MITRE ATT&CK matrix analytics & targeted demographics |
| `GET` | `/dashboard/executive` | `SUPER_ADMIN`, `ADMIN` | Administrative summary |

---

### 🤖 AI Search & Query History (`/api/v1/search`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/search` | Public | Execute query with local LLM & persist to Search table |
| `GET` | `/search` | Public | Fetch paginated search history with optional keyword search |
| `GET` | `/search/status` | Public | Get Ollama LLM connection status & model metadata |
| `GET` | `/search/:id` | Public | Get single search record and response |
| `DELETE`| `/search/:id` | Public | Delete individual search record |
| `DELETE`| `/search` | Public | Clear all search query history |

---

### 🩺 Health & AI Status (`/api/v1/health`)
- `GET /api/v1/health` — Returns Database status and local Ollama (`Qwen3:8b`) engine status.

---

## 💻 Frontend Application (`/client`)
A reactive React + Vite + Tailwind CSS frontend interface is located in the `client/` directory.

### Quick Start for Frontend:
```bash
cd client
npm install
npm run dev
```
The application will launch at `http://localhost:3000` with:
- Live AI LLM Search Bar with interactive prompt suggestion chips
- Real-time Ollama status monitor and model switcher
- Rich Markdown rendering with code blocks & one-click copy
- Search History slide-over drawer with keyword filtering & deletion controls
- Collapsible AI engine configuration modal (Model selector, System prompt, Temperature slider)

