// Console Shell, Mode Management, Layout Editor Schema 2, and Test Hooks
module.exports = `
// ==================== 控制台外壳与模式管理 (Section 2 & 13) ====================
let mode = 'compact'; // 'compact' or 'console'
let activeSheetEngine = 0;
let focusedPanelId = null;
let showDataTable = false;
let lastMountedMods = new Set();
let lastRightMode = '';
// Active, draft, and saved layouts management (Schema 2 §13.6)
let activeLayout = JSON.parse(JSON.stringify(LayoutEngine.DEFAULT_LAYOUT_SCHEMA2));
let savedLayouts = [];
let draftLayout = null;
let draftEditorTab = 'compact'; // 'compact' or 'console'
let previewPhaseT = 0;
let wasRunningBeforeDialog = false;

// Alias for backwards compatibility
let layoutConfig = activeLayout;

function loadActiveAndSavedLayouts() {
  try {
    const rawSaved = localStorage.getItem('aether.layout.saved');
    if (rawSaved) {
      const arr = JSON.parse(rawSaved);
      if (Array.isArray(arr)) savedLayouts = arr.slice(0, 5);
    }
  } catch (e) {
    savedLayouts = [];
  }

  try {
    let rawActive = localStorage.getItem('aether.layout.active');
    if (!rawActive) {
      rawActive = localStorage.getItem('aether.layout');
    }
    if (rawActive) {
      const parsed = typeof rawActive === 'string' ? JSON.parse(rawActive) : rawActive;
      const migrated = LayoutEngine.migrateLegacy(parsed);
      const v = LayoutEngine.validate(migrated);
      if (v.ok) {
        activeLayout = migrated;
        localStorage.setItem('aether.layout.active', JSON.stringify(activeLayout));
      } else {
        activeLayout = JSON.parse(JSON.stringify(LayoutEngine.DEFAULT_LAYOUT_SCHEMA2));
      }
    } else {
      activeLayout = JSON.parse(JSON.stringify(LayoutEngine.DEFAULT_LAYOUT_SCHEMA2));
    }
  } catch (e) {
    activeLayout = JSON.parse(JSON.stringify(LayoutEngine.DEFAULT_LAYOUT_SCHEMA2));
  }
  layoutConfig = activeLayout;
  loadPubSettings();
}

let pubSettings = {
  unit: 'metric', // 'metric' or 'imperial'
  showDesc: true,
  showGLoad: false
};

function loadPubSettings() {
  try {
    const raw = localStorage.getItem('aether.pub_settings');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        if (parsed.unit === 'metric' || parsed.unit === 'imperial') pubSettings.unit = parsed.unit;
        if (typeof parsed.showDesc === 'boolean') pubSettings.showDesc = parsed.showDesc;
        if (typeof parsed.showGLoad === 'boolean') pubSettings.showGLoad = parsed.showGLoad;
      }
    }
  } catch (e) {}
}

function savePubSettings() {
  try {
    localStorage.setItem('aether.pub_settings', JSON.stringify(pubSettings));
  } catch (e) {}
}

function renderPubSettingsDialog() {
  const btnMetric = $('btnUnitMetric');
  const btnImperial = $('btnUnitImperial');
  if (btnMetric && btnImperial) {
    btnMetric.classList.toggle('active', pubSettings.unit === 'metric');
    btnImperial.classList.toggle('active', pubSettings.unit === 'imperial');
  }

  const btnLangZh = $('btnLangZh');
  const btnLangEn = $('btnLangEn');
  if (btnLangZh && btnLangEn) {
    btnLangZh.classList.toggle('active', lang === 'zh');
    btnLangEn.classList.toggle('active', lang === 'en');
  }

  const btnDesc = $('btnTogglePubDesc');
  if (btnDesc) {
    btnDesc.textContent = pubSettings.showDesc ? L('开启 (On)', 'On') : L('关闭 (Off)', 'Off');
    btnDesc.classList.toggle('active', pubSettings.showDesc);
  }

  const btnGLoad = $('btnTogglePubGLoad');
  if (btnGLoad) {
    btnGLoad.textContent = pubSettings.showGLoad ? L('开启 (On)', 'On') : L('关闭 (Off)', 'Off');
    btnGLoad.classList.toggle('active', pubSettings.showGLoad);
  }
}

// 模式切换 (§2.1)
function setMode(newMode) {
  mode = newMode;
  try {
    localStorage.setItem('aether.mode', mode);
  } catch (e) {}
  
  if (variant === 'engineering') {
    window.location.hash = mode === 'console' ? '#console' : '#engineering';
  }
  updateBodyClasses();
  updateTopBarSwitches();
  if (variant === 'engineering' && mode === 'compact' && !$('dash-eng')) {
    initDashboardDOM();
  }
  
  // 确保时间轴挂载到对应位置
  relocateTimeline();
  if (mode === 'console') {
    Views.mountView(Views.getActiveView());
  }
  draw();
}

const PUB_NZ = ['点火', '升空', '最大压力', '一级关机', '分离', '翻转', '返回大气层', '着陆减速', '着陆'];
const PUB_NE = ['Ignition', 'Liftoff', 'Max Q', 'MECO', 'Separation', 'Flip', 'Entry', 'Landing Burn', 'Touchdown'];

let detachedTopGroup = null;
let detachedFreshBadge = null;
let detachedConsoleWrap = null;


function setVariantAndMode(newVar, newMode) {
  const varChanged = variant !== newVar;
  variant = newVar;
  if (newMode) mode = newMode;
  if (variant === 'public') {
    mode = 'compact';
    lang = 'zh';
    document.documentElement.lang = 'zh-CN';
    if (typeof dr !== 'undefined' && dr) {
      dr = false;
      const drw = $('drw');
      if (drw) drw.classList.remove('open');
    }
    window.location.hash = '#public';
  } else {
    window.location.hash = mode === 'console' ? '#console' : '#engineering';
  }
  relocateTimeline();
  updateBodyClasses();
  updateTopBarSwitches();
  if (varChanged || (variant === 'engineering' && mode === 'compact' && !$('dash-eng'))) {
    initDashboardDOM();
  }
  relocateTimeline();
  if (variant === 'engineering') {
    initConsoleInteractions();
    if (mode === 'console') {
      Views.mountView(Views.getActiveView());
    }
  }
  draw();
}

function updateBodyClasses() {
  document.body.className = variant === 'public'
    ? 'is-public'
    : (mode === 'console' ? 'is-engineering is-console' : 'is-engineering is-compact');
}

function updateTopBarSwitches() {
  const bPub = $('bPub');
  const bEng = $('bEng');
  if (bPub) bPub.classList.toggle('active', variant === 'public');
  if (bEng) bEng.classList.toggle('active', variant === 'engineering');
  
  const topActions = $('topActions');
  const bLang = $('bLang');
  const minimapWrap = $('minimap-wrap');

  if (variant === 'public') {
    // 严格 DOM 排除: 移除控制台相关组件 (不存在于 DOM 树)
    const tlWrap = $('timeline-wrap') || (detachedConsoleWrap ? detachedConsoleWrap.querySelector('#timeline-wrap') : null);
    const panel = $('dash-panel');
    if (tlWrap && panel && tlWrap.parentNode !== panel) {
      panel.appendChild(tlWrap);
    }
    const topGroup = $('cTopGroup');
    if (topGroup) {
      detachedTopGroup = topGroup;
      topGroup.remove();
    }
    const freshBadge = $('c-fresh-badge');
    if (freshBadge) {
      detachedFreshBadge = freshBadge;
      freshBadge.remove();
    }
    const consoleWrap = $('console-wrap');
    if (consoleWrap) {
      detachedConsoleWrap = consoleWrap;
      consoleWrap.remove();
    }
  } else {
    // 工程模式: 恢复组件挂载到 DOM
    if (detachedTopGroup && !$('cTopGroup') && topActions && bLang) {
      topActions.insertBefore(detachedTopGroup, bLang);
    }
    if (detachedFreshBadge && !$('c-fresh-badge') && topActions && bLang) {
      topActions.insertBefore(detachedFreshBadge, bLang);
    }
    if (detachedConsoleWrap && !$('console-wrap') && minimapWrap && minimapWrap.parentNode) {
      minimapWrap.parentNode.insertBefore(detachedConsoleWrap, minimapWrap.nextSibling);
    }

    const modeSwitch = $('modeSwitch');
    const viewTabs = $('cViewTabs');
    const freshBadge = $('c-fresh-badge');

    if (modeSwitch) modeSwitch.style.display = 'inline-flex';
    const bCompact = $('bModeCompact');
    const bConsole = $('bModeConsole');
    if (bCompact) bCompact.classList.toggle('active', mode === 'compact');
    if (bConsole) bConsole.classList.toggle('active', mode === 'console');
    if (viewTabs) viewTabs.style.display = mode === 'console' ? 'inline-flex' : 'none';
    if (freshBadge) freshBadge.style.display = mode === 'console' ? 'inline-flex' : 'none';
  }
}

// 时间轴挂载重定向
function relocateTimeline() {
  let tlWrap = $('timeline-wrap');
  if (!tlWrap && detachedConsoleWrap) {
    tlWrap = detachedConsoleWrap.querySelector('#timeline-wrap');
  }
  if (!tlWrap) return;
  if (mode === 'console' && variant === 'engineering') {
    const mount = $('c-tl-mount');
    if (mount && tlWrap.parentNode !== mount) {
      mount.appendChild(tlWrap);
    }
  } else {
    const panel = $('dash-panel');
    if (panel && tlWrap.parentNode !== panel) {
      panel.appendChild(tlWrap);
    }
  }
}


// 部件页 L3 (Part Sheet)
function openPartSheet(engIdx) {
  activeSheetEngine = engIdx;
  const sheet = $('c-part-sheet');
  const body = $('c-sheet-body');
  const title = $('c-sheet-title');
  if (!sheet || !body) return;

  const s = S_act(t);
  const isFailed = fl[engIdx];
  const isPlanned = planSet(t).includes(engIdx);
  const statusZh = isFailed ? '故障' : isPlanned ? '点火燃烧中' : '待命';
  const statusEn = isFailed ? 'FAULT' : isPlanned ? 'FIRING' : 'STANDBY';
  const pcBar = (97 * (s.th_eff / 100) * (isFailed ? 0 : 1)).toFixed(1);

  title.textContent = \`\${L('一级发动机', 'S1 ENGINE')} #\${engIdx} · \${L('部件详情', 'PART SHEET')}\`;
  body.innerHTML = \`
    <div style="display:flex;align-items:center;gap:12px">
      <div style="font-size:32px;font-weight:700;\${isFailed ? 'color:var(--cr)' : 'color:#FFFFFF'}">#\${engIdx}</div>
      <div>
        <div style="font-size:14px;font-weight:600;\${isFailed ? 'color:var(--cr)' : 'color:#FFFFFF'}">\${L(statusZh, statusEn)}</div>
        <div class="lb">\${engIdx === 0 ? L('中心发动机 (回收关键)', 'Center (Recovery Critical)') : L('外圈发动机', 'Outer Ring')}</div>
      </div>
    </div>
    
    <div style="margin-top:12px;display:flex;flex-direction:column;gap:8px">
      <div class="row"><span>\${L('实时推力', 'Thrust')}</span><span class="m">\${isFailed ? '0 kN' : Math.round(s.th_eff / 100 * 845) + ' kN'}</span></div>
      <div class="row"><span>\${L('节流深度', 'Throttle')}</span><span class="m">\${Math.round(s.th_eff)}%</span></div>
      <div class="row"><span>\${L('燃烧室压力', 'Chamber Pc')}<span class="sim-badge" style="margin-left:4px">派生</span></span><span class="m">\${pcBar} bar</span></div>
    </div>

    <div style="margin-top:14px">
      <button class="bt \${isFailed ? 'pr' : 'ab'}" id="btnToggleEngFault" style="width:100%;height:38px">
        \${isFailed ? L('恢复正常 / Clear Fault', 'Clear Fault') : L('设为故障 / Inject Fault', 'Inject Fault')}
      </button>
    </div>

    <div style="margin-top:16px">
      <div class="lb" style="margin-bottom:6px">\${L('最近 60 秒推力趋势', 'Last 60s Thrust')}</div>
      <canvas id="canvas-sheet-spark" style="width:100%;height:60px;background:rgba(255,255,255,0.02);border-radius:4px"></canvas>
    </div>\`;

  sheet.classList.add('open');
  $('btnToggleEngFault').onclick = () => {
    fl[engIdx] ^= 1;
    ev(\`\${L('一级发动机', 'S1 Engine')} #\${engIdx} \${fl[engIdx] ? L('设为故障', 'failed') : L('恢复正常', 'cleared')}\`);
    draw();
    openPartSheet(engIdx);
  };

  // 绘制 60s 趋势
  const spkCanvas = $('canvas-sheet-spark');
  if (spkCanvas) {
    drawSparkline(spkCanvas, Hist.getSeries('thrust', false), t, isFailed, isFailed);
  }
}

function closePartSheet() {
  const sheet = $('c-part-sheet');
  if (sheet) sheet.classList.remove('open');
}

// 聚焦模式 Modal (§2.2, §6.7)
function openFocusModal(panelId) {
  focusedPanelId = panelId;
  const modal = $('c-focus-modal');
  const title = $('c-focus-title');
  const content = $('c-focus-content');
  if (!modal || !content) return;

  title.textContent = \`\${L('面板聚焦', 'PANEL FOCUS')} · \${panelId.toUpperCase()}\`;
  modal.classList.add('active');
  renderFocusContent();
}

function closeFocusModal() {
  focusedPanelId = null;
  showDataTable = false;
  const modal = $('c-focus-modal');
  if (modal) modal.classList.remove('active');
}

function renderFocusContent() {
  const content = $('c-focus-content');
  if (!content || !focusedPanelId) return;

  if (showDataTable) {
    // 渲染最近 60 个采样的精确数据表 (§6.7, §11)
    const samples = Hist.getRecentSamples('alt', t, 60);
    content.innerHTML = \`
      <div class="c-focus-data-tbl">
        <table class="c-alarm-tbl">
          <thead><tr><th>T (s)</th><th>\${L('实际值', 'Actual')}</th><th>\${L('名义值', 'Nominal')}</th><th>Δ (偏差)</th></tr></thead>
          <tbody>
            \${samples.map(row => \`<tr><td>\${row.t.toFixed(1)}</td><td>\${row.act.toFixed(1)}</td><td>\${row.nom.toFixed(1)}</td><td>\${(row.act - row.nom).toFixed(1)}</td></tr>\`).join('')}
          </tbody>
        </table>
      </div>\`;
  } else {
    content.innerHTML = \`
      <div class="c-chart-container" style="height:100%">
        <canvas class="c-chart-canvas" id="canvas-focus-chart"></canvas>
      </div>\`;
    const fCanvas = $('canvas-focus-chart');
    if (fCanvas) {
      if (focusedPanelId.includes('corridor')) {
        drawCorridorPlot(fCanvas, 'hv', t);
      } else {
        drawStripChart(fCanvas, {
          mode: 'full', curT: t, minV: 0, maxV: 100,
          actualSeries: Hist.getSeries('alt', false),
          nominalSeries: Hist.getSeries('alt', true)
        });
      }
    }
  }
}

// 控制台主绘制循环
function drawConsole(s, curT) {
  // 1. 状态条更新
  const met = $('c-met'), phase = $('c-phase'), tight = $('c-tight-margin'), alarmSummary = $('c-alarm-summary');
  const ph = P.filter(p => p <= curT).length - 1;
  if (met) met.textContent = fT(curT);
  if (phase) phase.textContent = \`\${L('阶段', 'PHASE')} · \${L(NZ[ph], NE[ph])}\`;

  // 最紧裕度
  const margins = mg(s, curT).filter(m => m.v !== '—');
  const tightest = margins.sort((a, b) => b.s - a.s || (b.s > 0 ? b.p - a.p : a.p - b.p))[0] || mg(s, curT)[1];
  if (tight && tightest) {
    tight.textContent = \`\${L('最紧裕度', 'Tightest')}: \${L(tightest.z, tightest.e)} \${tightest.v}\`;
    tight.style.borderColor = tightest.s === 2 ? 'var(--cr)' : tightest.s === 1 ? 'var(--wn)' : 'rgba(255,255,255,.14)';
  }

  // 席位状态
  const seatStates = GoNoGo.getStates(s, curT);
  const pollInfo = GoNoGo.getPollInfo();
  for (const seatName in seatStates) {
    const el = $( \`seat-\${seatName.toLowerCase()}\` );
    if (el) {
      const st = seatStates[seatName];
      el.classList.toggle('go', st.go);
      el.classList.toggle('nogo', !st.go);
      if (pollInfo.pollActive) {
        el.classList.toggle('polling', !pollInfo.pollEvaluatedSeats.has(seatName));
      } else {
        el.classList.remove('polling');
      }
    }
  }

  const wallNow = performance.now();

  // 新鲜度判定 (§4.6)
  const timeSinceLastTick = wallNow - lastTickWallTime;
  isStale = testStaleForced || (run && timeSinceLastTick > 1000);
  const freshBadge = $('c-fresh-badge'), freshTxt = $('c-fresh-txt');
  if (freshBadge && freshTxt) {
    if (isStale) {
      freshBadge.className = 'stale';
      freshTxt.textContent = '▲ STALE';
    } else if (!run) {
      freshBadge.className = 'paused';
      freshTxt.textContent = 'PAUSED';
    } else {
      freshBadge.className = 'live';
      freshTxt.textContent = 'LIVE ● 10Hz';
    }
  }

  // 报警引擎评估与计数汇总
  const evalRes = Alarms.evaluate(s, curT, wallNow);
  const activeAlarms = evalRes.alarms;
  const p1Count = activeAlarms.filter(a => a.priority === 1).length;
  const p2Count = activeAlarms.filter(a => a.priority === 2).length;
  const p3Count = activeAlarms.filter(a => a.priority === 3).length;

  if (alarmSummary) {
    alarmSummary.textContent = \`\${L('报警', 'ALARMS')} 高\${p1Count} 中\${p2Count} 低\${p3Count}\`;
    alarmSummary.classList.toggle('has-crit', p1Count > 0);
    alarmSummary.classList.toggle('has-warn', p1Count === 0 && p2Count > 0);
  }

  // P1 顶部横幅
  const p1Banner = $('c-p1-banner'), p1Txt = $('c-p1-banner-txt');
  const topP1 = activeAlarms.find(a => a.priority === 1 && a.state === 'active');
  if (p1Banner && p1Txt) {
    if (topP1) {
      p1Banner.classList.add('active');
      p1Txt.textContent = \`■ \${L('临界报警', 'CRITICAL')}: \${L(topP1.msg.zh, topP1.msg.en)} (\${L(topP1.advice.zh, topP1.advice.en)})\`;
      $('c-p1-ack-btn').onclick = () => {
        Alarms.acknowledge(topP1.id);
        p1Banner.classList.remove('active');
      };
    } else {
      p1Banner.classList.remove('active');
    }
  }

  // 2. 根据当前视图渲染内部图表
  const vIdx = Views.getActiveView();
  if (vIdx === 0) {
    // 总览 View 1
    const vpCanvas = $('canvas-vp3d-v1');
    if (vpCanvas) Viewport3D.drawPlaceholder(vpCanvas, curT, s);
    const corHV = $('canvas-corridor-hv');
    if (corHV) drawCorridorPlot(corHV, 'hv', curT);
    const corHT = $('canvas-corridor-ht');
    if (corHT) drawCorridorPlot(corHT, 'ht', curT);

    // B 行 12 格小部件更新 (Diff-Mount + 按部件 ID 画 Sparkline §13.4)
    const stripB = $('cWidgetStripB');
    if (stripB) {
      const resolved = LayoutEngine.resolveLayout(activeLayout, curT);
      Views.updateConsoleStripB(stripB, resolved.S, resolved.dimmed.S, s, curT);
    }

    // C 行 GO/NO-GO 席位板
    const gngGrid = $('cGngBoardGrid');
    if (gngGrid) {
      const gngTitle = $('c-gng-hdr-title');
      if (gngTitle) {
        gngTitle.textContent = pollInfo.pollActive
          ? \`POLL · \${pollInfo.pollEventName} -10s (\${pollInfo.pollSummary || L('点名中...', 'Polling...')})\`
          : L('GO/NO-GO 席位板', 'GO/NO-GO SEATS');
      }
      gngGrid.innerHTML = Object.keys(seatStates).map(st => {
        const item = seatStates[st];
        return \`
          <div class="c-gng-cell">
            <span class="c-gng-seat">\${st}</span>
            <span class="c-gng-status \${item.go ? '' : 'nogo'}">\${item.go ? 'GO' : 'NO-GO'}</span>
            <span class="lb" style="font-size:9px">\${item.desc}</span>
          </div>\`;
      }).join('');
    }

    // C 行 报警列表
    const alarmBox = $('cAlarmTableBox');
    if (alarmBox) {
      if (activeAlarms.length === 0) {
        alarmBox.innerHTML = \`<div class="lb" style="padding:10px">\${L('一切正常 · 无活跃报警', 'ALL NOMINAL · NO ACTIVE ALARMS')}</div>\`;
      } else {
        alarmBox.innerHTML = \`
          <table class="c-alarm-tbl">
            <thead><tr><th>\${L('时间', 'Time')}</th><th>\${L('级别', 'Pri')}</th><th>\${L('内容', 'Message')}</th><th>\${L('建议动作', 'Action')}</th><th>\${L('时限', 'Limit')}</th></tr></thead>
            <tbody>
              \${activeAlarms.slice(0, 6).map(a => \`
                <tr class="p\${a.priority}">
                  <td>\${fT(a.tRaised)}</td>
                  <td style="\${a.priority===1?'color:var(--cr);font-weight:700':a.priority===2?'color:var(--wn)':''}">\${a.priority===1?'■ P1':a.priority===2?'◆ P2':'▲ P3'}</td>
                  <td>\${L(a.msg.zh, a.msg.en)}\${a.derivedCount ? \` (\${L('衍生', 'derived')} +\${a.derivedCount})\` : ''}</td>
                  <td>\${L(a.advice.zh, a.advice.en)}</td>
                  <td>\${a.respondWithin}s</td>
                </tr>\`).join('')}
            </tbody>
          </table>\`;
      }
    }

    // C 行 事件日志
    const logBox = $('cEventLogBox');
    if (logBox) {
      logBox.innerHTML = log.slice(0, 12).join('<br>') || L('暂无事件', 'No events');
    }
  } else if (vIdx === 1) {
    // 轨迹 View 2
    const bigCor = $('canvas-big-corridor');
    if (bigCor) drawCorridorPlot(bigCor, 'hv', curT);

    const devTable = $('cFdoDevTableBody');
    if (devTable) {
      const s_nom = S_nom(curT);
      const derived = getDerivedData(s, s_nom, curT);
      devTable.innerHTML = [
        [L('高度偏差 Δh', 'Alt Dev Δh'), (s.e_h >= 0 ? '+' : '') + Math.round(s.e_h) + ' m'],
        [L('速度偏差 Δv', 'Vel Dev Δv'), (s.e_v >= 0 ? '+' : '') + Math.round(s.e_v) + ' m/s'],
        [L('MECO 时刻偏差', 'MECO Dev'), (curT >= 150 ? (s.e_v < -50 ? '+1.8 s' : '0.0 s') : '—')],
        [L('分离时刻偏差', 'Sep Dev'), (curT >= 156 ? (s.e_v < -50 ? '+1.9 s' : '0.0 s') : '—')],
        [L('预测落点偏差', 'Impact Offset'), derived.pred_offset.toFixed(1) + ' m'],
        [L('预计触地 ETA', 'Touchdown ETA'), derived.eta_s]
      ].map(r => \`<div class="row"><span>\${r[0]}</span><span class="m">\${r[1]}</span></div>\`).join('');
    }

    const fdoAlt = $('canvas-fdo-alt');
    if (fdoAlt) {
      drawStripChart(fdoAlt, {
        mode: 'full', curT, minV: 0, maxV: 130000, unit: 'm',
        actualSeries: Hist.getSeries('alt', false),
        nominalSeries: Hist.getSeries('alt', true)
      });
    }
    const fdoVel = $('canvas-fdo-vel');
    if (fdoVel) {
      drawStripChart(fdoVel, {
        mode: 'full', curT, minV: 0, maxV: 2400, unit: 'm/s',
        actualSeries: Hist.getSeries('v', false),
        nominalSeries: Hist.getSeries('v', true)
      });
    }
  } else if (vIdx === 2) {
    // 推进 View 3
    const engTbl = $('cEngPerTableBody');
    if (engTbl) {
      const pl = planSet(curT);
      engTbl.innerHTML = EA.map(i => {
        const isF = fl[i];
        const isPl = pl.includes(i);
        const isFiring = isPl && !isF && s.th > 0;
        const thrust = isFiring ? Math.round(s.th_eff / 100 * 845) : 0;
        const pc = isFiring ? (97 * (s.th_eff / 100)).toFixed(1) : '0.0';
        return \`
          <tr>
            <td><b>#\${i}</b></td>
            <td style="\${isF ? 'color:var(--cr)' : ''}">\${isF ? L('故障', 'FAULT') : isFiring ? L('点火', 'FIRING') : L('待命', 'STANDBY')}</td>
            <td>\${thrust} kN</td>
            <td>\${Math.round(s.th_eff)}%</td>
            <td>\${pc} bar</td>
            <td><button class="pill" onclick="openPartSheet(\${i})" style="height:22px;padding:0 6px;font-size:10px">\${L('详情/设故障', 'Sheet')}</button></td>
          </tr>\`;
      }).join('');
    }

    const propThrust = $('canvas-prop-thrust');
    if (propThrust) {
      drawStripChart(propThrust, {
        mode: 'full', curT, minV: 0, maxV: 8000, unit: 'kN',
        actualSeries: Hist.getSeries('thrust', false),
        nominalSeries: Hist.getSeries('thrust', true),
        limits: [
          { val: 7605, label: L('额定推力 7605 kN', 'Nominal 7605 kN'), type: 'warn' }
        ]
      });
    }

    const propBody = $('cPropellantPanelBody');
    if (propBody) {
      const derived = getDerivedData(s, S_nom(curT), curT);
      const totalProp = s.pr * 5.2;
      const twr = s.mass > 0 ? (s.kN / (s.mass * 9.81)).toFixed(2) : '0.00';
      propBody.innerHTML = \`
        <div class="row"><span>\${L('总推进剂', 'Total Prop')}</span><span class="m">\${totalProp.toFixed(1)} t (\${s.pr.toFixed(1)}%)</span></div>
        <div class="row"><span>\${L('LOX 液氧分量', 'LOX Component')}<span class="sim-badge" style="margin-left:4px">派生</span></span><span class="m">\${derived.lox.toFixed(1)} t</span></div>
        <div class="row"><span>\${L('RP-1 煤油分量', 'RP-1 Component')}<span class="sim-badge" style="margin-left:4px">派生</span></span><span class="m">\${derived.rp1.toFixed(1)} t</span></div>
        <div class="row"><span>\${L('实时推重比 (TWR)', 'Thrust-to-Weight')}</span><span class="m">\${twr}</span></div>
        <div style="margin-top:10px;border-top:1px solid var(--ln);padding-top:8px">
          <div class="lb" style="margin-bottom:4px">\${L('二级真空梅林状态 (SIM)', 'Stage 2 MVac Status (SIM)')}</div>
          <div style="font-size:13px;font-weight:600;color:var(--ac)">\${getStage2State(curT).statusTextZh}</div>
        </div>\`;
    }
  } else if (vIdx === 3) {
    // 姿态 View 4
    const pitchBody = $('cGncPitchBody');
    if (pitchBody) {
      const s_nom = S_nom(curT);
      const errPitch = s.pk - s_nom.pk;
      pitchBody.innerHTML = \`
        <div class="row"><span>\${L('名义俯仰角', 'Nominal Pitch')}</span><span class="m">\${s_nom.pk.toFixed(1)}°</span></div>
        <div class="row"><span>\${L('实际俯仰角', 'Actual Pitch')}</span><span class="m">\${s.pk.toFixed(1)}°</span></div>
        <div class="row"><span>\${L('俯仰角偏差', 'Pitch Error')}</span><span class="m">\${(errPitch >= 0 ? '+' : '')}\${errPitch.toFixed(2)}°</span></div>
        <div style="margin-top:16px">
          <div class="lb" style="margin-bottom:4px">\${L('俯仰偏差 (±5° 容差)', 'Pitch Error (±5°)')}</div>
          <div class="c-abar-track">
            <div class="c-abar-fill" style="width:\${cl(50 + errPitch * 10, 0, 100)}%"></div>
          </div>
        </div>\`;
    }

    const gncRate = $('canvas-gnc-rate');
    if (gncRate) {
      drawStripChart(gncRate, {
        mode: 'full', curT, minV: 0, maxV: 8, unit: '°/s',
        actualSeries: Hist.getSeries('rate', false),
        nominalSeries: Hist.getSeries('rate', true),
        limits: [
          { val: 6.2, label: L('翻转机动峰值 6.2°/s', 'Flip Peak 6.2°/s'), type: 'warn' }
        ]
      });
    }

    // 姿态小示意图
    const attCanvas = $('canvas-att-diagram');
    if (attCanvas) {
      const setup = setupCanvas(attCanvas);
      if (setup) {
        const { ctx, w, h } = setup;
        ctx.clearRect(0, 0, w, h);
        ctx.save();
        ctx.translate(w / 2, h / 2);
        ctx.rotate(-(s.pk - 90) * Math.PI / 180);
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.strokeRect(-8, -50, 16, 100);
        ctx.beginPath();
        ctx.moveTo(-8, -50); ctx.lineTo(0, -66); ctx.lineTo(8, -50);
        ctx.stroke();
        ctx.restore();
      }
    }

    const gncAct = $('cGncActuatorsBody');
    if (gncAct) {
      const ca = mg(s, curT)[2].p;
      const coldGas = curT > 156 ? ((curT - 156) * 0.8).toFixed(1) : '0.0';
      gncAct.innerHTML = \`
        <div class="row"><span>\${L('控制权限余量', 'Control Auth')}</span><span class="m">\${Math.round(ca)}%</span></div>
        <div class="c-abar-track" style="margin:4px 0 10px">
          <div class="c-abar-fill \${ca < 30 ? 'crit' : ca < 50 ? 'warn' : ''}" style="width:\${ca}%"></div>
        </div>
        <div class="row"><span>\${L('栅格舵机构', 'Grid Fins')}<span class="sim-badge" style="margin-left:4px">SIM</span></span><span class="m">\${curT >= 156 ? L('展开控姿', 'DEPLOYED') : L('收起', 'STOWED')}</span></div>
        <div class="row"><span>\${L('冷气姿控消耗', 'Cold Gas Use')}<span class="sim-badge" style="margin-left:4px">派生</span></span><span class="m">\${coldGas} kg</span></div>
        <div class="row"><span>\${L('发动机摆动机构', 'Gimbal')}<span class="sim-badge" style="margin-left:4px">SIM</span></span><span class="m">\${s.th > 0 ? L('主动伺服', 'ACTIVE') : L('居中闭锁', 'LOCKED')}</span></div>\`;
    }
  } else if (vIdx === 4) {
    // 气动热载荷 View 5
    const loadCd = $('canvas-load-cd');
    if (loadCd) {
      const setup = setupCanvas(loadCd);
      if (setup) {
        const { ctx, w, h } = setup;
        ctx.clearRect(0, 0, w, h);
        const pad = 30;
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.strokeRect(pad, pad, w - pad * 2, h - pad * 2);
        // Cd(M) 曲线
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let m = 0; m <= 6; m += 0.1) {
          const cdVal = 0.3 + 0.55 * Math.exp(-Math.pow((m - 1.1) / 0.28, 2)) + (m > 1.4 ? 0.05 : 0);
          const x = pad + (m / 6) * (w - pad * 2);
          const y = h - pad - (cdVal / 1.0) * (h - pad * 2);
          if (m === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
        // 峰值处标 ▲
        ctx.fillStyle = '#8A94A3';
        ctx.font = '10px monospace';
        ctx.fillText('▲ Max Cd 0.85', pad + (1.1 / 6) * (w - pad * 2) - 20, h - pad - 0.85 * (h - pad * 2) - 8);
        // 当前工作点
        const curX = pad + (Math.min(6, s.M) / 6) * (w - pad * 2);
        const curY = h - pad - (s.Cd / 1.0) * (h - pad * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath(); ctx.arc(curX, curY, 4, 0, Math.PI * 2); ctx.fill();
      }
    }

    const loadQ = $('canvas-load-q');
    if (loadQ) {
      drawStripChart(loadQ, {
        mode: 'full', curT, minV: 0, maxV: 45, unit: 'kPa',
        actualSeries: Hist.getSeries('q', false),
        nominalSeries: Hist.getSeries('q', true),
        limits: [
          { val: q_caution, label: L('动压注意 33.6 kPa', 'Caution 33.6 kPa'), type: 'warn' },
          { val: q_crit, label: L('动压临界 40.3 kPa', 'Critical 40.3 kPa'), type: 'crit' }
        ]
      });
    }

    const loadG = $('canvas-load-g');
    if (loadG) {
      drawStripChart(loadG, {
        mode: 'full', curT, minV: 0, maxV: 7, unit: 'G',
        actualSeries: Hist.getSeries('nG', false),
        nominalSeries: Hist.getSeries('nG', true),
        limits: [
          { val: 4.5, label: L('过载注意 4.5 G', 'Caution 4.5 G'), type: 'warn' },
          { val: 5.5, label: L('过载临界 5.5 G', 'Critical 5.5 G'), type: 'crit' }
        ]
      });
    }

    const loadHeat = $('canvas-load-heat');
    if (loadHeat) {
      drawStripChart(loadHeat, {
        mode: 'full', curT, minV: 0, maxV: 220, unit: 'kW/m²',
        actualSeries: Hist.getSeries('heat', false),
        nominalSeries: Hist.getSeries('heat', true),
        limits: [
          { val: heat_caution, label: L('热流注意 175 kW/m²', 'Caution 175'), type: 'warn' },
          { val: heat_crit, label: L('热流临界 210 kW/m²', 'Critical 210'), type: 'crit' }
        ]
      });
    }

    const heatFooter = $('cLoadHeatFooter');
    if (heatFooter) {
      const derived = getDerivedData(s, S_nom(curT), curT);
      heatFooter.innerHTML = \`
        <div style="height:6px;border-radius:3px;background:linear-gradient(to right, #6b0000, #ff4500, #ffa500, #ffffaa);margin-bottom:6px"></div>
        <div class="row"><span>\${L('累计热载荷', 'Cumulative Heat Load')}<span class="sim-badge" style="margin-left:4px">派生</span></span><span class="m">\${derived.cum_heat_mj.toFixed(2)} MJ/m²</span></div>\`;
    }
  } else if (vIdx === 5) {
    // 回收 View 6
    const recBrake = $('canvas-rec-brake');
    if (recBrake) {
      const setup = setupCanvas(recBrake);
      if (setup) {
        const { ctx, w, h } = setup;
        ctx.clearRect(0, 0, w, h);
        const padL = 40, padB = 24, padT = 16, padR = 16;
        const pW = w - padL - padR, pH = h - padT - padB;
        // 横轴 330..420s, 纵轴 0..75000m
        const toX = tV => padL + ((cl(tV, 330, 420) - 330) / 90) * pW;
        const toY = aV => padT + pH - (cl(aV, 0, 75000) / 75000) * pH;

        // 阴影余量填充
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.beginPath();
        for (let st = 330; st <= 420; st += 2) {
          const sn = S_nom(st);
          const a_avail = Math.max(0.5, 10 * sn.kN / 727);
          const reqH = sn.v * sn.v / (2 * a_avail);
          const x = toX(st), y = toY(reqH);
          if (st === 330) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        for (let st = 420; st >= 330; st -= 2) {
          const sn = S_nom(st);
          const x = toX(st), y = toY(sn.alt);
          ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();

        // 实际高度线
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let st = 330; st <= Math.min(420, curT); st += 1) {
          const sa = S_act(st);
          const x = toX(st), y = toY(sa.alt);
          if (st === 330) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // 所需制动高度线
        ctx.strokeStyle = '#8A94A3';
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        for (let st = 330; st <= 420; st += 2) {
          const sn = S_nom(st);
          const a_avail = Math.max(0.5, 10 * sn.kN / 727);
          const reqH = sn.v * sn.v / (2 * a_avail);
          const x = toX(st), y = toY(reqH);
          if (st === 330) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    const recPred = $('cRecPredictionBody');
    if (recPred) {
      const b0 = mg(s, curT)[0];
      const isBad = s.pg > 4.5 || short;
      const derived = getDerivedData(s, S_nom(curT), curT);
      recPred.innerHTML = \`
        <div class="row"><span>\${L('着陆制动余量', 'Brake Margin')}</span><span class="m">\${b0.v}</span></div>
        <div class="row"><span>\${L('预测触地速度', 'Pred. Touchdown V')}</span><span class="m">\${s.tdv.toFixed(1)} m/s</span></div>
        <div class="row"><span>\${L('预测触地过载', 'Pred. G-Load')}</span><span class="m">\${s.pg.toFixed(1)} G (限值 4.5G)</span></div>
        <div class="row"><span>\${L('缓冲行程', 'Gear Stroke')}</span><span class="m">\${cfg.stroke.toFixed(2)} m</span></div>
        <div class="row"><span>\${L('落点偏差', 'Impact Offset')}</span><span class="m">\${derived.pred_offset.toFixed(1)} m</span></div>
        <div class="row"><span>\${L('预计触地时刻 ETA', 'Touchdown ETA')}</span><span class="m">\${derived.eta_s}</span></div>
        <div style="margin-top:12px;padding:8px;border-radius:6px;background:rgba(255,255,255,0.03);border:1px solid var(--ln)">
          <div class="lb">\${L('预判结论', 'PREDICTION')}</div>
          <div style="font-size:14px;font-weight:700;margin-top:4px;\${isBad ? 'color:var(--cr)' : 'color:#FFFFFF'}">
            \${isBad ? L('预计坠毁 (缓冲过载超限 / 推进不足)', 'VEHICLE LOSS (Overload / Prop Deficit)') : L('预计着陆成功 (一切在容差内)', 'NOMINAL TOUCHDOWN EXPECTED')}
          </div>
        </div>\`;
    }

    const recEng = $('cRecEnginesBody');
    if (recEng) {
      recEng.innerHTML = \`
        <div style="display:flex;flex-direction:column;align-items:center;gap:6px">
          <div>\${getEngineMatrixSvg(88)}</div>
          <div class="lb" style="margin-top:4px">\${curT < 395 ? L('再入段: 3 台点火 (0,1,5)', 'Entry Burn: 3 Engs') : L('着陆段: 单台中心 (0)', 'Landing: Center Only')}</div>
        </div>\`;
    }

    const recVp = $('canvas-vp3d-rec');
    if (recVp) {
      Viewport3D.drawPlaceholder(recVp, curT, s);
    }

    const recLog = $('cRecLogBox');
    if (recLog) {
      recLog.innerHTML = log.slice(0, 10).join('<br>') || L('暂无记录', 'No events');
    }
  }

  // 3. 聚焦模式下的实时重绘
  if (focusedPanelId) {
    renderFocusContent();
  }
}

// 键盘快捷键监听增强 (§2.3)
window.addEventListener('keydown', e => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
  const k = e.key.toLowerCase();

  // 1–6: 切换视图标签
  if (variant === 'engineering' && mode === 'console' && e.key >= '1' && e.key <= '6') {
    Views.mountView(+e.key - 1);
  }
  // 左/右方向键: 上/下一个视图
  else if (variant === 'engineering' && mode === 'console' && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
    const cur = Views.getActiveView();
    const next = e.key === 'ArrowLeft' ? (cur + 5) % 6 : (cur + 1) % 6;
    Views.mountView(next);
  }
  // K: 布局编辑器 (仅工程版)
  if (k === 'k') {
    if (variant === 'engineering') {
      const overlay = $('layoutModalOverlay');
      if (overlay && overlay.style.display !== 'none') {
        closeLayoutDialog(true);
      } else {
        openLayoutDialog();
      }
      e.preventDefault();
      return;
    }
  }

  // F: 聚焦
  else if (k === 'f') {
    if (variant === 'engineering' && mode === 'console') {
      if (focusedPanelId) closeFocusModal();
      else openFocusModal('corridor-hv');
    }
  }
  // C: 紧凑 ⇄ 控制台
  else if (k === 'c') {
    if (variant === 'engineering') {
      setMode(mode === 'compact' ? 'console' : 'compact');
    } else {
      setVariantAndMode('engineering', 'console');
    }
  }
  // A: 自动导播开关
  else if (k === 'a') {
    Viewport3D.setAuto(!Viewport3D.isAuto());
    draw();
  }
  // Esc: 退出聚焦、部件页或对话框
  else if (e.key === 'Escape') {
    const layoutOverlay = $('layoutModalOverlay');
    if (layoutOverlay && layoutOverlay.style.display !== 'none') {
      closeLayoutDialog(true);
      return;
    }
    const pubOverlay = $('pubSettingsOverlay');
    if (pubOverlay && pubOverlay.style.display !== 'none') {
      closePubSettingsDialog();
      return;
    }
    if (focusedPanelId) closeFocusModal();
    closePartSheet();
  }
});

// 全局鼠标移动跨图表同步光标 (§4.4)
window.addEventListener('mousemove', e => {
  const chartCanvas = e.target.closest('.c-chart-canvas');
  if (chartCanvas) {
    const rect = chartCanvas.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width;
    sharedCursorSimT = cl(relX * END, 0, END);
    draw();
  } else {
    if (sharedCursorSimT != null) {
      sharedCursorSimT = null;
      draw();
    }
  }
});

// 绑定顶栏与控制台按钮交互
function initConsoleInteractions() {
  initLayoutDialogInteractions();
  const bModeCompact = $('bModeCompact');
  const bModeConsole = $('bModeConsole');
  if (bModeCompact) bModeCompact.onclick = () => setMode('compact');
  if (bModeConsole) bModeConsole.onclick = () => setMode('console');

  const bDrwClose = $('bDrwClose');
  if (bDrwClose) bDrwClose.onclick = dw;

  const tabs = document.querySelectorAll('#cViewTabs .c-tab-btn');
  tabs.forEach(btn => {
    btn.onclick = () => Views.mountView(+btn.dataset.v);
  });

  const bGoCon = $('bGoConsole');
  if (bGoCon) bGoCon.onclick = go;

  // 控制台 ABORT 按钮 (长按 1s)
  const bAbCon = $('bAbConsole');
  if (bAbCon) {
    const fCon = $('abf-console');
    let timerCon = null;
    const endAb = () => {
      if (timerCon) { clearTimeout(timerCon); timerCon = null; }
      if (fCon) { fCon.style.transition = 'width .15s ease'; fCon.style.width = '0%'; }
    };
    const startAb = () => {
      if (timerCon || ab || fin) return;
      if (fCon) { fCon.style.transition = 'width 1s linear'; fCon.style.width = '100%'; }
      timerCon = setTimeout(() => { endAb(); abort(); }, 1000);
    };
    ['pointerup', 'pointerleave', 'pointercancel', 'blur', 'keyup'].forEach(n => bAbCon.addEventListener(n, endAb));
    bAbCon.addEventListener('pointerdown', startAb);
  }

  const btnSheetClose = $('c-sheet-close');
  if (btnSheetClose) btnSheetClose.onclick = closePartSheet;

  const btnCloseFocus = $('btnCloseFocus');
  if (btnCloseFocus) btnCloseFocus.onclick = closeFocusModal;

  const btnToggleData = $('btnToggleDataTable');
  if (btnToggleData) {
    btnToggleData.onclick = () => {
      showDataTable = !showDataTable;
      renderFocusContent();
    };
  }

  const btnNarrowSwitch = $('btnSwitchToCompactFromNotice');
  if (btnNarrowSwitch) btnNarrowSwitch.onclick = () => setMode('compact');

  const alarmPill = $('c-alarm-summary');
  if (alarmPill) {
    alarmPill.onclick = () => {
      Views.mountView(0); // 切换到总览查看报警
    };
  }
}

// 暴露测试钩子 (§10)
window.__test = {
  setStale: function(val) {
    testStaleForced = !!val;
    draw();
  },
  setT: function(newT) {
    t = cl(newT, 0, END);
    recomputeDeviationsUpTo(t);
    draw();
  },
  getAlarms: function() {
    return Alarms.getActive();
  },
  getLayout: function() {
    return activeLayout;
  },
  setLayout: function(l) {
    const v = LayoutEngine.validate(l);
    if (!v.ok) throw new Error(v.reasonEn);
    activeLayout = JSON.parse(JSON.stringify(l));
    try { localStorage.setItem('aether.layout.active', JSON.stringify(activeLayout)); } catch(e){}
    layoutConfig = activeLayout;
    Views.resetMountCache();
    draw();
  },
  openLayoutDialog: function(tab) {
    openLayoutDialog(tab);
  },
  closeLayoutDialog: function(cancel) {
    closeLayoutDialog(cancel);
  },
  getDraftLayout: function() {
    return draftLayout;
  },
  getSavedLayouts: function() {
    return savedLayouts;
  },
  getGoNoGo: function() {
    return GoNoGo.getStates(S_act(t), t);
  },
  getView: function() {
    return Views.getActiveView();
  },
  setView: function(idx) {
    Views.mountView(idx);
  },
  injectFailure: function(engIdx, state) {
    fl[engIdx] = state ? 1 : 0;
    recomputeDeviationsUpTo(t);
    draw();
  },
  setThrustBias: function(bias) {
    thrustBias = bias;
    recomputeDeviationsUpTo(t);
    draw();
  },
  triggerPoll: function(name) {
    GoNoGo.triggerManualPoll(name);
    draw();
  },
  isAutoDirector: function() {
    return Viewport3D.isAuto();
  },
  setAutoDirector: function(val) {
    Viewport3D.setAuto(val);
    draw();
  },
  getPubSettings: function() {
    return pubSettings;
  },
  setPubSettings: function(s) {
    Object.assign(pubSettings, s);
    savePubSettings();
    draw();
  },
  saveAsNewLayout: function(name) {
    saveAsNewLayout(name);
  },
  renameSavedLayout: function(idx, name) {
    renameSavedLayout(idx, name);
  }
};

// ==================== 时间轴全交互拖拽平滑洗发 (Timeline Scrubbing) ====================
function initTimelineScrub() {
  const trackArea = $('tlTrackArea');
  const tlWrap = $('timeline-wrap');
  if (!trackArea || !tlWrap) return;

  let isDragging = false;
  let wasRunningBeforeDrag = false;

  function getTimeFromEvent(e) {
    const rect = trackArea.getBoundingClientRect();
    if (!rect.width) return 0;
    const clientX = (e.touches && e.touches[0]) ? e.touches[0].clientX : e.clientX;
    const clampedX = Math.max(0, Math.min(rect.width, clientX - rect.left));
    return (clampedX / rect.width) * END;
  }

  function startDrag(e) {
    if (e.button !== undefined && e.button !== 0 && e.type !== 'touchstart') return;
    isDragging = true;
    wasRunningBeforeDrag = run;
    run = false;
    const targetT = getTimeFromEvent(e);
    t = Math.max(0, Math.min(END, targetT));
    fin = t >= END;
    if (typeof cachedTrackWidth !== 'undefined') cachedTrackWidth = 0;
    draw();
    document.body.classList.add('timeline-dragging');
    e.preventDefault();
  }

  function moveDrag(e) {
    if (!isDragging) return;
    const targetT = getTimeFromEvent(e);
    t = Math.max(0, Math.min(END, targetT));
    fin = t >= END;
    if (typeof cachedTrackWidth !== 'undefined') cachedTrackWidth = 0;
    draw();
    e.preventDefault();
  }

  function stopDrag(e) {
    if (!isDragging) return;
    isDragging = false;
    document.body.classList.remove('timeline-dragging');
    if (wasRunningBeforeDrag && !fin && !ab) {
      run = true;
    }
    if (typeof cachedTrackWidth !== 'undefined') cachedTrackWidth = 0;
    draw();
  }

  trackArea.addEventListener('mousedown', startDrag);
  trackArea.addEventListener('touchstart', startDrag, { passive: false });

  window.addEventListener('mousemove', moveDrag, { passive: false });
  window.addEventListener('touchmove', moveDrag, { passive: false });

  window.addEventListener('mouseup', stopDrag);
  window.addEventListener('touchend', stopDrag);
}


// ==================== 面板布局编辑器 Dialog 交互逻辑 (Section 13) ====================
function openLayoutDialog(targetTab) {
  if (variant === 'public') return;
  const overlay = $('layoutModalOverlay');
  if (!overlay) return;

  wasRunningBeforeDialog = run;
  run = false; // 编辑时自动暂停 (§13.7)

  draftLayout = JSON.parse(JSON.stringify(activeLayout));
  draftEditorTab = targetTab || (mode === 'console' ? 'console' : 'compact');
  previewPhaseT = 0;

  overlay.style.display = 'flex';
  const alertEl = $('leDialogAlert');
  if (alertEl) alertEl.style.display = 'none';

  renderLayoutDialog();
}

function closeLayoutDialog(cancelled) {
  const overlay = $('layoutModalOverlay');
  if (overlay) overlay.style.display = 'none';
  if (cancelled) {
    draftLayout = null;
  }
  // 关闭时恢复到打开前的状态 (原本在运行才恢复 §13.7)
  if (wasRunningBeforeDialog && !fin && !ab) {
    run = true;
  }
  draw();
}

function applyDraftLayout() {
  if (!draftLayout) return;
  const v = LayoutEngine.validate(draftLayout);
  const alertEl = $('leDialogAlert');
  if (!v.ok) {
    if (alertEl) {
      alertEl.style.display = 'block';
      alertEl.style.background = 'rgba(255, 77, 94, 0.15)';
      alertEl.style.color = 'var(--cr)';
      alertEl.textContent = \`\${L('校验未通过: ', 'Validation error: ')}\${L(v.reasonZh, v.reasonEn)}\`;
    }
    return;
  }

  activeLayout = JSON.parse(JSON.stringify(draftLayout));
  layoutConfig = activeLayout;
  try {
    localStorage.setItem('aether.layout.active', JSON.stringify(activeLayout));
  } catch (e) {}
  Views.resetMountCache();
  closeLayoutDialog(false);
  draw();
}

function getUniqueLayoutName(baseName, excludeIdx = -1) {
  let name = (baseName || L('我的布局', 'My Layout')).trim();
  const exists = (n) => savedLayouts.some((l, idx) => idx !== excludeIdx && l.name === n);
  if (!exists(name)) return name;
  let idx = 2;
  while (exists(\`\${name} \${idx}\`)) {
    idx++;
  }
  return \`\${name} \${idx}\`;
}

function saveAsNewLayout(customName) {
  if (!draftLayout) return;
  if (savedLayouts.length >= 5) {
    alert(L('最多保存 5 个自定义布局，请先删除旧布局。', 'Maximum 5 saved layouts reached. Please delete an older layout first.'));
    return;
  }
  const defaultName = \`\${L('我的布局', 'My Layout')} \${savedLayouts.length + 1}\`;
  const name = (customName !== undefined) ? customName : prompt(L('请输入布局名称:', 'Enter layout name:'), draftLayout.name || defaultName);
  if (!name) return;
  const toSave = JSON.parse(JSON.stringify(draftLayout));
  toSave.name = getUniqueLayoutName(name);
  savedLayouts.push(toSave);
  try {
    localStorage.setItem('aether.layout.saved', JSON.stringify(savedLayouts));
  } catch (e) {}
  renderLayoutDialog();
}

function renameSavedLayout(idx, customNewName) {
  if (idx >= 0 && idx < savedLayouts.length) {
    const cur = savedLayouts[idx].name;
    const newName = (customNewName !== undefined) ? customNewName : prompt(L('请输入新布局名称:', 'Enter new layout name:'), cur);
    if (newName && newName.trim() && newName.trim() !== cur) {
      savedLayouts[idx].name = getUniqueLayoutName(newName.trim(), idx);
      try {
        localStorage.setItem('aether.layout.saved', JSON.stringify(savedLayouts));
      } catch (e) {}
      renderLayoutDialog();
    }
  }
}

function deleteSavedLayout(idx) {
  if (idx >= 0 && idx < savedLayouts.length) {
    savedLayouts.splice(idx, 1);
    try {
      localStorage.setItem('aether.layout.saved', JSON.stringify(savedLayouts));
    } catch (e) {}
    renderLayoutDialog();
  }
}

function loadSavedLayout(idx) {
  if (idx >= 0 && idx < savedLayouts.length) {
    draftLayout = JSON.parse(JSON.stringify(savedLayouts[idx]));
    renderLayoutDialog();
  }
}

function loadLayoutPreset(presetKey) {
  const p = LayoutEngine.PRESETS_SCHEMA2[presetKey];
  if (p) {
    draftLayout = JSON.parse(JSON.stringify(p));
    renderLayoutDialog();
  }
}

function exportLayoutJson() {
  const ta = $('leIoTextarea');
  if (ta && draftLayout) {
    ta.value = LayoutEngine.serialize(draftLayout);
    ta.select();
  }
}

function importLayoutJson() {
  const ta = $('leIoTextarea');
  const alertEl = $('leDialogAlert');
  if (!ta) return;
  try {
    const parsed = LayoutEngine.parse(ta.value.trim());
    const v = LayoutEngine.validate(parsed);
    if (!v.ok) {
      if (alertEl) {
        alertEl.style.display = 'block';
        alertEl.style.background = 'rgba(255, 77, 94, 0.15)';
        alertEl.style.color = 'var(--cr)';
        alertEl.textContent = \`\${L('导入格式校验失败: ', 'Import validation failed: ')}\${L(v.reasonZh, v.reasonEn)}\`;
      }
      return;
    }
    draftLayout = parsed;
    if (alertEl) {
      alertEl.style.display = 'block';
      alertEl.style.background = 'rgba(79, 209, 255, 0.15)';
      alertEl.style.color = 'var(--ac)';
      alertEl.textContent = L('导入成功！已载入为当前草稿。', 'Import successful! Loaded into draft.');
    }
    renderLayoutDialog();
  } catch (err) {
    if (alertEl) {
      alertEl.style.display = 'block';
      alertEl.style.background = 'rgba(255, 77, 94, 0.15)';
      alertEl.style.color = 'var(--cr)';
      alertEl.textContent = \`\${L('JSON 解析失败: ', 'JSON parse error: ')}\${err.message}\`;
    }
  }
}

function renderLayoutDialog() {
  if (!draftLayout) return;

  // 1. Tab buttons
  const btnCompact = $('btnLeTabCompact');
  const btnConsole = $('btnLeTabConsole');
  if (btnCompact) btnCompact.classList.toggle('active', draftEditorTab === 'compact');
  if (btnConsole) btnConsole.classList.toggle('active', draftEditorTab === 'console');

  // 2. Mismatch notice
  const mismatchEl = $('leModeMismatchNotice');
  const mismatchTxt = $('leMismatchText');
  const isMismatch = (draftEditorTab === 'compact' && mode === 'console') ||
                     (draftEditorTab === 'console' && mode === 'compact');
  if (mismatchEl) {
    mismatchEl.style.display = isMismatch ? 'block' : 'none';
    if (mismatchTxt) {
      mismatchTxt.textContent = draftEditorTab === 'compact'
        ? L('当前为控制台模式，在紧凑模式标签下的修改将在应用并切换到紧凑模式后生效。', 'Currently in console mode; changes will be visible when switching to compact mode.')
        : L('当前为紧凑模式，在控制台总览标签下的修改将在应用并切换到控制台模式后生效。', 'Currently in compact mode; changes will be visible when switching to console mode.');
    }
  }

  // 3. Presets buttons active state
  document.querySelectorAll('.le-preset-btn').forEach(btn => {
    const pKey = btn.dataset.p;
    const pObj = LayoutEngine.PRESETS_SCHEMA2[pKey];
    btn.classList.toggle('active', !!(pObj && draftLayout.name === pObj.name));
  });

  // 4. Preview phase selector & preview strip
  const selPhase = $('selPreviewPhase');
  if (selPhase) {
    selPhase.value = String(previewPhaseT);
  }
  updatePreviewStrip();

  // 5. Grid scroll area
  const gridArea = $('leGridArea');
  if (gridArea) {
    gridArea.innerHTML = renderGridSlotRowsHtml();
    attachSlotRowListeners(gridArea);
  }

  // 6. Saved layouts list
  const savedList = $('leSavedLayoutsList');
  if (savedList) {
    if (savedLayouts.length === 0) {
      savedList.innerHTML = \`<span class="lb" style="font-size:10px;padding:2px">\${L('暂无保存布局', 'No saved layouts')}</span>\`;
    } else {
      savedList.innerHTML = savedLayouts.map((l, idx) => \`
        <div class="le-saved-item">
          <span class="le-saved-item-name" title="\${l.name}" data-idx="\${idx}">\${l.name}</span>
          <div style="display:flex;gap:4px">
            <button class="pill" data-load-idx="\${idx}" style="height:18px;padding:0 5px;font-size:9px">\${L('载入', 'Load')}</button>
            <button class="pill" data-rename-idx="\${idx}" style="height:18px;padding:0 5px;font-size:9px">\${L('重命名', 'Rename')}</button>
            <button class="pill" data-del-idx="\${idx}" style="height:18px;padding:0 5px;font-size:9px;color:var(--cr)">✕</button>
          </div>
        </div>\`).join('');

      savedList.querySelectorAll('[data-load-idx]').forEach(btn => {
        btn.onclick = () => loadSavedLayout(+btn.dataset.loadIdx);
      });
      savedList.querySelectorAll('[data-rename-idx]').forEach(btn => {
        btn.onclick = () => renameSavedLayout(+btn.dataset.renameIdx);
      });
      savedList.querySelectorAll('[data-del-idx]').forEach(btn => {
        btn.onclick = () => deleteSavedLayout(+btn.dataset.delIdx);
      });
    }
  }

  // 7. Textarea default serialize
  const ta = $('leIoTextarea');
  if (ta && !ta.value) {
    ta.value = LayoutEngine.serialize(draftLayout);
  }
}

function renderGridSlotRowsHtml() {
  const optionsHtml = (selectedVal) => {
    return LayoutEngine.WIDGET_OPTIONS.map(opt => {
      const isSel = opt.val === selectedVal;
      return \`<option value="\${opt.val}" \${isSel ? 'selected' : ''}>\${opt.val} · \${L(opt.zh, opt.en)}</option>\`;
    }).join('');
  };

  if (draftEditorTab === 'compact') {
    const lSlots = draftLayout.L || [];
    const rSlots = draftLayout.R || [];

    const lHtml = lSlots.map((slot, i) => {
      const isAuto = slot.m === 'a';
      return \`
        <div class="le-slot-row" data-zone="L" data-idx="\${i}">
          <span class="le-slot-label">L\${i + 1}</span>
          <button class="le-mode-btn \${isAuto ? 'auto' : 'fixed'}" data-zone="L" data-idx="\${i}">
            \${isAuto ? L('自动', 'AUTO') : L('固定', 'FIXED')}
          </button>
          <select class="le-select le-widget-select" data-zone="L" data-idx="\${i}" \${isAuto ? 'disabled style="opacity:0.4"' : ''}>
            \${optionsHtml(slot.w || 'eng1')}
          </select>
        </div>\`;
    }).join('');

    const rHtml = rSlots.map((slot, i) => {
      const isAuto = slot.m === 'a';
      return \`
        <div class="le-slot-row" data-zone="R" data-idx="\${i}">
          <span class="le-slot-label">R\${i + 1}</span>
          <button class="le-mode-btn \${isAuto ? 'auto' : 'fixed'}" data-zone="R" data-idx="\${i}">
            \${isAuto ? L('自动', 'AUTO') : L('固定', 'FIXED')}
          </button>
          <select class="le-select le-widget-select" data-zone="R" data-idx="\${i}" \${isAuto ? 'disabled style="opacity:0.4"' : ''}>
            \${optionsHtml(slot.w || 'thrust')}
          </select>
        </div>\`;
    }).join('');

    return \`
      <div class="le-zones-grid">
        <div class="le-zone-col">
          <span class="lb" style="color:var(--ac);font-weight:600">\${L('左区 (L1–L5, 发动机占 L1+L2)', 'Left Zone L1–L5')}</span>
          \${lHtml}
        </div>
        <div class="le-zone-col">
          <span class="lb" style="color:var(--ac);font-weight:600">\${L('右区 (R1–R4)', 'Right Zone R1–R4')}</span>
          \${rHtml}
        </div>
      </div>\`;
  } else {
    const sSlots = draftLayout.S || [];
    const col1 = sSlots.slice(0, 6);
    const col2 = sSlots.slice(6, 12);

    const renderCol = (slots, offset) => slots.map((slot, i) => {
      const idx = offset + i;
      const isAuto = slot.m === 'a';
      return \`
        <div class="le-slot-row" data-zone="S" data-idx="\${idx}">
          <span class="le-slot-label">S\${idx + 1}</span>
          <button class="le-mode-btn \${isAuto ? 'auto' : 'fixed'}" data-zone="S" data-idx="\${idx}">
            \${isAuto ? L('自动', 'AUTO') : L('固定', 'FIXED')}
          </button>
          <select class="le-select le-widget-select" data-zone="S" data-idx="\${idx}" \${isAuto ? 'disabled style="opacity:0.4"' : ''}>
            \${optionsHtml(slot.w || 'eng1')}
          </select>
        </div>\`;
    }).join('');

    return \`
      <div class="le-zones-grid">
        <div class="le-zone-col">
          <span class="lb" style="color:var(--ac);font-weight:600">\${L('前区 (S1–S6)', 'Front S1–S6')}</span>
          \${renderCol(col1, 0)}
        </div>
        <div class="le-zone-col">
          <span class="lb" style="color:var(--ac);font-weight:600">\${L('后区 (S7–S12)', 'Back S7–S12')}</span>
          \${renderCol(col2, 6)}
        </div>
      </div>\`;
  }
}

function updatePreviewStrip() {
  const strip = $('lePreviewStrip');
  if (!strip || !draftLayout) return;

  const resolved = LayoutEngine.resolveLayout(draftLayout, previewPhaseT);
  if (draftEditorTab === 'compact') {
    const chipsL = resolved.L.map((w, i) => {
      if (w === 'eng1_span' || w === 'eng2_span') return '';
      const isSpan = (w === 'eng1' || w === 'eng2');
      const isDimmed = resolved.dimmed.L[i];
      const isFixed = draftLayout.L[i] && draftLayout.L[i].m === 'f';
      return \`<span class="le-preview-slot-chip \${isFixed ? 'fixed' : ''} \${isDimmed ? 'dimmed' : ''}">L\${i + 1}\${isSpan ? '+L' + (i + 2) : ''}: \${w}</span>\`;
    }).join('');

    const chipsR = resolved.R.map((w, i) => {
      const isDimmed = resolved.dimmed.R[i];
      const isFixed = draftLayout.R[i] && draftLayout.R[i].m === 'f';
      return \`<span class="le-preview-slot-chip \${isFixed ? 'fixed' : ''} \${isDimmed ? 'dimmed' : ''}">R\${i + 1}: \${w}</span>\`;
    }).join('');

    strip.innerHTML = chipsL + '<span style="color:var(--t2);padding:0 4px">|</span>' + chipsR;
  } else {
    const chipsS = resolved.S.map((w, i) => {
      if (w === 'eng1_span' || w === 'eng2_span') return '';
      const isSpan = (w === 'eng1' || w === 'eng2');
      const isDimmed = resolved.dimmed.S[i];
      const isFixed = draftLayout.S[i] && draftLayout.S[i].m === 'f';
      return \`<span class="le-preview-slot-chip \${isFixed ? 'fixed' : ''} \${isDimmed ? 'dimmed' : ''}">S\${i + 1}\${isSpan ? '+S' + (i + 2) : ''}: \${w}</span>\`;
    }).join('');

    strip.innerHTML = chipsS;
  }
}

function attachSlotRowListeners(gridArea) {
  const alertEl = $('leDialogAlert');

  gridArea.querySelectorAll('.le-mode-btn').forEach(btn => {
    btn.onclick = () => {
      const zone = btn.dataset.zone;
      const idx = +btn.dataset.idx;
      const slot = draftLayout[zone][idx];
      const newM = slot.m === 'a' ? 'f' : 'a';

      if (newM === 'f' && (!slot.w || slot.w === 'none' || !LayoutEngine.VALID_WIDGET_IDS.has(slot.w))) {
        slot.w = zone === 'S'
          ? (LayoutEngine.getAutoScheduledWidgetForS(idx, previewPhaseT) || 'thrust')
          : (zone === 'L' ? (idx === 0 ? 'eng1' : 'prop1') : 'thrust');
        if (slot.w === 'none' || slot.w === 'eng1_span' || slot.w === 'eng2_span' || !LayoutEngine.VALID_WIDGET_IDS.has(slot.w)) {
          slot.w = 'thrust';
        }
      }
      slot.m = newM;

      const v = LayoutEngine.validate(draftLayout);
      if (!v.ok) {
        slot.m = newM === 'a' ? 'f' : 'a';
        if (alertEl) {
          alertEl.style.display = 'block';
          alertEl.style.background = 'rgba(255, 77, 94, 0.15)';
          alertEl.style.color = 'var(--cr)';
          alertEl.textContent = \`\${L('非法修改: ', 'Invalid modification: ')}\${L(v.reasonZh, v.reasonEn)}\`;
        }
        return;
      }
      if (alertEl) alertEl.style.display = 'none';
      renderLayoutDialog();
    };
  });

  gridArea.querySelectorAll('.le-widget-select').forEach(sel => {
    sel.onchange = () => {
      const zone = sel.dataset.zone;
      const idx = +sel.dataset.idx;
      const oldW = draftLayout[zone][idx].w;
      const newW = sel.value;

      draftLayout[zone][idx].w = newW;

      const v = LayoutEngine.validate(draftLayout);
      if (!v.ok) {
        draftLayout[zone][idx].w = oldW;
        sel.value = oldW;
        if (alertEl) {
          alertEl.style.display = 'block';
          alertEl.style.background = 'rgba(255, 77, 94, 0.15)';
          alertEl.style.color = 'var(--cr)';
          alertEl.textContent = \`\${L('非法选择: ', 'Invalid selection: ')}\${L(v.reasonZh, v.reasonEn)}\`;
        }
        return;
      }
      if (alertEl) alertEl.style.display = 'none';
      updatePreviewStrip();
    };
  });
}

function openPubSettingsDialog() {
  const overlay = $('pubSettingsOverlay');
  if (overlay) overlay.style.display = 'flex';
  renderPubSettingsDialog();
}

function closePubSettingsDialog() {
  const overlay = $('pubSettingsOverlay');
  if (overlay) overlay.style.display = 'none';
}

function initLayoutDialogInteractions() {
  const bLayoutTop = $('bLayoutTop');
  if (bLayoutTop) bLayoutTop.onclick = () => openLayoutDialog();

  const btnLayoutClose = $('btnLayoutClose');
  if (btnLayoutClose) btnLayoutClose.onclick = () => closeLayoutDialog(true);

  const btnLayoutCancel = $('btnLayoutCancel');
  if (btnLayoutCancel) btnLayoutCancel.onclick = () => closeLayoutDialog(true);

  const btnLayoutApply = $('btnLayoutApply');
  if (btnLayoutApply) btnLayoutApply.onclick = () => applyDraftLayout();

  const btnLeTabCompact = $('btnLeTabCompact');
  if (btnLeTabCompact) btnLeTabCompact.onclick = () => { draftEditorTab = 'compact'; renderLayoutDialog(); };

  const btnLeTabConsole = $('btnLeTabConsole');
  if (btnLeTabConsole) btnLeTabConsole.onclick = () => { draftEditorTab = 'console'; renderLayoutDialog(); };

  const selPhase = $('selPreviewPhase');
  if (selPhase) selPhase.onchange = () => { previewPhaseT = +selPhase.value; updatePreviewStrip(); };

  document.querySelectorAll('.le-preset-btn').forEach(btn => {
    btn.onclick = () => loadLayoutPreset(btn.dataset.p);
  });

  const btnRestoreDefaultLayout = $('btnRestoreDefaultLayout');
  if (btnRestoreDefaultLayout) btnRestoreDefaultLayout.onclick = () => {
    draftLayout = JSON.parse(JSON.stringify(LayoutEngine.DEFAULT_LAYOUT_SCHEMA2));
    renderLayoutDialog();
  };

  const btnSaveAs = $('btnSaveAsLayout');
  if (btnSaveAs) btnSaveAs.onclick = () => saveAsNewLayout();

  const btnExport = $('btnExportIo');
  if (btnExport) btnExport.onclick = () => exportLayoutJson();

  const btnImport = $('btnImportIo');
  if (btnImport) btnImport.onclick = () => importLayoutJson();

  // Public settings dialog
  const bSettingsPub = $('bSettingsPub');
  if (bSettingsPub) bSettingsPub.onclick = () => openPubSettingsDialog();

  const btnPubClose = $('btnPubSettingsClose');
  if (btnPubClose) btnPubClose.onclick = () => closePubSettingsDialog();

  const btnPubOk = $('btnPubSettingsOk');
  if (btnPubOk) btnPubOk.onclick = () => closePubSettingsDialog();

  const btnUnitMetric = $('btnUnitMetric');
  if (btnUnitMetric) btnUnitMetric.onclick = () => {
    pubSettings.unit = 'metric';
    savePubSettings();
    renderPubSettingsDialog();
    initDashboardDOM();
    draw();
  };

  const btnUnitImperial = $('btnUnitImperial');
  if (btnUnitImperial) btnUnitImperial.onclick = () => {
    pubSettings.unit = 'imperial';
    savePubSettings();
    renderPubSettingsDialog();
    initDashboardDOM();
    draw();
  };

  const btnLangZh = $('btnLangZh');
  if (btnLangZh) btnLangZh.onclick = () => {
    if (lang !== 'zh') toggleLanguage();
    renderPubSettingsDialog();
  };

  const btnLangEn = $('btnLangEn');
  if (btnLangEn) btnLangEn.onclick = () => {
    if (lang !== 'en') toggleLanguage();
    renderPubSettingsDialog();
  };

  const btnTogglePubDesc = $('btnTogglePubDesc');
  if (btnTogglePubDesc) btnTogglePubDesc.onclick = () => {
    pubSettings.showDesc = !pubSettings.showDesc;
    savePubSettings();
    renderPubSettingsDialog();
    initDashboardDOM();
    draw();
  };

  const btnTogglePubGLoad = $('btnTogglePubGLoad');
  if (btnTogglePubGLoad) btnTogglePubGLoad.onclick = () => {
    pubSettings.showGLoad = !pubSettings.showGLoad;
    savePubSettings();
    renderPubSettingsDialog();
    initDashboardDOM();
    draw();
  };
}

`;
