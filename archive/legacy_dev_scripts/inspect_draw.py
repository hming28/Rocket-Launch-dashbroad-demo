with open('d:/This PC/Downloads/AETHER-9 飞行控制台 v4.html', 'r', encoding='utf-8') as f:
    v4 = f.read()

# Let's check draw() in v4_old
pos_draw = v4.find('function draw()')
print("draw() starts at:", pos_draw)
pos_draw_end = v4.find('function tick()', pos_draw)
print("draw() ends at:", pos_draw_end)
print("--- draw() content around compact ---")
pos_compact = v4.find('Views.updateCompactZones', pos_draw)
print(v4[pos_compact - 200 : pos_compact + 250])
