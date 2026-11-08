with open('d:/This PC/Downloads/AETHER-9 飞行控制台 v4.html', 'r', encoding='utf-8') as f:
    v4 = f.read()

pos_modal_html = v4.find('<div id="layoutModalOverlay"')
pos_pub_settings = v4.find('id="pubSettingsOverlay"')
print("Modal overlay from", pos_modal_html, "to pubSettingsOverlay at", pos_pub_settings)
print(v4[pos_pub_settings - 200 : pos_pub_settings + 50])
