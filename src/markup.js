// Markup components for AETHER-9 Mission Console
module.exports = {
  getTopBarAdditions() {
    return `
      <!-- 控制台模式新增: 紧凑/控制台切换 & 6个视图标签 & 新鲜度指示器 -->
      <div class="c-top-group" id="cTopGroup">
        <div class="c-mode-switch" id="modeSwitch" role="group" aria-label="工程模式切换" style="display:none">
          <button class="seg-opt" id="bModeCompact" data-mode="compact">紧凑</button>
          <button class="seg-opt" id="bModeConsole" data-mode="console">控制台</button>
        </div>
        <div class="c-view-tabs" id="cViewTabs" role="tablist" aria-label="控制台视图切换" style="display:none">
          <button class="c-tab-btn active" data-v="0" role="tab">①总览</button>
          <button class="c-tab-btn" data-v="1" role="tab">②轨迹</button>
          <button class="c-tab-btn" data-v="2" role="tab">③推进</button>
          <button class="c-tab-btn" data-v="3" role="tab">④姿态</button>
          <button class="c-tab-btn" data-v="4" role="tab">⑤气动热</button>
          <button class="c-tab-btn" data-v="5" role="tab">⑥回收</button>
        </div>
      </div>
      <div id="c-fresh-badge" class="live" style="display:none" title="数据新鲜度">
        <span class="dot"></span>
        <span id="c-fresh-txt">LIVE ● 10Hz</span>
      </div>`;
  },

  getConsoleWrap() {
    return `
  <!-- 控制台全屏包裹器 (仅工程版控制台模式生效) -->
  <div id="console-wrap">
    <!-- 状态条 52px (ISA-101 固定) -->
    <div id="console-status-bar">
      <div class="c-status-left">
        <div class="c-met-clock" id="c-met">T+ 00:00.0</div>
        <div class="c-phase-chip" id="c-phase">阶段 · 点火</div>
      </div>
      <div class="c-status-center">
        <div class="c-seat-list" id="c-seats-bar">
          <div class="c-seat-item go" id="seat-fido" data-seat="FIDO"><span class="c-seat-dot"></span>FIDO</div>
          <div class="c-seat-item go" id="seat-gnc" data-seat="GNC"><span class="c-seat-dot"></span>GNC</div>
          <div class="c-seat-item go" id="seat-prop" data-seat="PROP"><span class="c-seat-dot"></span>PROP</div>
          <div class="c-seat-item go" id="seat-load" data-seat="LOAD"><span class="c-seat-dot"></span>LOAD</div>
          <div class="c-seat-item go" id="seat-rec" data-seat="REC"><span class="c-seat-dot"></span>REC</div>
          <div class="c-seat-item go" id="seat-rng" data-seat="RNG"><span class="c-seat-dot"></span>RNG</div>
          <div class="c-seat-item go" id="seat-wx" data-seat="WX"><span class="c-seat-dot"></span>WX</div>
        </div>
      </div>
      <div class="c-status-right">
        <div class="c-tight-pill" id="c-tight-margin">最紧裕度: —</div>
        <div class="c-alarm-pill" id="c-alarm-summary" title="点击查看报警">报警 高0 中0 低0</div>
      </div>
    </div>

    <!-- P1 临界报警横幅 -->
    <div id="c-p1-banner">
      <span id="c-p1-banner-txt">■ 临界报警: —</span>
      <button class="btn-ack" id="c-p1-ack-btn">确认 / ACK</button>
    </div>

    <!-- 内容区: 12列网格，按视图动态渲染面板 -->
    <div id="console-content">
      <div class="c-view-grid" id="c-view-container"></div>
    </div>

    <!-- 底部操作与时间轴栏 76px (ISA-101 固定) -->
    <div id="console-bottom-bar">
      <button id="bGoConsole" aria-label="开始/暂停">▶</button>
      <div class="c-bottom-tl-wrap" id="c-tl-mount"></div>
      <button id="bAbConsole" title="Hold 1 s" aria-label="飞行中止 (长按1秒)">
        <i id="abf-console"></i>
        <span class="ab-main">ABORT</span>
        <span class="ab-sub">HOLD 1s</span>
      </button>
    </div>

    <!-- 部件详情页 (L3: 右侧滑出 420px) -->
    <div id="c-part-sheet">
      <div class="c-sheet-hdr">
        <span style="font-weight:700;font-size:13px" id="c-sheet-title">部件详情 · PART DETAILS</span>
        <button class="pill" id="c-sheet-close" style="height:26px;padding:0 8px">✕</button>
      </div>
      <div id="c-sheet-body"></div>
    </div>

    <!-- 聚焦模式 Modal (含 60 采样数据表) -->
    <div id="c-focus-modal">
      <div class="c-focus-tb">
        <span style="font-weight:700;font-size:13px" id="c-focus-title">面板聚焦 · PANEL FOCUS</span>
        <div style="display:flex;gap:8px">
          <button class="pill" id="btnToggleDataTable">数据表 / Table</button>
          <button class="pill" id="btnCloseFocus">退出聚焦 (Esc)</button>
        </div>
      </div>
      <div id="c-focus-content" style="flex:1;position:relative;overflow:hidden"></div>
    </div>

    <!-- 窄屏 (<1280px) 提示覆盖层 -->
    <div id="c-narrow-notice">
      <div style="font-size:18px;font-weight:700;color:var(--tx)">控制台模式在 &lt; 1280px 分辨率下不可用</div>
      <div style="font-size:13px;color:var(--t2)">多视图任务控制台专为大屏设计。请调整窗口宽度或切换至紧凑模式。</div>
      <button class="bt pr" id="btnSwitchToCompactFromNotice">切换至工程 · 紧凑模式</button>
    </div>
  </div>`;
  },

  getLayoutDialog() {
    return `
    <!-- 布局编辑器对话框 (Section 13) -->
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
    </div>`;
  },

  getPublicSettingsDialog() {
    return `
    <!-- 公众版 4 个安全选项设置弹窗 -->
    <div id="pubSettingsOverlay" class="layout-modal-overlay" style="display:none">
      <div class="layout-modal-box pub-settings-box" style="width:420px;height:auto;max-height:80vh;gap:16px" role="dialog" aria-modal="true">
        <div class="le-dialog-hdr">
          <span class="le-dialog-title">公众版设置 · SETTINGS</span>
          <button class="pill le-btn-close" id="btnPubSettingsClose">✕</button>
        </div>
        <div style="display:flex;flex-direction:column;gap:12px;font-size:12px">
          <div class="row">
            <span>单位系统 (Units)</span>
            <div class="seg-switch" style="width:160px;height:28px">
              <button class="seg-opt active" id="btnUnitMetric">公制 (km/h)</button>
              <button class="seg-opt" id="btnUnitImperial">英制 (mph)</button>
            </div>
          </div>
          <div class="row">
            <span>语言 (Language)</span>
            <div class="seg-switch" style="width:160px;height:28px">
              <button class="seg-opt active" id="btnLangZh">中文</button>
              <button class="seg-opt" id="btnLangEn">EN</button>
            </div>
          </div>
          <div class="row">
            <span>状态说明 (Status Desc)</span>
            <button class="pill" id="btnTogglePubDesc" style="height:28px;padding:0 12px">开启 (On)</button>
          </div>
          <div class="row">
            <span>显示过载 (G-Load)</span>
            <button class="pill" id="btnTogglePubGLoad" style="height:28px;padding:0 12px">关闭 (Off)</button>
          </div>
        </div>
        <div class="le-dialog-footer">
          <button class="bt pr" id="btnPubSettingsOk" style="height:30px;padding:0 20px">完成 / Done</button>
        </div>
      </div>
    </div>`;
  }
};

