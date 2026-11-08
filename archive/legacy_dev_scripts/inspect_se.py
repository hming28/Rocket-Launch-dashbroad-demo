with open('C:/Users/user/.gemini/antigravity/scratch/src/shell_editor.js', 'r', encoding='utf-8') as f:
    se = f.read()

idx_open = se.find('function openLayoutDialog')
print("openLayoutDialog at:", idx_open)
idx_apply = se.find('function applyDraftLayout')
print("applyDraftLayout at:", idx_apply)
idx_render = se.find('function renderLayoutDialog')
print("renderLayoutDialog at:", idx_render)
idx_init = se.find('function initLayoutDialogInteractions')
print("initLayoutDialogInteractions at:", idx_init)
