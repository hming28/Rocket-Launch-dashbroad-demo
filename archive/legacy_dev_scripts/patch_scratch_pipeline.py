import os
import re

print("Patching scratch pipeline files...")

# ============================================================
# 1. Update src/styles.js
# ============================================================
with open('C:/Users/user/.gemini/antigravity/scratch/src/styles.js', 'r', encoding='utf-8') as f:
    st = f.read()

# Add extra CSS for the 2-mode modal and custom cards
css_modal_clean = """
/* 自动模式与自定义模式面板 */
.le-panel-auto {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px 0;
}
.le-auto-hero {
  display: flex;
  gap: 14px;
  align-items: flex-start;
  background: rgba(79, 209, 255, 0.06);
  border: 1px solid rgba(79, 209, 255, 0.25);
  border-radius: 8px;
  padding: 16px 20px;
}
.le-auto-icon {
  font-size: 28px;
  line-height: 1;
}
.le-auto-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--ac);
  margin-bottom: 6px;
}
.le-auto-desc {
  font-size: 12px;
  line-height: 1.6;
  color: var(--t2);
}
.le-auto-schedule-preview {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.sched-pill {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 6px;
  padding: 10px 12px;
  font-size: 11px;
  color: var(--tx);
  line-height: 1.4;
}
.sched-time {
  display: inline-block;
  background: rgba(255, 255, 255, 0.12);
  color: var(--ac);
  font-weight: 700;
  font-size: 10px;
  padding: 1px 5px;
  border-radius: 4px;
  margin-right: 6px;
}

.le-panel-custom {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow: hidden;
}
.le-custom-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  flex: 1;
  overflow-y: auto;
}
.le-custom-col {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.le-col-hdr {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding-bottom: 6px;
}
.le-col-title {
  font-size: 13px;
  font-weight: 700;
  color: var(--tx);
}
.le-col-sub {
  font-size: 10px;
  color: var(--t2);
}
.le-slot-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.le-slot-row {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 6px;
  padding: 4px 8px;
}
.le-slot-row.locked-slot {
  background: rgba(79, 209, 255, 0.04);
  border-color: rgba(79, 209, 255, 0.2);
}
.le-slot-num {
  font-size: 11px;
  font-weight: 700;
  color: var(--ac);
  width: 32px;
  flex-shrink: 0;
}
.le-slot-locked-tag {
  font-size: 10px;
  background: rgba(79, 209, 255, 0.15);
  color: var(--ac);
  padding: 1px 4px;
  border-radius: 3px;
  flex-shrink: 0;
}
.le-slot-locked-name {
  font-size: 11px;
  color: var(--tx);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.le-slot-select {
  flex: 1;
  background: #111720;
  color: #FFFFFF;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 11px;
  outline: none;
  cursor: pointer;
}
.le-slot-select:focus {
  border-color: var(--ac);
}
.le-custom-tip {
  font-size: 11px;
  color: var(--t2);
  padding: 2px 4px;
}
.le-mode-switch-row .seg-opt {
  white-space: nowrap !important;
  font-size: 11px !important;
  padding: 0 14px !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
}

/* 自定义卡片排版防截断 */
.custom-cards-row {
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
  width: 100% !important;
  height: 76px !important;
  overflow: visible !important;
}
.dash-card {
  min-width: 104px !important;
  flex: 1 1 auto !important;
  overflow: visible !important;
}
.dash-card .card-val, .dash-card .ctx-val {
  font-size: 18px !important;
  font-weight: 700 !important;
  white-space: nowrap !important;
  overflow: visible !important;
  text-overflow: clip !important;
}
.dash-card .card-val small, .dash-card .ctx-val small {
  font-size: 11px !important;
  font-weight: 500 !important;
  color: var(--t2) !important;
  margin-left: 2px !important;
}
"""

if '.le-auto-hero' not in st:
    pos_end_quote = st.rfind('`')
    st = st[:pos_end_quote] + "\n" + css_modal_clean + "\n`"
    with open('C:/Users/user/.gemini/antigravity/scratch/src/styles.js', 'w', encoding='utf-8') as f:
        f.write(st)
    print("src/styles.js updated")

