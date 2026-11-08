with open('d:/This PC/Downloads/AETHER-9 飞行控制台 v4.html', 'r', encoding='utf-8') as f:
    v4 = f.read()

pos_beng = v4.find('function buildEngDash()')
pos_beng_end = v4.find('function initDashboardDOM()', pos_beng)
print("buildEngDash starts at:", pos_beng, "ends at:", pos_beng_end)
print(v4[pos_beng:pos_beng_end])
