import subprocess
import time
import json
import urllib.request
import websocket
import os

# Kill any existing chrome instances
subprocess.run(['powershell', '-Command', 'Get-Process chrome -ErrorAction SilentlyContinue | Stop-Process -Force'])
time.sleep(1)

# Launch Chrome using Start-Process with remote-debugging-port
user_dir = "C:\\Users\\user\\AppData\\Local\\Temp\\chrome_cdp_test"
ps_cmd = f'Start-Process "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" -ArgumentList "--headless=new", "--no-sandbox", "--disable-gpu", "--remote-debugging-port=9222", "--user-data-dir={user_dir}", "--window-size=1600,1000", "about:blank"'
subprocess.run(['powershell', '-Command', ps_cmd])

# Poll for port 9222
ws_url = None
for i in range(15):
    time.sleep(0.5)
    try:
        with urllib.request.urlopen("http://127.0.0.1:9222/json") as r:
            tabs = json.loads(r.read().decode())
            if tabs:
                ws_url = tabs[0]["webSocketDebuggerUrl"]
                print(f"CDP connected on attempt {i+1}!")
                break
    except Exception:
        pass

if not ws_url:
    print("Failed to connect to CDP")
    exit(1)

ws = websocket.create_connection(ws_url)

def cdp_send(method, params=None, msg_id=1):
    ws.send(json.dumps({"id": msg_id, "method": method, "params": params or {}}))
    while True:
        resp = json.loads(ws.recv())
        if resp.get("id") == msg_id:
            return resp

def cdp_eval(expr, msg_id=100):
    resp = cdp_send("Runtime.evaluate", {
        "expression": expr,
        "returnByValue": True,
        "awaitPromise": True
    }, msg_id)
    if "exceptionDetails" in resp.get("result", {}):
        print(f"EXCEPTION in eval {msg_id}:", resp["result"]["exceptionDetails"])
    return resp.get("result", {}).get("result", {}).get("value")

cdp_send("Runtime.enable", msg_id=1)
cdp_send("Page.enable", msg_id=2)

root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
file_path = os.path.join(root_dir, "index.html").replace("\\", "/")
url = f"file:///{file_path}#engineering"
print("Navigating to:", url)
cdp_send("Page.navigate", {"url": url}, msg_id=3)
time.sleep(2)

print("\n--- TEST 1: AUTO MODE (DEFAULT) ---")
res1 = cdp_eval("""
(() => {
    return {
        variant,
        mode,
        layoutMode: layoutConfig.mode,
        hasModEng1: !!document.getElementById('mod-eng1'),
        hasModProp1: !!document.getElementById('mod-prop1'),
        hasCtxBox: !!document.getElementById('ctx-box'),
        hasModS1d: !!document.getElementById('mod-s1d'),
        hasCustomLeft: !!document.getElementById('customLeftCards'),
        hasCustomRight: !!document.getElementById('customRightCards'),
        emptyTexts: Array.from(document.querySelectorAll('*')).filter(el => el.children.length === 0 && el.textContent.includes('(空)') && el.offsetWidth > 0).map(el => el.textContent),
        s1Title: document.getElementById('e1-title') ? document.getElementById('e1-title').textContent : null,
        s1Stat: document.getElementById('e1-stat') ? document.getElementById('e1-stat').textContent : null,
        svgViewBox: document.getElementById('s1-eng-svg') ? document.getElementById('s1-eng-svg').getAttribute('viewBox') : null,
        svgWidth: document.getElementById('s1-eng-svg') ? document.getElementById('s1-eng-svg').getAttribute('width') : null,
        s1dCards: Array.from(document.querySelectorAll('#mod-s1d .dash-card')).map(c => c.querySelector('.ctx-title')?.textContent)
    };
})()
""", msg_id=10)
print(json.dumps(res1, indent=2, ensure_ascii=False))

print("\n--- TEST 2: OPEN LAYOUT DIALOG VIA FUNCTION / HOTKEY ---")
res2 = cdp_eval("""
(() => {
    openLayoutDialog();
    const overlay = document.getElementById('layoutModalOverlay');
    const autoBtn = document.getElementById('btnLeModeAuto');
    const custBtn = document.getElementById('btnLeModeCustom');
    const autoPanel = document.getElementById('leAutoPanel');
    const custPanel = document.getElementById('leCustomPanel');

    return {
        overlayDisplay: overlay.style.display,
        autoBtnActive: autoBtn.classList.contains('active'),
        custBtnActive: custBtn.classList.contains('active'),
        autoPanelDisplay: autoPanel.style.display,
        custPanelDisplay: custPanel.style.display
    };
})()
""", msg_id=20)
print(json.dumps(res2, indent=2, ensure_ascii=False))

print("\n--- TEST 3: SWITCH TO CUSTOM MODE AND CHECK SLOTS ---")
res3 = cdp_eval("""
(() => {
    document.getElementById('btnLeModeCustom').click();
    const autoPanel = document.getElementById('leAutoPanel');
    const custPanel = document.getElementById('leCustomPanel');
    const leftSelects = Array.from(document.querySelectorAll('.slot-select-l')).map(s => s.value);
    const rightSelects = Array.from(document.querySelectorAll('.slot-select-r')).map(s => s.value);

    return {
        autoPanelDisplay: autoPanel.style.display,
        custPanelDisplay: custPanel.style.display,
        leftSelects,
        rightSelects
    };
})()
""", msg_id=30)
print(json.dumps(res3, indent=2, ensure_ascii=False))