# ============================================================
# 2. Update src/shell_editor.js
# ============================================================
with open('C:/Users/user/.gemini/antigravity/scratch/src/shell_editor.js', 'r', encoding='utf-8') as f:
    se = f.read()

# Update DEFAULT_LAYOUT_CONFIG at the top
p_layout_start = se.find('// Active, draft, and saved layouts management (Schema 2 §13.6)')
p_layout_end = se.find('// 模式切换 (§2.1)', p_layout_start)

se_top_replacement = """// Active, draft, and saved layouts management (Section 13)
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

let pubSettings = {
  unit: 'metric', // 'metric' or 'imperial'
  showDesc: true,
  showGLoad: false
};

function loadPubSettings() {
  try {
    const raw = localStorage.getItem('aether.pub.settings');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed) {
        pubSettings.unit = parsed.unit === 'imperial' ? 'imperial' : 'metric';
        pubSettings.showDesc = parsed.showDesc !== false;
        pubSettings.showGLoad = parsed.showGLoad === true;
      }
    }
  } catch (e) {}
}

function savePubSettings() {
  try {
    localStorage.setItem('aether.pub.settings', JSON.stringify(pubSettings));
  } catch (e) {}
}
"""

se = se[:p_layout_start] + se_top_replacement + "\n" + se[p_layout_end:]

# Update Dialog interaction logic
p_diag_start = se.find('// ==================== 面板布局编辑器 Dialog 交互逻辑 (Section 13) ====================')
p_diag_end = se.rfind('`;')

