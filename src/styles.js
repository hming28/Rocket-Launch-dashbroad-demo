// Additional CSS styles for AETHER-9 Mission Console
module.exports = `
/* ==================== 多视图任务控制台 (Mission Console) 样式 ==================== */
body.is-console #dash-panel,
body.is-console #minimap-wrap,
body.is-console #banner-wrap,
body.is-console #fl,
body.is-console #vd,
body.is-console #ph3d {
  display: none !important;
}

#console-wrap {
  display: none;
  position: fixed;
  inset: 0;
  top: 40px;
  overflow: hidden;
  flex-direction: column;
  background: var(--bg);
  z-index: 20;
}
body.is-console #console-wrap {
  display: flex !important;
}

body.is-console .sim-badge {
  background: rgba(255, 255, 255, 0.06) !important;
  color: var(--t2) !important;
  border-color: rgba(255, 255, 255, 0.18) !important;
}

/* 顶栏视图切换与模式切换 */
.c-top-group {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.c-mode-switch {
  display: inline-flex;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 8px;
  padding: 2px;
  height: 30px;
}
.c-view-tabs {
  display: inline-flex;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  padding: 2px;
  height: 30px;
  gap: 2px;
}
.c-tab-btn {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: .04em;
  padding: 0 9px;
  border: none;
  background: transparent;
  color: var(--t2);
  border-radius: 6px;
  transition: all .15s ease;
  cursor: pointer;
  white-space: nowrap;
}
.c-tab-btn:hover {
  color: var(--tx);
  background: rgba(255, 255, 255, 0.04);
}
.c-tab-btn.active {
  background: var(--ac) !important;
  color: #05202B !important;
  font-weight: 700;
}
.c-tab-btn.has-alarm {
  position: relative;
}
.c-tab-btn.has-alarm::after {
  content: '';
  position: absolute;
  top: 4px; right: 4px;
  width: 5px; height: 5px;
  border-radius: 50%;
  background: var(--wn);
}

/* 顶栏新鲜度指示器 */
#c-fresh-badge {
  font-size: 11px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: var(--tx);
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
#c-fresh-badge .dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: #FFFFFF;
}
#c-fresh-badge.live .dot {
  background: #FFFFFF;
}
#c-fresh-badge.paused {
  color: var(--t2);
}
#c-fresh-badge.paused .dot {
  background: var(--t2);
}
#c-fresh-badge.stale {
  background: rgba(255, 176, 32, 0.16) !important;
  border-color: var(--wn) !important;
  color: var(--wn) !important;
}
#c-fresh-badge.stale .dot {
  background: var(--wn) !important;
}

/* 状态条 (52px) */
#console-status-bar {
  height: 52px;
  padding: 0 20px;
  background: rgba(5, 7, 11, 0.88);
  border-bottom: 1px solid var(--ln);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  z-index: 25;
}
.c-status-left {
  display: flex;
  align-items: center;
  gap: 14px;
}
.c-met-clock {
  font-size: 24px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: #FFFFFF;
  letter-spacing: .02em;
}
.c-phase-chip {
  font-size: 12px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 5px;
  background: rgba(79, 209, 255, 0.12);
  border: 1px solid rgba(79, 209, 255, 0.35);
  color: var(--ac);
  letter-spacing: .04em;
}

.c-status-center {
  display: flex;
  align-items: center;
  gap: 12px;
}
.c-seat-list {
  display: flex;
  align-items: center;
  gap: 8px;
}
.c-seat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: .06em;
  color: var(--t2);
  padding: 2px 6px;
  border-radius: 4px;
  transition: all .2s;
  cursor: pointer;
}
.c-seat-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.4);
}
.c-seat-item.go .c-seat-dot {
  background: #FFFFFF;
}
.c-seat-item.nogo {
  color: var(--cr) !important;
  background: rgba(255, 77, 94, 0.12);
}
.c-seat-item.nogo .c-seat-dot {
  background: var(--cr) !important;
}
.c-seat-item.polling {
  color: var(--wn) !important;
  animation: seatPulse 0.4s ease infinite alternate;
}
@keyframes seatPulse {
  0% { opacity: 0.5; }
  100% { opacity: 1; }
}

.c-status-right {
  display: flex;
  align-items: center;
  gap: 10px;
}
.c-tight-pill {
  font-size: 11px;
  font-weight: 500;
  padding: 4px 10px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: var(--tx);
  display: flex;
  align-items: center;
  gap: 6px;
}
.c-alarm-pill {
  font-size: 11px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.14);
  color: var(--tx);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all .15s ease;
}
.c-alarm-pill:hover {
  background: rgba(255, 255, 255, 0.1);
}
.c-alarm-pill.has-crit {
  border-color: var(--cr) !important;
  background: rgba(255, 77, 94, 0.18) !important;
  color: var(--cr) !important;
}
.c-alarm-pill.has-warn {
  border-color: var(--wn) !important;
  background: rgba(255, 176, 32, 0.16) !important;
  color: var(--wn) !important;
}

/* P1 临界报警顶部横幅 */
#c-p1-banner {
  display: none;
  height: 34px;
  margin: 8px 14px 0;
  padding: 0 14px;
  background: rgba(255, 77, 94, 0.16);
  border: 1px solid var(--cr);
  border-radius: 6px;
  align-items: center;
  justify-content: space-between;
  color: var(--tx);
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
  z-index: 30;
}
#c-p1-banner.active {
  display: flex !important;
}
#c-p1-banner .btn-ack {
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 4px;
  background: var(--cr);
  border: none;
  color: #FFFFFF;
  cursor: pointer;
}

/* 控制台内容区 (12列网格) */
#console-content {
  flex: 1;
  position: relative;
  margin: 10px 14px 8px;
  overflow: hidden;
  box-sizing: border-box;
}
.c-view-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 12px;
  height: 100%;
  width: 100%;
  box-sizing: border-box;
  overflow-y: auto;
}

/* 面板通用样式 (ISA-101 规范) */
.c-panel {
  background: rgba(5, 7, 11, 0.78);
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  box-sizing: border-box;
  min-height: 0;
}
.c-panel-hdr {
  height: 28px;
  padding: 0 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.015);
}
.c-panel-title {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: .08em;
  text-transform: uppercase;
  color: var(--t2);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
}
.c-panel-title:hover {
  color: var(--tx);
}
.c-panel-acts {
  display: flex;
  align-items: center;
  gap: 4px;
}
.c-focus-btn {
  font-size: 12px;
  background: transparent;
  border: none;
  color: var(--t2);
  cursor: pointer;
  padding: 2px 4px;
  border-radius: 3px;
  transition: all .15s;
}
.c-focus-btn:hover {
  color: var(--tx);
  background: rgba(255, 255, 255, 0.08);
}
.c-panel-body {
  flex: 1;
  padding: 8px 10px;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
  min-height: 0;
}
.c-panel-fresh-dot {
  position: absolute;
  bottom: 4px; right: 4px;
  width: 4px; height: 4px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.25);
  pointer-events: none;
  transition: background .2s;
}
.c-panel.fresh .c-panel-fresh-dot {
  background: rgba(255, 255, 255, 0.85);
}
.c-panel.has-warn {
  border-color: rgba(255, 176, 32, 0.45);
}
.c-panel.has-warn .c-panel-hdr {
  border-top: 2px solid var(--wn);
}
.c-panel.has-crit {
  border-color: rgba(255, 77, 94, 0.55);
}
.c-panel.has-crit .c-panel-hdr {
  border-top: 2px solid var(--cr);
}

/* 底部操作与时间轴栏 (76px) */
#console-bottom-bar {
  height: 76px;
  padding: 0 20px;
  background: rgba(5, 7, 11, 0.92);
  border-top: 1px solid var(--ln);
  display: flex;
  align-items: center;
  gap: 16px;
  flex-shrink: 0;
  z-index: 25;
}
#bGoConsole {
  width: 44px; height: 44px;
  border-radius: 22px;
  min-width: 44px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--ac);
  border: 1px solid var(--ac);
  color: #05202B;
  cursor: pointer;
  flex-shrink: 0;
}
#bGoConsole:hover {
  background: #6fe0ff;
}
.c-bottom-tl-wrap {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
#bAbConsole {
  height: 52px;
  min-width: 72px;
  padding: 4px 12px;
  background: rgba(255, 77, 94, 0.06);
  border: 1px solid rgba(255, 77, 94, 0.55);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  flex-shrink: 0;
}
#bAbConsole .ab-main {
  font-size: 13px;
  font-weight: 700;
  color: var(--cr);
  letter-spacing: .08em;
}
#bAbConsole .ab-sub {
  font-size: 10px;
  color: var(--cr);
  margin-top: 2px;
}
#bAbConsole #abf-console {
  position: absolute;
  left: 0; top: 0; bottom: 0;
  width: 0%;
  background: rgba(255, 77, 94, 0.35);
  pointer-events: none;
}

/* 偏差徽标 (Deviation Badge) */
.c-dev-badge {
  font-size: 10px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  letter-spacing: .02em;
  color: var(--t2);
  display: inline-flex;
  align-items: center;
  gap: 2px;
}
.c-dev-badge.warn {
  color: var(--wn) !important;
}
.c-dev-badge.crit {
  color: var(--cr) !important;
}

/* AnalogBar 组件样式 */
.c-abar-box {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
}
.c-abar-val-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}
.c-abar-num {
  font-size: 16px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: #FFFFFF;
}
.c-abar-unit {
  font-size: 11px;
  color: var(--t2);
  font-weight: 400;
  margin-left: 2px;
}
.c-abar-track {
  height: 12px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 2px;
  position: relative;
  overflow: visible;
  width: 100%;
}
.c-abar-fill {
  height: 100%;
  background: #F4F7FA;
  border-radius: 2px;
  transition: width .15s ease;
}
.c-abar-fill.warn {
  background: var(--wn) !important;
}
.c-abar-fill.crit {
  background: var(--cr) !important;
}
.c-abar-nom-mark {
  position: absolute;
  top: -8px;
  width: 0; height: 0;
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-top: 6px solid #8A94A3;
  transform: translateX(-4px);
  pointer-events: none;
}
.c-abar-lim-warn {
  position: absolute;
  top: -2px; bottom: -2px;
  width: 2px;
  background: var(--wn);
  pointer-events: none;
}
.c-abar-lim-crit {
  position: absolute;
  top: -2px; bottom: -2px;
  width: 2px;
  background: var(--cr);
  pointer-events: none;
}
.c-abar-ticks {
  position: relative;
  height: 4px;
  width: 100%;
}
.c-abar-tick-mark {
  position: absolute;
  top: 0;
  width: 1px;
  height: 3px;
  background: rgba(255, 255, 255, 0.16);
}

/* 走廊图与趋势图 Canvas 容器 */
.c-chart-container {
  flex: 1;
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  min-height: 60px;
}
.c-chart-canvas {
  width: 100%;
  height: 100%;
  display: block;
}
.c-chart-meta {
  position: absolute;
  top: 4px; right: 8px;
  font-size: 11px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--tx);
  background: rgba(5, 7, 11, 0.65);
  padding: 2px 6px;
  border-radius: 4px;
  pointer-events: none;
}

/* 总览 B 行 12 格小部件条 (Tall Variant 104x150) */
.c-widget-strip {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 8px;
  width: 100%;
  height: 100%;
}
.c-tall-widget {
  height: 100%;
  min-height: 140px;
  padding: 6px 8px;
  background: rgba(255, 255, 255, 0.025);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-sizing: border-box;
  overflow: hidden;
  position: relative;
}
.c-tall-widget .w-hdr {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: .06em;
  color: var(--t2);
  line-height: 1;
}
.c-tall-widget .w-val-box {
  display: flex;
  align-items: baseline;
  line-height: 1;
  margin: 3px 0 2px;
}
.c-tall-widget .w-num {
  font-size: 20px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: #FFFFFF;
}
.c-tall-widget .w-unit {
  font-size: 10px;
  color: var(--t2);
  margin-left: 3px;
}
.c-tall-widget .w-spark {
  width: 100%;
  height: 22px;
}

/* 3D 视口组件 */
.c-vp3d-box {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  position: relative;
}
.c-vp3d-chips {
  position: absolute;
  top: 6px; left: 8px; right: 8px;
  display: flex;
  gap: 4px;
  z-index: 5;
  flex-wrap: wrap;
}
.c-vp-chip {
  font-size: 10px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
  background: rgba(5, 7, 11, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.18);
  color: var(--t2);
  cursor: pointer;
  transition: all .15s;
}
.c-vp-chip:hover {
  color: var(--tx);
  border-color: rgba(255, 255, 255, 0.35);
}
.c-vp-chip.active {
  background: var(--ac);
  border-color: var(--ac);
  color: #05202B;
}
.c-vp-chip.auto-active {
  border-color: var(--ac);
  color: var(--ac);
}
.c-vp3d-canvas {
  width: 100%;
  height: 100%;
  display: block;
}

/* 报警列表面板表格 */
.c-alarm-table-box {
  width: 100%;
  height: 100%;
  overflow-y: auto;
}
.c-alarm-tbl {
  width: 100%;
  border-collapse: collapse;
  font-size: 11px;
}
.c-alarm-tbl th {
  color: var(--t2);
  text-align: left;
  padding: 4px 6px;
  font-weight: 500;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}
.c-alarm-tbl td {
  padding: 5px 6px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.c-alarm-tbl tr.p1 {
  background: rgba(255, 77, 94, 0.08);
}
.c-alarm-tbl tr.p2 {
  background: rgba(255, 176, 32, 0.06);
}

/* GO/NO-GO 席位板 (Overview Row C) */
.c-gng-board {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
  width: 100%;
  height: 100%;
  align-content: start;
}
.c-gng-cell {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 6px;
  padding: 6px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.c-gng-seat {
  font-size: 10px;
  font-weight: 700;
  color: var(--t2);
}
.c-gng-status {
  font-size: 12px;
  font-weight: 700;
  color: #FFFFFF;
}
.c-gng-status.nogo {
  color: var(--cr) !important;
}

/* 部件页 L3 (Part Sheet) */
#c-part-sheet {
  position: fixed;
  top: 92px; bottom: 76px; right: 0;
  width: 420px;
  background: rgba(5, 7, 11, 0.96);
  border-left: 1px solid var(--ln);
  transform: translateX(105%);
  transition: transform .25s cubic-bezier(.16, 1, .3, 1);
  padding: 16px;
  overflow-y: auto;
  z-index: 40;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
#c-part-sheet.open {
  transform: translateX(0);
}
.c-sheet-hdr {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--ln);
  padding-bottom: 8px;
}

/* 聚焦模式与数据表 Modal */
#c-focus-modal {
  display: none;
  position: fixed;
  top: 92px; bottom: 76px; left: 14px; right: 14px;
  background: rgba(5, 7, 11, 0.98);
  border: 1px solid var(--ac);
  border-radius: 10px;
  z-index: 50;
  flex-direction: column;
  padding: 12px;
}
#c-focus-modal.active {
  display: flex !important;
}
.c-focus-tb {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding-bottom: 6px;
  border-bottom: 1px solid var(--ln);
}
.c-focus-data-tbl {
  width: 100%;
  height: 100%;
  overflow: auto;
  font-family: monospace;
  font-size: 11px;
}

/* 窄屏 (<1280px) 提示覆盖层 */
#c-narrow-notice {
  display: none;
  position: fixed;
  inset: 0;
  top: 40px;
  background: rgba(5, 7, 11, 0.95);
  z-index: 60;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 24px;
  text-align: center;
}
@media (max-width: 1279px) {
  body.is-console #c-narrow-notice {
    display: flex !important;
  }
}


/* ==================== 底部仪表盘现代卡片小部件与顶部 ABORT 样式 ==================== */
/* 区头部标签 (左区 一级箭体 · STAGE 1 / 右区 一级飞行细节 · FLIGHT DETAIL) */
.dash-zone-hdr, #lZoneHdr, #rZoneHdr {
  font-size: 11px !important;
  font-weight: 600 !important;
  letter-spacing: .08em !important;
  color: var(--t2, #8A99AD) !important;
  text-transform: uppercase !important;
  margin-top: 8px !important;
  margin-bottom: 8px !important;
  display: flex !important;
  align-items: center !important;
  gap: 6px !important;
  line-height: 1 !important;
  flex-shrink: 0 !important;
}
.dash-zone {
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  padding: 0 16px 8px 16px;
  box-sizing: border-box;
  overflow: hidden;
}
.dash-left-body, .r-content-wrap {
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
  width: 100% !important;
  height: 76px !important;
  min-width: 0 !important;
  flex: 0 0 76px !important;
}
.dash-cards-row {
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
  width: 100% !important;
  max-width: 500px !important;
  height: 76px !important;
}
.dash-card {
  flex: 1 1 0% !important;
  min-width: 95px !important;
  max-width: 124px !important;
  height: 76px !important;
  background: rgba(255, 255, 255, 0.035) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  border-radius: 8px !important;
  padding: 6px 8px !important;
  display: flex !important;
  flex-direction: column !important;
  justify-content: space-between !important;
  box-sizing: border-box !important;
  transition: border-color .2s ease, background .2s ease, box-shadow .2s ease;
  overflow: visible !important;
  position: relative !important;
}
.dash-card .card-lb, .dash-card .ctx-title {
  font-size: 10px !important;
  color: var(--t2, #8A99AD) !important;
  font-weight: 600 !important;
  letter-spacing: .04em !important;
  text-transform: uppercase !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  line-height: 1 !important;
}
.dash-card .card-val, .dash-card .ctx-val {
  font-size: 19px !important;
  font-weight: 700 !important;
  color: var(--tx, #FFFFFF) !important;
  font-variant-numeric: tabular-nums !important;
  line-height: 1.15 !important;
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
.dash-card .ctx-bar {
  height: 4px !important;
  background: rgba(255, 255, 255, 0.08) !important;
  border-radius: 2px !important;
  position: relative !important;
  overflow: visible !important;
  margin: 2px 0 !important;
}
.dash-card .ctx-bar-fill {
  height: 100% !important;
  background: var(--ac) !important;
  border-radius: 2px !important;
}
.dash-card .ctx-tick {
  position: absolute !important;
  width: 2px !important;
  height: 8px !important;
  top: -2px !important;
  border-radius: 1px !important;
}
.dash-card .card-sub, .dash-card .ctx-sub {
  font-size: 10px !important;
  color: var(--t3, #8A99AD) !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  line-height: 1 !important;
}
.dash-card.card-highlight-q, .dash-card.highlight-q {
  border-color: rgba(79, 209, 255, 0.6) !important;
  background: rgba(79, 209, 255, 0.08) !important;
  box-shadow: 0 0 12px rgba(79, 209, 255, 0.25) !important;
}

/* 顶部导航栏 ABORT 按钮 (长按 1 秒，防误触，ISA-101 警示色规范) */
.pill.pill-abort {
  position: relative;
  overflow: hidden;
  border-color: rgba(255, 77, 94, 0.55);
  background: rgba(255, 77, 94, 0.08);
  color: var(--cr, #FF4D5E);
  font-weight: 700;
  letter-spacing: .08em;
  padding: 0 14px;
  height: 28px;
  border-radius: 20px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  user-select: none;
  transition: border-color .2s ease, background .2s ease, box-shadow .2s ease;
  flex-shrink: 0;
}
.pill.pill-abort:hover:not(:disabled) {
  background: rgba(255, 77, 94, 0.16);
  border-color: rgba(255, 77, 94, 0.9);
  box-shadow: 0 0 10px rgba(255, 77, 94, 0.25);
}
.pill.pill-abort:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  filter: grayscale(0.5);
}
.pill.pill-abort #abf {
  position: absolute;
  left: 0; top: 0; bottom: 0;
  width: 0%;
  background: rgba(255, 77, 94, 0.4);
  pointer-events: none;
  z-index: 1;
}
.pill.pill-abort span {
  position: relative;
  z-index: 2;
  font-size: 11px;
}

/* ==================== 公众版仪表盘与防重叠样式 (Public Mode & Anti-Overlap) ==================== */
body.is-public #dash-panel {
  height: 148px !important;
}

#dash-pub {
  height: 84px;
  padding: 8px 24px 4px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-sizing: border-box;
}

.pub-row1 {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 52px;
}

/* 左区: 52px 播放/暂停圆钮 + 48px MET 时钟 + 下一步小字 */
.pub-zone-left {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 0 0 auto;
}

/* 确保播放/暂停按钮所有点（包含正中心 SVG 图标）均可 100% 触发点击响应，消除 SVG pointer-events 吞事件 */
.bt.go, #bGoPub, #bGoEng, #bGoConsole {
  cursor: pointer !important;
  user-select: none !important;
  -webkit-user-select: none !important;
}
.bt.go svg, .bt.go svg *,
#bGoPub svg, #bGoPub svg *,
#bGoEng svg, #bGoEng svg *,
#bGoConsole svg, #bGoConsole svg *,
.go svg, .go svg * {
  pointer-events: none !important;
}

#bGoPub {
  width: 52px !important;
  height: 52px !important;
  min-width: 52px !important;
  min-height: 52px !important;
  border-radius: 26px !important;
  padding: 0 !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  background: var(--ac) !important;
  color: #05202B !important;
  border: none !important;
  cursor: pointer !important;
  transition: transform .15s ease, filter .15s ease !important;
  box-shadow: 0 0 16px rgba(79, 209, 255, 0.4);
}
#bGoPub:hover {
  transform: scale(1.05);
  filter: brightness(1.1);
}
#bGoPub svg {
  width: 22px;
  height: 22px;
  fill: #05202B;
}

#bGoEng {
  width: 44px !important;
  height: 44px !important;
  min-width: 44px !important;
  min-height: 44px !important;
  border-radius: 22px !important;
  padding: 0 !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  background: var(--ac) !important;
  color: #05202B !important;
  border: none !important;
  cursor: pointer !important;
  box-shadow: 0 0 14px rgba(79, 209, 255, 0.4);
}
#bGoEng:hover {
  transform: scale(1.05);
  filter: brightness(1.1);
}
#bGoEng svg {
  width: 18px;
  height: 18px;
  fill: #05202B;
}

.pub-clock-box {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.pub-clock {
  font-size: 48px !important;
  font-weight: 600;
  letter-spacing: .02em;
  font-variant-numeric: tabular-nums;
  line-height: 1;
  color: #FFFFFF;
}

.pub-sub {
  font-size: 11px;
  color: var(--t2);
  letter-spacing: .04em;
  line-height: 1.2;
  margin-top: 2px;
  white-space: nowrap;
}

/* 中区: 速度 (36px, km/h) + 高度 (36px, km) */
.pub-zone-center {
  display: flex;
  align-items: center;
  gap: 40px;
  flex: 0 0 auto;
}

.pub-stat-tile {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.pub-stat-tile .pub-lbl {
  font-size: 11px;
  letter-spacing: .12em;
  color: var(--t2);
  text-transform: uppercase;
  line-height: 1;
}

.pub-stat-tile .pub-val {
  font-size: 36px !important;
  font-weight: 500;
  line-height: 1;
  font-variant-numeric: tabular-nums;
  color: #FFFFFF;
}

.pub-stat-tile .pub-val small {
  font-size: 16px;
  color: var(--t2);
  margin-left: 4px;
}

/* 右区: 健康状态胶囊 + 再看一次按钮 */
.pub-zone-right {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 0 0 auto;
}

.pub-health-cap {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.14);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: .04em;
  white-space: nowrap;
}
.pub-health-cap .hdot {
  font-size: 11px;
  color: var(--ac);
  display: inline-block;
  line-height: 1;
}

#bReplayPub {
  font-size: 12px;
  font-weight: 600;
  padding: 8px 16px;
  border-radius: 20px;
  background: rgba(79, 209, 255, 0.15);
  border: 1px solid var(--ac);
  color: var(--ac);
  cursor: pointer;
  transition: all .2s;
  white-space: nowrap;
}
#bReplayPub:hover {
  background: rgba(79, 209, 255, 0.28);
  box-shadow: 0 0 12px rgba(79, 209, 255, 0.4);
}

/* 小地图公众版 160px 缩放 */
body.is-public #minimap-wrap {
  width: 160px !important;
  height: 160px !important;
}
body.is-public #minimap {
  width: 160px !important;
  height: 160px !important;
}

/* 时间轴与底部仪表盘全宽纯黑无边框样式 (Entire Black, Zero Waste Space) */
#dash-panel,
body.is-public #dash-panel,
body.is-engineering #dash-panel {
  position: fixed !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  width: 100% !important;
  border-radius: 0 !important;
  background: #05070B !important; /* 全黑底色 */
  border-top: 1px solid rgba(255, 255, 255, 0.12) !important;
  border-left: none !important;
  border-right: none !important;
  border-bottom: none !important;
  box-sizing: border-box !important;
  z-index: 20 !important;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.6) !important;
}

body.is-public #dash-panel {
  height: 148px !important;
}
body.is-public #dash-pub {
  height: 84px !important;
  flex: 0 0 84px !important;
  min-height: 84px !important;
  max-height: 84px !important;
  padding: 0 32px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  box-sizing: border-box !important;
  overflow: hidden !important;
}
body.is-public .pub-row1 {
  display: grid !important;
  grid-template-columns: 1fr auto 1fr !important;
  align-items: center !important;
  width: 100% !important;
  height: 52px !important;
}
body.is-public .pub-zone-left {
  grid-column: 1 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: flex-start !important;
  gap: 16px !important;
}
body.is-public .pub-zone-center {
  grid-column: 2 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 40px !important;
}
body.is-public .pub-zone-right {
  grid-column: 3 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: flex-end !important;
  gap: 16px !important;
}
body.is-public #timeline-wrap {
  height: 64px !important;
  flex: 0 0 64px !important;
  min-height: 64px !important;
  max-height: 64px !important;
  flex-shrink: 0 !important;
  display: flex !important;
  flex-direction: column !important;
  justify-content: flex-start !important;
  padding-top: 34px !important;
  box-sizing: border-box !important;
  overflow: hidden !important;
}

body.is-engineering #dash-panel {
  height: 202px !important;
}
body.is-engineering #dash-eng {
  height: 124px !important;
  flex: 0 0 124px !important;
  min-height: 124px !important;
  max-height: 124px !important;
  display: grid !important;
  grid-template-columns: 1fr auto 1fr !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  width: 100% !important;
}
body.is-engineering .dash-left {
  grid-column: 1 !important;
  display: flex !important;
  flex-direction: column !important;
  align-items: flex-start !important;
  justify-content: flex-start !important;
  padding: 0 16px 8px 16px !important;
  overflow: hidden !important;
  min-width: 0 !important;
  box-sizing: border-box !important;
}
body.is-engineering .dash-left-body {
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
  width: 100% !important;
  height: 76px !important;
  min-width: 0 !important;
  flex: 0 0 76px !important;
}
body.is-engineering .eng1-card,
body.is-engineering #mod-eng1 {
  display: flex !important;
  align-items: center !important;
  gap: 14px !important;
  height: 76px !important;
  width: auto !important;
  background: transparent !important;
  border: none !important;
  border-radius: 0 !important;
  padding: 0 4px 0 0 !important;
  box-sizing: border-box !important;
  flex-shrink: 0 !important;
}
body.is-engineering .eng1-svg-box {
  width: 76px !important;
  height: 76px !important;
  flex-shrink: 0 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}
body.is-engineering .eng1-svg-box svg {
  width: 76px !important;
  height: 76px !important;
}
body.is-engineering .eng1-info {
  display: flex !important;
  flex-direction: column !important;
  justify-content: center !important;
  gap: 3px !important;
  min-width: 95px !important;
}
body.is-engineering .eng1-title {
  font-size: 13px !important;
  font-weight: 500 !important;
  letter-spacing: .05em !important;
  color: var(--t2, #8A99AD) !important;
  white-space: nowrap !important;
  text-transform: none !important;
  line-height: 1.1 !important;
}
body.is-engineering .eng1-stat {
  font-size: 19px !important;
  font-weight: 700 !important;
  color: var(--ac, #4FD1FF) !important;
  white-space: nowrap !important;
  line-height: 1.15 !important;
}
body.is-engineering .eng1-row {
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
  font-size: 11px !important;
  color: var(--t2, #8A99AD) !important;
  gap: 12px !important;
  white-space: nowrap !important;
  line-height: 1.2 !important;
}
body.is-engineering .eng1-row span:first-child {
  color: var(--t2, #8A99AD) !important;
}
body.is-engineering .eng1-row .val {
  color: var(--tx, #FFFFFF) !important;
  font-weight: 600 !important;
  font-variant-numeric: tabular-nums !important;
}
body.is-engineering .prop1-card,
body.is-engineering #mod-prop1 {
  display: flex !important;
  flex-direction: column !important;
  justify-content: space-between !important;
  width: 95px !important;
  min-width: 88px !important;
  height: 76px !important;
  background: rgba(255, 255, 255, 0.035) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  border-radius: 8px !important;
  padding: 6px 10px !important;
  box-sizing: border-box !important;
  flex-shrink: 0 !important;
}
body.is-engineering .prop1-card .ctx-title,
body.is-engineering .prop-hdr .lb {
  font-size: 10px !important;
  font-weight: 600 !important;
  color: var(--t2) !important;
  text-transform: uppercase !important;
  letter-spacing: .04em !important;
  line-height: 1 !important;
  white-space: nowrap !important;
}
body.is-engineering .prop1-card .ctx-val,
body.is-engineering .prop-hdr .m {
  font-size: 20px !important;
  font-weight: 700 !important;
  color: var(--tx) !important;
  line-height: 1.1 !important;
  font-variant-numeric: tabular-nums !important;
  white-space: nowrap !important;
}
body.is-engineering .prop1-card .ctx-bar,
body.is-engineering .prop-bar-box {
  height: 4px !important;
  background: rgba(255, 255, 255, 0.08) !important;
  border-radius: 2px !important;
  position: relative !important;
  overflow: visible !important;
  margin: 2px 0 !important;
}
body.is-engineering .prop-bar-fill {
  height: 100% !important;
  background: var(--ac) !important;
  border-radius: 2px !important;
}
body.is-engineering .prop-tick {
  position: absolute !important;
  width: 2px !important;
  height: 8px !important;
  top: -2px !important;
  background: var(--wn) !important;
  border-radius: 1px !important;
}
body.is-engineering .prop-margin {
  font-size: 10px !important;
  color: var(--t3) !important;
  line-height: 1 !important;
  white-space: nowrap !important;
}
body.is-engineering .ctx-box {
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
  flex: 0 0 auto !important;
  min-width: 0 !important;
  overflow: hidden !important;
}
body.is-engineering .ctx-mod {
  width: auto !important;
  min-width: 92px !important;
  max-width: 124px !important;
  height: 76px !important;
  padding: 6px 8px !important;
  background: rgba(255, 255, 255, 0.035) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  border-radius: 8px !important;
  display: flex !important;
  flex-direction: column !important;
  justify-content: space-between !important;
  box-sizing: border-box !important;
  flex: 1 1 0% !important;
  opacity: 1 !important;
  overflow: visible !important;
}
body.is-engineering .ctx-mod .ctx-title {
  font-size: 10px !important;
  font-weight: 600 !important;
  letter-spacing: .04em !important;
  color: var(--t2) !important;
  text-transform: uppercase !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  line-height: 1 !important;
}
body.is-engineering .ctx-mod .ctx-val {
  font-size: 19px !important;
  font-weight: 700 !important;
  line-height: 1.15 !important;
  font-variant-numeric: tabular-nums !important;
  white-space: nowrap !important;
  overflow: visible !important;
  text-overflow: clip !important;
}
body.is-engineering .ctx-mod .ctx-val small {
  font-size: 11px !important;
  font-weight: 500 !important;
  color: var(--t2) !important;
  margin-left: 2px !important;
}
body.is-engineering .ctx-mod .ctx-bar {
  height: 4px !important;
  background: rgba(255, 255, 255, 0.08) !important;
  border-radius: 2px !important;
  position: relative !important;
  overflow: visible !important;
  margin: 2px 0 !important;
}
body.is-engineering .ctx-mod .ctx-bar-fill {
  height: 100% !important;
  background: var(--ac) !important;
  border-radius: 2px !important;
}
body.is-engineering .ctx-mod .ctx-tick {
  position: absolute !important;
  width: 2px !important;
  height: 8px !important;
  top: -2px !important;
  border-radius: 1px !important;
}
body.is-engineering .ctx-mod .ctx-sub {
  font-size: 10px !important;
  color: var(--t3) !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  line-height: 1 !important;
}

/* 工程版中区：放大并保持屏幕严格正居中 (Dead Center & Bigger & Less Padding) */
body.is-engineering .dash-center {
  grid-column: 2 !important;
  display: flex !important;
  flex-direction: column !important;
  justify-content: center !important;
  align-items: center !important;
  padding: 0 8px !important;
  min-width: 320px !important;
  max-width: 380px !important;
  box-sizing: border-box !important;
}
.dc-row1 {
  display: flex !important;
  align-items: center !important;
  gap: 14px !important;
}
.dc-clock {
  font-size: 42px !important;
  font-weight: 700 !important;
  letter-spacing: .02em !important;
  font-variant-numeric: tabular-nums !important;
  line-height: 1 !important;
  color: #FFFFFF !important;
}
#bGoEng {
  width: 48px !important;
  height: 48px !important;
  min-width: 48px !important;
  min-height: 48px !important;
  border-radius: 24px !important;
  padding: 0 !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  background: var(--ac) !important;
  color: #05202B !important;
  border: none !important;
  cursor: pointer !important;
  box-shadow: 0 0 14px rgba(79, 209, 255, 0.4);
}
#bGoEng:hover {
  transform: scale(1.05);
  filter: brightness(1.1);
}
#bGoEng svg {
  width: 20px !important;
  height: 20px !important;
  fill: #05202B !important;
}
body.is-engineering .dc-row2-center {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  width: 100% !important;
  gap: 8px !important;
  margin-top: 2px !important;
  min-width: 0 !important;
}
body.is-engineering #nxEng {
  flex: 0 1 auto !important;
  min-width: 0 !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  font-size: 12px !important;
}
body.is-engineering .eng-health-pill {
  flex: 0 0 auto !important;
  max-width: 180px !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
}
body.is-engineering .dc-row3 {
  display: flex !important;
  align-items: baseline !important;
  gap: 32px !important;
  margin-top: 3px !important;
  line-height: 1 !important;
}
.dc-val-group .lb {
  font-size: 11px !important;
  font-weight: 500 !important;
}
.dc-val-group .vnum {
  font-size: 30px !important;
  font-weight: 600 !important;
  line-height: 1 !important;
  font-variant-numeric: tabular-nums !important;
}
.dc-val-group .vnum small {
  font-size: 14px !important;
  color: var(--t2) !important;
  font-weight: 400 !important;
  margin-left: 3px !important;
}

/* 工程版右区与 Stage 2 防重叠 */
body.is-engineering .dash-right {
  grid-column: 3 !important;
  display: flex !important;
  flex-direction: column !important;
  align-items: flex-end !important;
  justify-content: flex-start !important;
  padding: 0 16px 8px 16px !important;
  overflow: hidden !important;
  min-width: 0 !important;
  box-sizing: border-box !important;
}
.s2-group {
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
  width: 100% !important;
  max-width: 440px !important;
  height: 76px !important;
  overflow: hidden !important;
}
body.is-engineering #mod-eng2.s2-eng-card {
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
  height: 76px !important;
  background: rgba(255, 255, 255, 0.035) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  border-radius: 8px !important;
  padding: 6px 10px !important;
  box-sizing: border-box !important;
  flex: 1 1 auto !important;
}
.mvac-svg-box {
  width: 58px !important;
  height: 58px !important;
  flex-shrink: 0 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}
.mvac-svg-box svg {
  width: 58px !important;
  height: 58px !important;
}
.s2-info {
  display: flex !important;
  flex-direction: column !important;
  justify-content: center !important;
  gap: 2px !important;
  flex: 1 1 auto !important;
  min-width: 0 !important;
  overflow: hidden !important;
}
.s2-title-row {
  display: flex !important;
  align-items: center !important;
  gap: 6px !important;
  line-height: 1 !important;
}
.s2-title-row .lb {
  font-size: 10px !important;
  font-weight: 600 !important;
  color: var(--t2) !important;
  text-transform: uppercase !important;
}
.s2-status {
  font-size: 12px !important;
  font-weight: 700 !important;
  color: var(--ac) !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  line-height: 1.1 !important;
}
.s2-chk-list {
  display: grid !important;
  grid-template-columns: 1fr 1fr !important;
  gap: 2px 6px !important;
  font-size: 9px !important;
  line-height: 1.2 !important;
  color: var(--t2) !important;
  white-space: nowrap !important;
}
.s2-chk-list > div {
  overflow: hidden !important;
  text-overflow: ellipsis !important;
}
.prop2-card, #mod-prop2 {
  width: 95px !important;
  min-width: 88px !important;
  height: 76px !important;
  background: rgba(255, 255, 255, 0.035) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  border-radius: 8px !important;
  padding: 6px 10px !important;
  box-sizing: border-box !important;
  display: flex !important;
  flex-direction: column !important;
  justify-content: space-between !important;
  flex-shrink: 0 !important;
}
.prop2-card .ctx-title,
.prop2-card .prop-hdr .lb {
  font-size: 10px !important;
  font-weight: 600 !important;
  color: var(--t2) !important;
  text-transform: uppercase !important;
  letter-spacing: .04em !important;
  line-height: 1 !important;
  white-space: nowrap !important;
}
.prop2-card .ctx-val,
.prop2-card .prop-hdr .m {
  font-size: 20px !important;
  font-weight: 700 !important;
  color: var(--tx) !important;
  line-height: 1.1 !important;
  font-variant-numeric: tabular-nums !important;
  white-space: nowrap !important;
}
.prop2-card .prop-bar-box {
  height: 4px !important;
  background: rgba(255, 255, 255, 0.08) !important;
  border-radius: 2px !important;
  position: relative !important;
  overflow: visible !important;
  margin: 2px 0 !important;
}
.prop2-card .prop-bar-fill {
  height: 100% !important;
  background: var(--ac) !important;
  border-radius: 2px !important;
}
.s2-badge-flash {
  display: none !important;
}

/* 时间轴可拖拽与光标交互 (Interactive Draggable Scrubbing) */
.tl-track-area {
  cursor: pointer !important;
  position: relative !important;
}
.tl-rail, .tl-seg {
  cursor: pointer !important;
}
.tl-dot {
  cursor: grab !important;
  pointer-events: auto !important;
}
body.timeline-dragging,
body.timeline-dragging * {
  cursor: grabbing !important;
  user-select: none !important;
  -webkit-user-select: none !important;
}
.tl-track-area::before {
  content: '';
  position: absolute;
  top: -14px;
  bottom: -14px;
  left: 0;
  right: 0;
  cursor: ew-resize !important;
  z-index: 4;
}

body.is-engineering #timeline-wrap {
  height: 76px !important;
  flex: 0 0 76px !important;
  min-height: 76px !important;
  max-height: 76px !important;
  flex-shrink: 0 !important;
  display: flex !important;
  flex-direction: column !important;
  justify-content: flex-start !important;
  padding-top: 38px !important;
  box-sizing: border-box !important;
  overflow: hidden !important;
}

body.is-public .tl-dur {
  display: none !important;
}

/* 时间轴标签严格包含防越界 (row-0: -28px, row-1: -15px, dur: 14px) */
.tl-lbl.row-0 {
  top: -28px !important;
}
.tl-lbl.row-1 {
  top: -15px !important;
}
.tl-dur {
  top: 14px !important;
}

/* ==================== 工程抽屉 (Engineering Drawer - D) 全高侧滑与最高层级 ==================== */
#drw {
  position: fixed !important;
  top: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  width: 440px !important;
  max-width: 100vw !important;
  background: rgba(8, 12, 18, 0.98) !important;
  backdrop-filter: blur(12px) !important;
  -webkit-backdrop-filter: blur(12px) !important;
  border-left: 1px solid rgba(255, 255, 255, 0.12) !important;
  box-shadow: -12px 0 40px rgba(0, 0, 0, 0.85) !important;
  padding: 16px 20px !important;
  box-sizing: border-box !important;
  overflow-y: auto !important;
  z-index: 1000 !important;
  transform: translateX(102%) !important;
  transition: transform .25s cubic-bezier(.16, 1, .3, 1) !important;
  pointer-events: none !important;
}
#drw.open {
  transform: none !important;
  pointer-events: auto !important;
}
body.is-console #drw {
  bottom: 0 !important;
}
#drw .tabs {
  display: flex !important;
  gap: 4px !important;
  margin-bottom: 14px !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
  padding-bottom: 10px !important;
}
#drw .tabs button {
  flex: 1 !important;
  height: 30px !important;
  font-size: 11px !important;
  background: rgba(255, 255, 255, 0.03) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  border-radius: 6px !important;
  color: var(--t2, #8A99AD) !important;
  cursor: pointer !important;
  transition: all .15s ease !important;
}
#drw .tabs button.on {
  border-color: var(--ac, #4FD1FF) !important;
  color: var(--ac, #4FD1FF) !important;
  background: rgba(79, 209, 255, 0.12) !important;
}

/* ==================== 面板布局编辑器 (Section 13 Modal) ==================== */
.layout-modal-overlay {
  position: fixed !important;
  inset: 0 !important;
  background: rgba(4, 6, 10, 0.78) !important;
  backdrop-filter: blur(8px) !important;
  -webkit-backdrop-filter: blur(8px) !important;
  z-index: 20000 !important;
  display: flex;
  align-items: center !important;
  justify-content: center !important;
}
.layout-modal-overlay[style*="display: none"],
.layout-modal-overlay[style*="display:none"],
.layout-modal-overlay.hidden {
  display: none !important;
}

.layout-modal-box {
  width: 760px;
  max-width: 95vw;
  height: 560px;
  max-height: 95vh;
  background: #0A0E14 !important;
  border: 1px solid rgba(255, 255, 255, 0.16) !important;
  border-radius: 12px !important;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.85) !important;
  display: flex !important;
  flex-direction: column !important;
  padding: 16px 20px !important;
  box-sizing: border-box !important;
  color: #FFFFFF !important;
  gap: 10px !important;
  overflow: hidden !important;
}

.layout-modal-box.pub-settings-box {
  width: 420px !important;
  height: auto !important;
  max-height: 80vh !important;
}

.le-dialog-hdr {
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
  padding-bottom: 8px !important;
}

.le-dialog-title {
  font-size: 14px !important;
  font-weight: 700 !important;
  color: var(--tx) !important;
  letter-spacing: .05em !important;
}

.le-schema-badge {
  font-size: 10px !important;
  font-weight: 700 !important;
  color: var(--ac) !important;
  background: rgba(79, 209, 255, 0.12) !important;
  border: 1px solid rgba(79, 209, 255, 0.3) !important;
  border-radius: 4px !important;
  padding: 2px 6px !important;
}

.le-mode-switch-row {
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
  gap: 12px !important;
}

.le-presets-group {
  display: flex !important;
  align-items: center !important;
  gap: 4px !important;
}

.le-preset-btn {
  height: 26px !important;
  padding: 0 8px !important;
  font-size: 11px !important;
}

.le-notice-banner {
  background: rgba(255, 179, 0, 0.12) !important;
  border: 1px solid rgba(255, 179, 0, 0.35) !important;
  color: #FFB300 !important;
  padding: 5px 10px !important;
  border-radius: 6px !important;
  font-size: 11px !important;
  display: flex !important;
  align-items: center !important;
  gap: 6px !important;
}

.le-preview-bar {
  display: flex !important;
  align-items: center !important;
  gap: 10px !important;
  background: rgba(255, 255, 255, 0.03) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  border-radius: 6px !important;
  padding: 6px 10px !important;
  min-height: 38px !important;
  box-sizing: border-box !important;
}

.le-select {
  height: 24px !important;
  background: #151A22 !important;
  color: var(--tx) !important;
  border: 1px solid rgba(255, 255, 255, .2) !important;
  border-radius: 4px !important;
  padding: 0 6px !important;
  font-size: 11px !important;
}

.le-preview-slots-preview {
  display: flex !important;
  gap: 4px !important;
  flex: 1 !important;
  overflow-x: auto !important;
  align-items: center !important;
}

.mini-slot-chip {
  height: 22px !important;
  padding: 0 6px !important;
  font-size: 10px !important;
  border-radius: 4px !important;
  background: rgba(255, 255, 255, 0.06) !important;
  border: 1px solid rgba(255, 255, 255, 0.12) !important;
  display: flex !important;
  align-items: center !important;
  gap: 4px !important;
  white-space: nowrap !important;
  color: var(--tx) !important;
}

.mini-slot-chip.is-dimmed {
  opacity: 0.35 !important;
}

.le-grid-scroll-area {
  flex: 1 !important;
  overflow-y: auto !important;
  background: rgba(0, 0, 0, 0.25) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  border-radius: 8px !important;
  padding: 10px !important;
  min-height: 120px !important;
  box-sizing: border-box !important;
}

.le-slot-row {
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
  padding: 4px 6px !important;
  background: rgba(255, 255, 255, 0.02) !important;
  border-radius: 4px !important;
  margin-bottom: 4px !important;
}

.le-slot-badge {
  font-size: 11px !important;
  font-weight: 700 !important;
  color: var(--ac) !important;
  width: 28px !important;
}

.le-locked-section {
  background: rgba(255, 255, 255, 0.02) !important;
  border: 1px solid rgba(255, 255, 255, 0.06) !important;
  border-radius: 6px !important;
  padding: 6px 10px !important;
}

.le-locked-chips {
  display: flex !important;
  flex-wrap: wrap !important;
  gap: 6px !important;
}

.locked-chip {
  font-size: 10px !important;
  color: #8A94A3 !important;
  background: rgba(255, 255, 255, 0.04) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  border-radius: 4px !important;
  padding: 2px 6px !important;
  display: inline-flex !important;
  align-items: center !important;
  gap: 4px !important;
}

.le-saved-and-io-row {
  display: flex !important;
  gap: 12px !important;
  height: 80px !important;
}

.le-saved-col, .le-io-col {
  flex: 1 !important;
  display: flex !important;
  flex-direction: column !important;
  overflow: hidden !important;
}

.le-saved-list {
  flex: 1 !important;
  overflow-y: auto !important;
  display: flex !important;
  flex-direction: column !important;
  gap: 3px !important;
}

.le-saved-item {
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
  background: rgba(255, 255, 255, 0.04) !important;
  border-radius: 4px !important;
  padding: 2px 6px !important;
  font-size: 11px !important;
}

.le-dialog-footer {
  display: flex !important;
  justify-content: flex-end !important;
  gap: 10px !important;
  margin-top: auto !important;
  padding-top: 6px !important;
  border-top: 1px solid rgba(255, 255, 255, 0.08) !important;
}

/* 有阶段语义的小部件变暗样式 (§13.5) */
.widget-dimmed {
  opacity: 0.35 !important;
  filter: grayscale(45%) !important;
  transition: opacity 0.2s ease !important;
}

/* 控制台 Tall Widget 尺寸严格保证 (104x150 不溢出) */
.c-tall-slot-wrap {
  width: 100%;
  height: 100%;
  min-height: 150px;
  box-sizing: border-box;
}
.c-tall-widget {
  width: 100% !important;
  max-width: 100% !important;
  height: 150px !important;
  min-height: 150px !important;
  max-height: 150px !important;
  box-sizing: border-box !important;
  overflow: hidden !important;
  padding: 8px !important;
  display: flex !important;
  flex-direction: column !important;
  justify-content: space-between !important;
}

.c-tall-widget .w-hdr {
  font-size: 11px !important;
  line-height: 1.2 !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
}

.c-tall-widget .w-val-box {
  display: flex !important;
  align-items: baseline !important;
  gap: 3px !important;
  margin: 2px 0 !important;
}

.c-tall-widget .w-num {
  font-size: 20px !important;
  font-weight: 700 !important;
  line-height: 1.1 !important;
  font-feature-settings: "tnum" !important;
}

.c-tall-widget .w-unit {
  font-size: 11px !important;
  color: var(--t2) !important;
}

.c-tall-widget .c-abar-track {
  width: 88px !important;
  height: 4px !important;
  background: rgba(255, 255, 255, 0.08) !important;
  border-radius: 2px !important;
  overflow: hidden !important;
  margin: 3px 0 !important;
}

.c-tall-widget .w-spark {
  width: 88px !important;
  height: 22px !important;
  display: block !important;
}

/* 紧凑模式通用卡片网格与卡片尺寸 */
.compact-slots-grid {
  display: flex !important;
  gap: 8px !important;
  align-items: center !important;
  height: 100% !important;
}

.compact-slot-card {
  min-width: 84px !important;
  height: 76px !important;
  background: rgba(255, 255, 255, 0.03) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  border-radius: 8px !important;
  padding: 6px 8px !important;
  box-sizing: border-box !important;
  display: flex !important;
  flex-direction: column !important;
  justify-content: space-between !important;
  overflow: hidden !important;
}

/* 紧凑模式异常才用色 (ISA-101) */
.compact-slot-card .ctx-bar-fill,
body.is-engineering .compact-slot-card .ctx-bar-fill {
  height: 100% !important;
  background: #8A94A3 !important;
  border-radius: 2px !important;
  transition: background 0.2s ease, width 0.1s linear !important;
}
.compact-slot-card .ctx-bar-fill.warn,
body.is-engineering .compact-slot-card .ctx-bar-fill.warn {
  background: var(--wn) !important;
}
.compact-slot-card .ctx-bar-fill.crit,
body.is-engineering .compact-slot-card .ctx-bar-fill.crit {
  background: var(--cr) !important;
}
.compact-slot-card.card-warn {
  border-color: rgba(255, 176, 32, 0.4) !important;
}
.compact-slot-card.card-crit {
  border-color: rgba(255, 77, 94, 0.5) !important;
}
`;
