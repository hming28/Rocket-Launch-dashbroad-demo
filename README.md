# AETHER-9 · 航天发射与遥测飞行控制台
### AETHER-9 Aerospace Mission Control & Flight Telemetry Simulation Console

<p align="center">
  <img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License MIT">
  <img src="https://img.shields.io/badge/Dependencies-Zero%20(Pure%20Vanilla%20JS)-success.svg" alt="Zero Dependencies">
  <img src="https://img.shields.io/badge/Standard-ISA--101%20Compliant-orange.svg" alt="ISA-101">
  <img src="https://img.shields.io/badge/Architecture-Single%20File%20Standalone-purple.svg" alt="Single File">
  <img src="https://img.shields.io/badge/GitHub%20Pages-Ready-brightgreen.svg" alt="Pages Ready">
</p>

---

## 📖 项目简介 / Overview

**AETHER-9** 是一套高保真、零外部依赖、纯浏览器端运行的现代化航天飞行控制台与火箭遥测仿真系统。

项目视觉与交互深度汲取自 **SpaceX 官方发射直播 HUD** 与 **NASA 现代航天任务控制中心** 设计哲学，兼顾公众媒体传播的直观生动与航天工程控制台的严谨克制。系统基于纯原生 HTML5 / CSS3 / Vanilla JavaScript 与 Canvas 构建，具备完整的 420 秒标称时序物理轨迹仿真、Octaweb 9 发动机阵列与故障注入、ISA-101 工业级分级报警引擎、GO/NO-GO 席位轮询板、走廊偏差图、动态时序自适应仪表盘与 Schema 2 布局编辑器。

> **Zero Dependencies**: 无需构建工具即可开箱即用。双击 `index.html` 或通过静态服务器即可在任何主流现代浏览器中以 60 FPS 丝滑运行。

---

## 🚀 版本演进与在线分发 / Release Versions (v1 ~ v3)

本项目提供完整的 3 个历史演进版本，直观展现了从基础原型到工业级控制台的工程进化路径：

| 版本代号 | 在线演示入口 / 源码路径 | 里程碑特性与架构 |
| :--- | :--- | :--- |
| **Release v1.0**<br>`v1.0.0` | [`dist/v1/index.html`](dist/v1/index.html)<br>([单文件下载](dist/aether-9-v1.0.html)) | **初始交互原型**：72px 极简单层底栏 + 58px 线性时间轴 + 右侧抽屉，验证 420s 火箭遥测时序方程与基础动画。 |
| **Release v2.0**<br>`v2.0.0` | [`dist/v2/index.html`](dist/v2/index.html)<br>([单文件下载](dist/aether-9-v2.0.html)) | **双模书签卡片版**：首创公众版（148px）与工程版（200px）双模式，自适应书签卡片槽位 + Octaweb 9发故障注入 + ABORT 长按防误触。 |
| **Release v3.0**<br>`v3.0.0 (Latest)` | [`index.html`](index.html)<br>([单文件下载](dist/aether-9-v3.0.html)) | **工业级多席位任务控制中心（旗舰版）**：ISA-101 工业视觉规范 + 总览与 6 大专业岗位席位 + 走廊偏差图 + 趋势图 + Schema 2 动态布局编辑器。 |

---

## ✨ 核心特性 / Key Features (v3 旗舰版)

### 1. 三种显示模式自由切换 (Three Display Modes)
* 🎥 **公众版（Public View, 快捷键 `V`）**：
  * 面向直播观众与大众科普的 148px 扁平化流媒体 HUD。
  * 纯粹关键遥测：超大数字时钟、速度（km/h）、高度（km）、综合健康状态胶囊。
  * 逐阶段通俗解说（点火、离塔、最大动压、一级关机、热分离、再入、着陆点火、触地）。
  * 触地后全自动弹出「再看一次」一键起航。
* 🛠️ **工程版 · 紧凑模式（Engineering Compact, 快捷键 `E`）**：
  * 200px 紧凑工程底栏 + 顶部导航栏长按 1 秒防误触 ABORT 按钮。
  * **Octaweb 发动机矩阵**：支持点击任意发动机注入故障，实时影响推力、过载载荷与着陆判定。
  * **动态自适应槽位**：左区发动机/推进剂，右区分离前一级飞行遥测、分离后二级发动机工况。
