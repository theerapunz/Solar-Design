# 📄 Implementation Plan (SDD): Project Baseline & Next Step

**Objective:** Document the current design and plan for **SI.3: Battery Storage Estimation**.

---

## 📐 Current Design (ISO 29110 SI Analysis/Design)

### **1. Core Logic (Solar & Load Engine)**
- **Solar Irradiance:** Modeled using a simplified Gaussian distribution (`getSolarCurve`). It accounts for **Azimuth** (8 fixed points), **Tilt Angle**, and **System Efficiency**.
- **Load Aggregation:** Sums power (Watts) across 10 categories over half-hour slots (06:00-18:00).
- **Financial Model:** Simple ROI (Payback) = Total Cost / (Annual Savings from self-consumption).

### **2. UI Architecture**
- **Grid Layout:** 2-column layout (Sidebar/Main).
- **Interactivity:** Real-time updates using `oninput` events and manual `calculate()` triggers.
- **Visualization:** `Chart.js` for dual-axis (Load vs. Generation).

---

## 🔋 Proposed Enhancement: SI.3 Battery Storage Estimation

### **Technical Strategy**
1.  **UI Updates:**
    - Add "Battery Storage" section in the sidebar.
    - Fields: Capacity (kWh), DoD (%), Efficiency (%), and Battery Price/kWh.
2.  **Calculation Logic:**
    - Track "Surplus" (Solar - Load) to charge the battery.
    - Track "Deficit" (Load - Solar) to discharge the battery.
    - Implement a State of Charge (SOC) variable updated iteratively through the time slots.
3.  **Visualization:**
    - Add a new line or area series to `mainChart` for **Battery SOC (%)**.
4.  **Financial Impact:**
    - Update annual savings to include battery discharge usage.
    - Update total cost to include battery procurement.

---

## 🛡️ Validation Strategy (ISO 29110 SI Test)
- **Unit Test:** Verify that `SOC` never exceeds capacity and never drops below (Capacity * (1 - DoD)).
- **Integration Test:** Ensure battery is only charged when Solar > Load.
- **UX Test:** Confirm the new SOC line is clearly visible and doesn't clutter the main chart.
