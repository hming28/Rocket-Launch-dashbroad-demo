with open('d:/This PC/Downloads/rocket dashbroad design/AETHER-9 飞行控制台 v4.html', 'r', encoding='utf-8') as f:
    v4 = f.read()

idx1 = v4.find('id="leAutoPanel"')
idx2 = v4.find('id="leCustomPanel"')
print("idx1:", idx1, "idx2:", idx2)
print(v4[idx2-50:idx2+200])
