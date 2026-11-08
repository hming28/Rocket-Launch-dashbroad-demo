with open('d:/This PC/Downloads/AETHER-9 飞行控制台 v4.html', 'r', encoding='utf-8') as f:
    v4 = f.read()

p_start = v4.find('// Active, draft, and saved layouts management')
p_end = v4.find('function setMode', p_start)
print("Layout state from", p_start, "to", p_end, "length:", p_end - p_start)
print(v4[p_start:p_start+400])
print("...")
print(v4[p_end-200:p_end+50])
