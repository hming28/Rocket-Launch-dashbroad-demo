// 6 Position Views Implementation (FLIGHT, FDO, PROP, GNC, LOAD, REC) and Tall Widget Strip
module.exports = `
// ==================== 6 个岗位视图详细渲染 (Section 6) ====================
let activeConsoleView = 0; // 0..5 对应总览、轨迹、推进、姿态、气动热、回收
let lastRenderedView = -1;

const Views = (function() {
  const VIEW_NAMES = [
    { zh: '总览 FLIGHT', en: 'FLIGHT OVERVIEW', short: '总览' },
    { zh: '轨迹 FDO', en: 'FDO TRAJECTORY', short: '轨迹' },
    { zh: '推进 PROP', en: 'PROPULSION', short: '推进' },
    { zh: '姿态 GNC', en: 'ATTITUDE & GNC', short: '姿态' },
    { zh: '气动热 LOAD', en: 'AERO & THERMAL', short: '气动热' },
    { zh: '回收 REC', en: 'RECOVERY', short: '回收' }
  ];

  const SPARK_SERIES_MAP = {
    prop1: 'prop',
    thrust: 'thrust',
    g: 'nG',
    q: 'q',
    mach: 'mach',
    heat: 'heat',
    att: 'pitch',
    mass: 'mass',
    brk: 'brakeMargin'
  };

  let lastMountedTallWidgets = new Array(12).fill(null);
  let lastMountedCompactL = new Array(5).fill(null);
  let lastMountedCompactR = new Array(4).fill(null);

  function resetMountCache() {
    lastMountedTallWidgets.fill(null);
    lastMountedCompactL.fill(null);
    lastMountedCompactR.fill(null);
  }

  // 12 格小部件 Tall Variant 渲染器 (§13.4, 104x150)
  function renderTallWidget(slotIdx, wId, s, curT) {
    const s_nom = S_nom(curT);
    const derived = getDerivedData(s, s_nom, curT);
    let title = '', valStr = '', unitStr = '', isSim = false, isDerived = false;
    let barPct = 0, barWarn = false, barCrit = false;
    let devVal = null, devUnit = '';

    if (wId === 'eng1') {
      // 发动机矩阵占 2 格 (S1+S2)
      return \`
        <div class="c-tall-widget" style="grid-column: span 2" data-slot="\${slotIdx}">
          <div class="w-hdr">
            <span>\${L('一级发动机矩阵', 'S1 ENGINE MATRIX')}</span>
            <span class="lb tall-eng-stat">\${s.activeEngines} / \${s.plannedEngines} 在线</span>
          </div>
          <div style="display:flex;align-items:center;gap:12px;margin:auto 0">
            <div class="tall-eng-svg-box">\${getEngineMatrixSvg(46)}</div>
            <div>
              <div class="w-num tall-eng-thrust">\${Math.round(s.kN)}<small style="font-size:11px;color:var(--t2)"> kN</small></div>
              <div class="lb tall-eng-throt" style="margin-top:2px">\${L('节流', 'Throttle')} \${Math.round(s.th_eff)}%</div>
            </div>
          </div>
          <div class="lb" style="font-size:9px;color:var(--t2)">\${L('二级状态: ', 'S2: ')}\${getStage2State(curT).statusTextZh} <span class="sim-badge">SIM</span></div>
        </div>\`;
    }

    if (wId === 'eng2') {
      const s2 = getStage2State(curT);
      return \`
        <div class="c-tall-widget" style="grid-column: span 2" data-slot="\${slotIdx}">
          <div class="w-hdr">
            <span>\${L('二级真空梅林', 'STAGE 2 MVAC')}</span>
            <span class="sim-badge">SIM</span>
          </div>
          <div style="display:flex;align-items:center;gap:10px;margin:auto 0">
            <div class="tall-mvac-box">\${getMvacSvg(44)}</div>
            <div>
              <div class="w-num tall-mvac-thrust">\${s2.thrust}<small style="font-size:11px;color:var(--t2)"> kN</small></div>
              <div class="lb tall-mvac-stat" style="margin-top:2px">\${L(s2.statusTextZh, s2.statusTextEn)}</div>
            </div>
          </div>
          <div class="lb tall-mvac-prop" style="font-size:9px;color:var(--t2)">\${L('推进: ', 'Prop: ')}\${s2.pr2.toFixed(1)}%</div>
        </div>\`;
    }

    if (wId === 'prop1') {
      title = L('推进剂', 'PROPELLANT');
      valStr = s.pr.toFixed(1); unitStr = '%';
      barPct = s.pr;
      const need = getNeed(curT, s.alt);
      devVal = (s.pr - need) * 5.2; devUnit = 't';
    } else if (wId === 'thrust') {
      title = L('总推力', 'TOTAL THRUST');
      valStr = Math.round(s.kN); unitStr = 'kN';
      barPct = Math.min(100, (s.kN / 7605) * 100);
      devVal = s.kN - s_nom.kN; devUnit = 'kN';
    } else if (wId === 'g') {
      title = L('过载', 'G-LOAD');
      valStr = s.nG.toFixed(1); unitStr = 'G';
      barPct = Math.min(100, (s.nG / 6) * 100);
      barWarn = s.nG >= nG_caution; barCrit = s.nG >= nG_crit;
      devVal = s.nG - s_nom.nG; devUnit = 'G';
    } else if (wId === 'q') {
      title = L('动压 Q', 'DYN. PRESSURE Q');
      valStr = s.q.toFixed(1); unitStr = 'kPa';
      barPct = Math.min(100, (s.q / 35) * 100);
      barWarn = s.q >= q_caution; barCrit = s.q >= q_crit;
      devVal = s.q - s_nom.q; devUnit = 'kPa';
    } else if (wId === 'mach') {
      title = L('马赫数', 'MACH');
      valStr = s.M.toFixed(2); unitStr = 'M';
      barPct = Math.min(100, (s.M / 8) * 100);
      devVal = s.M - s_nom.M; devUnit = 'M';
    } else if (wId === 'thr') {
      title = L('节流深度', 'THROTTLE DEPTH');
      valStr = '−' + Math.round(s.depth); unitStr = '%';
      barPct = (s.depth / 30) * 100;
    } else if (wId === 'heat') {
      title = L('热流', 'HEAT FLUX');
      valStr = Math.round(s.heat); unitStr = 'kW/m²';
      barPct = Math.min(100, (s.heat / 200) * 100);
      barWarn = s.heat >= heat_caution; barCrit = s.heat >= heat_crit;
      devVal = s.heat - s_nom.heat; devUnit = 'kW/m²';
    } else if (wId === 'brk') {
      title = L('制动余量', 'BRAKE MARGIN');
      const b0 = mg(s, curT)[0];
      valStr = b0.v; unitStr = '';
      barPct = b0.p;
      barWarn = b0.s === 1; barCrit = b0.s === 2;
    } else if (wId === 'cd') {
      title = L('阻力系数', 'DRAG CD');
      valStr = s.Cd.toFixed(2); unitStr = '';
      barPct = Math.min(100, (s.Cd / 0.9) * 100);
    } else if (wId === 'att') {
      title = L('俯仰角', 'PITCH ANGLE');
      valStr = s.pk.toFixed(1); unitStr = '°';
      barPct = Math.min(100, (Math.abs(s.pk) / 90) * 100);
      devVal = s.pk - s_nom.pk; devUnit = '°';
    } else if (wId === 'mass') {
      title = L('箭体质量', 'STAGE MASS');
      valStr = s.mass.toFixed(1); unitStr = 't';
      barPct = Math.min(100, (s.mass / 550) * 100);
      isDerived = true;
    } else if (wId === 'margin') {
      title = L('最紧裕度', 'TIGHTEST MARGIN');
      const m0 = mg(s, curT).filter(m => m.v !== '—')[0] || mg(s, curT)[1];
      valStr = m0.v; unitStr = '';
      barPct = m0.p;
      barWarn = m0.s === 1; barCrit = m0.s === 2;
    } else if (wId === 'prop2') {
      title = L('二级推进', 'S2 PROPELLANT');
      const s2 = getStage2State(curT);
      valStr = s2.pr2.toFixed(1); unitStr = '%';
      barPct = s2.pr2;
      isSim = true;
    } else {
      return \`<div class="c-tall-widget" data-slot="\${slotIdx}"><div class="w-hdr">\${L('(空)', '(Empty)')}</div></div>\`;
    }

    return \`
      <div class="c-tall-widget" data-slot="\${slotIdx}">
        <div class="w-hdr">
          <span class="w-title-txt">\${title}</span>
          \${isSim ? '<span class="sim-badge">SIM</span>' : isDerived ? '<span class="sim-badge" style="color:var(--t2);border-color:rgba(255,255,255,.2)">派生</span>' : ''}
        </div>
        <div class="w-val-box">
          <span class="w-num">\${valStr}</span><span class="w-unit">\${unitStr}</span>
        </div>
        <div class="c-abar-track">
          <div class="c-abar-fill \${barCrit ? 'crit' : barWarn ? 'warn' : ''}" style="width:\${cl(barPct,0,100)}%"></div>
        </div>
        <canvas class="w-spark"></canvas>
        <div class="w-dev-badge-box" style="display:flex;justify-content:space-between;align-items:center">
          \${buildDevBadgeHtml(devVal, devUnit, barWarn, barCrit)}
        </div>
      </div>\`;
  }

  function updateTallWidgetValues(slotEl, wId, s, curT, isDimmed) {
    const s_nom = S_nom(curT);
    const derived = getDerivedData(s, s_nom, curT);

    if (wId === 'eng1') {
      const stat = slotEl.querySelector('.tall-eng-stat');
      if (stat) stat.textContent = \`\${s.activeEngines} / \${s.plannedEngines} 在线\`;
      const th = slotEl.querySelector('.tall-eng-thrust');
      if (th) th.innerHTML = \`\${Math.round(s.kN)}<small style="font-size:11px;color:var(--t2)"> kN</small>\`;
      const throt = slotEl.querySelector('.tall-eng-throt');
      if (throt) throt.textContent = \`\${L('节流', 'Throttle')} \${Math.round(s.th_eff)}%\`;
      return;
    }

    if (wId === 'eng2') {
      const s2 = getStage2State(curT);
      const th = slotEl.querySelector('.tall-mvac-thrust');
      if (th) th.innerHTML = \`\${s2.thrust}<small style="font-size:11px;color:var(--t2)"> kN</small>\`;
      const st = slotEl.querySelector('.tall-mvac-stat');
      if (st) st.textContent = L(s2.statusTextZh, s2.statusTextEn);
      const pr = slotEl.querySelector('.tall-mvac-prop');
      if (pr) pr.textContent = \`\${L('推进: ', 'Prop: ')}\${s2.pr2.toFixed(1)}%\`;
      return;
    }

    let valStr = '', unitStr = '', barPct = 0, barWarn = false, barCrit = false;
    let devVal = null, devUnit = '';

    if (wId === 'prop1') {
      valStr = s.pr.toFixed(1); unitStr = '%';
      barPct = s.pr;
      const need = getNeed(curT, s.alt);
      devVal = (s.pr - need) * 5.2; devUnit = 't';
    } else if (wId === 'thrust') {
      valStr = Math.round(s.kN); unitStr = 'kN';
      barPct = Math.min(100, (s.kN / 7605) * 100);
      devVal = s.kN - s_nom.kN; devUnit = 'kN';
    } else if (wId === 'g') {
      valStr = s.nG.toFixed(1); unitStr = 'G';
      barPct = Math.min(100, (s.nG / 6) * 100);
      barWarn = s.nG >= nG_caution; barCrit = s.nG >= nG_crit;
      devVal = s.nG - s_nom.nG; devUnit = 'G';
    } else if (wId === 'q') {
      valStr = s.q.toFixed(1); unitStr = 'kPa';
      barPct = Math.min(100, (s.q / 35) * 100);
      barWarn = s.q >= q_caution; barCrit = s.q >= q_crit;
      devVal = s.q - s_nom.q; devUnit = 'kPa';
    } else if (wId === 'mach') {
      valStr = s.M.toFixed(2); unitStr = 'M';
      barPct = Math.min(100, (s.M / 8) * 100);
      devVal = s.M - s_nom.M; devUnit = 'M';
    } else if (wId === 'thr') {
      valStr = '−' + Math.round(s.depth); unitStr = '%';
      barPct = (s.depth / 30) * 100;
    } else if (wId === 'heat') {
      valStr = Math.round(s.heat); unitStr = 'kW/m²';
      barPct = Math.min(100, (s.heat / 200) * 100);
      barWarn = s.heat >= heat_caution; barCrit = s.heat >= heat_crit;
      devVal = s.heat - s_nom.heat; devUnit = 'kW/m²';
    } else if (wId === 'brk') {
      const b0 = mg(s, curT)[0];
      valStr = b0.v; unitStr = '';
      barPct = b0.p;
      barWarn = b0.s === 1; barCrit = b0.s === 2;
    } else if (wId === 'cd') {
      valStr = s.Cd.toFixed(2); unitStr = '';
      barPct = Math.min(100, (s.Cd / 0.9) * 100);
    } else if (wId === 'att') {
      valStr = s.pk.toFixed(1); unitStr = '°';
      barPct = Math.min(100, (Math.abs(s.pk) / 90) * 100);
      devVal = s.pk - s_nom.pk; devUnit = '°';
    } else if (wId === 'mass') {
      valStr = s.mass.toFixed(1); unitStr = 't';
      barPct = Math.min(100, (s.mass / 550) * 100);
    } else if (wId === 'margin') {
      const m0 = mg(s, curT).filter(m => m.v !== '—')[0] || mg(s, curT)[1];
      valStr = m0.v; unitStr = '';
      barPct = m0.p;
      barWarn = m0.s === 1; barCrit = m0.s === 2;
    } else if (wId === 'prop2') {
      const s2 = getStage2State(curT);
      valStr = s2.pr2.toFixed(1); unitStr = '%';
      barPct = s2.pr2;
    }

    const numEl = slotEl.querySelector('.w-num');
    if (numEl) numEl.textContent = valStr;
    const unitEl = slotEl.querySelector('.w-unit');
    if (unitEl) unitEl.textContent = unitStr;
    const barEl = slotEl.querySelector('.c-abar-fill');
    if (barEl) {
      barEl.style.width = cl(barPct, 0, 100) + '%';
      barEl.classList.toggle('crit', barCrit);
      barEl.classList.toggle('warn', !barCrit && barWarn);
    }
    const devBox = slotEl.querySelector('.w-dev-badge-box');
    if (devBox) {
      devBox.innerHTML = buildDevBadgeHtml(devVal, devUnit, barWarn, barCrit);
    }
  }

  function updateConsoleStripB(stripEl, resolvedS, dimmedS, s, curT) {
    if (!stripEl) return;
    let slotDivs = stripEl.children;
    if (slotDivs.length !== 12) {
      stripEl.innerHTML = '';
      for (let i = 0; i < 12; i++) {
        const div = document.createElement('div');
        div.className = 'c-tall-slot-wrap';
        div.id = 'tall-slot-' + (i + 1);
        stripEl.appendChild(div);
      }
      slotDivs = stripEl.children;
      lastMountedTallWidgets.fill(null);
    }

    for (let slot = 0; slot < 12; slot++) {
      const slotEl = slotDivs[slot];
      const wId = resolvedS ? resolvedS[slot] : 'none';
      const isDimmed = dimmedS ? !!dimmedS[slot] : false;

      if (wId === 'eng1_span' || wId === 'eng2_span') {
        slotEl.style.display = 'none';
        lastMountedTallWidgets[slot] = wId;
        continue;
      }

      slotEl.style.display = 'block';
      if (wId === 'eng1' || wId === 'eng2') {
        slotEl.style.gridColumn = 'span 2';
      } else {
        slotEl.style.gridColumn = 'span 1';
      }

      if (lastMountedTallWidgets[slot] !== wId) {
        slotEl.innerHTML = renderTallWidget(slot + 1, wId, s, curT);
        lastMountedTallWidgets[slot] = wId;
      } else {
        updateTallWidgetValues(slotEl, wId, s, curT, isDimmed);
      }

      const sparkCanvas = slotEl.querySelector('.w-spark');
      if (sparkCanvas) {
        const sKey = SPARK_SERIES_MAP[wId];
        if (sKey) {
          sparkCanvas.style.display = 'block';
          let spkWarn = false, spkCrit = false;
          if (wId === 'g') { spkWarn = s.nG >= nG_caution; spkCrit = s.nG >= nG_crit; }
          else if (wId === 'q') { spkWarn = s.q >= q_caution; spkCrit = s.q >= q_crit; }
          else if (wId === 'heat') { spkWarn = s.heat >= heat_caution; spkCrit = s.heat >= heat_crit; }
          else if (wId === 'brk') { const b0 = mg(s, curT)[0]; spkWarn = b0.s === 1; spkCrit = b0.s === 2; }
          else if (wId === 'margin') { const m0 = mg(s, curT).filter(m => m.v !== '—')[0] || mg(s, curT)[1]; spkWarn = m0.s === 1; spkCrit = m0.s === 2; }
          drawSparkline(sparkCanvas, Hist.getSeries(sKey, false), curT, spkWarn, spkCrit);
        } else {
          sparkCanvas.style.display = 'none';
        }
      }

      slotEl.classList.toggle('widget-dimmed', isDimmed);
    }
  }

  // 紧凑模式 (Compact Variant) 渲染器 (88x80)
  function renderCompactWidgetHtml(slotIdx, wId, s, curT) {
    if (wId === 'eng1') {
      return \`
        <div class="eng1-card compact-eng1-card" style="display:flex;align-items:center;gap:8px;padding:6px">
          <div class="eng1-svg-box">
            <svg class="compact-eng-svg" width="76" height="76" viewBox="0 0 120 120" role="group">
              <circle cx="60" cy="60" r="57" fill="none" stroke="rgba(255,255,255,.14)" stroke-width="2"/>
              \${EA.map(i => {
                const a = (22.5 + (i - 1) * 45) * Math.PI / 180;
                const x = i ? 60 + 40 * Math.sin(a) : 60, y = i ? 60 - 40 * Math.cos(a) : 60;
                return \`<g data-e="\${i}" style="cursor:pointer" aria-label="发动机 \${i}">
                  <circle class="c_ec_\${i}" cx="\${x}" cy="\${y}" r="12" stroke-width="1.5" fill="none" stroke="rgba(255,255,255,.3)"/>
                  <path class="c_ex_\${i}" d="M\${x-5} \${y-5}L\${x+5} \${y+5}M\${x+5} \${y-5}L\${x-5} \${y+5}" stroke="#FF4D5E" stroke-width="2" display="none"/>
                </g>\`;
              }).join('')}
            </svg>
          </div>
          <div class="eng1-info">
            <div class="eng1-title">\${L('9× 梅林 1D', '9× Merlin 1D')}</div>
            <div class="eng1-stat compact-e1-stat">\${s.activeEngines} / \${s.plannedEngines} \${L('在线', 'ACTIVE')}</div>
            <div class="eng1-row"><span>\${L('总推力', 'Thrust')}</span><span class="val compact-e1-thrust">\${Math.round(s.kN)} kN</span></div>
            <div class="eng1-row"><span>\${L('节流', 'Throttle')}</span><span class="val compact-e1-throt">\${Math.round(s.th_eff)}%</span></div>
          </div>
        </div>\`;
    }

    if (wId === 'eng2') {
      const s2 = getStage2State(curT);
      return \`
        <div class="compact-slot-card compact-eng2-card" style="min-width:180px">
          <div class="ctx-title" style="display:flex;justify-content:space-between">
            <span>\${L('二级真空梅林', 'STAGE 2 MVAC')}</span>
            <span class="sim-badge">SIM</span>
          </div>
          <div style="display:flex;align-items:center;gap:8px;margin:4px 0">
            <div>\${getMvacSvg(36)}</div>
            <div>
              <div class="ctx-val compact-e2-thrust">\${s2.thrust}<small> kN</small></div>
              <div class="ctx-sub compact-e2-stat">\${L(s2.statusTextZh, s2.statusTextEn)}</div>
            </div>
          </div>
          <div class="ctx-sub compact-e2-prop">\${L('推进剂: ', 'Prop: ')}\${s2.pr2.toFixed(1)}%</div>
        </div>\`;
    }

    if (wId === 'verdict') {
      const isBad = s.pg > 4.5 || short;
      return \`
        <div class="compact-slot-card" style="min-width:110px;border-color:\${isBad ? 'var(--cr)' : 'var(--ac)'}">
          <div class="ctx-title">\${L('任务判定', 'VERDICT')}</div>
          <div class="ctx-val" style="font-size:13px;color:\${isBad ? 'var(--cr)' : 'var(--ac)'}">\${isBad ? L('坠毁 / LOSS', 'LOSS') : L('成功 / NOMINAL', 'NOMINAL')}</div>
          <div class="ctx-sub">\${s.pg.toFixed(1)} G · \${s.tdv.toFixed(1)} m/s</div>
        </div>\`;
    }

    let title = '', valStr = '', barPct = 0, subStr = '', tickLeft = null, tickColor = '';
    const need = getNeed(curT, s.alt);

    if (wId === 'prop1') {
      title = L('一级推进', 'S1 PROP');
      valStr = s.pr.toFixed(1) + '%';
      barPct = s.pr;
      tickLeft = 22; tickColor = 'var(--tx)';
      subStr = L('余量', 'Margin') + ' ' + ((s.pr - need) * 5.2 >= 0 ? '+' : '') + ((s.pr - need) * 5.2).toFixed(1) + ' t';
    } else if (wId === 'thrust') {
      title = L('推力', 'THRUST');
      valStr = Math.round(s.kN).toLocaleString() + '<small> kN</small>';
      barPct = Math.min(100, (s.kN / 7607) * 100);
      subStr = L('9台合力', '9 ENGINES');
    } else if (wId === 'mach') {
      title = L('马赫', 'MACH');
      valStr = s.M.toFixed(2);
      barPct = Math.min(100, (s.M / 5.5) * 100);
      tickLeft = 18; tickColor = 'var(--wn)';
      subStr = s.M >= 1.0 ? L('超音速', 'SUPERSONIC') : L('亚音速', 'SUBSONIC');
    } else if (wId === 'q') {
      title = L('动压 Q', 'DYN. Q');
      valStr = s.q.toFixed(1) + '<small> kPa</small>';
      barPct = Math.min(100, (s.q / 30.0) * 100);
      tickLeft = 75; tickColor = 'var(--cr)';
      subStr = (curT >= 64 && curT < 92) ? L('Max-Q 峰值', 'MAX-Q PEAK') : L('动压载荷', 'DYNAMIC LOAD');
    } else if (wId === 'cd') {
      title = L('阻力 CD', 'DRAG CD');
      const isTrans = Math.abs(s.M - 1.1) < .28;
      valStr = s.Cd.toFixed(2) + (isTrans ? ' ▲' : '');
      barPct = Math.min(100, (s.Cd / 0.85) * 100);
      subStr = isTrans ? L('跨音速峰', 'TRANSONIC') : L('气动阻力', 'DRAG');
    } else if (wId === 'g') {
      title = L('过载', 'G-LOAD');
      valStr = s.nG.toFixed(1) + ' G';
      barPct = Math.min(100, (s.nG / 6.0) * 100);
      subStr = L('轴向过载', 'AXIAL G');
    } else if (wId === 'thr') {
      title = L('节流深度', 'THROTTLE');
      valStr = '−' + Math.round(s.depth) + '%';
      barPct = (s.depth / 30) * 100;
      subStr = L('Max-Q 节流', 'BUCKET');
    } else if (wId === 'heat') {
      title = L('气动热', 'HEAT FLUX');
      valStr = Math.round(s.heat) + '<small> kW/m²</small>';
      barPct = Math.min(100, (s.heat / 200) * 100);
      subStr = L('再入热流', 'RE-ENTRY');
    } else if (wId === 'brk') {
      title = L('制动余量', 'BRAKE MARGIN');
      const b0 = mg(s, curT)[0];
      valStr = b0.v;
      barPct = b0.p;
      subStr = L('着陆制动', 'LANDING');
    } else if (wId === 'att') {
      title = L('姿态俯仰', 'PITCH');
      valStr = s.pk.toFixed(1) + '°';
      barPct = Math.min(100, (Math.abs(s.pk) / 90) * 100);
      subStr = L('飞行姿态', 'ATTITUDE');
    } else if (wId === 'mass') {
      title = L('箭体质量', 'STAGE MASS');
      valStr = s.mass.toFixed(1) + '<small> t</small>';
      barPct = Math.min(100, (s.mass / 550) * 100);
      subStr = L('实时质量', 'TOTAL MASS');
    } else if (wId === 'margin') {
      title = L('最紧裕度', 'MARGIN');
      const m0 = mg(s, curT).filter(m => m.v !== '—')[0] || mg(s, curT)[1];
      valStr = m0.v;
      barPct = m0.p;
      subStr = L(m0.z, m0.e);
    } else if (wId === 'prop2') {
      title = L('二级推进', 'S2 PROP');
      const s2 = getStage2State(curT);
      valStr = s2.pr2.toFixed(1) + '%';
      barPct = s2.pr2;
      subStr = L('真空推进剂', 'MVAC PROP');
    } else {
      return \`<div class="compact-slot-card" style="opacity:0.4"><div class="ctx-title">\${L('(空)', '(Empty)')}</div></div>\`;
    }

    return \`
      <div class="compact-slot-card">
        <div class="ctx-title compact-w-title">\${title}</div>
        <div class="ctx-val compact-w-val">\${valStr}</div>
        <div class="ctx-bar">
          <div class="ctx-bar-fill compact-w-bar" style="width:\${cl(barPct,0,100)}%"></div>
          \${tickLeft != null ? \`<div class="ctx-tick" style="left:\${tickLeft}%;background:\${tickColor}"></div>\` : ''}
        </div>
        <div class="ctx-sub compact-w-sub">\${subStr}</div>
      </div>\`;
  }

  function updateCompactWidgetValues(slotEl, wId, s, curT) {
    if (wId === 'eng1') {
      const stat = slotEl.querySelector('.compact-e1-stat');
      if (stat) stat.textContent = \`\${s.activeEngines} / \${s.plannedEngines} \${L('在线', 'ACTIVE')}\`;
      const th = slotEl.querySelector('.compact-e1-thrust');
      if (th) th.textContent = \`\${Math.round(s.kN)} kN\`;
      const throt = slotEl.querySelector('.compact-e1-throt');
      if (throt) throt.textContent = \`\${Math.round(s.th_eff)}%\`;

      const pl = planSet(curT);
      EA.forEach(i => {
        const p = pl.includes(i), f = fl[i], on = p && !f && s.th > 0;
        const c = slotEl.querySelector('.c_ec_' + i);
        const x = slotEl.querySelector('.c_ex_' + i);
        if (c) {
          c.setAttribute('fill', f ? 'rgba(255,77,94,.22)' : on ? 'rgba(79,209,255,' + (.35 + .65 * s.th_eff / 100) + ')' : 'transparent');
          c.setAttribute('stroke', f ? '#FF4D5E' : p ? '#4FD1FF' : 'rgba(255,255,255,.22)');
        }
        if (x) x.setAttribute('display', f ? '' : 'none');
      });
      return;
    }
    if (wId === 'eng2') {
      const s2 = getStage2State(curT);
      const th = slotEl.querySelector('.compact-e2-thrust');
      if (th) th.innerHTML = \`\${s2.thrust}<small> kN</small>\`;
      const st = slotEl.querySelector('.compact-e2-stat');
      if (st) st.textContent = L(s2.statusTextZh, s2.statusTextEn);
      const pr = slotEl.querySelector('.compact-e2-prop');
      if (pr) pr.textContent = \`\${L('推进剂: ', 'Prop: ')}\${s2.pr2.toFixed(1)}%\`;
      return;
    }

    let valStr = '', barPct = 0, subStr = '';
    const need = getNeed(curT, s.alt);

    if (wId === 'prop1') {
      valStr = s.pr.toFixed(1) + '%';
      barPct = s.pr;
      subStr = L('余量', 'Margin') + ' ' + ((s.pr - need) * 5.2 >= 0 ? '+' : '') + ((s.pr - need) * 5.2).toFixed(1) + ' t';
    } else if (wId === 'thrust') {
      valStr = Math.round(s.kN).toLocaleString() + '<small> kN</small>';
      barPct = Math.min(100, (s.kN / 7607) * 100);
      subStr = L('9台合力', '9 ENGINES');
    } else if (wId === 'mach') {
      valStr = s.M.toFixed(2);
      barPct = Math.min(100, (s.M / 5.5) * 100);
      subStr = s.M >= 1.0 ? L('超音速', 'SUPERSONIC') : L('亚音速', 'SUBSONIC');
    } else if (wId === 'q') {
      valStr = s.q.toFixed(1) + '<small> kPa</small>';
      barPct = Math.min(100, (s.q / 30.0) * 100);
      subStr = (curT >= 64 && curT < 92) ? L('Max-Q 峰值', 'MAX-Q PEAK') : L('动压载荷', 'DYNAMIC LOAD');
    } else if (wId === 'cd') {
      const isTrans = Math.abs(s.M - 1.1) < .28;
      valStr = s.Cd.toFixed(2) + (isTrans ? ' ▲' : '');
      barPct = Math.min(100, (s.Cd / 0.85) * 100);
      subStr = isTrans ? L('跨音速峰', 'TRANSONIC') : L('气动阻力', 'DRAG');
    } else if (wId === 'g') {
      valStr = s.nG.toFixed(1) + ' G';
      barPct = Math.min(100, (s.nG / 6.0) * 100);
      subStr = L('轴向过载', 'AXIAL G');
    } else if (wId === 'thr') {
      valStr = '−' + Math.round(s.depth) + '%';
      barPct = (s.depth / 30) * 100;
      subStr = L('Max-Q 节流', 'BUCKET');
    } else if (wId === 'heat') {
      valStr = Math.round(s.heat) + '<small> kW/m²</small>';
      barPct = Math.min(100, (s.heat / 200) * 100);
      subStr = L('再入热流', 'RE-ENTRY');
    } else if (wId === 'brk') {
      const b0 = mg(s, curT)[0];
      valStr = b0.v;
      barPct = b0.p;
      subStr = L('着陆制动', 'LANDING');
    } else if (wId === 'att') {
      valStr = s.pk.toFixed(1) + '°';
      barPct = Math.min(100, (Math.abs(s.pk) / 90) * 100);
      subStr = L('飞行姿态', 'ATTITUDE');
    } else if (wId === 'mass') {
      valStr = s.mass.toFixed(1) + '<small> t</small>';
      barPct = Math.min(100, (s.mass / 550) * 100);
      subStr = L('实时质量', 'TOTAL MASS');
    } else if (wId === 'margin') {
      const m0 = mg(s, curT).filter(m => m.v !== '—')[0] || mg(s, curT)[1];
      valStr = m0.v;
      barPct = m0.p;
      subStr = L(m0.z, m0.e);
    } else if (wId === 'prop2') {
      const s2 = getStage2State(curT);
      valStr = s2.pr2.toFixed(1) + '%';
      barPct = s2.pr2;
      subStr = L('真空推进剂', 'MVAC PROP');
    }

    let barWarn = false, barCrit = false;
    if (wId === 'g') {
      barWarn = s.nG >= nG_caution; barCrit = s.nG >= nG_crit;
    } else if (wId === 'q') {
      barWarn = s.q >= q_caution; barCrit = s.q >= q_crit;
    } else if (wId === 'heat') {
      barWarn = s.heat >= heat_caution; barCrit = s.heat >= heat_crit;
    } else if (wId === 'brk') {
      const b0 = mg(s, curT)[0];
      barWarn = b0.s === 1; barCrit = b0.s === 2;
    } else if (wId === 'margin') {
      const m0 = mg(s, curT).filter(m => m.v !== '—')[0] || mg(s, curT)[1];
      barWarn = m0.s === 1; barCrit = m0.s === 2;
    }

    const valEl = slotEl.querySelector('.compact-w-val');
    if (valEl) {
      valEl.innerHTML = valStr;
      valEl.style.color = barCrit ? 'var(--cr)' : barWarn ? 'var(--wn)' : '';
    }
    const barEl = slotEl.querySelector('.compact-w-bar');
    if (barEl) {
      barEl.style.width = cl(barPct, 0, 100) + '%';
      barEl.classList.toggle('crit', barCrit);
      barEl.classList.toggle('warn', !barCrit && barWarn);
    }
    const subEl = slotEl.querySelector('.compact-w-sub');
    if (subEl) subEl.textContent = subStr;
    const cardEl = slotEl.querySelector('.compact-slot-card');
    if (cardEl) {
      cardEl.classList.toggle('card-crit', barCrit);
      cardEl.classList.toggle('card-warn', !barCrit && barWarn);
    }
  }

  function updateCompactZones(leftBody, rightWrap, resolvedL, dimmedL, resolvedR, dimmedR, s, curT) {
    if (leftBody) {
      let lDivs = leftBody.children;
      if (lDivs.length !== 5) {
        leftBody.innerHTML = '';
        for (let i = 0; i < 5; i++) {
          const div = document.createElement('div');
          div.className = 'c-compact-slot-wrap';
          div.id = 'compact-slot-l-' + (i + 1);
          leftBody.appendChild(div);
        }
        lDivs = leftBody.children;
        lastMountedCompactL.fill(null);
      }
      for (let i = 0; i < 5; i++) {
        const slotEl = lDivs[i];
        const wId = resolvedL ? resolvedL[i] : 'none';
        const isDimmed = dimmedL ? !!dimmedL[i] : false;
        if (wId === 'eng1_span' || wId === 'eng2_span') {
          slotEl.style.display = 'none';
          lastMountedCompactL[i] = wId;
          continue;
        }
        slotEl.style.display = 'flex';
        if (lastMountedCompactL[i] !== wId) {
          slotEl.innerHTML = renderCompactWidgetHtml(i + 1, wId, s, curT);
          lastMountedCompactL[i] = wId;
        } else {
          updateCompactWidgetValues(slotEl, wId, s, curT);
        }
        slotEl.classList.toggle('widget-dimmed', isDimmed);
      }
    }

    if (rightWrap) {
      let rDivs = rightWrap.children;
      if (rDivs.length !== 4) {
        rightWrap.innerHTML = '';
        for (let i = 0; i < 4; i++) {
          const div = document.createElement('div');
          div.className = 'c-compact-slot-wrap';
          div.id = 'compact-slot-r-' + (i + 1);
          rightWrap.appendChild(div);
        }
        rDivs = rightWrap.children;
        lastMountedCompactR.fill(null);
      }
      for (let i = 0; i < 4; i++) {
        const slotEl = rDivs[i];
        const wId = resolvedR ? resolvedR[i] : 'none';
        const isDimmed = dimmedR ? !!dimmedR[i] : false;
        if (wId === 'eng1_span' || wId === 'eng2_span') {
          slotEl.style.display = 'none';
          lastMountedCompactR[i] = wId;
          continue;
        }
        slotEl.style.display = 'flex';
        if (lastMountedCompactR[i] !== wId) {
          slotEl.innerHTML = renderCompactWidgetHtml(i + 1, wId, s, curT);
          lastMountedCompactR[i] = wId;
        } else {
          updateCompactWidgetValues(slotEl, wId, s, curT);
        }
        slotEl.classList.toggle('widget-dimmed', isDimmed);
      }
    }
  }

  function getEngineMatrixSvg(size) {
    return \`
      <svg class="eng-matrix-svg" width="\${size}" height="\${size}" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="57" fill="none" stroke="rgba(255,255,255,.14)" stroke-width="2"/>
        \${EA.map(i => {
          const a = (22.5 + (i - 1) * 45) * Math.PI / 180;
          const x = i ? 60 + 40 * Math.sin(a) : 60, y = i ? 60 - 40 * Math.cos(a) : 60;
          const isF = fl[i];
          const isPl = planSet(t).includes(i);
          const isFiring = isPl && !isF && S_act(t).th > 0;
          return \`<circle cx="\${x}" cy="\${y}" r="11" fill="\${isF ? 'rgba(255,77,94,.2)' : isFiring ? '#FFFFFF' : 'transparent'}" stroke="\${isF ? '#FF4D5E' : isPl ? '#FFFFFF' : 'rgba(255,255,255,.22)'}" stroke-width="1.5"/>
          \${isF ? \`<path d="\${x-5} \${y-5}L\${x+5} \${y+5}M\${x+5} \${y-5}L\${x-5} \${y+5}" stroke="#FF4D5E" stroke-width="2"/>\` : ''}\`;
        }).join('')}
      </svg>\`;
  }

  function getMvacSvg(size) {
    const s2 = getStage2State(t);
    return \`
      <svg class="mvac-engine-svg" width="\${size}" height="\${size}" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(255,255,255,.14)" stroke-width="1.5"/>
        <circle cx="50" cy="50" r="34" fill="none" stroke="rgba(255,255,255,.3)" stroke-width="2"/>
        <circle cx="50" cy="50" r="28" fill="\${s2.thrust > 0 ? '#FFFFFF' : 'transparent'}" opacity="\${s2.plumeOp}"/>
        <circle cx="50" cy="50" r="10" fill="transparent" stroke="rgba(255,255,255,.4)" stroke-width="2"/>
      </svg>\`;
  }

  // 1. View 1: 总览 FLIGHT (L1, 键 1)
  function buildView1Html() {
    return \`
      <!-- A 行: 3D视口(5列) + 走廊图(4列) + 全程高度-时间(3列) -->
      <div class="c-panel" style="grid-column: span 5; height: 260px">
        <div class="c-panel-hdr">
          <span class="c-panel-title">\${L('3D 视口 · 相机预设', '3D VIEWPORT · PRESETS')}</span>
          <div class="c-panel-acts"><button class="c-focus-btn" data-panel="vp3d">⤢</button></div>
        </div>
        <div class="c-panel-body" style="padding:0">
          <div class="c-vp3d-box">
            <div class="c-vp3d-chips">
              \${Viewport3D.presets.map(p => \`<button class="c-vp-chip \${Viewport3D.getPreset() === p && !Viewport3D.isAuto() ? 'active' : ''}" data-p="\${p}">\${L(Viewport3D.presetLabels[p].zh, Viewport3D.presetLabels[p].en)}</button>\`).join('')}
              <button class="c-vp-chip \${Viewport3D.isAuto() ? 'active auto-active' : ''}" id="btnVpAuto">AUTO</button>
            </div>
            <canvas class="c-vp3d-canvas" id="canvas-vp3d-v1"></canvas>
          </div>
          <div class="c-panel-fresh-dot"></div>
        </div>
      </div>

      <div class="c-panel" style="grid-column: span 4; height: 260px">
        <div class="c-panel-hdr">
          <span class="c-panel-title" data-nav="1">\${L('走廊图 高度–速度', 'CORRIDOR ALT-VEL')}</span>
          <div class="c-panel-acts"><button class="c-focus-btn" data-panel="corridor-hv">⤢</button></div>
        </div>
        <div class="c-panel-body">
          <div class="c-chart-container"><canvas class="c-chart-canvas" id="canvas-corridor-hv"></canvas></div>
          <div class="c-panel-fresh-dot"></div>
        </div>
      </div>

      <div class="c-panel" style="grid-column: span 3; height: 260px">
        <div class="c-panel-hdr">
          <span class="c-panel-title" data-nav="1">\${L('全程 高度–时间', 'FULL-MISSION ALT-TIME')}</span>
          <div class="c-panel-acts"><button class="c-focus-btn" data-panel="corridor-ht">⤢</button></div>
        </div>
        <div class="c-panel-body">
          <div class="c-chart-container"><canvas class="c-chart-canvas" id="canvas-corridor-ht"></canvas></div>
          <div class="c-panel-fresh-dot"></div>
        </div>
      </div>

      <!-- B 行: 12 格小部件条 (12列 x 160px) -->
      <div class="c-panel" style="grid-column: span 12; height: 172px">
        <div class="c-panel-hdr">
          <span class="c-panel-title">\${L('总览小部件条 · WIDGET STRIP', 'MISSION OVERVIEW WIDGET STRIP')}</span>
          <span class="lb" style="font-size:10px">\${L('可在抽屉「布局」中替换', 'Customizable in Layout')}</span>
        </div>
        <div class="c-panel-body" style="padding:6px">
          <div class="c-widget-strip" id="cWidgetStripB"></div>
          <div class="c-panel-fresh-dot"></div>
        </div>
      </div>

      <!-- C 行: GO/NO-GO 席位板(3列) + 报警列表(5列) + 事件日志(4列) -->
      <div class="c-panel" style="grid-column: span 3; height: 180px">
        <div class="c-panel-hdr">
          <span class="c-panel-title" id="c-gng-hdr-title">\${L('GO/NO-GO 席位板', 'GO/NO-GO SEATS')}</span>
        </div>
        <div class="c-panel-body">
          <div class="c-gng-board" id="cGngBoardGrid"></div>
          <div class="c-panel-fresh-dot"></div>
        </div>
      </div>

      <div class="c-panel" style="grid-column: span 5; height: 180px">
        <div class="c-panel-hdr">
          <span class="c-panel-title">\${L('活跃报警列表 · ALARMS', 'ACTIVE ALARMS')}</span>
          <div class="c-panel-acts"><button class="c-focus-btn" data-panel="alarms">⤢</button></div>
        </div>
        <div class="c-panel-body" style="padding:4px">
          <div class="c-alarm-table-box" id="cAlarmTableBox"></div>
          <div class="c-panel-fresh-dot"></div>
        </div>
      </div>

      <div class="c-panel" style="grid-column: span 4; height: 180px">
        <div class="c-panel-hdr">
          <span class="c-panel-title">\${L('事件日志 · EVENT LOG', 'EVENT LOG')}</span>
          <div class="c-panel-acts"><button class="c-focus-btn" data-panel="log">⤢</button></div>
        </div>
        <div class="c-panel-body" style="padding:4px">
          <div class="lg" id="cEventLogBox" style="max-height:100%"></div>
          <div class="c-panel-fresh-dot"></div>
        </div>
      </div>\`;
  }

  // 2. View 2: 轨迹 FDO (键 2)
  function buildView2Html() {
    return \`
      <div class="c-panel" style="grid-column: span 8; height: 380px">
        <div class="c-panel-hdr">
          <span class="c-panel-title">\${L('大走廊图 高度–速度 · BIG CORRIDOR', 'ALTITUDE - VELOCITY CORRIDOR')}</span>
          <div class="c-panel-acts"><button class="c-focus-btn" data-panel="big-corridor">⤢</button></div>
        </div>
        <div class="c-panel-body">
          <div class="c-chart-container"><canvas class="c-chart-canvas" id="canvas-big-corridor"></canvas></div>
          <div class="c-panel-fresh-dot"></div>
        </div>
      </div>

      <div class="c-panel" style="grid-column: span 4; height: 380px">
        <div class="c-panel-hdr">
          <span class="c-panel-title">\${L('轨迹偏差表 · DEVIATIONS', 'TRAJECTORY DEVIATIONS')}</span>
        </div>
        <div class="c-panel-body" id="cFdoDevTableBody" style="font-size:12px;overflow-y:auto"></div>
      </div>

      <div class="c-panel" style="grid-column: span 6; height: 230px">
        <div class="c-panel-hdr">
          <span class="c-panel-title">\${L('高度–时间 趋势图', 'ALTITUDE TREND')}</span>
          <div class="c-panel-acts"><button class="c-focus-btn" data-panel="fdo-alt">⤢</button></div>
        </div>
        <div class="c-panel-body">
          <div class="c-chart-container"><canvas class="c-chart-canvas" id="canvas-fdo-alt"></canvas></div>
          <div class="c-panel-fresh-dot"></div>
        </div>
      </div>

      <div class="c-panel" style="grid-column: span 6; height: 230px">
        <div class="c-panel-hdr">
          <span class="c-panel-title">\${L('速度–时间 趋势图', 'VELOCITY TREND')}</span>
          <div class="c-panel-acts"><button class="c-focus-btn" data-panel="fdo-vel">⤢</button></div>
        </div>
        <div class="c-panel-body">
          <div class="c-chart-container"><canvas class="c-chart-canvas" id="canvas-fdo-vel"></canvas></div>
          <div class="c-panel-fresh-dot"></div>
        </div>
      </div>\`;
  }

  // 3. View 3: 推进 PROP (键 3)
  function buildView3Html() {
    return \`
      <div class="c-panel" style="grid-column: span 4; height: 270px">
        <div class="c-panel-hdr">
          <span class="c-panel-title">\${L('发动机矩阵 (点击打开部件页)', 'ENGINE MATRIX')}</span>
          <span class="lb">L3</span>
        </div>
        <div class="c-panel-body" style="align-items:center;justify-content:center">
          <div id="c-prop-eng-big" style="cursor:pointer">\${getEngineMatrixSvg(110)}</div>
          <div class="lb" style="margin-top:6px">\${L('点击任意发动机查看详情与故障', 'Click engine for details')}</div>
          <div class="c-panel-fresh-dot"></div>
        </div>
      </div>

      <div class="c-panel" style="grid-column: span 8; height: 270px">
        <div class="c-panel-hdr">
          <span class="c-panel-title">\${L('逐台发动机状态表', 'PER-ENGINE STATUS TABLE')}</span>
        </div>
        <div class="c-panel-body" style="padding:2px;overflow-y:auto">
          <table class="c-alarm-tbl" id="cEngPerTable">
            <thead>
              <tr>
                <th>#</th><th>\${L('状态', 'Status')}</th><th>\${L('推力', 'Thrust')}</th>
                <th>\${L('节流', 'Throttle')}</th><th>\${L('室压', 'Pc')}<span class="sim-badge" style="margin-left:4px">派生</span></th>
                <th>\${L('操作', 'Action')}</th>
              </tr>
            </thead>
            <tbody id="cEngPerTableBody"></tbody>
          </table>
          <div class="c-panel-fresh-dot"></div>
        </div>
      </div>

      <div class="c-panel" style="grid-column: span 6; height: 340px">
        <div class="c-panel-hdr">
          <span class="c-panel-title">\${L('推力趋势图 · THRUST TREND', 'THRUST TREND')}</span>
          <div class="c-panel-acts"><button class="c-focus-btn" data-panel="prop-thrust">⤢</button></div>
        </div>
        <div class="c-panel-body">
          <div class="c-chart-container"><canvas class="c-chart-canvas" id="canvas-prop-thrust"></canvas></div>
          <div class="c-panel-fresh-dot"></div>
        </div>
      </div>

      <div class="c-panel" style="grid-column: span 6; height: 340px">
        <div class="c-panel-hdr">
          <span class="c-panel-title">\${L('推进剂账本与二级状态', 'PROPELLANT & STAGE 2')}</span>
        </div>
        <div class="c-panel-body" id="cPropellantPanelBody" style="gap:8px"></div>
      </div>\`;
  }

  // 4. View 4: 姿态 GNC (键 4)
  function buildView4Html() {
    return \`
      <div class="c-panel" style="grid-column: span 4; height: 280px">
        <div class="c-panel-hdr">
          <span class="c-panel-title">\${L('俯仰角与指令偏差', 'PITCH COMMAND & DEVIATION')}</span>
        </div>
        <div class="c-panel-body" id="cGncPitchBody"></div>
      </div>

      <div class="c-panel" style="grid-column: span 8; height: 280px">
        <div class="c-panel-hdr">
          <span class="c-panel-title">\${L('角速度趋势图 (翻转机动峰值)', 'ANGULAR RATE TREND')}</span>
          <div class="c-panel-acts"><button class="c-focus-btn" data-panel="gnc-rate">⤢</button></div>
        </div>
        <div class="c-panel-body">
          <div class="c-chart-container"><canvas class="c-chart-canvas" id="canvas-gnc-rate"></canvas></div>
          <div class="c-panel-fresh-dot"></div>
        </div>
      </div>

      <div class="c-panel" style="grid-column: span 4; height: 330px">
        <div class="c-panel-hdr">
          <span class="c-panel-title">\${L('姿态示意图', 'ATTITUDE SCHEMATIC')}</span>
        </div>
        <div class="c-panel-body" style="align-items:center;justify-content:center;position:relative">
          <canvas id="canvas-att-diagram" width="160" height="220"></canvas>
          <div class="lb" style="color:#8A94A3;font-size:10px;margin-top:8px">\${L('偏航 / 滚转 / 攻角: 未建模', 'Yaw / Roll / AoA: Unmodeled')}</div>
          <div class="c-panel-fresh-dot"></div>
        </div>
      </div>

      <div class="c-panel" style="grid-column: span 8; height: 330px">
        <div class="c-panel-hdr">
          <span class="c-panel-title">\${L('控制权限与执行机构', 'CONTROL AUTHORITY & ACTUATORS')}</span>
        </div>
        <div class="c-panel-body" id="cGncActuatorsBody"></div>
      </div>\`;
  }

  // 5. View 5: 气动热载荷 LOAD (键 5)
  function buildView5Html() {
    return \`
      <div class="c-panel" style="grid-column: span 5; height: 290px">
        <div class="c-panel-hdr">
          <span class="c-panel-title">\${L('阻力系数 Cd–马赫 曲线', 'CD - MACH CURVE')}</span>
        </div>
        <div class="c-panel-body">
          <div class="c-chart-container"><canvas class="c-chart-canvas" id="canvas-load-cd"></canvas></div>
          <div class="c-panel-fresh-dot"></div>
        </div>
      </div>

      <div class="c-panel" style="grid-column: span 7; height: 290px">
        <div class="c-panel-hdr">
          <span class="c-panel-title">\${L('动压趋势图 (Max-Q 窗口与限值)', 'DYNAMIC PRESSURE TREND')}</span>
          <div class="c-panel-acts"><button class="c-focus-btn" data-panel="load-q">⤢</button></div>
        </div>
        <div class="c-panel-body">
          <div class="c-chart-container"><canvas class="c-chart-canvas" id="canvas-load-q"></canvas></div>
          <div class="c-panel-fresh-dot"></div>
        </div>
      </div>

      <div class="c-panel" style="grid-column: span 6; height: 320px">
        <div class="c-panel-hdr">
          <span class="c-panel-title">\${L('过载趋势图 (4.5G / 5.5G 限值)', 'OVERLOAD G TREND')}</span>
          <div class="c-panel-acts"><button class="c-focus-btn" data-panel="load-g">⤢</button></div>
        </div>
        <div class="c-panel-body">
          <div class="c-chart-container"><canvas class="c-chart-canvas" id="canvas-load-g"></canvas></div>
          <div class="c-panel-fresh-dot"></div>
        </div>
      </div>

      <div class="c-panel" style="grid-column: span 6; height: 320px">
        <div class="c-panel-hdr">
          <span class="c-panel-title">\${L('热流趋势与黑体色条', 'HEAT FLUX TREND')}</span>
          <div class="c-panel-acts"><button class="c-focus-btn" data-panel="load-heat">⤢</button></div>
        </div>
        <div class="c-panel-body">
          <div class="c-chart-container"><canvas class="c-chart-canvas" id="canvas-load-heat"></canvas></div>
          <div id="cLoadHeatFooter" style="margin-top:6px"></div>
          <div class="c-panel-fresh-dot"></div>
        </div>
      </div>\`;
  }

  // 6. View 6: 回收 REC (键 6)
  function buildView6Html() {
    return \`
      <div class="c-panel" style="grid-column: span 7; height: 330px">
        <div class="c-panel-hdr">
          <span class="c-panel-title">\${L('制动余量曲线 (所需高度 vs 实际高度)', 'BRAKE MARGIN PROFILE')}</span>
          <div class="c-panel-acts"><button class="c-focus-btn" data-panel="rec-brake">⤢</button></div>
        </div>
        <div class="c-panel-body">
          <div class="c-chart-container"><canvas class="c-chart-canvas" id="canvas-rec-brake"></canvas></div>
          <div class="c-panel-fresh-dot"></div>
        </div>
      </div>

      <div class="c-panel" style="grid-column: span 5; height: 330px">
        <div class="c-panel-hdr">
          <span class="c-panel-title">\${L('回收推进剂与着陆预测', 'RECOVERY PROP & PREDICTION')}</span>
        </div>
        <div class="c-panel-body" id="cRecPredictionBody"></div>
      </div>

      <div class="c-panel" style="grid-column: span 3; height: 280px">
        <div class="c-panel-hdr">
          <span class="c-panel-title">\${L('回收阶段计划发动机', 'RECOVERY ENGINES')}</span>
        </div>
        <div class="c-panel-body" id="cRecEnginesBody" style="align-items:center;justify-content:center"></div>
      </div>

      <div class="c-panel" style="grid-column: span 5; height: 280px">
        <div class="c-panel-hdr">
          <span class="c-panel-title">\${L('着陆特写 (LAND 机位)', 'LANDING CLOSE-UP 3D')}</span>
          <div class="c-panel-acts"><button class="c-focus-btn" data-panel="vp3d-rec">⤢</button></div>
        </div>
        <div class="c-panel-body" style="padding:0">
          <canvas class="c-vp3d-canvas" id="canvas-vp3d-rec"></canvas>
          <div class="c-panel-fresh-dot"></div>
        </div>
      </div>

      <div class="c-panel" style="grid-column: span 4; height: 280px">
        <div class="c-panel-hdr">
          <span class="c-panel-title">\${L('回收事件日志', 'RECOVERY EVENT LOG')}</span>
        </div>
        <div class="c-panel-body" style="padding:4px">
          <div class="lg" id="cRecLogBox" style="max-height:100%"></div>
          <div class="c-panel-fresh-dot"></div>
        </div>
      </div>\`;
  }

  function mountView(vIdx) {
    activeConsoleView = vIdx;
    const container = $('c-view-container');
    if (!container) return;
    if (vIdx === 0) container.innerHTML = buildView1Html();
    else if (vIdx === 1) container.innerHTML = buildView2Html();
    else if (vIdx === 2) container.innerHTML = buildView3Html();
    else if (vIdx === 3) container.innerHTML = buildView4Html();
    else if (vIdx === 4) container.innerHTML = buildView5Html();
    else if (vIdx === 5) container.innerHTML = buildView6Html();

    // 更新顶栏标签选中
    const tabBtns = document.querySelectorAll('#cViewTabs .c-tab-btn');
    tabBtns.forEach((b, idx) => {
      b.classList.toggle('active', idx === vIdx);
    });

    // 绑定面板标题与按钮交互
    bindViewInteractions(container);
    lastRenderedView = vIdx;
  }

  function bindViewInteractions(container) {
    // 聚焦按钮
    container.querySelectorAll('.c-focus-btn').forEach(btn => {
      btn.onclick = () => {
        openFocusModal(btn.dataset.panel);
      };
    });
    // 标题跳转
    container.querySelectorAll('[data-nav]').forEach(el => {
      el.onclick = () => {
        const targetView = +el.dataset.nav;
        mountView(targetView);
      };
    });
    // 机位芯片
    container.querySelectorAll('.c-vp-chip[data-p]').forEach(chip => {
      chip.onclick = () => {
        Viewport3D.setPreset(chip.dataset.p);
        draw();
      };
    });
    const autoBtn = $('btnVpAuto');
    if (autoBtn) {
      autoBtn.onclick = () => {
        Viewport3D.setAuto(true);
        draw();
      };
    }
    // 发动机点击打开 L3 部件页
    const propEng = $('c-prop-eng-big');
    if (propEng) {
      propEng.onclick = e => {
        const g = e.target.closest('circle');
        openPartSheet(0);
      };
    }
  }

  return {
    mountView,
    renderTallWidget,
    updateConsoleStripB,
    updateCompactZones,
    resetMountCache,
    getActiveView: () => activeConsoleView,
    VIEW_NAMES,
    SPARK_SERIES_MAP
  };
})();
`;
