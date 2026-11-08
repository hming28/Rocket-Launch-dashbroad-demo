import subprocess, time, json, urllib.request, websocket, os

subprocess.run(['powershell', '-Command', 'Get-Process chrome -ErrorAction SilentlyContinue | Stop-Process -Force'])
time.sleep(1)

user_dir = 'C:\\Users\\user\\AppData\\Local\\Temp\\chrome_cdp_debug'
ps_cmd = f'Start-Process "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" -ArgumentList "--headless=new", "--no-sandbox", "--disable-gpu", "--remote-debugging-port=9222", "--user-data-dir={user_dir}", "about:blank"'
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

send('Runtime.enable')
send('Page.enable')

file_path = os.path.abspath('AETHER-9 飞行控制台 v4.html').replace('\\', '/')

# Add script to evaluate on new document to catch errors
send('Page.addScriptToEvaluateOnNewDocument', {
    'source': '''
    window.__errors = [];
    window.addEventListener('error', e => {
        window.__errors.push({ msg: e.message, filename: e.filename, lineno: e.lineno, colno: e.colno, error: e.error ? e.error.stack : '' });
    });
    '''
})

send('Page.navigate', {'url': f'file:///{file_path}#engineering'})

time.sleep(3)

res = send('Runtime.evaluate', {
    'expression': 'window.__errors',
    'returnByValue': True
})
print('Errors:', json.dumps(res, indent=2, ensure_ascii=False))

res2 = send('Runtime.evaluate', {
    'expression': '(() => { try { initDashboardDOM(); return "ran initDashboardDOM ok"; } catch(e) { return "error in initDashboardDOM: " + e.stack; } })()',
    'returnByValue': True
})
print('Manual run initDashboardDOM:', json.dumps(res2, indent=2, ensure_ascii=False))
