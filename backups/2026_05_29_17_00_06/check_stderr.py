import os
import time

path = 'server_stderr.txt'
for _ in range(5):
    if os.path.exists(path):
        with open(path, 'r', encoding='utf-8', errors='ignore') as file:
            content = file.read()
            if 'Exception occurred' in content:
                print(content[-2000:])
                break
    time.sleep(1)
