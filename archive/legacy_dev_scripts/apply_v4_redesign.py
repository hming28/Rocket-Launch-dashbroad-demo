import os
import re

with open('AETHER-9 飞行控制台 v3.html', 'r', encoding='utf-8') as f:
    v3 = f.read()

# Start from fresh v4 or current v4
with open('AETHER-9 飞行控制台 v4.html', 'r', encoding='utf-8') as f:
    v4 = f.read()

with open('v3_extracted_widgets.js', 'r', encoding='utf-8') as f:
    v3_widgets = f.read()

print("Original v4 length:", len(v4))

# 1. Update the layout declaration around line 197845
pos_target = v4.find('// Active, draft, and saved layouts management (Schema 2 §13.6)')
if pos_target == -1:
    pos_target = v4.find('// Active, draft, and saved layouts management')
pos_target_end = v4.find('let pubSettings =', pos_target)

new_layout_core = """// Active, draft, and saved layouts management
const DEFAULT_LAYOUT_CONFIG = {
  mode: 'auto', // 'auto' | 'custom'
  left: ['prop1', 'g', 'thr', 'none'], // 槽位 2~5
  right: ['thrust', 'mach', 'q', 'cd', 'none'], // 槽位 1~5
  S: LayoutEngine.DEFAULT_LAYOUT_SCHEMA2.S
};

let layoutConfig = JSON.parse(JSON.stringify(DEFAULT_LAYOUT_CONFIG));
let activeLayout = layoutConfig;
let savedLayouts = [];
let draftLayout = null;
let draftEditorTab = 'compact';
let previewPhaseT = 0;
let wasRunningBeforeDialog = false;

function loadActiveAndSavedLayouts() {
  loadLayoutConfig();
  loadPubSettings();
}

function loadLayoutConfig() {
  try {
    const raw = localStorage.getItem('aether.layout.v4');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && (parsed.mode === 'auto' || parsed.mode === 'custom')) {
        layoutConfig = {
          mode: parsed.mode || 'auto',
          left: Array.isArray(parsed.left) && parsed.left.length === 4 ? parsed.left : ['prop1', 'g', 'thr', 'none'],
          right: Array.isArray(parsed.right) && parsed.right.length === 5 ? parsed.right : ['thrust', 'mach', 'q', 'cd', 'none'],
          S: LayoutEngine.DEFAULT_LAYOUT_SCHEMA2.S
        };
      }
    }
  } catch (e) {
    layoutConfig = JSON.parse(JSON.stringify(DEFAULT_LAYOUT_CONFIG));
  }
  activeLayout = layoutConfig;
}

function saveLayoutConfig() {
  try {
    localStorage.setItem('aether.layout.v4', JSON.stringify(layoutConfig));
  } catch (e) {}
  activeLayout = layoutConfig;
}

"""

v4 = v4[:pos_target] + new_layout_core + v4[pos_target_end:]
print("Core layout variables updated")

# 2. Update Modal JS (ensure no duplicate declarations)
pos_modal_js_start = v4.find('// ==================== 仪表盘布局配置与编辑器 Dialog 交互逻辑 ====================')
if pos_modal_js_start == -1:
    pos_modal_js_start = v4.find('// ==================== 面板布局编辑器 Dialog 交互逻辑 (Section 13) ====================')
pos_modal_js_end = v4.find('// ==================== DOM 构建与版本管理 ====================')