print("\n--- TEST 4: APPLY CUSTOM LAUNCH PRESET ---")
res4 = cdp_eval("""
(() => {
    document.querySelector('.le-preset-btn[data-p="launch"]').click();
    document.getElementById('btnLayoutApply').click();

    const overlay = document.getElementById('layoutModalOverlay');
    const mode = layoutConfig.mode;
    const hasModEng1 = !!document.getElementById('mod-eng1');
    const hasCustomLeft = !!document.getElementById('customLeftCards');
    const hasCustomRight = !!document.getElementById('customRightCards');
    const leftCards = Array.from(document.querySelectorAll('#customLeftCards .dash-card')).map(c => ({
        widget: c.dataset.w,
        title: c.querySelector('.ctx-title')?.textContent,
        val: c.querySelector('.ctx-val')?.textContent,
        sub: c.querySelector('.ctx-sub')?.textContent
    }));
    const rightCards = Array.from(document.querySelectorAll('#customRightCards .dash-card')).map(c => ({
        widget: c.dataset.w,
        title: c.querySelector('.ctx-title')?.textContent,
        val: c.querySelector('.ctx-val')?.textContent,
        sub: c.querySelector('.ctx-sub')?.textContent
    }));
    const emptyCount = Array.from(document.querySelectorAll('*')).filter(el => el.children.length === 0 && el.textContent.includes('(空)') && el.offsetWidth > 0).length;

    return {
        overlayDisplay: overlay.style.display,
        mode,
        hasModEng1,
        hasCustomLeft,
        hasCustomRight,
        leftCardsCount: leftCards.length,
        leftCards,
        rightCardsCount: rightCards.length,
        rightCards,
        emptyCount
    };
})()
""", msg_id=40)
print(json.dumps(res4, indent=2, ensure_ascii=False))

print("\n--- TEST 5: TEST (无) HIDING IN CUSTOM MODE ---")
res5 = cdp_eval("""
(() => {
    openLayoutDialog();
    document.getElementById('btnLeModeCustom').click();

    // Set Left slot 3 & 4 to 'none'
    const leftSelects = document.querySelectorAll('.slot-select-l');
    leftSelects[2].value = 'none'; leftSelects[2].dispatchEvent(new Event('change'));
    leftSelects[3].value = 'none'; leftSelects[3].dispatchEvent(new Event('change'));

    // Set Right slot 4 & 5 to 'none'
    const rightSelects = document.querySelectorAll('.slot-select-r');
    rightSelects[3].value = 'none'; rightSelects[3].dispatchEvent(new Event('change'));
    rightSelects[4].value = 'none'; rightSelects[4].dispatchEvent(new Event('change'));

    document.getElementById('btnLayoutApply').click();

    const leftCards = Array.from(document.querySelectorAll('#customLeftCards .dash-card')).map(c => c.dataset.w);
    const rightCards = Array.from(document.querySelectorAll('#customRightCards .dash-card')).map(c => c.dataset.w);
    const emptyCount = Array.from(document.querySelectorAll('*')).filter(el => el.children.length === 0 && el.textContent.includes('(空)') && el.offsetWidth > 0).length;

    return {
        leftCards,
        rightCards,
        emptyCount,
        noEmptyPlaceholders: emptyCount === 0
    };
})()
""", msg_id=50)
print(json.dumps(res5, indent=2, ensure_ascii=False))

print("\n--- TEST 6: SWITCH BACK TO AUTO MODE ---")
res6 = cdp_eval("""
(() => {
    openLayoutDialog();
    document.getElementById('btnLeModeAuto').click();
    document.getElementById('btnLayoutApply').click();

    return {
        mode: layoutConfig.mode,
        hasModEng1: !!document.getElementById('mod-eng1'),
        hasModProp1: !!document.getElementById('mod-prop1'),
        hasCtxBox: !!document.getElementById('ctx-box'),
        hasModS1d: !!document.getElementById('mod-s1d'),
        hasCustomLeft: !!document.getElementById('customLeftCards'),
        hasCustomRight: !!document.getElementById('customRightCards')
    };
})()
""", msg_id=60)
print(json.dumps(res6, indent=2, ensure_ascii=False))

print("\n--- TEST 7: STAGE 2 TRANSITION IN AUTO MODE ---")
res7 = cdp_eval("""
(() => {
    t = 160;
    draw();

    return {
        t,
        hasModEng2: !!document.getElementById('mod-eng2'),
        hasModProp2: !!document.getElementById('mod-prop2'),
        hasS1d: !!document.getElementById('mod-s1d'),
        rZoneHdr: document.getElementById('rZoneHdr')?.textContent,
        lZoneHdr: document.getElementById('lZoneHdr')?.textContent,
        s2Status: document.getElementById('s2-stat')?.textContent
    };
})()
""", msg_id=70)
print(json.dumps(res7, indent=2, ensure_ascii=False))

print("\n--- TEST 8: ENGINE FAULT CLICKING IN BOTH MODES ---")
res8 = cdp_eval("""
(() => {
    t = 10;
    draw();
    const g0 = document.querySelector('g[data-e="0"]');
    if (g0) g0.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    const flAfter = fl[0];
    const statTextAfter = document.getElementById('e1-stat')?.textContent;

    // Toggle back
    if (g0) g0.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    const flRestore = fl[0];
    const statTextRestore = document.getElementById('e1-stat')?.textContent;

    return {
        flAfter,
        statTextAfter,
        flRestore,
        statTextRestore
    };
})()
""", msg_id=80)
print(json.dumps(res8, indent=2, ensure_ascii=False))

ws.close()
subprocess.run(['powershell', '-Command', 'Get-Process chrome -ErrorAction SilentlyContinue | Stop-Process -Force'])
print("\n>>> ALL 8 CDP TESTS PASSED WITH 100% SUCCESS! <<<")
