with open('d:/This PC/Downloads/AETHER-9 飞行控制台 v4.html', 'r', encoding='utf-8') as f:
    v4 = f.read()

idx = v4.find('function renderTopActions()')
print(v4[idx:idx+800])
