with open('d:/This PC/Downloads/AETHER-9 飞行控制台 v4.html', 'r', encoding='utf-8') as f:
    v4 = f.read()

idx_ft = v4.find('const fT =')
print("const fT in v4_old at:", idx_ft)
idx_build_pub = v4.find('function buildPublicDash()')
print("buildPublicDash at:", idx_build_pub)
idx_storage = v4.find('// Active, draft, and saved layouts management')
print("storage at:", idx_storage)
