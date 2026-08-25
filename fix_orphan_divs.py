with open(r'd:\Peidagogos_Oficial\login.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove the orphan </div> on the line after <!-- fin student-dashboard-container -->
target = '</div> <!-- fin student-dashboard-container -->\n\n    </div>\n'
replacement = '</div> <!-- fin student-dashboard-container -->\n\n'

if target in content:
    content = content.replace(target, replacement, 1)
    with open(r'd:\Peidagogos_Oficial\login.html', 'w', encoding='utf-8') as f:
        f.write(content)
    print('OK: Removed orphan </div> after student-dashboard-container')
else:
    # Try with \r\n
    target2 = '</div> <!-- fin student-dashboard-container -->\r\n\r\n    </div>\r\n'
    replacement2 = '</div> <!-- fin student-dashboard-container -->\r\n\r\n'
    if target2 in content:
        content = content.replace(target2, replacement2, 1)
        with open(r'd:\Peidagogos_Oficial\login.html', 'w', encoding='utf-8') as f:
            f.write(content)
        print('OK: Removed orphan </div> (CRLF variant)')
    else:
        print('NOT FOUND - trying line-based approach')
        lines = content.split('\n')
        for i, l in enumerate(lines):
            if 'fin student-dashboard-container' in l:
                print(f'Found at line {i+1}')
                print(f'Next lines: {repr(lines[i+1])} | {repr(lines[i+2])} | {repr(lines[i+3])}')
                break
