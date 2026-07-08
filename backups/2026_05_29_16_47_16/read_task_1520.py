import os
path = r'C:\Users\Juan Felipe\.gemini\antigravity\brain\56933fec-1829-41c4-864a-822a77bd8c41\.system_generated\tasks\task-1520.log'
if os.path.exists(path):
    with open(path, 'r', encoding='utf-8', errors='ignore') as f:
        print(f.read())
