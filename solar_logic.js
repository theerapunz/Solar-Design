/**
 * Solar Logic Module (Refined)
 * Professional-grade calculations for solar irradiance, temperature derating, 
 * inverter clipping, and hybrid battery simulation.
 */

/**
 * Generates a solar irradiance and temperature derating curve.
 * @param {Object} params { azimuth, tilt, hours, peakTemp }
 * @returns {Array<Object>} Array of { irr, tempDerate }
 */
function getSolarRefinedCurve(azimuthDeg, tiltDeg, hours, peakTemp = 35) {
  const az = ((azimuthDeg % 360) + 360) % 360;
  const azMap = {0:0.60, 45:0.75, 90:0.85, 135:0.95, 180:1.00, 225:0.95, 270:0.85, 315:0.75};
  const azFactor = azMap[az] !== undefined ? azMap[az] : 0.85;
  
  let shift = 0;
  if (az > 0 && az < 180) shift = -(az / 180) * 0.8;
  else if (az > 180 && az < 360) shift = ((az - 180) / 180) * 0.8;
  
  const tiltOpt = 13;
  const tiltFactor = Math.max(0.72, 1 - Math.abs(tiltDeg - tiltOpt) * 0.007);
  
  const minTemp = 25; // Typical morning/night temp

  return hours.map(h => {
    const xs = h - (12.0 + shift);
    // Gaussian irradiance model - Sigma 1.9 matches ~4.8 PSH
    const irr = Math.max(0, Math.exp(-(xs * xs) / (2 * 1.9 * 1.9)) * azFactor * tiltFactor);
    
    // Temperature Model
    // T_amb peaks slightly after solar peak
    const tAmb = minTemp + (peakTemp - minTemp) * Math.max(0, Math.exp(-((xs-1) * (xs-1)) / (2 * 4 * 4)));
    const tCell = tAmb + (irr * 25); // Cell is hotter than ambient
    const tempDerate = 1 - (Math.max(0, tCell - 25) * 0.0041); // -0.41% per degC
    
    return { irr, tempDerate };
  });
}

/**
 * Builds a 24-hour load profile (48 slots).
 */
function buildLoadProfile(loads) {
  const slots = [];
  for (let h = 0; h < 24; h += 0.5) slots.push(h);
  return slots.map(h => loads.reduce((sum, a) => h >= a.s && h < a.e ? sum + a.p : sum, 0));
}

/**
 * Simulates the entire hybrid system including Inverter Clipping and Standby Loss.
 * @param {Object} params { slots, solarRawCurve, solarKw, invKw, invStandbyW, loadProfile, batCap, batDod, batEff }
 */
function simulateSystem(params) {
  const { slots, solarRawCurve, solarKw, invKw, invStandbyW, loadProfile, batCap, batDod, batEff } = params;
  
  const maxSOCWh = batCap * 1000;
  const minSOCWh = maxSOCWh * (1 - batDod);
  let currentSOCWh = minSOCWh;
  
  const results = {
    solarAC: [], // After clipping and derating
    socHistory: [],
    selfWh: 0,
    exportWh: 0,
    clippedWh: 0,
    standbyWh: 0
  };

  slots.forEach((h, i) => {
    const { irr, tempDerate } = solarRawCurve[i];
    
    // 1. DC to AC conversion with clipping
    const solarDC = irr * solarKw * 1000 * tempDerate;
    const solarACBeforeClipping = solarDC * 0.96; // 96% Inverter Eff
    const solarAC = Math.min(solarACBeforeClipping, invKw * 1000);
    results.clippedWh += Math.max(0, (solarACBeforeClipping - solarAC) * 0.5);
    results.solarAC.push(solarAC);

    // 2. Load & Standby
    const pLoad = loadProfile[i];
    const pStandby = invStandbyW;
    results.standbyWh += pStandby * 0.5;
    
    const netP = solarAC - (pLoad + pStandby);
    const deltaWh = netP * 0.5;

    if (deltaWh > 0) {
      // Surplus: Charge battery first, then export
      const chargeReq = maxSOCWh > 0 ? Math.min(deltaWh * batEff, maxSOCWh - currentSOCWh) : 0;
      currentSOCWh += chargeReq;
      results.selfWh += (pLoad * 0.5) + (chargeReq / batEff);
      results.exportWh += Math.max(0, deltaWh - (chargeReq / batEff));
    } else {
      // Deficit: Discharge battery
      const dischargeLimit = currentSOCWh - minSOCWh;
      const dischargeReq = maxSOCWh > 0 ? Math.min(-deltaWh, dischargeLimit * batEff) : 0;
      currentSOCWh -= (dischargeReq / batEff);
      results.selfWh += (solarAC * 0.5) + dischargeReq;
    }
    
    results.socHistory.push(maxSOCWh > 0 ? (currentSOCWh / maxSOCWh * 100) : 0);
  });

  return results;
}

if (typeof module !== 'undefined') {
  module.exports = { getSolarRefinedCurve, buildLoadProfile, simulateSystem };
}
