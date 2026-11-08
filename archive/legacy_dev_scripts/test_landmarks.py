import re

with open('AETHER-9 飞行控制台 v3.html', 'r', encoding='utf-8') as f:
    v3 = f.read()

with open('AETHER-9 飞行控制台 v4.html', 'r', encoding='utf-8') as f:
    v4 = f.read()

# Let's inspect how the modal HTML starts and ends in v4
pos_modal_start = v4.find('<div id="layoutModalOverlay"')
pos_modal_end = v4.find('<!-- 公众版 4 个安全选项设置弹窗 -->')
print(f"Modal HTML: from {pos_modal_start} to {pos_modal_end}")

# Let's inspect how the modal JS starts and ends in v4
pos_modal_js_start = v4.find('// ==================== 面板布局编辑器 Dialog 交互逻辑 (Section 13) ====================')
pos_modal_js_end = v4.find('// ==================== DOM 构建与版本管理 ====================')
print(f"Modal JS: from {pos_modal_js_start} to {pos_modal_js_end}")

# Let's inspect buildEngDash in v4
pos_build_eng = v4.find('function buildEngDash()')
pos_init_dom = v4.find('function initDashboardDOM()')
print(f"buildEngDash: from {pos_build_eng} to {pos_init_dom}")

# Let's inspect where compact mode is rendered in draw() in v4
pos_draw_compact = v4.find('// 紧凑模式下按布局引擎动态渲染左右区 (§13.2, §13.5)')
pos_draw_compact_end = v4.find('// ABORT 按钮状态 (位于顶部导航栏)', pos_draw_compact)
print(f"Compact draw: from {pos_draw_compact} to {pos_draw_compact_end}")