* 🖥️ **工程版 · 控制台模式（Console Multi-View, 快捷键 `C`）**：
  * 符合 **ISA-101 人机交互标准** 的工业级深色任务控制台。
  * **总览视图（OVERVIEW）**：小部件条、关键遥测数字、系统状态板。
  * **6 大岗位专业席位**：
    1. **FLIGHT**（飞行主任）：关键时序事件倒计时、GO/NO-GO 轮询板、综合状态。
    2. **FDO**（飞行力学与动力学席）：高精高度/速度走廊图（CorridorPlot）、动态偏差计算。
    3. **PROP**（推进系统席）：一二级推进剂消耗账本、节流工况、发动机实时推力与混合比。
    4. **GNC**（制导导航与控制席）：姿态角、万向节摆角、角速度与气动舵面监控。
    5. **LOAD**（结构载荷席）：动压（Max-Q）、过载加速度（0~6G）、气动阻力系数与气动热流。
    6. **REC**（一级回收席）：再入气动减速、反推制动余量曲线（Braking Margin）、触地姿态。

### 2. 严谨的物理时序模型 (Physics & Telemetry)
* **420 秒全时序闭环仿真**：涵盖点火升空、音障跨越、Max-Q 最大动压、MECO、级间热分离、网格舵展开、Boostback 调头、再入点火（Entry Burn）、跨音速阻力峰值与着陆点火减速（Landing Burn）。
* **$S_{act}$ 与 $S_{nom}$ 偏差引擎**：支持实际飞行曲线与标称理论轨迹的实时偏差比对，动态计算超限报警。
* **ISA-101 报警引擎**：12 项分级报警规则（A01~A12），具备 5 秒防抖（Debounce）与 2 秒回差清除机制。

### 3. Schema 2 动态布局编辑器 (Layout Editor, 快捷键 `K`)
* **⚡ 自动时序调度模式（Auto Mode）**：仪表盘跟随火箭飞行阶段自动调整展示最关键的 4~5 个核心指标，界面整洁无空白占位。
* **🛠️ 自定义遥测模式（Custom Mode）**：允许工程师手动选配左区 4 个槽位与右区 5 个槽位的遥测卡片（推力、马赫、动压、过载、热流等），支持内置预设一键加载与持久化存储。

### 4. 国际化与纯前端架构
* **中英双语无缝切换**：顶栏一键切换 `中 / EN`（快捷键 `L`）。
* **零外部依赖**：无需加载任何外部 CDN、字体库或框架，全内置 SVG 图形与 Web Audio 音效，离线环境下毫秒级冷启动。

---

## ⌨️ 操作与快捷键指南 / Controls & Shortcuts

| 快捷键 | 功能操作 | 作用视图 / 模式 |
| :--- | :--- | :--- |
| <kbd>Space</kbd> | **开始 / 暂停** 飞行时序仿真 | 全局通用 |
| <kbd>V</kbd> | 切换 **公众版** / **工程版** | 全局通用 |
| <kbd>E</kbd> | 切换至 **工程版 · 紧凑模式** | 工程版 |
| <kbd>C</kbd> | 切换至 **工程版 · 控制台模式** | 工程版 |
| <kbd>1</kbd> ~ <kbd>6</kbd> | 直达 6 大岗位视图 (FLIGHT, FDO, PROP, GNC, LOAD, REC) | 控制台模式 |
| <kbd>0</kbd> | 返回 **总览视图** (Overview) | 控制台模式 |
| <kbd>K</kbd> | 打开 / 关闭 **仪表盘布局编辑器** | 工程版 |
| <kbd>D</kbd> | 展开 / 收起 **工程抽屉**（推进账本/参数调节/事件日志） | 工程版 |
| <kbd>L</kbd> | 切换界面语言（**中文 / English**） | 全局通用 |
| <kbd>[</kbd> / <kbd>]</kbd> | 调节仿真倍速（0.5× / 1× / 2× / 5×） | 工程版 |
| <kbd>R</kbd> | 重置仿真至 T-00:00 发射初始状态 | 工程版 |
| <kbd>A</kbd> | 切换 3D 相机 **自动导播** / 固定机位 | 控制台模式 |

---

## 💻 快速开始 / Quick Start

### 方式 1：直接双击运行（推荐）
直接在文件资源管理器中双击根目录下的 **`index.html`**，即可使用任何主流浏览器（Chrome, Edge, Safari, Firefox）打开运行！

### 方式 2：使用本地静态服务器
```bash
# 克隆代码仓库
git clone https://github.com/your-username/aether-9.git
cd aether-9

# 使用 npx 启动静态服务
npm start
# 浏览器访问 http://localhost:3000 即可
```

### 方式 3：GitHub Pages 在线访问
将本仓库推送到 GitHub 后，在仓库的 **Settings -> Pages** 中将部署源选择为 **GitHub Actions**，代码推送到 `main` 分支后将全自动构建并发布到公网！

