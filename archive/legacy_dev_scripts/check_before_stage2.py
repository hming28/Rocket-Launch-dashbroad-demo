with open('d:/This PC/Downloads/AETHER-9 飞行控制台 v4.html', 'r', encoding='utf-8') as f:
    v4 = f.read()

pos_dialog_start = v4.find('// ==================== 面板布局编辑器 Dialog 交互逻辑')
pos_stage2 = v4.find('function getStage2State', pos_dialog_start)
print(v4[pos_stage2 - 400 : pos_stage2])
