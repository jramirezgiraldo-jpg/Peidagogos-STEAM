with open(r'd:\Peidagogos_Oficial\login.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

start = 0
end = 0
for i, l in enumerate(lines):
    if 'id="student-main-content"' in l and start == 0:
        start = i
    if 'fin dashboard-screen-container' in l:
        end = i

print(f"Start: {start}, End: {end}")
html_block = "".join(lines[start:end+1])

opens = html_block.count('<div')
closes = html_block.count('</div')
print(f"Opens: {opens}, Closes: {closes}")
