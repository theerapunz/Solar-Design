/**
 * Unit Tests for Refined Solar Logic
 */

const { getSolarRefinedCurve, buildLoadProfile, simulateSystem } = require('./solar_logic.js');

function assert(condition, message) {
  if (!condition) {
    console.error('❌ FAIL: ' + message);
    process.exit(1);
  }
  console.log('✅ PASS: ' + message);
}

function testRefinedLogic() {
  const hours = [12]; // Peak noon
  const slots = [12];
  const loadProfile = [0];
  
  // 1. Test Temperature Derating
  const curveCool = getSolarRefinedCurve(180, 15, hours, 25); // Ambient 25C
  const curveHot = getSolarRefinedCurve(180, 15, hours, 45);  // Ambient 45C
  assert(curveHot[0].tempDerate < curveCool[0].tempDerate, 'Higher ambient temp should increase derating (lower factor)');

  // 2. Test Inverter Clipping
  // Solar 10kWp on 5kW Inverter
  const params = {
    slots: [12],
    solarRawCurve: [{ irr: 1.0, tempDerate: 1.0 }],
    solarKw: 10,
    invKw: 5,
    invStandbyW: 0,
    loadProfile: [0],
    batCap: 0,
    batDod: 0.8,
    batEff: 0.95
  };
  const results = simulateSystem(params);
  assert(results.solarAC[0] === 5000, 'Solar AC should be clipped at 5000W (Inverter limit)');
  assert(results.clippedWh > 0, 'Should record clipped energy');

  // 3. Test Standby Loss
  params.invStandbyW = 100; // 100W standby
  params.solarKw = 0; // Night
  const resultsNight = simulateSystem(params);
  assert(resultsNight.selfWh === 0, 'No generation, standby is drawn from grid/bat (not self-consumed from solar)');
}

console.log('🚀 Running Refined Logic Tests...');
testRefinedLogic();
console.log('\n🌟 REFINED LOGIC VERIFIED!');
