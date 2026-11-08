// Physical Simulation, Deviation Integration, and History Buffer for AETHER-9
module.exports = `
// ==================== 物理模型与名义/实际分离 (Section 5) ====================
let thrustBias = 0; // 用户注入推力偏差 (-0.15 .. +0.05)
let e_v = 0, e_h = 0; // 速度偏差 (m/s), 高度偏差 (m)
let cumHeat = 0; // 累计热载荷 (MJ/m²)
let q_peak = 26.9, nG_peak = 4.0, heat_peak = 140; // 名义峰值
let q_caution = 33.6, q_crit = 40.35;
let nG_caution = 4.5, nG_crit = 5.5;
let heat_caution = 175, heat_crit = 210;

// 名义状态函数 (纯函数，不受故障与偏差影响)
function S_nom(x) {
  const k = lerp(K, x, 0), alt = k[1], v = k[2], th = k[3], pr = k[4];
  const mass = 30 + 5.2 * pr, I = mass * 169.6;
  const rho = 1.225 * Math.exp(-alt / 8500);
  const sos = Math.max(295, 340 - 0.0045 * alt);
  const M = v / sos;
  const q = 0.5 * rho * v * v / 1000;
  const Cd = 0.3 + 0.55 * Math.exp(-Math.pow((M - 1.1) / 0.28, 2)) + (M > 1.4 ? 0.05 : 0);
  const drag = q * Cd * 10.5;
  const heat = 1.74e-4 * Math.sqrt(rho / 0.3) * v * v * v / 1000;
  const depth = getThrottleDepth(x);
  const th_eff = th * (1 - depth / 100);
  const planned = planSet(x);
  const activeEngines = planned.length;
  const kN = (th_eff / 100) * activeEngines * 845;
  const nG = (kN + drag) / (mass * 9.81);
  const pk = lerp(PK, x, 0)[1];
  const tdv = 3 + Math.max(0, 2600 - cfg.burn) / 70;
  const pg = 1 + tdv * tdv / (2 * cfg.stroke * 9.81);
  const w = 0.2 + 6 * Math.exp(-Math.pow((x - 175) / 8, 2));
  return { alt, v, th, depth, th_eff, pr, mass, I, rho, sos, M, q, Cd, drag, heat, nG, kN, pk, tdv, pg, w, activeEngines, plannedEngines: planned.length };
}

// 启动时扫描名义峰值并计算限值 (§5.5)
function initNominalPeaks() {
  let maxQ = 0, maxG = 0, maxH = 0;
  for (let st = 0; st <= END; st += 0.5) {
    const s = S_nom(st);
    if (s.q > maxQ) maxQ = s.q;
    if (s.nG > maxG) maxG = s.nG;
    if (s.heat > maxH) maxH = s.heat;
  }
  q_peak = maxQ;
  nG_peak = maxG;
  heat_peak = maxH;
  q_caution = q_peak * 1.25;
  q_crit = q_peak * 1.5;
  nG_caution = 4.5;
  nG_crit = 5.5;
  heat_caution = heat_peak * 1.25;
  heat_crit = heat_peak * 1.5;
}
initNominalPeaks();

// 实际推力计算 (含发动机故障与推力偏差)
function getActualThrustInfo(x) {
  const k = lerp(K, x, 0), th = k[3];
  const depth = getThrottleDepth(x);
  const th_eff = th * (1 - depth / 100);
  const planned = planSet(x);
  const active = planned.filter(i => !fl[i]).length;
  const kN = (th_eff / 100) * active * 845 * (1 + thrustBias);
  return { kN, active, planned: planned.length, th_eff };
}

// 一阶偏差积分单步更新 (§5.2)
function stepDeviation(dt, curT) {
  if (curT <= 0) {
    e_v = 0; e_h = 0; cumHeat = 0;
    return;
  }
  const s_nom = S_nom(curT);
  const actThrust = getActualThrustInfo(curT);
  const r = s_nom.kN > 0 ? (actThrust.kN / s_nom.kN) : 1;
  const a_p = s_nom.mass > 0 ? (s_nom.kN / s_nom.mass) : 0; // m/s²
  
  if (s_nom.kN > 0) {
    const dev_dt = (r - 1) * a_p;
    e_v += dev_dt * dt;
  }
  e_h += e_v * dt;

  // 累计热载荷积分 (MJ/m²)
  const s_act = S_act(curT);
  cumHeat += (s_act.heat / 1000) * dt;
}

// 快速重新积分 (用于拖动进度或测试跳转)
function recomputeDeviationsUpTo(targetT) {
  e_v = 0; e_h = 0; cumHeat = 0;
  const dt = 0.1;
  for (let st = 0.1; st <= targetT + 0.001; st = +(st + dt).toFixed(1)) {
    const s_nom = S_nom(st);
    const actThrust = getActualThrustInfo(st);
    const r = s_nom.kN > 0 ? (actThrust.kN / s_nom.kN) : 1;
    const a_p = s_nom.mass > 0 ? (s_nom.kN / s_nom.mass) : 0;
    if (s_nom.kN > 0) {
      e_v += (r - 1) * a_p * dt;
    }
    e_h += e_v * dt;
    const rho = 1.225 * Math.exp(-Math.max(0, s_nom.alt + e_h) / 8500);
    const v_act = Math.max(0, s_nom.v + e_v);
    const heat = 1.74e-4 * Math.sqrt(rho / 0.3) * v_act * v_act * v_act / 1000;
    cumHeat += (heat / 1000) * dt;
  }
}

// 实际状态函数 (受故障、偏差与积分累积影响)
function S_act(x) {
  const nom = S_nom(x);
  const actThrust = getActualThrustInfo(x);
  const v_act = Math.max(0, nom.v + e_v);
  const alt_act = Math.max(0, nom.alt + e_h);
  
  const mass = nom.mass;
  const rho = 1.225 * Math.exp(-alt_act / 8500);
  const sos = Math.max(295, 340 - 0.0045 * alt_act);
  const M = v_act / sos;
  const q = 0.5 * rho * v_act * v_act / 1000;
  const Cd = 0.3 + 0.55 * Math.exp(-Math.pow((M - 1.1) / 0.28, 2)) + (M > 1.4 ? 0.05 : 0);
  const drag = q * Cd * 10.5;
  const heat = 1.74e-4 * Math.sqrt(rho / 0.3) * v_act * v_act * v_act / 1000;
  const kN = actThrust.kN;
  const nG = (kN + drag) / (mass * 9.81);
  const pk = nom.pk;
  const tdv = 3 + Math.max(0, 2600 - cfg.burn) / 70;
  const pg = 1 + tdv * tdv / (2 * cfg.stroke * 9.81);
  const w = nom.w;
  
  return {
    alt: alt_act, v: v_act, th: nom.th, depth: nom.depth, th_eff: actThrust.th_eff,
    pr: nom.pr, mass, I: nom.I, rho, sos, M, q, Cd, drag, heat, nG, kN,
    pk, tdv, pg, w, activeEngines: actThrust.active, plannedEngines: actThrust.planned,
    e_v, e_h, cumHeat
  };
}

// 统一物理入口 S (保持与旧代码完全兼容)
function S(x) {
  return S_act(x);
}

// 派生量辅助计算 (§5.5)
function getDerivedData(s_act, s_nom, curT) {
  const total_prop = s_act.pr * 5.2; // t
  const lox = total_prop * 0.719;
  const rp1 = total_prop * 0.281;
  const chamber_pc = 97 * (s_act.th_eff / 100) * (s_act.plannedEngines ? (s_act.activeEngines / s_act.plannedEngines) : 1);
  const cum_heat_mj = s_act.cumHeat;
  const eta_s = (curT >= 395 && s_act.v > 1) ? (s_act.alt / s_act.v).toFixed(1) + ' s' : '—';
  
  // 预测落点偏差
  const base_offset = curT >= 190 ? (3 + 800 * Math.pow(Math.max(0, (420 - curT) / 230), 2)) : 0;
  const pred_offset = base_offset + Math.abs(s_act.e_v) * 0.4;

  return { lox, rp1, chamber_pc, cum_heat_mj, eta_s, pred_offset };
}

function getNeed(x, alt) {
  if (x < 345) return 22;
  if (x < 362) return 22 - (x - 345) / 17 * 6;
  if (x < 395) return 16;
  return 2 + 14 * Math.min(1, Math.max(0, alt / 3000));
}

function mg(s, x) {
  const ph = P.filter(p => p <= x).length - 1;
  const need = getNeed(x, s.alt);
  const nf = planSet(x).filter(i => fl[i]).length;
  const br = x >= 395 && x < 420 ? s.alt - s.v * s.v / (2 * Math.max(.5, 10 * s.kN / 727)) : null;
  const pm = (s.pr - need) * 5.2;
  const ld = Math.min(100, s.q / 42 * 85 + s.nG * 3);
  const ca = 80 - 12 * nf - 25 * Math.exp(-Math.pow((x - 175) / 20, 2)) - 25 * Math.exp(-Math.pow((x - 350) / 12, 2));
  const of = x >= 190 ? 3 + 800 * Math.pow(Math.max(0, (420 - x) / 230), 2) : null;
  const lv = (v, w, c, inv) => inv ? (v < c ? 2 : v < w ? 1 : 0) : (v > c ? 2 : v > w ? 1 : 0);
  return [
    { r: br, z: '着陆制动', e: 'Landing brake', v: br == null ? '—' : (br < 0 ? '−' : '+') + Math.abs(Math.round(br)) + ' m', p: br == null ? 0 : cl(br / 12, 0, 100), s: br == null ? 0 : br < 0 ? 2 : (s.alt > 100 && br < 50) ? 2 : (s.alt > 200 && br < 150) ? 1 : 0 },
    { z: '推进剂', e: 'Propellant', v: pm.toFixed(1) + ' t', p: cl(pm / 40 * 100, 0, 100), s: lv(pm, 5, 2, 1) },
    { z: '控制权限', e: 'Control auth.', v: Math.round(ca) + '%', p: ca, s: lv(ca, 50, 30, 1) },
    { z: '结构载荷', e: 'Structural load', v: Math.round(ld) + '%', p: ld, s: lv(ld, 70, 90) },
    { z: '落点偏差', e: 'Impact offset', v: of == null ? '—' : of < 100 ? of.toFixed(1) + ' m' : Math.round(of) + ' m', p: of == null ? 0 : cl(of / 10, 0, 100), s: of == null ? 0 : of > 200 ? 2 : of > 20 ? 1 : 0 }
  ];
}

// ==================== 历史缓冲与环形序列 (Section 5.4) ====================
const Hist = (function() {
  const LEN = 4281; // 0..428s @ 10Hz
  const keys = ['alt', 'v', 'thrust', 'nG', 'q', 'mach', 'heat', 'prop', 'pitch', 'rate', 'brakeMargin', 'ctrlAuth', 'mass'];
  const nominalData = {};
  const actualData = {};
  
  keys.forEach(k => {
    nominalData[k] = new Float32Array(LEN);
    actualData[k] = new Float32Array(LEN);
  });

  // 预先填充名义历史
  function prefillNominal() {
    for (let i = 0; i < LEN; i++) {
      const st = i * 0.1;
      const sn = S_nom(st);
      const mg_n = mg(sn, st);
      nominalData.alt[i] = sn.alt;
      nominalData.v[i] = sn.v;
      nominalData.thrust[i] = sn.kN;
      nominalData.nG[i] = sn.nG;
      nominalData.q[i] = sn.q;
      nominalData.mach[i] = sn.M;
      nominalData.heat[i] = sn.heat;
      nominalData.prop[i] = sn.pr;
      nominalData.pitch[i] = sn.pk;
      nominalData.rate[i] = sn.w;
      nominalData.brakeMargin[i] = mg_n[0].r != null ? mg_n[0].r : 0;
      nominalData.ctrlAuth[i] = mg_n[2].p;
      nominalData.mass[i] = sn.mass;
    }
  }
  prefillNominal();

  function record(curT, sa, sn) {
    const idx = Math.min(LEN - 1, Math.round(curT * 10));
    const mg_a = mg(sa, curT);
    actualData.alt[idx] = sa.alt;
    actualData.v[idx] = sa.v;
    actualData.thrust[idx] = sa.kN;
    actualData.nG[idx] = sa.nG;
    actualData.q[idx] = sa.q;
    actualData.mach[idx] = sa.M;
    actualData.heat[idx] = sa.heat;
    actualData.prop[idx] = sa.pr;
    actualData.pitch[idx] = sa.pk;
    actualData.rate[idx] = sa.w;
    actualData.brakeMargin[idx] = mg_a[0].r != null ? mg_a[0].r : 0;
    actualData.ctrlAuth[idx] = mg_a[2].p;
    actualData.mass[idx] = sa.mass;
  }

  function reset() {
    keys.forEach(k => actualData[k].fill(0));
  }

  function getSeries(key, isNom) {
    return isNom ? nominalData[key] : actualData[key];
  }

  function getRecentSamples(key, curT, count) {
    const curIdx = Math.min(LEN - 1, Math.round(curT * 10));
    const startIdx = Math.max(0, curIdx - count + 1);
    const arr = [];
    for (let i = startIdx; i <= curIdx; i++) {
      arr.push({ t: +(i * 0.1).toFixed(1), act: actualData[key][i], nom: nominalData[key][i] });
    }
    return arr;
  }

  return { record, reset, getSeries, getRecentSamples };
})();
`;
