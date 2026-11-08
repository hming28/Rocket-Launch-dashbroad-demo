with open('d:/This PC/Downloads/AETHER-9 飞行控制台 v4.html', 'r', encoding='utf-8') as f:
    v4 = f.read()

pos_beng = v4.find('function buildEngDash()')
print(v4[pos_beng - 400 : pos_beng + 50])