se_dialog_replacement = """// ==================== 面板布局编辑器 Dialog 交互逻辑 (Section 13) ====================
let draftLayoutMode = 'auto';
let draftCustomLeft = ['prop1', 'g', 'thr', 'none'];
let draftCustomRight = ['thrust', 'mach', 'q', 'cd', 'none'];

const CUSTOM_OPTIONS_LEFT = [
  { val: 'prop1', zh: '一级推进', en: 'S1 Propellant' },
  { val: 'g',     zh: '过载', en: 'G-Load' },
  { val: 'thr',   zh: '节流深度', en: 'Throttle Depth' },
  { val: 'q',     zh: '动压 Q', en: 'Dyn. Pressure Q' },
  { val: 'heat',  zh: '气动热流', en: 'Heat Flux' },
  { val: 'brk',   zh: '制动余量', en: 'Brake Margin' },
  { val: 'mach',  zh: '马赫', en: 'Mach Number' },
  { val: 'mass',  zh: '质量', en: 'Stage Mass' },
  { val: 'cd',    zh: '阻力 CD', en: 'Drag Coeff' },
  { val: 'none',  zh: '(无)', en: '(None)' }
];

const CUSTOM_OPTIONS_RIGHT = [
  { val: 'thrust', zh: '总推力', en: 'Total Thrust' },
  { val: 'mach',   zh: '马赫', en: 'Mach Number' },
  { val: 'q',      zh: '动压 Q', en: 'Dyn. Pressure Q' },
  { val: 'cd',     zh: '阻力 CD', en: 'Drag Coeff CD' },
  { val: 'heat',   zh: '气动热流', en: 'Heat Flux' },
  { val: 'att',    zh: '姿态角', en: 'Pitch Angle' },
  { val: 'brk',    zh: '制动余量', en: 'Brake Margin' },
  { val: 'margin', zh: '最紧裕度', en: 'Tightest Margin' },
  { val: 'mass',   zh: '质量', en: 'Stage Mass' },
  { val: 'g',      zh: '过载', en: 'G-Load' },
  { val: 'none',   zh: '(无)', en: '(None)' }
];

const LAYOUT_PRESETS = {
  default: {
    name: '默认预设',
    nameEn: 'Default',
    left: ['prop1', 'g', 'thr', 'none'],
    right: ['thrust', 'mach', 'q', 'cd', 'none']
  },
  launch: {
    name: '发射专注',
    nameEn: 'Launch Focus',
    left: ['prop1', 'g', 'thr', 'q'],
    right: ['thrust', 'mach', 'q', 'cd', 'heat']
  },
  recovery: {
    name: '回收专注',
    nameEn: 'Recovery Focus',
    left: ['prop1', 'brk', 'g', 'thr'],
    right: ['thrust', 'mach', 'att', 'margin', 'brk']
  },
  thermal: {
    name: '结构气动',
    nameEn: 'Aero & Thermal',
    left: ['prop1', 'q', 'heat', 'cd'],
    right: ['mach', 'q', 'heat', 'g', 'margin']
  }
};

function openLayoutDialog() {
  if (variant === 'public') {
    setVariantAndMode('engineering', 'compact');
  }
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
}

function closeLayoutDialog(cancelled) {
  const overlay = $('layoutModalOverlay');
  if (overlay) overlay.style.display = 'none';
  if (wasRunningBeforeDialog && !fin && !ab) {
    run = true;
  }
  draw();
}

function renderLayoutDialog() {
  const btnAuto = $('btnLeModeAuto');
  const btnCustom = $('btnLeModeCustom');
  const autoPanel = $('leAutoPanel');
  const customPanel = $('leCustomPanel');

  const isAuto = draftLayoutMode === 'auto';
  if (btnAuto) btnAuto.classList.toggle('active', isAuto);
  if (btnCustom) btnCustom.classList.toggle('active', !isAuto);
  if (autoPanel) autoPanel.style.display = isAuto ? 'flex' : 'none';
  if (customPanel) customPanel.style.display = isAuto ? 'none' : 'flex';

  // 渲染左侧下拉框
  const leftSelects = document.querySelectorAll('.slot-select-l');
  leftSelects.forEach((sel, idx) => {
    sel.innerHTML = CUSTOM_OPTIONS_LEFT.map(opt => `<option value="${opt.val}" ${draftCustomLeft[idx] === opt.val ? 'selected' : ''}>${L(opt.zh, opt.en)}</option>`).join('');
    sel.onchange = (e) => {
      draftCustomLeft[idx] = e.target.value;
      updatePresetButtonsState();
    };
  });

  // 渲染右侧下拉框
  const rightSelects = document.querySelectorAll('.slot-select-r');
  rightSelects.forEach((sel, idx) => {
    sel.innerHTML = CUSTOM_OPTIONS_RIGHT.map(opt => `<option value="${opt.val}" ${draftCustomRight[idx] === opt.val ? 'selected' : ''}>${L(opt.zh, opt.en)}</option>`).join('');
    sel.onchange = (e) => {
      draftCustomRight[idx] = e.target.value;
      updatePresetButtonsState();
    };
  });

  // 预设按钮事件绑定
  document.querySelectorAll('.le-preset-btn').forEach(btn => {
    const pKey = btn.dataset.p;
    btn.onclick = () => applyDraftPreset(pKey);
  });
  updatePresetButtonsState();
}

function applyDraftPreset(pKey) {
  if (pKey === 'default') {
    draftLayoutMode = 'auto';
    draftCustomLeft = ['prop1', 'g', 'thr', 'none'];
    draftCustomRight = ['thrust', 'mach', 'q', 'cd', 'none'];
  } else {
    draftLayoutMode = 'custom';
    const preset = LAYOUT_PRESETS[pKey];
    if (preset) {
      draftCustomLeft = [...preset.left];
      draftCustomRight = [...preset.right];
    }
  }
  renderLayoutDialog();
}

function updatePresetButtonsState() {
  document.querySelectorAll('.le-preset-btn').forEach(btn => {
    const pKey = btn.dataset.p;
    if (pKey === 'default') {
      btn.classList.toggle('active', draftLayoutMode === 'auto');
    } else {
      const p = LAYOUT_PRESETS[pKey];
      if (p) {
        const match = draftLayoutMode === 'custom' && draftCustomLeft.every((w, i) => w === p.left[i]) && draftCustomRight.every((w, i) => w === p.right[i]);
        btn.classList.toggle('active', match);
      }
    }
  });
}

function applyDraftLayout() {
  layoutConfig.mode = draftLayoutMode;
  layoutConfig.left = [...draftCustomLeft];
  layoutConfig.right = [...draftCustomRight];
  saveLayoutConfig();

  initDashboardDOM();
  closeLayoutDialog(false);
  draw();
}

function initLayoutDialogInteractions() {
  const bLayoutTop = $('bLayoutTop');
  if (bLayoutTop) bLayoutTop.onclick = () => openLayoutDialog();

  const btnAuto = $('btnLeModeAuto');
  if (btnAuto) btnAuto.onclick = () => {
    draftLayoutMode = 'auto';
    renderLayoutDialog();
  };

  const btnCustom = $('btnLeModeCustom');
  if (btnCustom) btnCustom.onclick = () => {
    draftLayoutMode = 'custom';
    renderLayoutDialog();
  };

  const btnClose = $('btnLayoutClose');
  if (btnClose) btnClose.onclick = () => closeLayoutDialog(true);

  const btnCancel = $('btnLayoutCancel');
  if (btnCancel) btnCancel.onclick = () => closeLayoutDialog(true);

  const btnApply = $('btnLayoutApply');
  if (btnApply) btnApply.onclick = () => applyDraftLayout();

  const btnResetDefault = $('btnLayoutResetDefault');
  if (btnResetDefault) btnResetDefault.onclick = () => {
    draftLayoutMode = 'auto';
    draftCustomLeft = ['prop1', 'g', 'thr', 'none'];
    draftCustomRight = ['thrust', 'mach', 'q', 'cd', 'none'];
    renderLayoutDialog();
  };

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
    if (variant === 'public') initDashboardDOM();
    draw();
  };

  const btnUnitImperial = $('btnUnitImperial');
  if (btnUnitImperial) btnUnitImperial.onclick = () => {
    pubSettings.unit = 'imperial';
    savePubSettings();
    renderPubSettingsDialog();
    if (variant === 'public') initDashboardDOM();
    draw();
  };

  const btnDesc = $('btnTogglePubDesc');
  if (btnDesc) btnDesc.onclick = () => {
    pubSettings.showDesc = !pubSettings.showDesc;
    savePubSettings();
    renderPubSettingsDialog();
    if (variant === 'public') initDashboardDOM();
    draw();
  };

  const btnG = $('btnTogglePubGLoad');
  if (btnG) btnG.onclick = () => {
    pubSettings.showGLoad = !pubSettings.showGLoad;
    savePubSettings();
    renderPubSettingsDialog();
    if (variant === 'public') initDashboardDOM();
    draw();
  };
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

function renderPubSettingsDialog() {
  const btnMetric = $('btnUnitMetric');
  const btnImperial = $('btnUnitImperial');
  if (btnMetric && btnImperial) {
    btnMetric.classList.toggle('active', pubSettings.unit === 'metric');
    btnImperial.classList.toggle('active', pubSettings.unit === 'imperial');
  }
  const btnDesc = $('btnTogglePubDesc');
  if (btnDesc) {
    btnDesc.classList.toggle('active', pubSettings.showDesc);
  }
  const btnG = $('btnTogglePubGLoad');
  if (btnG) {
    btnG.classList.toggle('active', pubSettings.showGLoad);
  }
  const btnClose = $('btnPubClose');
  if (btnClose) btnClose.onclick = () => closePubSettingsDialog();
  const btnOk = $('btnPubOk');
  if (btnOk) btnOk.onclick = () => closePubSettingsDialog();
}
"""

