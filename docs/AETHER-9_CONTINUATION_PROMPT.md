# AETHER-9 飞行控制台 · 新对话无缝接续上下文与工程档案

> **给新会话中 AI Agent 的前置指令**：
> 请完整阅读本文件。本项目为 **AETHER-9 航天飞行控制台（单文件 HTML/JS/CSS 架构火箭遥测仿真与可视化系统）**。
> 目前代码已演进至 **v3 版本**，所有功能需求、公众版与工程版双模式、布局防重叠及 17 项端到端验收测试套件均已就绪。请严格遵守下述文件路径与设计约束，直接继续响应用户的后续开发指令。

---

## 1. 核心文件与工作环境清单

### 1.1 核心交付文件（必须严格保持字节级同步）
- **工作区主文件**：`d:\This PC\Downloads\rocket dashbroad design\AETHER-9 飞行控制台 v3.html`
- **下载目录主文件**：`d:\This PC\Downloads\AETHER-9 飞行控制台 v3.html`
- **镜像副本**：`d:\This PC\Downloads\AETHER-9 飞行控制台_v3.html`
- **接续文档**：`d:\This PC\Downloads\rocket dashbroad design\AETHER-9_CONTINUATION_PROMPT.md` 与 `d:\This PC\Downloads\AETHER-9_CONTINUATION_PROMPT.md`
- **历史备份（严禁覆盖修改）**：
  - `d:\This PC\Downloads\AETHER-9 飞行控制台.html` (v2 稳定版备份)
  - `d:\This PC\Downloads\AETHER-9 飞行控制台_v2.html`
  - `d:\This PC\Downloads\AETHER-9 飞行控制台 v3.html.bak_redesign` (重构基线备份)

### 1.2 规范与技术方案文档
- **多视图控制台方案**：`d:\This PC\Downloads\rocket dashbroad design\AETHER-9 工程版 · 多视图任务控制台 实现方案.md`
- **底部动态仪表盘重构方案**：`d:\This PC\Downloads\AETHER-9 飞行控制台 · 底部动态仪表盘重构方案.docx`

### 1.3 模块化构建与测试工具（在 Scratch 目录下）
- **模块化源码目录**：`C:\Users\user\.gemini\antigravity\scratch\src\`
  - `models.js`：$S_{act}$ / $S_{nom}$ 物理模型、轨迹偏差、动压、推力与姿态计算。
  - `alarms_gonogo.js`：ISA-101 分级报警引擎（A01–A12）、5 秒防抖、2 秒回差清除、根因合并与 GO/NO-GO 自动点名。
  - `charts_viewport.js`：走廊图（CorridorPlot）、动态趋势图（StripChart）、3D 视角预设与相机切换。
  - `views.js`：6 大岗位视图（FLIGHT, FDO, PROP, GNC, LOAD, REC）与部件详情面板（Part Sheet）。
  - `shell_editor.js`：模式路由（`#public`, `#engineering`, `#console`）、快捷键监听、测试钩子 `window.__test`。
  - `styles.js`：控制台专属样式、公众版 148px 底盘、时间轴 64px/76px 隔离样式与 ISA-101 颜色规范。
  - `markup.js`：控制台顶栏扩展、公众版与工程版外壳 DOM 结构。
  - `drawer_extensions.js`：工程抽屉与 Schema 2 布局编辑器。
- **构建生成脚本**：`C:\Users\user\.gemini\antigravity\scratch\generate_clean_v3.js`
  - 运行 `node generate_clean_v3.js` 会自动将模块编译合并输出至上述三个 `v3.html` 目标文件。
- **自动化验收测试套件**：`C:\Users\user\.gemini\antigravity\scratch\run_all_tests.js`
  - 驱动 Headless Chrome 执行 17 项端到端验收测试（100% 全部通过）。

---

## 2. 当前已实现的关键特性与架构

