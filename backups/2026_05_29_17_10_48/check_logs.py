import os

path = r'C:\Users\Juan Felipe\.gemini\antigravity\brain\56933fec-1829-41c4-864a-822a77bd8c41\.system_generated\tasks'
for f in os.listdir(path):
    if f.endswith('.log'):
        with open(os.path.join(path, f), 'r', encoding='utf-8') as file:
            content = file.read()
            if 'Error' in content or 'Traceback' in content:
                print(f"--- {f} ---")
                print(content[-500:])
