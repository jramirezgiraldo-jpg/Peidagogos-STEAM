import re

with open(r'd:\Peidagogos_Oficial\login.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Track div depth through the document
stack = []
issues = []
lines = content.split('\n')
depth = 0

for i, line in enumerate(lines, 1):
    opens = len(re.findall(r'<div[\s>]', line))
    closes = len(re.findall(r'</div>', line))
    depth += opens - closes
    if depth < 0:
        issues.append(f"Line {i}: Depth went negative ({depth}) — extra </div>: {line.strip()[:80]}")
        depth = 0  # reset to continue tracing

print(f"Final depth: {depth} (should be 0)")
print(f"Issues found: {len(issues)}")
for iss in issues[:10]:
    print(iss)