new_modal_js = f"""// ==================== 仪表盘布局配置与编辑器 Dialog 交互逻辑 ====================
let draftLayoutMode = 'auto';
let draftCustomLeft = ['prop1', 'g', 'thr', 'none'];
let draftCustomRight = ['thrust', 'mach', 'q', 'cd', 'none'];

const CUSTOM_OPTIONS_LEFT = [
  {{ val: 'prop1', zh: '一级推进', en: 'S1 Propellant' }},
  {{ val: 'g',     zh: '过载', en: 'G-Load' }},
  {{ val: 'thr',   zh: '节流深度', en: 'Throttle Depth' }},
  {{ val: 'q',     zh: '动压', en: 'Dyn. Pressure Q' }},
  {{ val: 'heat',  zh: '气动热流', en: 'Heat Flux' }},
  {{ val: 'brk',   zh: '制动余量', en: 'Brake Margin' }},
  {{ val: 'mach',  zh: '马赫', en: 'Mach Number' }},
  {{ val: 'mass',  zh: '质量', en: 'Stage Mass' }},
  {{ val: 'cd',    zh: '阻力', en: 'Drag Coeff' }},
  {{ val: 'none',  zh: '(无)', en: '(None)' }}
];

const CUSTOM_OPTIONS_RIGHT = [
  {{ val: 'thrust', zh: '推力', en: 'Total Thrust' }},
  {{ val: 'mach',   zh: '马赫', en: 'Mach Number' }},
  {{ val: 'q',      zh: '动压 Q', en: 'Dyn. Pressure Q' }},
  {{ val: 'cd',     zh: '阻力 CD', en: 'Drag Coeff CD' }},
  {{ val: 'heat',   zh: '气动热流', en: 'Heat Flux' }},
  {{ val: 'att',    zh: '姿态角', en: 'Pitch Angle' }},
  {{ val: 'brk',    zh: '制动余量', en: 'Brake Margin' }},
  {{ val: 'margin', zh: '最紧裕度', en: 'Tightest Margin' }},
  {{ val: 'mass',   zh: '质量', en: 'Stage Mass' }},
  {{ val: 'g',      zh: '过载', en: 'G-Load' }},
  {{ val: 'none',   zh: '(无)', en: '(None)' }}
];

const LAYOUT_PRESETS = {{
  default: {{
    name: '默认预设',
    nameEn: 'Default',
    left: ['prop1', 'g', 'thr', 'none'],
    right: ['thrust', 'mach', 'q', 'cd', 'none']
  }},
  launch: {{
    name: '发射专注',
    nameEn: 'Launch Focus',
    left: ['prop1', 'g', 'thr', 'q'],
    right: ['thrust', 'mach', 'q', 'cd', 'heat']
  }},
  recovery: {{
    name: '回收专注',
    nameEn: 'Recovery Focus',
    left: ['prop1', 'brk', 'g', 'thr'],
    right: ['thrust', 'mach', 'att', 'margin', 'brk']
  }},
  thermal: {{
    name: '结构热学',
    nameEn: 'Aero & Thermal',
    left: ['prop1', 'q', 'heat', 'cd'],
    right: ['mach', 'q', 'heat', 'g', 'margin']
  }}
}};

function openLayoutDialog() {{
  if (variant === 'public') {{
    setVariantAndMode('engineering', 'compact');
  }}
  const overlay = $('layoutModalOverlay');
  if (!overlay) return;

  wasRunningBeforeDialog = run;
  run = false;

  draftLayoutMode = layoutConfig.mode || 'auto';
  draftCustomLeft = Array.isArray(layoutConfig.left) ? [...layoutConfig.left] : ['prop1', 'g', 'thr', 'none'];
  draftCustomRight = Array.isArray(layoutConfig.right) ? [...layoutConfig.right] : ['thrust', 'mach', 'q', 'cd', 'none'];

  overlay.style.display = 'flex';
  renderLayoutDialog();
  initLayoutDialogInteractions();
}}

function closeLayoutDialog(cancelled) {{
  const overlay = $('layoutModalOverlay');
  if (overlay) overlay.style.display = 'none';
  if (wasRunningBeforeDialog && !fin && !ab) {{
    run = true;
  }}
  draw();
}}

function renderLayoutDialog() {{
  const btnAuto = $('btnLeModeAuto');
  const btnCustom = $('btnLeModeCustom');
  const autoPanel = $('leAutoPanel');
  const customPanel = $('leCustomPanel');

  const isAuto = draftLayoutMode === 'auto';
  if (btnAuto) btnAuto.classList.toggle('active', isAuto);
  if (btnCustom) btnCustom.classList.toggle('active', !isAuto);
  if (autoPanel) autoPanel.style.display = isAuto ? 'block' : 'none';
  if (customPanel) customPanel.style.display = isAuto ? 'none' : 'block';

  // 渲染左侧下拉框
  const leftSelects = document.querySelectorAll('.slot-select-l');
  leftSelects.forEach((sel, idx) => {{
    sel.innerHTML = CUSTOM_OPTIONS_LEFT.map(opt => `<option value="${{opt.val}}" ${{draftCustomLeft[idx] === opt.val ? 'selected' : ''}}>${{L(opt.zh, opt.en)}}</option>`).join('');
    sel.onchange = (e) => {{
      draftCustomLeft[idx] = e.target.value;
      updatePresetButtonsState();
    }};
  }});

  // 渲染右侧下拉框
  const rightSelects = document.querySelectorAll('.slot-select-r');
  rightSelects.forEach((sel, idx) => {{
    sel.innerHTML = CUSTOM_OPTIONS_RIGHT.map(opt => `<option value="${{opt.val}}" ${{draftCustomRight[idx] === opt.val ? 'selected' : ''}}>${{L(opt.zh, opt.en)}}</option>`).join('');
    sel.onchange = (e) => {{
      draftCustomRight[idx] = e.target.value;
      updatePresetButtonsState();
    }};
  }});

  // 预设按钮事件绑定
  document.querySelectorAll('.le-preset-btn').forEach(btn => {{
    const pKey = btn.dataset.p;
    btn.onclick = () => applyDraftPreset(pKey);
  }});
  updatePresetButtonsState();
}}

function applyDraftPreset(pKey) {{
  const preset = LAYOUT_PRESETS[pKey];
  if (!preset) return;
  draftCustomLeft = [...preset.left];
  draftCustomRight = [...preset.right];
  renderLayoutDialog();
}}

function updatePresetButtonsState() {{
  document.querySelectorAll('.le-preset-btn').forEach(btn => {{
    const pKey = btn.dataset.p;
    const p = LAYOUT_PRESETS[pKey];
    if (p) {{
      const match = draftCustomLeft.every((w, i) => w === p.left[i]) && draftCustomRight.every((w, i) => w === p.right[i]);
      btn.classList.toggle('active', match);
    }}
  }});
}}

function applyDraftLayout() {{
  layoutConfig.mode = draftLayoutMode;
  layoutConfig.left = [...draftCustomLeft];
  layoutConfig.right = [...draftCustomRight];
  saveLayoutConfig();

  initDashboardDOM();
  closeLayoutDialog(false);
  draw();
}}

function initLayoutDialogInteractions() {{
  const bLayoutTop = $('bLayoutTop');
  if (bLayoutTop) bLayoutTop.onclick = () => openLayoutDialog();

  const btnAuto = $('btnLeModeAuto');
  if (btnAuto) btnAuto.onclick = () => {{
    draftLayoutMode = 'auto';
    renderLayoutDialog();
  }};

  const btnCustom = $('btnLeModeCustom');
  if (btnCustom) btnCustom.onclick = () => {{
    draftLayoutMode = 'custom';
    renderLayoutDialog();
  }};

  const btnClose = $('btnLayoutClose');
  if (btnClose) btnClose.onclick = () => closeLayoutDialog(true);

  const btnCancel = $('btnLayoutCancel');
  if (btnCancel) btnCancel.onclick = () => closeLayoutDialog(true);

  const btnApply = $('btnLayoutApply');
  if (btnApply) btnApply.onclick = () => applyDraftLayout();
}}

function openPubSettingsDialog() {{
  const overlay = $('pubSettingsOverlay');
  if (overlay) overlay.style.display = 'flex';
  renderPubSettingsDialog();
}}

function closePubSettingsDialog() {{
  const overlay = $('pubSettingsOverlay');
  if (overlay) overlay.style.display = 'none';
}}

// ==================== 自定义模式卡片渲染与数值刷新 ====================
function renderCustomCardInnerHtml(wId) {{
  let title = '';
  if (wId === 'prop1') title = L('一级推进', 'S1 PROP');
  else if (wId === 'g') title = L('过载', 'G-LOAD');
  else if (wId === 'thr') title = L('节流深度', 'THROTTLE');
  else if (wId === 'q') title = L('动压 Q', 'DYN. Q');
  else if (wId === 'heat') title = L('气动热流', 'HEAT FLUX');
  else if (wId === 'brk') title = L('制动余量', 'BRAKE MARGIN');
  else if (wId === 'mach') title = L('马赫', 'MACH');
  else if (wId === 'mass') title = L('质量', 'STAGE MASS');
  else if (wId === 'cd') title = L('阻力 CD', 'DRAG CD');
  else if (wId === 'thrust') title = L('总推力', 'THRUST');
  else if (wId === 'att') title = L('姿态俯仰', 'PITCH');
  else if (wId === 'margin') title = L('最紧裕度', 'TIGHTEST MARGIN');

  return `
    <div class="ctx-title">${{title}}</div>
    <div class="ctx-val">—</div>
    <div class="ctx-bar"><div class="ctx-bar-fill" style="width:0%"></div></div>
    <div class="ctx-sub">—</div>`;
}}

function buildCustomSlotsHtml(zone) {{
  const slots = zone === 'L' ? layoutConfig.left : layoutConfig.right;
  let html = '';
  slots.forEach((wId, idx) => {{
    if (wId && wId !== 'none') {{
      html += `<div class="dash-card ctx-mod" id="card-cust-${{zone.toLowerCase()}}-${{idx}}" data-w="${{wId}}">
        ${{renderCustomCardInnerHtml(wId)}}
      </div>`;
    }}
  }});
  return html;
}}

function updateCustomWidgetCard(cardEl, wId, s, curT, tightest) {{
  const valEl = cardEl.querySelector('.ctx-val');
  const barEl = cardEl.querySelector('.ctx-bar-fill');
  const subEl = cardEl.querySelector('.ctx-sub');
  if (!valEl || !barEl || !subEl) return;

  if (wId === 'prop1') {{
    valEl.innerHTML = `${{s.pr.toFixed(1)}}<small>%</small>`;
    barEl.style.width = `${{Math.min(100, Math.max(0, s.pr)).toFixed(1)}}%`;
    barEl.style.background = s.pr < 10 ? 'var(--cr)' : s.pr < 22 ? 'var(--wn)' : 'var(--ac)';
    const need = curT < 395 ? 22 : 2 + 12 * (s.alt / 3000);
    const marginT = (s.pr - need) * 5.2;
    subEl.textContent = `${{L('余量', 'Margin')}} ${{(marginT >= 0 ? '+' : '')}}${{marginT.toFixed(1)}} t`;
    subEl.style.color = marginT < 0 ? 'var(--cr)' : marginT < 5 ? 'var(--wn)' : 'var(--t2)';
  }} else if (wId === 'g') {{
    valEl.innerHTML = `${{s.nG.toFixed(1)}}<small> G</small>`;
    barEl.style.width = `${{Math.min(100, Math.max(0, (s.nG / 6) * 100)).toFixed(1)}}%`;
    barEl.style.background = s.nG > 5.5 ? 'var(--cr)' : s.nG > 4.5 ? 'var(--wn)' : 'var(--ac)';
    subEl.textContent = s.nG > 5.5 ? L('载荷超限', 'LIMIT EXCEEDED') : s.nG > 4.5 ? L('高载荷区', 'HIGH LOAD') : '0–6 G';
    subEl.style.color = s.nG > 5.5 ? 'var(--cr)' : s.nG > 4.5 ? 'var(--wn)' : 'var(--t2)';
  }} else if (wId === 'thr') {{
    valEl.innerHTML = `−${{Math.round(s.depth)}}<small>%</small>`;
    barEl.style.width = `${{Math.min(100, (s.depth / 30) * 100).toFixed(1)}}%`;
    barEl.style.background = 'var(--ac)';
    subEl.textContent = s.depth > 20 ? L('深节流控速', 'DEEP THROTTLE') : L('全推力工况', 'FULL POWER');
    subEl.style.color = 'var(--t2)';
  }} else if (wId === 'q') {{
    valEl.innerHTML = `${{s.q.toFixed(1)}}<small> kPa</small>`;
    barEl.style.width = `${{Math.min(100, (s.q / 30) * 100).toFixed(1)}}%`;
    const isQPeak = curT >= 64 && curT < 92;
    barEl.style.background = isQPeak ? 'var(--wn)' : 'var(--ac)';
    subEl.textContent = isQPeak ? L('Max-Q 峰值', 'MAX-Q PEAK') : L('动压载荷', 'DYNAMIC LOAD');
    subEl.style.color = isQPeak ? 'var(--wn)' : 'var(--t2)';
  }} else if (wId === 'heat') {{
    const h = s.heat || 0;
    valEl.innerHTML = `${{h.toFixed(1)}}<small> MW/m²</small>`;
    barEl.style.width = `${{Math.min(100, (h / 2.5) * 100).toFixed(1)}}%`;
    barEl.style.background = h > 2.0 ? 'var(--cr)' : h > 1.2 ? 'var(--wn)' : 'var(--ac)';
    subEl.textContent = h > 1.2 ? L('高温防热保护', 'TPS ACTIVE') : L('热环境正常', 'NOMINAL');
    subEl.style.color = h > 2.0 ? 'var(--cr)' : h > 1.2 ? 'var(--wn)' : 'var(--t2)';
  }} else if (wId === 'brk') {{
    const bm = s.brakeMargin !== undefined ? s.brakeMargin : 0;
    valEl.innerHTML = `${{bm > 0 ? bm.toFixed(1) : '—'}}<small> s</small>`;
    barEl.style.width = `${{Math.min(100, Math.max(0, (bm / 15) * 100)).toFixed(1)}}%`;
    barEl.style.background = bm < 3 ? 'var(--cr)' : bm < 6 ? 'var(--wn)' : 'var(--ac)';
    subEl.textContent = curT >= 330 ? L('点火窗口裕度', 'BURN MARGIN') : L('回收制动余量', 'BRAKE MARGIN');
    subEl.style.color = bm < 3 ? 'var(--cr)' : bm < 6 ? 'var(--wn)' : 'var(--t2)';
  }} else if (wId === 'mach') {{
    valEl.innerHTML = `${{s.M.toFixed(2)}}`;
    barEl.style.width = `${{Math.min(100, (s.M / 5.5) * 100).toFixed(1)}}%`;
    barEl.style.background = s.M >= 1.0 ? 'var(--ac)' : 'rgba(255,255,255,0.4)';
    subEl.textContent = s.M >= 1.0 ? L('超音速飞行', 'SUPERSONIC') : L('亚音速飞行', 'SUBSONIC');
    subEl.style.color = 'var(--t2)';
  }} else if (wId === 'mass') {{
    const mVal = Math.round(s.mass || s.m || 0);
    valEl.innerHTML = `${{mVal}}<small> t</small>`;
    barEl.style.width = `${{Math.min(100, (mVal / 550) * 100).toFixed(1)}}%`;
    barEl.style.background = 'var(--ac)';
    subEl.textContent = curT < 156 ? L('一级持续消耗', 'S1 BURNING') : L('当前飞行质量', 'FLIGHT MASS');
    subEl.style.color = 'var(--t2)';
  }} else if (wId === 'cd') {{
    const isTrans = Math.abs(s.M - 1.1) < 0.28;
    valEl.innerHTML = `${{s.Cd.toFixed(2)}}${{isTrans ? ' ▲' : ''}}`;
    barEl.style.width = `${{Math.min(100, (s.Cd / 0.85) * 100).toFixed(1)}}%`;
    barEl.style.background = isTrans ? 'var(--wn)' : 'var(--ac)';
    subEl.textContent = isTrans ? L('跨音速峰', 'TRANSONIC') : L('气动阻力', 'DRAG');
    subEl.style.color = isTrans ? 'var(--wn)' : 'var(--t2)';
  }} else if (wId === 'thrust') {{
    valEl.innerHTML = `${{Math.round(s.kN).toLocaleString()}}<small> kN</small>`;
    barEl.style.width = `${{Math.min(100, (s.kN / 7607) * 100).toFixed(1)}}%`;
    barEl.style.background = 'var(--ac)';
    subEl.textContent = `${{s.activeEngines}} / ${{s.plannedEngines}} ${{L('在线', 'ACTIVE')}}`;
    subEl.style.color = 'var(--t2)';
  }} else if (wId === 'att') {{
    const p = s.pitch !== undefined ? s.pitch : 0;
    valEl.innerHTML = `${{p.toFixed(1)}}<small>°</small>`;
    barEl.style.width = `${{Math.min(100, Math.max(0, ((p + 90) / 180) * 100)).toFixed(1)}}%`;
    barEl.style.background = 'var(--ac)';
    subEl.textContent = curT < 150 ? L('重力转弯俯仰', 'GRAVITY TURN') : L('俯仰姿态角', 'PITCH ANGLE');
    subEl.style.color = 'var(--t2)';
  }} else if (wId === 'margin') {{
    valEl.innerHTML = tightest ? `${{tightest.v}}` : '+2.4σ';
    barEl.style.width = '75%';
    barEl.style.background = tightest && tightest.s === 2 ? 'var(--cr)' : tightest && tightest.s === 1 ? 'var(--wn)' : 'var(--ac)';
    subEl.textContent = tightest ? `${{L(tightest.z, tightest.e)}}` : L('最紧裕度', 'TIGHTEST');
    subEl.style.color = tightest && tightest.s === 2 ? 'var(--cr)' : tightest && tightest.s === 1 ? 'var(--wn)' : 'var(--t2)';
  }}
}}

// ==================== 恢复的经典 V3 动态小部件与右区渲染 ====================
{v3_widgets}
"""

v4 = v4[:pos_modal_js_start] + new_modal_js + v4[pos_modal_js_end:]
print("Modal JS section replaced")

with open('AETHER-9 飞行控制台 v4.html', 'w', encoding='utf-8') as f:
    f.write(v4)

print("Saved intermediate v4 file, length:", len(v4))
