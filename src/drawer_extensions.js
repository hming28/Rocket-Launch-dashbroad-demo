// Drawer extensions: Tuning tab (thrust bias, RNG/WX toggles) and Layout Editor Schema 2 link
module.exports = `
// ==================== 抽屉扩展: 调参页与 Schema 2 布局编辑器入口 ====================
function showTab() {
  if ($('drwHeaderTitle')) $('drwHeaderTitle').textContent = L('工程抽屉 · DIAGNOSTICS & SETTINGS', 'ENGINEERING DRAWER');
  const bClose = $('bDrwClose');
  if (bClose) bClose.onclick = () => { if (dr) dw(); };
  const tabNames = [
    ['验证', 'Verify'], ['推进', 'Propulsion'], ['调参', 'Tuning'],
    ['裕度', 'Margins'], ['布局', 'Layout'], ['日志', 'Log']
  ];
  $('tabs').innerHTML = tabNames.map((n, i) => \`<button class="\${i === tab ? 'on' : ''}" data-t="\${i}">\${L(n[0], n[1])}</button>\`).join('');
  const s = V || S_act(t);
  const e = $('db');

  if (tab === 0) {
    const ok = s.mass > 0 && s.I / s.mass > 169 && s.I / s.mass < 170;
    e.innerHTML = [
      [L('质量', 'Mass'), s.mass.toFixed(1) + ' t'],
      [L('转动惯量', 'Inertia'), Math.round(s.I).toLocaleString() + ' t·m²'],
      [L('质量/惯量一致', 'Mass–inertia'), ok ? '✓' : '✗'],
      [L('大气密度', 'Density'), s.rho.toExponential(2) + ' kg/m³'],
      [L('马赫', 'Mach'), s.M.toFixed(2)],
      [L('阻力系数 Cd', 'Cd'), s.Cd.toFixed(3) + (Math.abs(s.M - 1.1) < .3 ? ' ▲' : '')],
      [L('动压', 'Q'), s.q.toFixed(2) + ' kPa'],
      [L('阻力', 'Drag'), s.drag.toFixed(1) + ' kN'],
      [L('热流', 'Heat flux'), s.heat.toFixed(1) + ' kW/m²'],
      [L('过载 nG', 'Load nG'), s.nG.toFixed(2) + ' G'],
      [L('角速度', 'Rate'), s.w.toFixed(2) + ' °/s']
    ].map(r => \`<div class="row"><span>\${r[0]}</span><span class="m">\${r[1]}</span></div>\`).join('');
  } else if (tab === 1) {
    const u = (100 - s.pr) * 5.2, cg = t > 156 ? (t - 156) * .8 : 0;
    e.innerHTML = [
      [L('剩余推进剂', 'Remaining'), s.pr.toFixed(2) + '% · ' + (s.pr * 5.2).toFixed(1) + ' t'],
      [L('主发动机消耗', 'Main engines'), (u - cg / 1000).toFixed(1) + ' t'],
      [L('姿控冷气消耗', 'Cold gas'), cg.toFixed(0) + ' kg'],
      [L('当前推力', 'Thrust'), Math.round(s.kN) + ' kN'],
      [L('缓冲行程限值', 'Stroke'), cfg.stroke.toFixed(2) + ' m'],
      [L('预测触地过载', 'Pred. G'), s.pg.toFixed(2) + ' G']
    ].map(r => \`<div class="row"><span>\${r[0]}</span><span class="m">\${r[1]}</span></div>\`).join('') +
    \`<p class="lb" style="margin-top:14px;line-height:1.6;text-transform:none;letter-spacing:0">\${L('姿控消耗计入同一本推进剂账本。', 'Attitude-control use is booked in the same propellant ledger.')}</p>\`;
  } else if (tab === 2) {
    // 调参页 (§5.2, §8.2: 新增推力偏差与 RNG/WX 开关)
    e.innerHTML = \`
      <div class="row"><span>\${L('着陆点火高度', 'Burn altitude')}</span><span class="m" id="lb1">\${cfg.burn} m</span></div>
      <input type="range" id="s1" min="1800" max="3600" step="100" value="\${cfg.burn}">
      
      <div class="row" style="margin-top:12px"><span>\${L('缓冲行程', 'Stroke')}</span><span class="m" id="lb2">\${cfg.stroke.toFixed(2)} m</span></div>
      <input type="range" id="s2" min="0.3" max="2.6" step="0.05" value="\${cfg.stroke}">

      <div class="row" style="margin-top:12px">
        <span>\${L('推力偏差注入', 'Thrust Bias')}</span>
        <span class="m" id="lbThrustBias">\${(thrustBias * 100).toFixed(0)}%</span>
      </div>
      <input type="range" id="sThrustBias" min="-15" max="5" step="1" value="\${thrustBias * 100}">

      <div style="margin-top:14px;border-top:1px solid var(--ln);padding-top:10px">
        <div class="lb" style="margin-bottom:8px">\${L('席位模拟开关 (仅调参演示)', 'Seat Sim Overrides')}</div>
        <div class="row">
          <span>\${L('RNG 靶场席位', 'RNG Range Seat')}</span>
          <button class="pill" id="btnToggleRng" style="height:26px">\${rngOverrideGo ? 'GO (正常)' : 'NO-GO (超限)'}</button>
        </div>
        <div class="row">
          <span>\${L('WX 气象席位', 'WX Weather Seat')}</span>
          <button class="pill" id="btnToggleWx" style="height:26px">\${wxOverrideGo ? 'GO (良好)' : 'NO-GO (红线)'}</button>
        </div>
      </div>

      <p class="lb" style="text-transform:none;letter-spacing:0;line-height:1.6;margin:12px 0">\${L('改参数后点“重来”，运行结果会进入下表。', 'Change values, press Reset; each run is listed below.')}</p>
      <div id="hl">\${hs()}</div>\`;

    $('s1').oninput = ev => { cfg.burn = +ev.target.value; $('lb1').textContent = cfg.burn + ' m'; };
    $('s2').oninput = ev => { cfg.stroke = +ev.target.value; $('lb2').textContent = cfg.stroke.toFixed(2) + ' m'; };
    $('sThrustBias').oninput = ev => {
      thrustBias = (+ev.target.value) / 100;
      $('lbThrustBias').textContent = (thrustBias * 100).toFixed(0) + '%';
      recomputeDeviationsUpTo(t);
      draw();
    };
    $('btnToggleRng').onclick = () => {
      rngOverrideGo = !rngOverrideGo;
      $('btnToggleRng').textContent = rngOverrideGo ? 'GO (正常)' : 'NO-GO (超限)';
      draw();
    };
    $('btnToggleWx').onclick = () => {
      wxOverrideGo = !wxOverrideGo;
      $('btnToggleWx').textContent = wxOverrideGo ? 'GO (良好)' : 'NO-GO (红线)';
      draw();
    };
  } else if (tab === 3) {
    // 裕度页
    const margins = mg(s, t);
    e.innerHTML = margins.map(m => \`
      <div style="margin-bottom:10px">
        <div class="row" style="border:none;padding:2px 0">
          <span>\${L(m.z, m.e)}</span>
          <span class="m" style="color:\${m.s === 2 ? 'var(--cr)' : m.s === 1 ? 'var(--wn)' : 'var(--ac)'}">\${m.v}</span>
        </div>
        <div style="height:4px;background:rgba(255,255,255,.1);border-radius:2px;overflow:hidden">
          <div style="height:100%;width:\${m.p}%;background:\${m.s === 2 ? 'var(--cr)' : m.s === 1 ? 'var(--wn)' : 'var(--ac)'}"></div>
        </div>
      </div>\`).join('');
  } else if (tab === 4) {
    // 布局编辑器入口与摘要展示 (§13.7)
    const activeName = (typeof activeLayout !== 'undefined' && activeLayout && activeLayout.name) ? activeLayout.name : L('默认', 'Default');
    e.innerHTML = \`
      <div class="layout-editor-box" style="padding:10px">
        <div style="font-weight:700;font-size:13px;margin-bottom:8px">\${L('仪表盘布局编辑器 (Schema 2)', 'Layout Editor (Schema 2)')}</div>
        <div class="lb" style="margin-bottom:12px;color:var(--t2);line-height:1.4">
          \${L('AETHER-9 现已升级为独立面板布局编辑器对话框。请点击下方按钮打开对话框进行定制、预设切换与导入导出。', 'AETHER-9 layout editing is available via the layout editor dialog. Click below to open the dialog.')}
        </div>
        <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:6px;padding:10px;margin-bottom:12px">
          <div class="row"><span>\${L('当前激活布局', 'Active Layout')}</span><span class="m">\${activeName}</span></div>
          <div class="row"><span>\${L('紧凑模式槽位', 'Compact Slots')}</span><span class="m">L (5) + R (4)</span></div>
          <div class="row"><span>\${L('控制台总览小部件条', 'Console Strip')}</span><span class="m">S (12)</span></div>
        </div>
        <button class="bt pr" id="btnOpenLayoutModalFromDrawer" style="width:100%;height:38px;font-size:12px">
          \${L('打开面板布局编辑器 (K)', 'Open Layout Editor (K)')}
        </button>
      </div>\`;

    const btn = $('btnOpenLayoutModalFromDrawer');
    if (btn) btn.onclick = () => { if (typeof openLayoutDialog === 'function') openLayoutDialog(); };
  } else if (tab === 5) {
    e.innerHTML = \`<div class="lg">\${log.length ? log.join('<br>') : L('暂无事件', 'No events')}</div>\`;
  }
}

function saveSettings() {
  try {
    localStorage.setItem('aether.variant', variant);
    localStorage.setItem('aether.mode', mode);
    localStorage.setItem('aether.lang', lang);
    localStorage.setItem('aether.speed', String(spd));
    if (typeof activeLayout !== 'undefined' && activeLayout) {
      localStorage.setItem('aether.layout.active', JSON.stringify(activeLayout));
    }
  } catch (e) {}
}
function saveVariantSettings() {
  saveSettings();
}
function loadVariantSettings() {
  loadSettings();
}

function loadSettings() {
  try {
    const hash = window.location.hash.toLowerCase();
    if (hash === '#console') { variant = 'engineering'; mode = 'console'; }
    else if (hash === '#engineering') { variant = 'engineering'; mode = 'compact'; }
    else if (hash === '#public') { variant = 'public'; mode = 'compact'; lang = 'zh'; document.documentElement.lang = 'zh-CN'; }
    else {
      const savedVar = localStorage.getItem('aether.variant');
      if (savedVar === 'engineering' || savedVar === 'public') variant = savedVar;
      const savedMode = localStorage.getItem('aether.mode');
      if (savedMode === 'console' || savedMode === 'compact') mode = savedMode;
    }
    const savedLang = localStorage.getItem('aether.lang');
    if (savedLang === 'zh' || savedLang === 'en') {
      lang = savedLang;
      document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
    }
    const savedSpd = +localStorage.getItem('aether.speed');
    if (sp.includes(savedSpd)) spd = savedSpd;
  } catch (e) {}
  if (typeof loadActiveAndSavedLayouts === 'function') {
    loadActiveAndSavedLayouts();
  }
}
`;
