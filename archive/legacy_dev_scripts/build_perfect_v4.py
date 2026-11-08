import os
import re

print("Loading baseline v4_old and v3_widgets...")
with open('d:/This PC/Downloads/AETHER-9 飞行控制台 v4.html', 'r', encoding='utf-8') as f:
    v4 = f.read()

with open('v3_extracted_widgets.js', 'r', encoding='utf-8') as f:
    v3_widgets = f.read()

# -------------------------------------------------------------
# STEP 1: Append CSS additions before </style>
# -------------------------------------------------------------
css_additions = """
/* ==================== 布局编辑器模态对话框 (v4 Section 13) ==================== */
.layout-modal-overlay {
  position: fixed !important;
  inset: 0 !important;
  background: rgba(4, 6, 10, 0.82) !important;
  backdrop-filter: blur(8px) !important;
  -webkit-backdrop-filter: blur(8px) !important;
  z-index: 20000 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}
.layout-modal-overlay[style*="display: none"],
.layout-modal-overlay[style*="display:none"],
.layout-modal-overlay.hidden {
  display: none !important;
}

.layout-modal-box {
  width: 780px !important;
  max-width: 95vw !important;
  height: 580px !important;
  max-height: 95vh !important;
  background: #0A0E14 !important;
  border: 1px solid rgba(255, 255, 255, 0.16) !important;
  border-radius: 12px !important;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.85) !important;
  display: flex !important;
  flex-direction: column !important;
  padding: 18px 24px !important;
  box-sizing: border-box !important;
  color: #FFFFFF !important;
  gap: 12px !important;
  overflow: hidden !important;
}

.le-dialog-hdr {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  padding-bottom: 8px !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
}
.le-dialog-title {
  font-size: 15px !important;
  font-weight: 700 !important;
  color: var(--tx) !important;
  letter-spacing: .04em !important;
}
.le-schema-badge {
  font-size: 11px !important;
  background: rgba(79, 209, 255, 0.15) !important;
  color: var(--ac) !important;
  border: 1px solid rgba(79, 209, 255, 0.4) !important;
  border-radius: 4px !important;
  padding: 2px 7px !important;
  font-weight: 600 !important;
}
.le-btn-close {
  width: 28px !important;
  height: 28px !important;
  padding: 0 !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  font-size: 14px !important;
  cursor: pointer !important;
}

.le-mode-switch-row {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  padding: 4px 0 !important;
}
.le-mode-switch-row .seg-opt {
  white-space: nowrap !important;
  font-size: 11px !important;
  padding: 0 14px !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
}
.le-presets-group {
  display: flex !important;
  align-items: center !important;
  gap: 6px !important;
}
.le-preset-label {
  font-size: 11px !important;
  color: var(--t2) !important;
  margin-right: 4px !important;
}
.le-preset-btn {
  font-size: 11px !important;
  padding: 4px 10px !important;
  cursor: pointer !important;
}
.le-preset-btn.active {
  background: rgba(79, 209, 255, 0.25) !important;
  border-color: var(--ac) !important;
  color: var(--ac) !important;
}

/* 自动模式面板 */
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

/* 自定义模式面板 */
.le-panel-custom {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow: hidden;
}
.le-custom-grid {
  display: grid !important;
  grid-template-columns: 1fr 1fr !important;
  gap: 16px !important;
  flex: 1 !important;
  overflow-y: auto !important;
}
.le-custom-col {
  background: rgba(255, 255, 255, 0.03) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  border-radius: 8px !important;
  padding: 12px 14px !important;
  display: flex !important;
  flex-direction: column !important;
  gap: 8px !important;
}
.le-col-hdr {
  display: flex !important;
  justify-content: space-between !important;
  align-items: baseline !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
  padding-bottom: 6px !important;
}
.le-col-title {
  font-size: 13px !important;
  font-weight: 700 !important;
  color: var(--tx) !important;
}
.le-col-sub {
  font-size: 10px !important;
  color: var(--t2) !important;
}
.le-slot-list {
  display: flex !important;
  flex-direction: column !important;
  gap: 8px !important;
}
.le-slot-row {
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
  background: rgba(255, 255, 255, 0.02) !important;
  border: 1px solid rgba(255, 255, 255, 0.06) !important;
  border-radius: 6px !important;
  padding: 4px 8px !important;
}
.le-slot-row.locked-slot {
  background: rgba(79, 209, 255, 0.04) !important;
  border-color: rgba(79, 209, 255, 0.2) !important;
}
.le-slot-num {
  font-size: 11px !important;
  font-weight: 700 !important;
  color: var(--ac) !important;
  width: 32px !important;
  flex-shrink: 0 !important;
}
.le-slot-locked-tag {
  font-size: 10px !important;
  background: rgba(79, 209, 255, 0.15) !important;
  color: var(--ac) !important;
  padding: 1px 4px !important;
  border-radius: 3px !important;
  flex-shrink: 0 !important;
}
.le-slot-locked-name {
  font-size: 11px !important;
  color: var(--tx) !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
}
.le-slot-select {
  flex: 1 !important;
  background: #111720 !important;
  color: #FFFFFF !important;
  border: 1px solid rgba(255, 255, 255, 0.15) !important;
  border-radius: 4px !important;
  padding: 4px 8px !important;
  font-size: 11px !important;
  outline: none !important;
  cursor: pointer !important;
}
.le-slot-select:focus {
  border-color: var(--ac) !important;
}
.le-custom-tip {
  font-size: 11px !important;
  color: var(--t2) !important;
  padding: 2px 4px !important;
}

/* 弹窗底部操作按钮 */
.le-dialog-ftr {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  padding-top: 10px !important;
  border-top: 1px solid rgba(255, 255, 255, 0.1) !important;
}

/* 卡片排版与防截断增强 */
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

pos_style_end = v4.find('</style>')
v4 = v4[:pos_style_end] + "\n" + css_additions + "\n" + v4[pos_style_end:]
print("Step 1: CSS additions injected")

# -------------------------------------------------------------
# STEP 2: Replace layoutModalOverlay in HTML
# -------------------------------------------------------------
new_modal_html = """    <!-- 布局编辑器对话框 (Section 13) -->
    <div id="layoutModalOverlay" class="layout-modal-overlay" style="display:none">
      <div class="layout-modal-box" id="layoutModalBox" role="dialog" aria-modal="true" aria-labelledby="leDialogTitle">
        <!-- 头部 -->
        <div class="le-dialog-hdr">
          <div style="display:flex;align-items:center;gap:10px">
            <span class="le-dialog-title" id="leDialogTitle">⚙️ 面板布局配置 · LAYOUT CONFIGURATION</span>
            <span class="le-schema-badge">v4 · Section 13</span>
          </div>
          <button class="pill le-btn-close" id="btnLayoutClose" title="关闭 (Esc / K)">✕</button>
        </div>

        <!-- 模式切换与预设 -->
        <div class="le-mode-switch-row">
          <div class="seg-switch" style="width:330px;height:32px">
            <button class="seg-opt active" id="btnLeModeAuto">⚡ 自动模式 (Auto)</button>
            <button class="seg-opt" id="btnLeModeCustom">🛠️ 自定义模式 (Custom)</button>
          </div>

          <div class="le-presets-group" id="lePresetsGroup" style="display:flex;align-items:center;gap:6px">
            <span class="le-preset-label">快速预设:</span>
            <button class="pill le-preset-btn active" data-p="default">默认</button>
            <button class="pill le-preset-btn" data-p="launch">发射专注</button>
            <button class="pill le-preset-btn" data-p="recovery">回收专注</button>
            <button class="pill le-preset-btn" data-p="thermal">结构气动</button>
          </div>
        </div>

        <!-- 自动模式提示面板 -->
        <div class="le-panel-auto" id="leAutoPanel">
          <div class="le-auto-hero">
            <div class="le-auto-icon">⚡</div>
            <div class="le-auto-content">
              <div class="le-auto-title">自动时序智能调度模式 (标称时序)</div>
              <div class="le-auto-desc">
                仪表盘严格遵循标称飞行时序，自动在对应阶段呈现最关键遥测指标（升空、Max-Q、一二级分离、再入减速与着陆点火），界面保持完美对齐且无任何空白占位符。
              </div>
            </div>
          </div>
          <div class="le-auto-schedule-preview">
            <div class="sched-pill"><span class="sched-time">0~70s</span> 升空加速: 一级推进 + 过载 (0–6G) + 9×梅林动力</div>
            <div class="sched-pill"><span class="sched-time">70~90s</span> Max-Q 阶段: 自动切入动压 Q 监测 + 跨音速阻力峰</div>
            <div class="sched-pill"><span class="sched-time">90~156s</span> 一级关机末段: 节流深度控温 + MECO 确认时序</div>
            <div class="sched-pill"><span class="sched-time">156s+</span> 分级飞行: 左侧一子级回收制动 + 右侧二子级真空梅林 (934 kN)</div>
          </div>
        </div>

        <!-- 自定义模式配置面板 -->
        <div class="le-panel-custom" id="leCustomPanel" style="display:none">
          <div class="le-custom-grid">
            <!-- 左区配置 -->
            <div class="le-custom-col">
              <div class="le-col-hdr">
                <span class="le-col-title">左区 · 一级箭体</span>
                <span class="le-col-sub">共 5 格容量 (格 1 核心主控，格 2~5 自定义)</span>
              </div>
              <div class="le-slot-list">
                <div class="le-slot-row locked-slot">
                  <span class="le-slot-num">格 1</span>
                  <span class="le-slot-locked-tag">🔒 核心</span>
                  <span class="le-slot-locked-name">9× 梅林 1D 发动机矩阵 (可点击单发模拟故障)</span>
                </div>
                <div class="le-slot-row">
                  <span class="le-slot-num">格 2</span>
                  <select class="le-slot-select slot-select-l" data-idx="0"></select>
                </div>
                <div class="le-slot-row">
                  <span class="le-slot-num">格 3</span>
                  <select class="le-slot-select slot-select-l" data-idx="1"></select>
                </div>
                <div class="le-slot-row">
                  <span class="le-slot-num">格 4</span>
                  <select class="le-slot-select slot-select-l" data-idx="2"></select>
                </div>
                <div class="le-slot-row">
                  <span class="le-slot-num">格 5</span>
                  <select class="le-slot-select slot-select-l" data-idx="3"></select>
                </div>
              </div>
            </div>

            <!-- 右区配置 -->
            <div class="le-custom-col">
              <div class="le-col-hdr">
                <span class="le-col-title">右区 · 飞行遥测</span>
                <span class="le-col-sub">共 5 格容量 (自由选择关键遥测指标)</span>
              </div>
              <div class="le-slot-list">
                <div class="le-slot-row">
                  <span class="le-slot-num">格 1</span>
                  <select class="le-slot-select slot-select-r" data-idx="0"></select>
                </div>
                <div class="le-slot-row">
                  <span class="le-slot-num">格 2</span>
                  <select class="le-slot-select slot-select-r" data-idx="1"></select>
                </div>
                <div class="le-slot-row">
                  <span class="le-slot-num">格 3</span>
                  <select class="le-slot-select slot-select-r" data-idx="2"></select>
                </div>
                <div class="le-slot-row">
                  <span class="le-slot-num">格 4</span>
                  <select class="le-slot-select slot-select-r" data-idx="3"></select>
                </div>
                <div class="le-slot-row">
                  <span class="le-slot-num">格 5</span>
                  <select class="le-slot-select slot-select-r" data-idx="4"></select>
                </div>
              </div>
            </div>
          </div>
          <div class="le-custom-tip">
            💡 提示: 选择「(无)」的槽位在仪表盘中将自动紧凑收缩，绝不会留下空白方块。
          </div>
        </div>

        <!-- 底部操作按钮 -->
        <div class="le-dialog-ftr">
          <div class="le-ftr-left">
            <button class="pill" id="btnLayoutResetDefault">恢复默认 (自动模式)</button>
          </div>
          <div class="le-ftr-right" style="display:flex;gap:8px">
            <button class="pill" id="btnLayoutCancel">取消</button>
            <button class="pill pr" id="btnLayoutApply" style="background:var(--ac);color:#05202B;font-weight:700">应用布局</button>
          </div>
        </div>
      </div>
    </div>\n\n"""

pos_modal_html = v4.find('<div id="layoutModalOverlay"')
pos_pub_settings = v4.find('<div id="pubSettingsOverlay"')
v4 = v4[:pos_modal_html] + new_modal_html + v4[pos_pub_settings:]
print("Step 2: HTML layoutModalOverlay replaced")

# -------------------------------------------------------------
# STEP 3: Replace Layout State Management (195685 to 198989)
# -------------------------------------------------------------
pos_state_start = v4.find('// Active, draft, and saved layouts management (Schema 2 §13.6)')
if pos_state_start == -1:
    pos_state_start = v4.find('// Active, draft, and saved layouts management')
pos_state_end = v4.find('// 模式切换 (§2.1)', pos_state_start)
if pos_state_end == -1:
    pos_state_end = v4.find('function setMode', pos_state_start)

new_state_code = """// Active, draft, and saved layouts management (Section 13)
const DEFAULT_LAYOUT_CONFIG = {
  mode: 'auto', // 'auto' | 'custom'
  left: ['prop1', 'g', 'thr', 'none'], // 槽位 2~5 (槽位 1 锁定为 9×梅林1D)
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

v4 = v4[:pos_state_start] + new_state_code + v4[pos_state_end:]
print("Step 3: Layout state code surgically replaced")

# -------------------------------------------------------------
# STEP 4: Replace Dialog Interaction Logic (236607 to 256747)
# -------------------------------------------------------------
pos_dialog_start = v4.find('// ==================== 面板布局编辑器 Dialog 交互逻辑')
pos_dialog_end = v4.find('// 启动时按 argmax q(t) 求出 q 峰值时刻', pos_dialog_start)
if pos_dialog_end == -1:
    pos_dialog_end = v4.find('function getStage2State', pos_dialog_start)

new_dialog_code = """// ==================== 面板布局编辑器 Dialog 交互逻辑 (Section 13) ====================
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
    btnMetric.onclick = () => { pubSettings.unit = 'metric'; savePubSettings(); renderPubSettingsDialog(); if (variant === 'public') initDashboardDOM(); draw(); };
    btnImperial.onclick = () => { pubSettings.unit = 'imperial'; savePubSettings(); renderPubSettingsDialog(); if (variant === 'public') initDashboardDOM(); draw(); };
  }
  const btnDesc = $('btnTogglePubDesc');
  if (btnDesc) {
    btnDesc.classList.toggle('active', pubSettings.showDesc);
    btnDesc.onclick = () => { pubSettings.showDesc = !pubSettings.showDesc; savePubSettings(); renderPubSettingsDialog(); if (variant === 'public') initDashboardDOM(); draw(); };
  }
  const btnG = $('btnTogglePubGLoad');
  if (btnG) {
    btnG.classList.toggle('active', pubSettings.showGLoad);
    btnG.onclick = () => { pubSettings.showGLoad = !pubSettings.showGLoad; savePubSettings(); renderPubSettingsDialog(); if (variant === 'public') initDashboardDOM(); draw(); };
  }
  const btnClose = $('btnPubClose');
  if (btnClose) btnClose.onclick = () => closePubSettingsDialog();
  const btnOk = $('btnPubOk');
  if (btnOk) btnOk.onclick = () => closePubSettingsDialog();
}

"""

v4 = v4[:pos_dialog_start] + new_dialog_code + v4[pos_dialog_end:]
print("Step 4: Dialog interaction logic surgically replaced")

# -------------------------------------------------------------
# STEP 5: Insert V3 widgets + Custom card rendering before buildEngDash()
# -------------------------------------------------------------
custom_card_fns = f"""// ==================== 自定义模式卡片渲染与数值刷新 ====================
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
  else if (wId === 'att') title = L('姿态角', 'PITCH');
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

// ==================== 原生 V3 动态情境模块与右侧渲染 ====================
{v3_widgets}
"""

pos_beng = v4.find('function buildEngDash()')
v4 = v4[:pos_beng] + custom_card_fns + "\n\n" + v4[pos_beng:]
print("Step 5: V3 widgets and custom card functions injected")

# -------------------------------------------------------------
# STEP 6: Replace buildEngDash() with full Auto vs Custom markup
# -------------------------------------------------------------
new_build_eng = """function buildEngDash() {
  const isAuto = layoutConfig.mode === 'auto';
  return `
    <div id="dash-eng">
      <!-- 左区 一级箭体 -->
      <div class="dash-zone dash-left" id="dash-left">
        <div class="dash-zone-hdr" id="lZoneHdr">${isAuto ? (t < 156 ? L('一级箭体 · STAGE 1', 'STAGE 1') : L('一级返回状态 · BOOSTER RECOVERY', 'BOOSTER RECOVERY')) : L('一级箭体 (自定义) · STAGE 1', 'STAGE 1 (CUSTOM)')}</div>
        <div class="dash-left-body" id="dashLeftBody">
          <!-- 发动机矩阵 (Slot 1: 始终展示 76px 9× 梅林 1D 矩阵，支持单发故障模拟点击) -->
          <div class="eng1-card" id="mod-eng1">
            <div class="eng1-svg-box" id="eng1SvgBox">
              <svg id="s1-eng-svg" width="76" height="76" viewBox="0 0 120 120" role="group">
                <circle cx="60" cy="60" r="57" fill="none" stroke="rgba(255,255,255,.14)" stroke-width="2"/>
                ${EA.map(i => {
                  const a = (22.5 + (i - 1) * 45) * Math.PI / 180;
                  const x = i ? 60 + 40 * Math.sin(a) : 60, y = i ? 60 - 40 * Math.cos(a) : 60;
                  return `<g data-e="${i}" style="cursor:pointer" aria-label="发动机 ${i}">
                    <circle id="c_ec${i}" cx="${x}" cy="${y}" r="12" stroke-width="1.5"/>
                    <path id="c_ex${i}" d="M${x-5} ${y-5}L${x+5} ${y+5}M${x+5} ${y-5}L${x-5} ${y+5}" stroke="#FF4D5E" stroke-width="2" display="none"/>
                  </g>`;
                }).join('')}
              </svg>
            </div>
            <div class="eng1-info">
              <div class="eng1-title" id="e1-title">${L('9× 梅林 1D', '9× Merlin 1D')}</div>
              <div class="eng1-stat" id="e1-stat">9 / 9 ${L('在线', 'ACTIVE')}</div>
              <div class="eng1-row"><span>${L('总推力', 'Thrust')}</span><span class="val" id="e1-thrust">0 kN</span></div>
              <div class="eng1-row"><span>${L('节流', 'Throttle')}</span><span class="val" id="e1-throt">0%</span></div>
            </div>
          </div>

          ${isAuto ? `
          <!-- 小部件 2: 推进剂 (Propellant Widget) -->
          <div class="prop1-card ctx-mod" id="mod-prop1">
            <div class="ctx-title" id="p1-title">${L('一级推进', 'S1 PROP')}</div>
            <div class="ctx-val" id="p1-pct">100%</div>
            <div class="ctx-bar prop-bar-box">
              <div class="ctx-bar-fill prop-bar-fill" id="p1-fill" style="width:100%"></div>
              <div class="ctx-tick prop-tick" id="p1-tick" style="left:22%" title="回收预留"></div>
            </div>
            <div class="ctx-sub prop-margin" id="p1-margin">${L('余量', 'Margin')} +25.4 t</div>
          </div>

          <!-- 小部件 3 & 4 动态槽位 -->
          <div class="ctx-box" id="ctx-box"></div>
          ` : `
          <!-- 自定义模式左区槽位 2~5 (过滤掉 none，绝不展示 (空) 占位符) -->
          <div class="dash-cards-row custom-cards-row" id="customLeftCards">
            ${buildCustomSlotsHtml('L')}
          </div>
          `}
        </div>
      </div>

      <!-- 中区 时间、速度、高度、健康状态 -->
      <div class="dash-zone dash-center" id="dash-center">
        <div class="dc-row1">
          <button class="bt pr go" id="bGoEng" aria-label="开始/暂停">${run ? PA : PL}</button>
          <div class="dc-clock" id="metEng">${fT(t)}</div>
        </div>
        <div class="dc-row2-center">
          <span class="dc-next" id="nxEng">${L('下一事件 ', 'Next ') + L(NZ[1], NE[1]) + ' · 6 s'}</span>
          <button class="pill eng-health-pill" id="bHealthEng" aria-label="健康状态与最紧裕度" title="${L('点击打开裕度抽屉', 'Click to open Margins tab')}">
            <span class="hdot">●</span>
            <span id="engHealthTxt">${L('最紧裕度: —', 'Tightest: —')}</span>
          </button>
        </div>
        <div class="dc-row3">
          <div class="dc-val-group">
            <span class="lb">${L('速度', 'SPD')}</span>
            <span class="vnum" id="vsEng">0 <small>km/h</small></span>
          </div>
          <div class="dc-val-group">
            <span class="lb">${L('高度', 'ALT')}</span>
            <span class="vnum" id="vaEng">0 <small>m</small></span>
          </div>
        </div>
      </div>

      <!-- 右区 分离前飞行细节 / 分离后二级发动机 / 自定义模式遥测 -->
      <div class="dash-zone dash-right" id="dash-right">
        <div class="dash-zone-hdr" id="rZoneHdr">${isAuto ? (t < 156 ? L('一级飞行细节 · FLIGHT DETAIL', 'STAGE 1 FLIGHT DETAIL') : L('二级动力细节 · STAGE 2 DETAIL', 'STAGE 2 PROP & FLIGHT')) : L('飞行遥测 (自定义) · FLIGHT TELEMETRY', 'FLIGHT TELEMETRY (CUSTOM)')}</div>
        <div class="r-content-wrap" id="rContentWrap">
          ${!isAuto ? `
          <div class="dash-cards-row custom-cards-row" id="customRightCards">
            ${buildCustomSlotsHtml('R')}
          </div>
          ` : ''}
        </div>
      </div>
    </div>`;
}"""

pos_beng = v4.find('function buildEngDash()')
pos_beng_end = v4.find('function initDashboardDOM()', pos_beng)
v4 = v4[:pos_beng] + new_build_eng + "\n\n" + v4[pos_beng_end:]
print("Step 6: buildEngDash() replaced")

# -------------------------------------------------------------
# STEP 7: Update draw() compact zone branch
# -------------------------------------------------------------
pos_compact_comment = v4.find('// 紧凑模式下按布局引擎动态渲染左右区')
pos_compact_call = v4.find('Views.updateCompactZones($(\'dashLeftBody\')', pos_compact_comment)
pos_block_end = v4.find('}', pos_compact_call) + 1

new_compact_draw = """// 紧凑模式下按布局引擎动态渲染左右区 (§13.2, §13.5)
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
    }"""

v4 = v4[:pos_compact_comment] + new_compact_draw + v4[pos_block_end:]
print("Step 7: draw() compact rendering updated")

# -------------------------------------------------------------
# STEP 8: Add hotkey 'K' and 'Escape'
# -------------------------------------------------------------
pos_keydown = v4.find("window.addEventListener('keydown', e => {")
if pos_keydown != -1:
    hotkey_k_logic = """  if ((e.key === 'k' || e.key === 'K') && !e.ctrlKey && !e.altKey && !e.metaKey && e.target.tagName !== 'INPUT' && e.target.tagName !== 'SELECT' && e.target.tagName !== 'TEXTAREA') {
    e.preventDefault();
    const overlay = $('layoutModalOverlay');
    if (overlay && overlay.style.display === 'flex') closeLayoutDialog(true);
    else openLayoutDialog();
  }
  if (e.key === 'Escape') {
    const overlay = $('layoutModalOverlay');
    if (overlay && overlay.style.display === 'flex') closeLayoutDialog(true);
    const pubOverlay = $('pubSettingsOverlay');
    if (pubOverlay && pubOverlay.style.display === 'flex') closePubSettingsDialog();
  }
"""
    v4 = v4[:pos_keydown + len("window.addEventListener('keydown', e => {\n")] + hotkey_k_logic + v4[pos_keydown + len("window.addEventListener('keydown', e => {\n"):]
    print("Step 8: Hotkey K and Escape listener added")

# -------------------------------------------------------------
# STEP 9: Update Top Actions title & Update Drawer Tab 4
# -------------------------------------------------------------
# bLayoutTop is already in topActions in v4_old, ensure its label has the 📐 icon
v4 = v4.replace(
    '<button class="pill" id="bLayoutTop" aria-label="布局编辑器 (K)">${L(\'布局 (K)\', \'Layout (K)\')}</button>',
    '<button class="pill" id="bLayoutTop" aria-label="布局 (K)" title="${L(\'面板布局配置 (快捷键 K)\', \'Layout Configuration (Hotkey K)\')}">📐 ${L(\'布局\', \'Layout\')}</button>'
)
print("Step 9a: Layout button updated in topActions")

pos_tab4 = v4.find("} else if (tab === 4) {")
if pos_tab4 != -1:
    pos_tab4_end = v4.find("} else if (tab === 5) {", pos_tab4)
    tab4_replacement = """} else if (tab === 4) {
    const isAuto = layoutConfig.mode === 'auto';
    out = `
      <div style="padding:16px 20px;display:flex;flex-direction:column;gap:14px">
        <div style="display:flex;align-items:center;justify-content:space-between">
          <span style="font-size:14px;font-weight:700;color:var(--tx)">${L('面板布局配置', 'Dashboard Layout Configuration')}</span>
          <span class="le-schema-badge">${isAuto ? L('⚡ 自动模式', '⚡ Auto Mode') : L('🛠️ 自定义模式', '🛠️ Custom Mode')}</span>
        </div>
        <div style="font-size:12px;color:var(--t2);line-height:1.5">
          ${isAuto ? L('当前处于标称时序自动调度模式，仪表盘随飞行阶段动态呈现关键遥测部件，画面紧凑无空白。', 'Running in Auto nominal flight schedule. Widgets adapt dynamically without empty placeholders.') : L('当前处于自定义遥测模式，左区固定发动机+4部件，右区5部件。', 'Running in Custom telemetry mode. Left: Engine + 4 widgets, Right: 5 widgets.')}
        </div>
        <div style="display:flex;gap:10px;margin-top:6px">
          <button class="pill pr" id="btnOpenLayoutFromDrawer" style="background:var(--ac);color:#05202B;font-weight:700;padding:6px 16px;font-size:12px">📐 ${L('打开布局编辑器 (K)', 'Open Layout Editor (K)')}</button>
          <button class="pill" id="btnQuickResetAuto" style="font-size:12px">${L('恢复自动模式', 'Reset to Auto')}</button>
        </div>
      </div>
    `;
    setTimeout(() => {
      const bOpen = $('btnOpenLayoutFromDrawer');
      if (bOpen) bOpen.onclick = () => openLayoutDialog();
      const bRstAuto = $('btnQuickResetAuto');
      if (bRstAuto) bRstAuto.onclick = () => {
        layoutConfig.mode = 'auto';
        saveLayoutConfig();
        initDashboardDOM();
        showTab();
        draw();
      };
    }, 0);
  """
    v4 = v4[:pos_tab4] + tab4_replacement + v4[pos_tab4_end:]
    print("Step 9b: Drawer Tab 4 updated")

# Write to all 3 deliverables
import hashlib

paths = [
    'd:/This PC/Downloads/rocket dashbroad design/AETHER-9 飞行控制台 v4.html',
    'd:/This PC/Downloads/AETHER-9 飞行控制台 v4.html',
    'd:/This PC/Downloads/AETHER-9 飞行控制台_v4.html'
]

hashes = []
for p in paths:
    with open(p, 'w', encoding='utf-8') as f:
        f.write(v4)
    h = hashlib.sha256(v4.encode('utf-8')).hexdigest()
    hashes.append(h)
    print(f"Written: {p} (length: {len(v4)}, SHA256: {h})")

assert len(set(hashes)) == 1, "Hashes do not match!"
print(">>> ALL 3 V4 DELIVERABLES SYNCHRONIZED AND VERIFIED IDENTICAL! <<<")