---

## 📁 仓库目录结构 / Repository Layout

```text
aether-9/
├── index.html                      # [核心入口] 独立可运行的控制台单文件（默认 v3 旗舰版）
├── README.md                       # 开源项目说明与操作手册
├── LICENSE                         # MIT 开源协议
├── .gitignore                      # Git 忽略配置
├── package.json                    # 便捷脚本与工程元信息
│
├── .github/
│   └── workflows/
│       └── deploy.yml              # GitHub Pages 自动化发布 Action
│
├── src/                            # [v3 模块化源码] 解耦维护
│   ├── template.html               # 基础骨架模板 (原 HTML 外壳与状态机基础)
│   ├── models.js                   # 动力学与遥测偏差计算引擎 (S_act / S_nom)
│   ├── alarms_gonogo.js            # ISA-101 分级报警引擎 (A01-A12) 与 GO/NO-GO 席位板
│   ├── charts_viewport.js          # 走廊图 (CorridorPlot)、趋势图与 3D 相机预设
│   ├── views.js                    # 6 大专业席位控制台视图与部件面板
│   ├── layout_engine.js            # Schema 2 仪表盘布局引擎 (自动自适应 vs 自定义槽位)
│   ├── drawer_extensions.js        # 工程抽屉 (系统验证、推进剂账本、参数微调、事件日志)
│   ├── shell_editor.js             # 模式路由、全键盘快捷键监听与时钟循环
│   ├── styles.js                   # 全套暗黑航天主题与响应式样式体系
│   └── markup.js                   # DOM 标记与模态对话框结构构造器
│
├── dist/                           # [三大版本独立单文件分发包]
│   ├── v1/index.html               # Release v1.0.0 独立单文件 (初始交互原型)
│   ├── v2/index.html               # Release v2.0.0 独立单文件 (双模书签卡片版)
│   ├── v3/index.html               # Release v3.0.0 独立单文件 (工业级任务控制中心)
│   ├── aether-9-v1.0.html          # 发布附件包 v1
│   ├── aether-9-v2.0.html          # 发布附件包 v2
│   └── aether-9-v3.0.html          # 发布附件包 v3
│
├── scripts/                        # [工程工具与流水线]
│   ├── build.js                    # 跨平台一键打包脚本：将 src/ 编译合并生成 index.html 与 dist/v3/
│   └── release_all.js              # 全量发布与多版本语法/SHA-256 校验工具
│
├── tests/                          # [自动化测试套件]
│   ├── cdp_verify.py               # 基于 Chrome DevTools Protocol 的 8 项无头自动化端到端测试
│   └── capture_screenshots.py      # 多模式全分辨率无头截图生成工具
│
├── docs/                           # [项目设计与技术规格文档]
│   ├── AETHER-9 工程版 · 多视图任务控制台 实现方案.md
│   ├── AETHER-9 飞行控制台 · 底部动态仪表盘重构方案.docx
│   ├── AETHER-9_项目交接记录.md
│   ├── AETHER-9_CONTINUATION_PROMPT.md
│   └── AETHER-9 v4→v5 修复与补全指令(给 AI worker).md
│
└── archive/                        # [历史开发探索片段安全归档]
    ├── aether_9_original.html      # 最初版原始原型备份
    └── legacy_dev_scripts/         # 历史探索/排查脚本归档 (39 个调试脚本)
```

---

## 🛠️ 开发者指南 / Development & Build

### 1. 模块化构建与打包 (Build)
如果你修改了 `src/` 目录下的 JavaScript 或样式模块，只需运行构建脚本即可将其重新合并打包为单文件 `index.html`：

```bash
# 重新编译生成 index.html 与 dist/v3/index.html
node scripts/build.js
```

### 2. 全量发布校验 (Verify All Releases)
一键对 `v1`、`v2`、`v3` 三大发布版本执行 JavaScript 语法校验并生成 SHA-256 完整性摘要：

```bash
npm run build:all
# 或
node scripts/release_all.js
```

### 3. 运行端到端自动化测试 (E2E Tests)
项目配备了基于 Chrome DevTools Protocol (CDP) 的 8 项自动化无头端到端测试套件（涵盖自动模式自适应、布局编辑器模态窗交互、自定义预设换槽、二级过渡与发动机故障注入）：

```bash
# 确保已安装 python 及 websocket-client
python tests/cdp_verify.py
```

---

## 📄 开源许可证 / License

本项目遵循 [MIT License](LICENSE) 开源协议。无论是个人研究、学习航天遥测交互，还是用于商业演示，均可自由使用与修改。欢迎 Star 🌟 与提交 Issue / PR！
