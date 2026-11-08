with open('C:/Users/user/.gemini/antigravity/scratch/src/shell_editor.js', 'r', encoding='utf-8') as f:
    se = f.read()

idx = se.find('function loadActiveAndSavedLayouts()')
idx_end = se.find('function setMode', idx)
print(se[idx:idx_end])
