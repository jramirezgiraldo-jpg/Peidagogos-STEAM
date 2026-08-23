import re

with open(r'd:\Peidagogos_Oficial\server.js', 'r', encoding='utf-8') as f:
    srv = f.read()

target = """                if (startIdx !== -1 && endIdx !== -1 && endIdx >= startIdx) {
                    responseText = responseText.substring(startIdx, endIdx + 1);
                }
                const parsed = JSON.parse(responseText);"""

replacement = """                if (startIdx !== -1 && endIdx !== -1 && endIdx >= startIdx) {
                    responseText = responseText.substring(startIdx, endIdx + 1);
                }
                responseText = responseText.replace(/,\\s*([\\}\\]])/g, '$1');
                const parsed = JSON.parse(responseText);"""

srv = srv.replace(target, replacement)

with open(r'd:\Peidagogos_Oficial\server.js', 'w', encoding='utf-8') as f:
    f.write(srv)
print('server.js trailing commas patched')
