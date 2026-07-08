import os
import time

path = r'C:\Users\Juan Felipe\.gemini\antigravity\brain\56933fec-1829-41c4-864a-822a77bd8c41\.system_generated\tasks\task-1491.log'
for _ in range(5):
    if os.path.exists(path):
        with open(path, 'r', encoding='utf-8', errors='ignore') as file:
            content = file.read()
            if 'Exception occurred' in content or 'HTTPError' in content:
                print(content[-2000:])
                break
    time.sleep(1)
