import subprocess, time, json, urllib.request, websocket, os

with urllib.request.urlopen("http://127.0.0.1:9222/json") as r:
    tabs = json.loads(r.read().decode())
    ws_url = tabs[0]["webSocketDebuggerUrl"]

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
    return resp.get("result", {}).get("result", {}).get("value")

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
        lZoneHdr: document.getElementById('lZoneHdr')?.textContent
    };
})()
""")
print("Stage 2 test:", json.dumps(res7, indent=2, ensure_ascii=False))
