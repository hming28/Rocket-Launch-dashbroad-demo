with open('d:/This PC/Downloads/AETHER-9 飞行控制台 v4.html', 'r', encoding='utf-8') as f:
    v4 = f.read()

pos_maxq = v4.find('// 7.2 Max-Q')
print("pos_maxq:", pos_maxq)
print(v4[pos_maxq - 100 : pos_maxq + 200])
