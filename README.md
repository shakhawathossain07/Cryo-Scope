<div align="center">

# Cryo‑Scope 🌍  
**Real‑Time Arctic Permafrost & Methane Risk Intelligence Platform**  
Turning raw Earth observation data into transparent, science‑grade climate intelligence.

[![Status](https://img.shields.io/badge/status-production-green?style=flat-square)](#) [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE) [![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square)](#) [![NASA Data](https://img.shields.io/badge/Data-NASA%20POWER-orange?style=flat-square)](#) [![PDF Reports](https://img.shields.io/badge/Feature-NASA%20Style%20Reports-purple?style=flat-square)](#)  
*Production Build:* <strong>✔ 50s</strong> · *Routes:* <strong>17</strong> · *Bundle Shared JS:* <strong>102 kB</strong>

</div>

---

## 📌 Table of Contents
1. [Why Cryo‑Scope](#-why-cryo-scope)
2. [Key Capabilities](#-key-capabilities)
3. [Live Demo & Quick Links](#-live-demo--quick-links)
4. [Monitored Regions](#-monitored-regions)
5. [Scientific Methodology](#-scientific-methodology)
6. [Report Generation Engine](#-report-generation-engine)
7. [Architecture Overview](#-architecture-overview)
8. [Installation & Setup](#-installation--setup)
9. [Environment Variables](#-environment-variables)
10. [API Endpoints](#-api-endpoints)
11. [Data Sources & Provenance](#-data-sources--provenance)
12. [AI Usage Disclosure](#-ai-usage-disclosure)
13. [Performance & Optimization](#-performance--optimization)
14. [Security & Integrity](#-security--integrity)
15. [Roadmap](#-roadmap)
16. [Contributing](#-contributing)
17. [Citation](#-citation)
18. [License](#-license)
19. [Acknowledgements](#-acknowledgements)

---

## 🧭 Why Cryo‑Scope
Permafrost thaw is a high‑impact climate tipping element. When it destabilizes, **carbon and methane releases accelerate global warming**. Existing dashboards often treat variables in isolation. *Cryo‑Scope* fuses **temperature anomalies + methane atmospheric context + per‑region risk modeling** and automates *NASA‑style scientific PDF reporting* for immediate decision support.

**Mission:** Reduce research latency & increase transparency in Arctic climate intelligence through open, reproducible tooling.

---

## ✨ Key Capabilities
| Category | Highlights |
|----------|-----------|
| Real‑Time Monitoring | NASA POWER reanalysis temperature anomalies (z‑scores, >3σ extreme flagging) |
| Methane Context | Sentinel‑5P (TROPOMI) CH₄ visualization via Processing API (Copernicus/Sentinel Hub) |
| Risk Indexing | Composite per‑region permafrost destabilization risk tiers (Low → Extreme) |
| Scientific Reports | One‑click NASA/TM style PDF (figures, tables, methodology, citations) |
| Multi‑Region Comparison | Greenland • Alaska • Siberia • Canadian Archipelago side‑by‑side |
| Interactive Mapping | High‑resolution remote layers + anomaly overlays + temporal windowing |
| AI‑Assisted Narrative | OPTIONAL: Executive summaries (metrics remain deterministic) |
| Extensibility | Modular layer pipeline—future: InSAR, albedo, hydrology, carbon flux |

---

## 🔗 Live Demo & Quick Links
> (Add real links when deployed)

| Resource | Link |
|----------|------|
| Production App | https://your-netlify-site.netlify.app |
| Source Code | https://github.com/shakhawathossain07/Cryo-Scope |
| Quick Deploy Guide | `docs/QUICK_DEPLOY.md` |
| Netlify Deployment (Full) | `docs/NETLIFY_DEPLOYMENT_GUIDE.md` |
| Build / Optimization Summary | `docs/DEPLOYMENT_SUMMARY.md` |
| Optimization Checklist | `docs/OPTIMIZATION_CHECKLIST.md` |
| Env Vars Setup | `docs/NETLIFY_ENV_VARS_SETUP.md` |

---

## 🗺️ Monitored Regions
| Region | Focus Areas | Notes |
|--------|-------------|-------|
| Siberia | Yamal Peninsula, Lena Delta | Large carbon reservoir |
| Alaska North Slope | Prudhoe Bay, Teshekpuk | Rapid warming zone |
| Canadian Archipelago | Banks Island, Resolute | Seasonal variability |
| Greenland Margin | Kangerlussuaq, Ilulissat | Ice–permafrost coupling |

---

## 🧪 Scientific Methodology
**Pipeline Phases**
1. Baseline Acquisition → NASA POWER multi‑decadal climatology (μ, σ)
2. Real‑Time Fetch → Current day T2M, T2M_MAX, T2M_MIN
3. Anomaly Calculation → z = (T_current – μ)/σ (flag >3σ as *Extreme Anomaly*)
4. Methane Layer Integration → Sentinel‑5P CH₄ raster sampling & normalization
5. Composite Risk Scoring → f(thermal z, methane deviation percentile, persistence, sensitivity weight)
6. Uncertainty Layering → Confidence classification (High / Moderate / Caution)
7. Narrative Synthesis (OPTIONAL) → AI summary with provenance boundary

**Design Principles**
*Deterministic metrics • Transparent formulas • Clear uncertainty • Reproducibility over black box.*

---

## 🧾 Report Generation Engine
| Section | Contents |
|---------|----------|
| Title & Abstract | Auto‑filled metadata + timestamp |
| Executive Summary | AI‑assisted (optional) | 
| Regional Metrics | Temperature anomalies, methane context |
| Figures | 4+ publication‑quality charts (300 DPI) |
| Tables | Risk matrix, anomaly ranking, data provenance |
| Methodology | Statistical formulas, data lineage |
| Limitations | Atmospheric transport, temporal resolution |
| References | NASA & peer‑reviewed literature |

Exported via `jsPDF + html2canvas + autotable` with layout tuned to NASA Technical Memorandum style.

---

## 🏗 Architecture Overview
```
┌──────────────────────────┐
│        Client (UI)       │  Next.js (App Router), React 18, Tailwind, Recharts
└────────────┬─────────────┘
             │ fetch / actions
┌────────────▼─────────────┐
│  API Routes / Functions  │  /api/transparent-dashboard, /api/generate-report
└────────────┬─────────────┘
             │ orchestrate
┌────────────▼─────────────┐
│  Data & Processing Layer │  Anomaly calc, methane fusion, risk model
└────────────┬─────────────┘
             │ external fetch
┌────────────▼─────────────┐
│  NASA POWER  | Sentinel  │  External EO & climate services
│  GIBS / CMR  | Copernicus │
└────────────┬─────────────┘
             │ outputs
┌────────────▼─────────────┐
│  PDF Engine & AI Assist  │  Deterministic metrics + optional narrative
└──────────────────────────┘
```

---

## 🛠 Installation & Setup
```bash
git clone https://github.com/shakhawathossain07/Cryo-Scope.git
cd Cryo-Scope
npm install
cp .env.example .env.local   # Fill in required values
npm run dev                  # http://localhost:9002
```

**Production Build**
```bash
npm run build
npm start
```

> See `docs/NETLIFY_DEPLOYMENT_GUIDE.md` for platform specifics (memory, image domains, headers, caching).

---

## 🔐 Environment Variables
| Variable | Scope | Required | Description |
|----------|-------|----------|-------------|
| OPENROUTER_API_KEY | Server | Optional* | AI narrative (lazy loaded) |
| SENTINEL_HUB_CLIENT_ID / SECRET | Server | Yes (methane) | Copernicus OAuth |
| SENTINEL_HUB_INSTANCE_ID | Server | Yes | CH₄ visualization config |
| NEXT_PUBLIC_SENTINEL_HUB_INSTANCE_ID | Client | Yes | Mirror for map overlays |
| NEXT_PUBLIC_NASA_API_KEY | Client | Recommended | Higher request quota |
| EARTHDATA_BEARER_TOKEN | Server | Future | Direct Earthdata resources |
| NEXT_PUBLIC_SUPABASE_URL / ANON_KEY | Client | Optional | Persistence / auth expansion |

`OPENROUTER_API_KEY` throws only at runtime if missing (build safe).

Full reference: `.env.example` + `docs/NETLIFY_ENV_VARS_SETUP.md`.

---

## 🧵 API Endpoints
| Endpoint | Type | Purpose |
|----------|------|---------|
| `/api/transparent-dashboard` | GET | Aggregated region metrics (temperature, anomalies, CH₄ availability) |
| `/api/sentinel-processing` | POST | Methane layer Processing API proxy |
| `/api/sentinel-wms` | GET | WMS fallback CH₄ tiles |
| `/api/generate-report` | GET | Generates scientific (full / summary) report payload |
| `/api/regions/[regionId]/metrics` | GET | Per‑region structured metrics |
| `/api/regions/high-risk` | GET | High‑risk region shortlist |

---

## 🧬 Data Sources & Provenance
| Source | Use | Link |
|--------|-----|------|
| NASA POWER | Surface temperature, baselines | https://power.larc.nasa.gov/ |
| NASA GIBS | Context imagery | https://gibs.earthdata.nasa.gov/ |
| Sentinel‑5P (TROPOMI) | Atmospheric methane | https://dataspace.copernicus.eu/ |
| Sentinel Hub Processing API | CH₄ raster generation | https://docs.sentinel-hub.com/ |
| OpenRouter (Gemini) | Optional narrative | https://openrouter.ai/ |

All metrics list `source`, `retrieval timestamp`, and `confidence`. AI never modifies raw values.

---

## 🤖 AI Usage Disclosure
| Area | AI Role | Safeguard |
|------|---------|-----------|
| Report Narrative | Summaries & contextual prose | Metrics generated first deterministically |
| Code Scaffolding | Minor boilerplate suggestions | Manual audit & edits |
| No Synthetic Data | — | Explicit runtime guards |

No AI images/video currently used. Future AI media (if any) will include visible watermarks.

---

## ⚡ Performance & Optimization
| Optimization | Status |
|--------------|--------|
| Turbopack Dev Startup | ~2–4s ✔ |
| Bundle Split | Shared 102 kB ✔ |
| Source Maps (prod) | Disabled ✔ |
| Package Import Optimization | lucide-react, recharts ✔ |
| Memory Flags | 4 GB build (`NODE_OPTIONS`) ✔ |
| Image Remote Patterns | NASA / Copernicus whitelisted ✔ |
| PDF Generation | Client-side render + vector-friendly tables ✔ |

See: `docs/OPTIMIZATION_CHECKLIST.md` & `docs/DEPLOYMENT_SUMMARY.md`.

---

## 🛡 Security & Integrity
* Environment secrets never committed (see `.env.example`).
* Runtime fails gracefully if AI key absent.
* Security headers set (HSTS, X-Frame-Options, nosniff, etc.).
* Deterministic pipelines separate from optional AI layer.
* Transparent uncertainty reporting for scientific credibility.

---

## 🗺 Roadmap
| Phase | Feature | Status |
|-------|---------|--------|
| 1 | Core anomaly + CH₄ fusion | ✅ Done |
| 2 | Alerting / threshold webhooks | 🔜 |
| 3 | InSAR deformation ingestion (OPERA/S1) | Planned |
| 4 | Albedo & moisture integration | Planned |
| 5 | Carbon flux modeling linkage | Planned |
| 6 | Research export APIs (Jupyter / OGC) | Planned |
| 7 | Community peer review layer | Planned |

---

## 🤝 Contributing
We welcome scientific scrutiny, extensions, and performance improvements.

1. Fork & branch (`feature/my-improvement`)
2. Ensure build passes locally (`npm run build`)
3. Open a PR with: motivation, methodology notes, validation evidence
4. For scientific model changes include: assumptions, uncertainty impacts

> See forthcoming `CONTRIBUTING.md` (add if missing) & open an Issue for major proposals.

---

## 📚 Citation
If this project aids your research:
```
@software{cryoscope_2025,
  title        = {Cryo-Scope: Real-Time Arctic Permafrost & Methane Risk Intelligence Platform},
  author       = {Contributors, Cryo-Scope},
  year         = {2025},
  url          = {https://github.com/shakhawathossain07/Cryo-Scope},
  license      = {MIT},
  note         = {NASA POWER & Sentinel-5P integrated analytics}
}
```

---

## 📄 License
MIT — see [LICENSE](LICENSE). Please retain data source attributions.

---

## 🙏 Acknowledgements
* NASA POWER & GIBS teams for open climate intelligence.
* Sentinel‑5P / Copernicus programme for atmospheric monitoring.
* Open-source ecosystem: Next.js, Tailwind, Recharts, jsPDF.
* Scientific community advancing permafrost & methane research.

---

<div align="center"><strong>Built with integrity for planetary resilience.</strong><br/>Real NASA data • Open Science • Reproducible Analytics</div>

