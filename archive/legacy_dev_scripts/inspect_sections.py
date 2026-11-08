with open('d:/This PC/Downloads/AETHER-9 飞行控制台 v4.html', 'r', encoding='utf-8') as f:
    v4_old = f.read()

# CSS end
idx_css_end = v4_old.find('</style>')
print("Style ends at:", idx_css_end)

# HTML additions
idx_body_start = v4_old.find('<body>')
idx_script_start = v4_old.find('<script>')
print("Body starts at:", idx_body_start, "Script starts at:", idx_script_start)

# In JS, check Views end
idx_views = v4_old.find('const Views = (function()')
idx_layout_engine = v4_old.find('const LayoutEngine = (function()')
print("Views from", idx_views, "to", idx_layout_engine)

idx_after_le = v4_old.find('// Active, draft, and saved layouts management', idx_layout_engine)
print("LayoutEngine from", idx_layout_engine, "to", idx_after_le)

idx_dialog_logic = v4_old.find('// ==================== 面板布局编辑器 Dialog 交互逻辑', idx_after_le)
print("Layout storage from", idx_after_le, "to", idx_dialog_logic)

idx_build_dash = v4_old.find('function buildPublicDash', idx_dialog_logic)
print("Dialog logic from", idx_dialog_logic, "to", idx_build_dash)
