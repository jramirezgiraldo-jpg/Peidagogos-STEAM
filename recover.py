import json
import re
import os

log_path = r"C:\Users\Juan Felipe\.gemini\antigravity\brain\1f84c988-662e-4bd3-a50d-f236355e11e3\.system_generated\logs\transcript.jsonl"
file_target = "file:///d:/Peidagogos_Local/server.js"

lines_dict = {}
found = False

with open(log_path, 'r', encoding='utf-8') as f:
    for line in f:
        try:
            data = json.loads(line)
            if data.get('type') == 'VIEW_FILE' and 'content' in data:
                content = data['content']
                if file_target in content:
                    # check if line 1 starts with require
                    if "1: require('dotenv')" in content or "2: const express =" in content:
                        found = True
                        for match in re.finditer(r'^(\d+):\s(.*)$', content, re.MULTILINE):
                            line_num = int(match.group(1))
                            line_text = match.group(2)
                            # Remove trailing \r if present
                            if line_text.endswith('\r'):
                                line_text = line_text[:-1]
                            lines_dict[line_num] = line_text
        except:
            pass

if lines_dict:
    max_line = max(lines_dict.keys())
    output = []
    for i in range(1, max_line + 1):
        output.append(lines_dict.get(i, ""))
    
    with open('server_recovered.js', 'w', encoding='utf-8') as out_f:
        out_f.write('\n'.join(output))
    print(f"Recovered {max_line} lines to server_recovered.js!")
else:
    print("Could not find good server.js lines in logs.")