se = se[:p_diag_start] + se_dialog_replacement + "\n`"
with open('C:/Users/user/.gemini/antigravity/scratch/src/shell_editor.js', 'w', encoding='utf-8') as f:
    f.write(se)
print("src/shell_editor.js updated")

# ============================================================
# 3. Update generate_clean_v4.js
# ============================================================
with open('C:/Users/user/.gemini/antigravity/scratch/generate_clean_v4.js', 'r', encoding='utf-8') as f:
    gen = f.read()

# Update compact mode replace in draw()
pos_comp_find = gen.find('const compactModeReplace =')
pos_comp_find_end = gen.find('if (!baseHtml.includes(legacyModulesSearch))', pos_comp_find)

new_compact_replace = """const compactModeReplace = `    // 紧凑模式下按布局引擎动态渲染左右区 (§13.2, §13.5)
    if (variant === 'engineering' && mode === 'compact') {
      if (layoutConfig.mode === 'auto') {
        // 自动模式: 原生 V3 动态时序调度与完整卡片 (无 (空) 占位符)
        updateContextModules(s);
        updateRightZone(s);
      } else {
        // 自定义模式: 动态更新用户指定的各槽位遥测部件
        const tightest = mg(s, t).filter(m => m.v !== '—')[0];
        document.querySelectorAll('#customLeftCards .dash-card, #customRightCards .dash-card').forEach(card => {
          const wId = card.dataset.w;
          if (wId) updateCustomWidgetCard(card, wId, s, t, tightest);
        });
      }
    }`;"""

