with open('d:/This PC/Downloads/AETHER-9 飞行控制台 v4.html', 'r', encoding='utf-8') as f:
    v4 = f.read()

idx = v4.find('function updateBodyClasses')
print("updateBodyClasses at:", idx)
if idx != -1:
    print(v4[idx:idx+300])
else:
    print("Not found as function declaration. Searching usages:")
    pos = 0
    while True:
        pos = v4.find('updateBodyClasses', pos)
        if pos == -1: break
        print("Usage at:", pos, v4[max(0, pos-20):pos+40])
        pos += 17
