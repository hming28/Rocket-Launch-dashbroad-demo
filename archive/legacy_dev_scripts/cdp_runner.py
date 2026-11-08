import subprocess
import time
import json
import os
import tempfile
import base64
import urllib.request
import websocket

CHROME_PATH = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
PORT = 9222

def start_chrome():
    user_data_dir = os.path.join(tempfile.gettempdir(), "chrome_cdp_test_profile")
    cmd = [
        CHROME_PATH,
        "--headless=new",
        "--no-sandbox",
        "--disable-gpu",
        f"--user-data-dir={user_data_dir}",
        f"--remote-debugging-port={PORT}",
        "--remote-allow-origins=*",
        "--window-size=1600,1000",
        "about:blank"
    ]
    proc = subprocess.Popen(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    for _ in range(10):
        try:
            with urllib.request.urlopen(f"http://127.0.0.1:{PORT}/json", timeout=1) as r:
                return proc
        except Exception:
            time.sleep(0.5)
    return proc

def send_cdp_cmd(ws, msg_id, method, params=None):
    payload = {"id": msg_id, "method": method, "params": params or {}}
    ws.send(json.dumps(payload))
    while True:
        resp = json.loads(ws.recv())
        if resp.get("id") == msg_id:
            return resp

def evaluate_js(ws, msg_id, expr):
    resp = send_cdp_cmd(ws, msg_id, "Runtime.evaluate", {
        "expression": expr,
        "returnByValue": True,
        "awaitPromise": True
    })
    result = resp.get("result", {}).get("result", {})
    if "value" in result:
        return result["value"]
    elif "description" in result:
        return result["description"]
    return result

def take_screenshot(ws, msg_id, filename):
    resp = send_cdp_cmd(ws, msg_id, "Page.captureScreenshot", {"format": "png"})
    data = resp.get("result", {}).get("data")
    if data:
        with open(filename, "wb") as f:
            f.write(base64.b64decode(data))
        print(f"Screenshot saved to {filename}")

def main():
    proc = start_chrome()
    try:
        # Get websocket debugger URL
        tabs_url = f"http://127.0.0.1:{PORT}/json"
        with urllib.request.urlopen(tabs_url) as r:
            tabs = json.loads(r.read().decode())
        ws_url = tabs[0]["webSocketDebuggerUrl"]
        print("Connected to WebSocket:", ws_url)

        ws = websocket.create_connection(ws_url)
        msg_id = 1

        # Enable runtime and console
        send_cdp_cmd(ws, msg_id, "Runtime.enable")
        msg_id += 1
        send_cdp_cmd(ws, msg_id, "Page.enable")
        msg_id += 1

        # Navigate to file
        file_path = os.path.abspath("AETHER-9 飞行控制台 v4.html")
        file_url = "file:///" + file_path.replace("\\", "/") + "#engineering"
        print("Navigating to:", file_url)
        send_cdp_cmd(ws, msg_id, "Page.navigate", {"url": file_url})
        msg_id += 1
        time.sleep(2)

        # Check for errors in console or exceptions
        check_errs = evaluate_js(ws, msg_id, "window.__errors || []")
        msg_id += 1
        print("Initial errors:", check_errs)

        # 1. TEST AUTO MODE
        print("\n=== 1. VERIFYING AUTO MODE ===")
        auto_info = evaluate_js(ws, msg_id, """
        (() => {
            const mode = layoutConfig.mode;
            const eng1 = !!document.getElementById('mod-eng1');
            const prop1 = !!document.getElementById('mod-prop1');
            const ctxBox = !!document.getElementById('ctx-box');
            const s1d = !!document.getElementById('mod-s1d');
            const emptyBlocks = Array.from(document.querySelectorAll('*')).filter(el => el.textContent && el.textContent.includes('(空)') && el.offsetWidth > 0);
            const engSvg = document.getElementById('s1-eng-svg');
            const svgWidth = engSvg ? engSvg.getAttribute('width') : null;
            const svgHeight = engSvg ? engSvg.getAttribute('height') : null;

            return {
                mode,
                eng1,
                prop1,
                ctxBox,
                s1d,
                emptyCount: emptyBlocks.length,
                svgWidth,
                svgHeight
            };
        })()
        """)
        msg_id += 1
        print("Auto Mode Info:", json.dumps(auto_info, indent=2))

        take_screenshot(ws, msg_id, "screenshot_auto_mode.png")
        msg_id += 1

        # 2. TEST OPENING LAYOUT DIALOG
        print("\n=== 2. OPENING LAYOUT DIALOG ===")
        dlg_open_res = evaluate_js(ws, msg_id, """
        (() => {
            openLayoutDialog();
            const overlay = document.getElementById('layoutModalOverlay');
            const box = document.getElementById('layoutModalBox');
            const btnAuto = document.getElementById('btnLeModeAuto');
            const btnCust = document.getElementById('btnLeModeCustom');
            const autoPanel = document.getElementById('leAutoPanel');
            const customPanel = document.getElementById('leCustomPanel');

            return {
                overlayDisplay: overlay ? overlay.style.display : null,
                btnAutoActive: btnAuto ? btnAuto.classList.contains('active') : false,
                btnCustActive: btnCust ? btnCust.classList.contains('active') : false,
                autoPanelDisplay: autoPanel ? autoPanel.style.display : null,
                customPanelDisplay: customPanel ? customPanel.style.display : null
            };
        })()
        """)
        msg_id += 1
        print("Dialog Open Res:", json.dumps(dlg_open_res, indent=2))
        take_screenshot(ws, msg_id, "screenshot_layout_dialog_auto.png")
        msg_id += 1

        # 3. SWITCH TO CUSTOM MODE IN DIALOG
        print("\n=== 3. SWITCHING TO CUSTOM MODE IN DIALOG ===")
        switch_cust_res = evaluate_js(ws, msg_id, """
        (() => {
            const btnCust = document.getElementById('btnLeModeCustom');
            if (btnCust) btnCust.click();
            const autoPanel = document.getElementById('leAutoPanel');
            const customPanel = document.getElementById('leCustomPanel');
            const leftSelects = document.querySelectorAll('.slot-select-l');
            const rightSelects = document.querySelectorAll('.slot-select-r');

            return {
                autoPanelDisplay: autoPanel ? autoPanel.style.display : null,
                customPanelDisplay: customPanel ? customPanel.style.display : null,
                leftSelectsCount: leftSelects.length,
                rightSelectsCount: rightSelects.length
            };
        })()
        """)
        msg_id += 1
        print("Switch to Custom in Dialog:", json.dumps(switch_cust_res, indent=2))
        take_screenshot(ws, msg_id, "screenshot_layout_dialog_custom.png")
        msg_id += 1

        # 4. APPLY CUSTOM LAYOUT (LAUNCH PRESET)
        print("\n=== 4. APPLYING LAUNCH PRESET ===")
        apply_res = evaluate_js(ws, msg_id, """
        (() => {
            // Click launch preset
            const launchBtn = document.querySelector('.le-preset-btn[data-p="launch"]');
            if (launchBtn) launchBtn.click();
            
            // Click Apply
            const applyBtn = document.getElementById('btnLayoutApply');
            if (applyBtn) applyBtn.click();

            const overlay = document.getElementById('layoutModalOverlay');
            const mode = layoutConfig.mode;
            const leftCards = document.getElementById('customLeftCards');
            const rightCards = document.getElementById('customRightCards');
            const lCardCount = leftCards ? leftCards.children.length : 0;
            const rCardCount = rightCards ? rightCards.children.length : 0;
            const emptyBlocks = Array.from(document.querySelectorAll('*')).filter(el => el.textContent && el.textContent.includes('(空)') && el.offsetWidth > 0);

            return {
                overlayDisplay: overlay ? overlay.style.display : null,
                mode,
                lCardCount,
                rCardCount,
                emptyCount: emptyBlocks.length,
                configLeft: layoutConfig.left,
                configRight: layoutConfig.right
            };
        })()
        """)
        msg_id += 1
        print("Apply Launch Preset Res:", json.dumps(apply_res, indent=2))
        time.sleep(1)
        take_screenshot(ws, msg_id, "screenshot_custom_mode_launch.png")
        msg_id += 1

        # 5. TEST (无) HIDING LOGIC (Set some slots to 'none')
        print("\n=== 5. TESTING NONE HIDING LOGIC ===")
        none_res = evaluate_js(ws, msg_id, """
        (() => {
            openLayoutDialog();
            const btnCust = document.getElementById('btnLeModeCustom');
            if (btnCust) btnCust.click();

            // Set Left slot 3, 4 to none
            const leftSelects = document.querySelectorAll('.slot-select-l');
            if (leftSelects[2]) { leftSelects[2].value = 'none'; leftSelects[2].dispatchEvent(new Event('change')); }
            if (leftSelects[3]) { leftSelects[3].value = 'none'; leftSelects[3].dispatchEvent(new Event('change')); }

            // Set Right slot 4, 5 to none
            const rightSelects = document.querySelectorAll('.slot-select-r');
            if (rightSelects[3]) { rightSelects[3].value = 'none'; rightSelects[3].dispatchEvent(new Event('change')); }
            if (rightSelects[4]) { rightSelects[4].value = 'none'; rightSelects[4].dispatchEvent(new Event('change')); }

            // Apply
            document.getElementById('btnLayoutApply').click();

            const leftCards = document.getElementById('customLeftCards');
            const rightCards = document.getElementById('customRightCards');
            const emptyBlocks = Array.from(document.querySelectorAll('*')).filter(el => el.textContent && el.textContent.includes('(空)') && el.offsetWidth > 0);

            return {
                lCardCount: leftCards ? leftCards.children.length : 0,
                rCardCount: rightCards ? rightCards.children.length : 0,
                emptyCount: emptyBlocks.length,
                configLeft: layoutConfig.left,
                configRight: layoutConfig.right
            };
        })()
        """)
        msg_id += 1
        print("None Hiding Res:", json.dumps(none_res, indent=2))
        take_screenshot(ws, msg_id, "screenshot_custom_mode_none_hidden.png")
        msg_id += 1

        # 6. SWITCH BACK TO AUTO MODE
        print("\n=== 6. SWITCHING BACK TO AUTO MODE ===")
        back_auto_res = evaluate_js(ws, msg_id, """
        (() => {
            openLayoutDialog();
            document.getElementById('btnLeModeAuto').click();
            document.getElementById('btnLayoutApply').click();

            const mode = layoutConfig.mode;
            const eng1 = !!document.getElementById('mod-eng1');
            const prop1 = !!document.getElementById('mod-prop1');
            const ctxBox = !!document.getElementById('ctx-box');
            const s1d = !!document.getElementById('mod-s1d');
            const emptyBlocks = Array.from(document.querySelectorAll('*')).filter(el => el.textContent && el.textContent.includes('(空)') && el.offsetWidth > 0);

            return {
                mode,
                eng1,
                prop1,
                ctxBox,
                s1d,
                emptyCount: emptyBlocks.length
            };
        })()
        """)
        msg_id += 1
        print("Back to Auto Res:", json.dumps(back_auto_res, indent=2))
        take_screenshot(ws, msg_id, "screenshot_back_to_auto.png")
        msg_id += 1

        # 7. TEST STAGE 2 SWITCH IN AUTO MODE
        print("\n=== 7. TESTING STAGE 2 TRANSITION IN AUTO MODE ===")
        s2_res = evaluate_js(ws, msg_id, """
        (() => {
            t = 165; // After separation
            draw();

            const modEng2 = !!document.getElementById('mod-eng2');
            const modProp2 = !!document.getElementById('mod-prop2');
            const rHdr = document.getElementById('rZoneHdr') ? document.getElementById('rZoneHdr').textContent : null;
            const lHdr = document.getElementById('lZoneHdr') ? document.getElementById('lZoneHdr').textContent : null;

            return {
                modEng2,
                modProp2,
                rHdr,
                lHdr
            };
        })()
        """)
        msg_id += 1
        print("Stage 2 Transition Res:", json.dumps(s2_res, indent=2))
        take_screenshot(ws, msg_id, "screenshot_auto_stage2.png")
        msg_id += 1

        # 8. TEST ENGINE CLICK / FAULT INJECTION IN AUTO & CUSTOM MODES
        print("\n=== 8. TESTING ENGINE FAULT TOGGLE ===")
        fault_res = evaluate_js(ws, msg_id, """
        (() => {
            t = 10;
            draw();
            const g0 = document.querySelector('g[data-e="0"]');
            if (g0) g0.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            const statText = document.getElementById('e1-stat') ? document.getElementById('e1-stat').textContent : '';
            return {
                fl0: fl[0],
                statText
            };
        })()
        """)
        msg_id += 1
        print("Fault Toggle Res:", json.dumps(fault_res, indent=2))

        ws.close()
        print("\nALL CDP TESTS COMPLETED SUCCESSFULLY!")

    finally:
        proc.terminate()
        proc.wait()

if __name__ == '__main__':
    main()