gen = gen[:pos_comp_find] + new_compact_replace + "\n\n" + gen[pos_comp_find_end:]

# Update engDashNew in generate_clean_v4.js
pos_eng_new_find = gen.find('const engDashNew =')
pos_eng_new_end = gen.find('baseHtml = baseHtml.slice(0, pEngDash1)', pos_eng_new_find)

new_eng_dash_code = """const customCardFns = `// ==================== 自定义模式卡片渲染与数值刷新 ====================
function renderCustomCardInnerHtml(wId) {
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
  else if (wId === 'att') title = L('姿态角', 'PITCH');
  else if (wId === 'margin') title = L('最紧裕度', 'TIGHTEST MARGIN');

  return \\`
    <div class="ctx-title">\\${title}</div>
    <div class="ctx-val">—</div>
    <div class="ctx-bar"><div class="ctx-bar-fill" style="width:0%"></div></div>
    <div class="ctx-sub">—</div>\\`;
}

function buildCustomSlotsHtml(zone) {
  const slots = zone === 'L' ? layoutConfig.left : layoutConfig.right;
  let html = '';
  slots.forEach((wId, idx) => {
    if (wId && wId !== 'none') {
      html += \\`<div class="dash-card ctx-mod" id="card-cust-\\${zone.toLowerCase()}-\\${idx}" data-w="\\${wId}">
        \\${renderCustomCardInnerHtml(wId)}
      </div>\\`;
    }
  });
  return html;
}

function updateCustomWidgetCard(cardEl, wId, s, curT, tightest) {
  const valEl = cardEl.querySelector('.ctx-val');
  const barEl = cardEl.querySelector('.ctx-bar-fill');
  const subEl = cardEl.querySelector('.ctx-sub');
  if (!valEl || !barEl || !subEl) return;

  if (wId === 'prop1') {
    valEl.innerHTML = \\`\\${s.pr.toFixed(1)}<small>%</small>\\`;
    barEl.style.width = \\`\\${Math.min(100, Math.max(0, s.pr)).toFixed(1)}%\\`;
    barEl.style.background = s.pr < 10 ? 'var(--cr)' : s.pr < 22 ? 'var(--wn)' : 'var(--ac)';
    const need = curT < 395 ? 22 : 2 + 12 * (s.alt / 3000);
    const marginT = (s.pr - need) * 5.2;
    subEl.textContent = \\`\\${L('余量', 'Margin')} \\${(marginT >= 0 ? '+' : '')}\\${marginT.toFixed(1)} t\\`;
    subEl.style.color = marginT < 0 ? 'var(--cr)' : marginT < 5 ? 'var(--wn)' : 'var(--t2)';
  } else if (wId === 'g') {
    valEl.innerHTML = \\`\\${s.nG.toFixed(1)}<small> G</small>\\`;
    barEl.style.width = \\`\\${Math.min(100, Math.max(0, (s.nG / 6) * 100)).toFixed(1)}%\\`;
    barEl.style.background = s.nG > 5.5 ? 'var(--cr)' : s.nG > 4.5 ? 'var(--wn)' : 'var(--ac)';
    subEl.textContent = s.nG > 5.5 ? L('载荷超限', 'LIMIT EXCEEDED') : s.nG > 4.5 ? L('高载荷区', 'HIGH LOAD') : '0–6 G';
    subEl.style.color = s.nG > 5.5 ? 'var(--cr)' : s.nG > 4.5 ? 'var(--wn)' : 'var(--t2)';
  } else if (wId === 'thr') {
    valEl.innerHTML = \\`−\\${Math.round(s.depth)}<small>%</small>\\`;
    barEl.style.width = \\`\\${Math.min(100, (s.depth / 30) * 100).toFixed(1)}%\\`;
    barEl.style.background = 'var(--ac)';
    subEl.textContent = s.depth > 20 ? L('深节流控速', 'DEEP THROTTLE') : L('全推力工况', 'FULL POWER');
    subEl.style.color = 'var(--t2)';
  } else if (wId === 'q') {
    valEl.innerHTML = \\`\\${s.q.toFixed(1)}<small> kPa</small>\\`;
    barEl.style.width = \\`\\${Math.min(100, (s.q / 30) * 100).toFixed(1)}%\\`;
    const isQPeak = curT >= 64 && curT < 92;
    barEl.style.background = isQPeak ? 'var(--wn)' : 'var(--ac)';
    subEl.textContent = isQPeak ? L('Max-Q 峰值', 'MAX-Q PEAK') : L('动压载荷', 'DYNAMIC LOAD');
    subEl.style.color = isQPeak ? 'var(--wn)' : 'var(--t2)';
  } else if (wId === 'heat') {
    const h = s.heat || 0;
    valEl.innerHTML = \\`\\${h.toFixed(1)}<small> MW/m²</small>\\`;
    barEl.style.width = \\`\\${Math.min(100, (h / 2.5) * 100).toFixed(1)}%\\`;
    barEl.style.background = h > 2.0 ? 'var(--cr)' : h > 1.2 ? 'var(--wn)' : 'var(--ac)';
    subEl.textContent = h > 1.2 ? L('高温防热保护', 'TPS ACTIVE') : L('热环境正常', 'NOMINAL');
    subEl.style.color = h > 2.0 ? 'var(--cr)' : h > 1.2 ? 'var(--wn)' : 'var(--t2)';
  } else if (wId === 'brk') {
    const bm = s.brakeMargin !== undefined ? s.brakeMargin : 0;
    valEl.innerHTML = \\`\\${bm > 0 ? bm.toFixed(1) : '—'}<small> s</small>\\`;
    barEl.style.width = \\`\\${Math.min(100, Math.max(0, (bm / 15) * 100)).toFixed(1)}%\\`;
    barEl.style.background = bm < 3 ? 'var(--cr)' : bm < 6 ? 'var(--wn)' : 'var(--ac)';
    subEl.textContent = curT >= 330 ? L('点火窗口裕度', 'BURN MARGIN') : L('回收制动余量', 'BRAKE MARGIN');
    subEl.style.color = bm < 3 ? 'var(--cr)' : bm < 6 ? 'var(--wn)' : 'var(--t2)';
  } else if (wId === 'mach') {
    valEl.innerHTML = \\`\\${s.M.toFixed(2)}\\`;
    barEl.style.width = \\`\\${Math.min(100, (s.M / 5.5) * 100).toFixed(1)}%\\`;
    barEl.style.background = s.M >= 1.0 ? 'var(--ac)' : 'rgba(255,255,255,0.4)';
    subEl.textContent = s.M >= 1.0 ? L('超音速飞行', 'SUPERSONIC') : L('亚音速飞行', 'SUBSONIC');
    subEl.style.color = 'var(--t2)';
  } else if (wId === 'mass') {
    const mVal = Math.round(s.mass || s.m || 0);
    valEl.innerHTML = \\`\\${mVal}<small> t</small>\\`;
    barEl.style.width = \\`\\${Math.min(100, (mVal / 550) * 100).toFixed(1)}%\\`;
    barEl.style.background = 'var(--ac)';
    subEl.textContent = curT < 156 ? L('一级持续消耗', 'S1 BURNING') : L('当前飞行质量', 'FLIGHT MASS');
    subEl.style.color = 'var(--t2)';
  } else if (wId === 'cd') {
    const isTrans = Math.abs(s.M - 1.1) < 0.28;
    valEl.innerHTML = \\`\\${s.Cd.toFixed(2)}\\${isTrans ? ' ▲' : ''}\\`;
    barEl.style.width = \\`\\${Math.min(100, (s.Cd / 0.85) * 100).toFixed(1)}%\\`;
    barEl.style.background = isTrans ? 'var(--wn)' : 'var(--ac)';
    subEl.textContent = isTrans ? L('跨音速峰', 'TRANSONIC') : L('气动阻力', 'DRAG');
    subEl.style.color = isTrans ? 'var(--wn)' : 'var(--t2)';
  } else if (wId === 'thrust') {
    valEl.innerHTML = \\`\\${Math.round(s.kN).toLocaleString()}<small> kN</small>\\`;
    barEl.style.width = \\`\\${Math.min(100, (s.kN / 7607) * 100).toFixed(1)}%\\`;
    barEl.style.background = 'var(--ac)';
    subEl.textContent = \\`\\${s.activeEngines} / \\${s.plannedEngines} \\${L('在线', 'ACTIVE')}\\`;
    subEl.style.color = 'var(--t2)';
  } else if (wId === 'att') {
    const p = s.pitch !== undefined ? s.pitch : 0;
    valEl.innerHTML = \\`\\${p.toFixed(1)}<small>°</small>\\`;
    barEl.style.width = \\`\\${Math.min(100, Math.max(0, ((p + 90) / 180) * 100)).toFixed(1)}%\\`;
    barEl.style.background = 'var(--ac)';
    subEl.textContent = curT < 150 ? L('重力转弯俯仰', 'GRAVITY TURN') : L('俯仰姿态角', 'PITCH ANGLE');
    subEl.style.color = 'var(--t2)';
  } else if (wId === 'margin') {
    valEl.innerHTML = tightest ? \\`\\${tightest.v}\\` : '+2.4σ';
    barEl.style.width = '75%';
    barEl.style.background = tightest && tightest.s === 2 ? 'var(--cr)' : tightest && tightest.s === 1 ? 'var(--wn)' : 'var(--ac)';
    subEl.textContent = tightest ? \\`\\${L(tightest.z, tightest.e)}\\` : L('最紧裕度', 'TIGHTEST');
    subEl.style.color = tightest && tightest.s === 2 ? 'var(--cr)' : tightest && tightest.s === 1 ? 'var(--wn)' : 'var(--t2)';
  }
}`;

const engDashNew = customCardFns + `\\n\\nfunction buildEngDash() {
  const isAuto = layoutConfig.mode === 'auto';
  return \\`
    <div id="dash-eng">
      <!-- 左区 一级箭体 -->
      <div class="dash-zone dash-left" id="dash-left">
        <div class="dash-zone-hdr" id="lZoneHdr">\\${isAuto ? (t < 156 ? L('一级箭体 · STAGE 1', 'STAGE 1') : L('一级返回状态 · BOOSTER RECOVERY', 'BOOSTER RECOVERY')) : L('一级箭体 (自定义) · STAGE 1', 'STAGE 1 (CUSTOM)')}</div>
        <div class="dash-left-body" id="dashLeftBody">
          <!-- 发动机矩阵 (Slot 1: 始终展示 76px 9× 梅林 1D 矩阵，支持单发故障模拟点击) -->
          <div class="eng1-card" id="mod-eng1">
            <div class="eng1-svg-box" id="eng1SvgBox">
              <svg id="s1-eng-svg" width="76" height="76" viewBox="0 0 120 120" role="group">
                <circle cx="60" cy="60" r="57" fill="none" stroke="rgba(255,255,255,.14)" stroke-width="2"/>
                \\${EA.map(i => {
                  const a = (22.5 + (i - 1) * 45) * Math.PI / 180;
                  const x = i ? 60 + 40 * Math.sin(a) : 60, y = i ? 60 - 40 * Math.cos(a) : 60;
                  return \\`<g data-e="\\${i}" style="cursor:pointer" aria-label="发动机 \\${i}">
                    <circle id="c_ec\\${i}" cx="\\${x}" cy="\\${y}" r="12" stroke-width="1.5"/>
                    <path id="c_ex\\${i}" d="M\\${x-5} \\${y-5}L\\${x+5} \\${y+5}M\\${x+5} \\${y-5}L\\${x-5} \\${y+5}" stroke="#FF4D5E" stroke-width="2" display="none"/>
                  </g>\\`;
                }).join('')}
              </svg>
            </div>
            <div class="eng1-info">
              <div class="eng1-title" id="e1-title">\\${L('9× 梅林 1D', '9× Merlin 1D')}</div>
              <div class="eng1-stat" id="e1-stat">9 / 9 \\${L('在线', 'ACTIVE')}</div>
              <div class="eng1-row"><span>\\${L('总推力', 'Thrust')}</span><span class="val" id="e1-thrust">0 kN</span></div>
              <div class="eng1-row"><span>\\${L('节流', 'Throttle')}</span><span class="val" id="e1-throt">0%</span></div>
            </div>
          </div>

          \\${isAuto ? \\`
          <!-- 小部件 2: 推进剂 (Propellant Widget) -->
          <div class="prop1-card ctx-mod" id="mod-prop1">
            <div class="ctx-title" id="p1-title">\\${L('一级推进', 'S1 PROP')}</div>
            <div class="ctx-val" id="p1-pct">100%</div>
            <div class="ctx-bar prop-bar-box">
              <div class="ctx-bar-fill prop-bar-fill" id="p1-fill" style="width:100%"></div>
              <div class="ctx-tick prop-tick" id="p1-tick" style="left:22%" title="回收预留"></div>
            </div>
            <div class="ctx-sub prop-margin" id="p1-margin">\\${L('余量', 'Margin')} +25.4 t</div>
          </div>

          <!-- 小部件 3 & 4 动态槽位 -->
          <div class="ctx-box" id="ctx-box"></div>
          \\` : \\`
          <!-- 自定义模式左区槽位 2~5 (过滤掉 none，绝不展示 (空) 占位符) -->
          <div class="dash-cards-row custom-cards-row" id="customLeftCards">
            \\${buildCustomSlotsHtml('L')}
          </div>
          \\`}
        </div>
      </div>

      <!-- 中区 时间、速度、高度、健康状态 -->
      <div class="dash-zone dash-center" id="dash-center">
        <div class="dc-row1">
          <button class="bt pr go" id="bGoEng" aria-label="开始/暂停">\\${run ? PA : PL}</button>
          <div class="dc-clock" id="metEng">\\${fT(t)}</div>
        </div>
        <div class="dc-row2-center">
          <span class="dc-next" id="nxEng">\\${L('下一事件 ', 'Next ') + L(NZ[1], NE[1]) + ' · 6 s'}</span>
          <button class="pill eng-health-pill" id="bHealthEng" aria-label="健康状态与最紧裕度" title="\\${L('点击打开裕度抽屉', 'Click to open Margins tab')}">
            <span class="hdot">●</span>
            <span id="engHealthTxt">\\${L('最紧裕度: —', 'Tightest: —')}</span>
          </button>
        </div>
        <div class="dc-row3">
          <div class="dc-val-group">
            <span class="lb">\\${L('速度', 'SPD')}</span>
            <span class="vnum" id="vsEng">0 <small>km/h</small></span>
          </div>
          <div class="dc-val-group">
            <span class="lb">\\${L('高度', 'ALT')}</span>
            <span class="vnum" id="vaEng">0 <small>m</small></span>
          </div>
        </div>
      </div>

      <!-- 右区 分离前飞行细节 / 分离后二级发动机 / 自定义模式遥测 -->
      <div class="dash-zone dash-right" id="dash-right">
        <div class="dash-zone-hdr" id="rZoneHdr">\\${isAuto ? (t < 156 ? L('一级飞行细节 · FLIGHT DETAIL', 'STAGE 1 FLIGHT DETAIL') : L('二级动力细节 · STAGE 2 DETAIL', 'STAGE 2 PROP & FLIGHT')) : L('飞行遥测 (自定义) · FLIGHT TELEMETRY', 'FLIGHT TELEMETRY (CUSTOM)')}</div>
        <div class="r-content-wrap" id="rContentWrap">
          \\${!isAuto ? \\`
          <div class="dash-cards-row custom-cards-row" id="customRightCards">
            \\${buildCustomSlotsHtml('R')}
          </div>
          \\` : ''}
        </div>
      </div>
    </div>\\`;
}`;"""

gen = gen[:pos_eng_new_find] + new_eng_dash_code + "\n\n" + gen[pos_eng_new_end:]

# Update Drawer Tab 4 in drawer_extensions
with open('C:/Users/user/.gemini/antigravity/scratch/generate_clean_v4.js', 'w', encoding='utf-8') as f:
    f.write(gen)
print("generate_clean_v4.js updated")