### 2.1 三大显示模式
1. **公众版（Public View）**：
   - 路由：`#public`，快捷键 `V`。
   - 底部 148px 极简仪表盘（上半部 84px，下半部 64px 时间轴）：
     - 左区：52px 播放/暂停圆形按钮 + 48px 大字时钟 + 「下一步:××· N 秒后」。
     - 中区：36px 速度（km/h）、36px 高度（km）。
     - 右区：健康状态胶囊，「一切正常 / 注意 / 异常」，带图形图标指示。
     - 顶部居中：通俗阶段名 + 逐阶段通俗解释（例如「点火与推力建立: 发动机点火，火箭正在积蓄推力」）。
     - 线性时间轴：线段宽度按飞行时长成比例；不显示具体秒数；节点采用通俗文案（点火、升空、最大压力、一级关机、分离、翻转、返回大气层、着陆减速、着陆）。
     - 触地后自动弹出「再看一次」圆形重播按钮，点击重置并自动起航。
     - 彻底隐藏工程元素：DOM 中不存在 ABORT、发动机矩阵、过载、推力/马赫/动压/Cd、最紧裕度胶囊、紧凑/控制台开关、重来、倍速、工程抽屉。
     - 右上角小地图缩至 160px。
     - 彻底根除 `saveVariantSettings` 未定义异常，点火至触地 420s 仿真平滑流畅无卡死。
2. **工程版 · 紧凑模式（Engineering Compact）**：
   - 路由：`#engineering`。
   - 内容：全屏 3D 视角 + 底部现代化 200px 仪表盘（左区 `一级箭体 · STAGE 1`，右区 `一级飞行细节 · FLIGHT DETAIL` 4 张自适应卡片小部件）。
   - ABORT 按钮置于顶部导航栏 `D · 工程抽屉` 旁，带 1 秒防误触长按进度与状态锁定。
3. **工程版 · 多视图控制台（Engineering Console）**：
   - 路由：`#console`，快捷键 `C`。
   - 内容：ISA-101 四层架构的多岗位专业控制台，支持 6 大视图无缝切换。

### 2.2 修复的关键布局与文案问题
1. **时间轴标签防重叠隔离**：
   - 时间轴标签严格约束在自身保留高度内（工程版 76px，公众版 64px），绝不越界与上方三区发生重叠。
2. **时钟下方 SPD 与时间轴 Flip 重叠根治**：
   - 重新校准绝对定位、基线对齐与内边距，工程版紧凑模式下 SPD 底部与时间轴 Flip 标签顶部保持 19px 以上安全净间距。
3. **发动机型号文案统一**：
   - 全局界面与代码中文案已全部由 `9× Merlin 1D 1D-FT` 修正为标准名称 `9× Merlin 1D`。

---

## 3. 当前测试与验证状态

- **自动化测试套件**：17 项测试全部 **100% PASS**（运行 `node run_all_tests.js` 验证）：
  1. 6 大视图渲染与 DOM 重复 ID 检查（✓ PASS）
  2. ISA-101 正常状态色彩中性度审计（✓ PASS）
  3. 名义轨迹与实际轨迹偏差基准（✓ PASS，$< 0.0001\%$）
  4. 1 号发动机故障注入（$t=6s$）在 $t=150s$ 的速度偏差验证（✓ PASS）
  5. 390s 中心机故障触发根因合并与泛滥抑制（✓ PASS）
  6. 数据超时与 A10 报警防抖触发（✓ PASS）
  7. MECO 前自动席位点名序列（✓ PASS）
  8. 键盘快捷键导航（✓ PASS）
  9. 抽屉布局编辑器 Schema 2 初始化（✓ PASS）
  10. 跨 1080p、1440×810、720p、1100×700、800×600 全分辨率响应式与 0 溢出（✓ PASS）
  11. 公众版 DOM 严格排除工程元素审计（✓ PASS，0 违规）
  12. 公众版 148px 仪表盘组件与尺寸排版审计（✓ PASS）
  13. 公众版 160px 小地图规格审计（✓ PASS）
  14. 触地后「再看一次」重播逻辑审计（✓ PASS）
  15. 公众版 0–420s 仿真循环连续平滑度与 0 错误（✓ PASS）
  16. 跨 720p、900p、1080p 多分辨率时间轴标签无重叠与 Flip/SPD 净距审计（✓ PASS，垂直净距 19px）
  17. 发动机命名审计（`9× Merlin 1D`）与三文件 SHA-256 镜像绝对一致性（✓ PASS）
- **文件校验**：三个目标 `v3.html` 文件的 SHA-256 哈希值完全一致（大小均为 246,060 字节，哈希 `89d027ff9334f8579d85073b86a37bbf6874ba8eb5877f0a4d2c95b373cbc27a`）。

---

## 4. 下一次会话如何开始

在新会话中，只需向 AI 发送以下一句话即可继续：

```markdown
请阅读并加载 @[d:\This PC\Downloads\AETHER-9_CONTINUATION_PROMPT.md]，基于当前的 AETHER-9 v3 控制台继续开发。
```
