with open('d:/This PC/Downloads/AETHER-9 飞行控制台 v4.html', 'r', encoding='utf-8') as f:
    v4 = f.read()

# Check layoutModalOverlay in HTML
pos_modal_html = v4.find('<div id="layoutModalOverlay"')
pos_modal_html_end = v4.find('</div>\n\n    <!-- 公众版设置对话框', pos_modal_html)
print("layoutModalOverlay HTML starts at:", pos_modal_html, "ends at:", pos_modal_html_end)

# Check modal JS
pos_modal_js = v4.find('// ==================== 面板布局编辑器 Dialog 交互逻辑')
pos_modal_js_end = v4.find('function buildPublicDash()', pos_modal_js)
print("modal JS starts at:", pos_modal_js, "ends at:", pos_modal_js_end)
