# 📋 Project Task List: Solar On-Grid Designer

**Project Status:** 🟢 Active (ISO 29110 SI Implementation Phase)
**Current Version:** 1.0.0

---

## 🏗️ Phase 1: Foundation & Baseline (SI Initiation)
- [x] **SI.1: Project Setup & Codebase Analysis**
  - [x] Map existing `solar_designer.html` structure.
  - [x] Validate initial calculation models (Solar & Load).
- [x] **SI.2: Documentation Initialization**
  - [x] Create `task.md` (Task List).
  - [x] Create `implement_plan.md` (Initial Design/SDD).

## 🚀 Phase 2: Functional Enhancements
- [x] **SI.3: Battery Storage Estimation (Hybrid Support)**
  - [x] Update UI with Battery Capacity inputs.
  - [x] Implement DoD (Depth of Discharge) and efficiency logic.
  - [x] Add Battery SOC (State of Charge) visualization to the chart.
- [x] **SI.4: Advanced Load Scheduling**
  - [x] Support custom 24-hour load profiles.
  - [x] Add "Preset" profiles (Office, Remote Work, Heavy AC).
  - [x] Modularize core logic and implement unit tests.
- [x] **SI.4.1: Core Logic Refinement**
  - [x] Implement Inverter Clipping & AC conversion efficiency.
  - [x] Implement Dynamic Temperature Derating curve.
  - [x] Add Inverter Standby Loss (24/7 simulation).

## 🎨 Phase 3: UI/UX & Polish
- [x] **SI.5: Mobile Layout Optimization**
  - [x] Fix sidebar scrolling and add sticky calculate button on small screens.
  - [x] Optimize chart aspect ratio and label density for vertical view.
  - [x] Implement smooth-scroll to results logic.
- [x] **SI.6: Export & Reporting**
  - [x] Enhance PDF template with metadata fields (Project/Customer).
  - [x] Add "Share Link" functionality (URL-encoded state serialization).
  - [x] Implement URL hydration on page load.

---

## ✅ Verification & Validation (ISO 29110 SI Integration & Test)
- [x] **V&V.1:** Verify calculation accuracy against benchmarks.
  - [x] Specific yield calibrated to **1,468 kWh/kWp/year** (Standard: ~1450).
  - [x] Temperature derating verified at ~8.8% loss for 45°C.
- [x] **V&V.2:** Structural & Logic verification via `test_solar_logic.js`.
- [x] **V&V.3:** Print-to-PDF layout validation.
