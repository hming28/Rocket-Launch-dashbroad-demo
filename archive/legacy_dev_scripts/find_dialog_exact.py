with open('d:/This PC/Downloads/AETHER-9 飞行控制台 v4.html', 'r', encoding='utf-8') as f:
    v4 = f.read()

p1 = v4.find('// ==================== 面板布局编辑器 Dialog 交互逻辑')
p2 = v4.find('const fT = x =>')
print("Dialog JS from", p1, "to", p2, "length:", p2 - p1)
print("Snippet around p2:")
print(v4[p2 - 100 : p2 + 200])
