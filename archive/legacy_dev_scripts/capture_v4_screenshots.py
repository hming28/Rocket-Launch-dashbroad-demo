import subprocess, time, json, urllib.request, websocket, os, base64

art_dir = "C:\\Users\\user\\.gemini\\antigravity\\brain\\f98b6d46-6b12-4a5a-a2ca-b22ed59ee3b9"

subprocess.run(['powershell', '-Command', 'Get-Process chrome -ErrorAction SilentlyContinue | Stop-Process -Force'])
time.sleep(1)

user_dir = 'C:\\Users\\user\\AppData\\Local\\Temp\\chrome_cdp_cap'
ps_cmd = f'Start-Process "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" -ArgumentList "--headless=new", "--no-sandbox", "--disable-gpu", "--remote-debugging-port=9222", "--user-data-dir={user_dir}", "--window-size=1600,1000", "about:blank"'
subprocess.run(['powershell', '-Command', ps_cmd])

time.sleep(2)
with urllib.request.urlopen('http://127.0.0.1:9222/json') as r:
    tabs = json.loads(r.read().decode())
    ws_url = tabs[0]['webSocketDebuggerUrl']

ws = websocket.create_connection(ws_url)

msg_id = 0
def send(method, params=None):
    global msg_id
    msg_id += 1
    ws.send(json.dumps({'id': msg_id, 'method': method, 'params': params or {}}))
    while True:
        resp = json.loads(ws.recv())
        if resp.get('id') == msg_id:
            return resp

def eval_js(expr):
    resp = send('Runtime.evaluate', {
        'expression': expr,
        'returnByValue': True,
        'awaitPromise': True
    })
    return resp.get('result', {}).get('result', {}).get('value')

def capture(filename):
    res = send('Page.captureScreenshot', {'format': 'png'})
    b64 = res['result']['data']
    path = os.path.join(art_dir, filename)
    with open(path, 'wb') as f:
        f.write(base64.b64decode(b64))
    print(f"Captured: {path}")

send('Runtime.enable')
send('Page.enable')

file_path = os.path.abspath('AETHER-9 飞行控制台 v4.html').replace('\\', '/')
send('Page.navigate', {'url': f'file:///{file_path}#engineering'})
time.sleep(2)

# 1. Auto Mode at t=70 (Max-Q)
eval_js("(() => { t = 70; draw(); })()")
time.sleep(0.5)
capture("v4_auto_compact_t70.png")

# 2. Open Layout Dialog (Auto mode view)
eval_js("openLayoutDialog()")
time.sleep(0.5)
capture("v4_dialog_auto.png")

# 3. Switch Layout Dialog to Custom Mode view
eval_js("(() => { document.getElementById('btnLeModeCustom').click(); })()")
time.sleep(0.5)
capture("v4_dialog_custom.png")

# 4. Apply Custom Launch Preset and view dashboard
eval_js("(() => { document.querySelector('.le-preset-btn[data-p=\"launch\"]').click(); document.getElementById('btnLayoutApply').click(); t = 70; draw(); })()")
time.sleep(0.5)
capture("v4_custom_launch_dashboard.png")

# 5. Public View
eval_js("setVariantAndMode('public', 'compact')")
time.sleep(0.5)
capture("v4_public_dashboard.png")

# 6. Console Mode View
eval_js("setVariantAndMode('engineering', 'console')")
time.sleep(0.5)
capture("v4_console_view.png")

subprocess.run(['powershell', '-Command', 'Get-Process chrome -ErrorAction SilentlyContinue | Stop-Process -Force'])
print("All screenshots captured successfully!")
