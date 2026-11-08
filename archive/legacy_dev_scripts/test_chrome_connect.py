import subprocess
import time
import os
import shutil
import urllib.request

prof_dir = os.path.abspath("temp_chrome_profile")
cmd = [
    r"C:\Program Files\Google\Chrome\Application\chrome.exe",
    "--headless=new",
    "--no-sandbox",
    "--disable-gpu",
    f"--user-data-dir={prof_dir}",
    "--remote-debugging-port=9222",
    "--remote-debugging-address=127.0.0.1",
    "about:blank"
]
proc = subprocess.Popen(cmd)
print("PID:", proc.pid)

for i in range(10):
    time.sleep(1)
    try:
        with urllib.request.urlopen("http://127.0.0.1:9222/json/version", timeout=1) as r:
            print("Connected at attempt", i+1, ":", r.read().decode())
            break
    except Exception as e:
        print(f"Attempt {i+1} failed: {e}")

proc.terminate()
proc.wait()
