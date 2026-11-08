with open('d:/This PC/Downloads/AETHER-9 飞行控制台 v4.html', 'r', encoding='utf-8') as f:
    v4 = f.read()

pos_bpub = v4.find('function buildPublicDash()')
print("buildPublicDash starts at:", pos_bpub)
