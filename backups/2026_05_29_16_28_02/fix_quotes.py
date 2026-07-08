with open('js/app.js', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('await fetch(http:// + host + :8080/api/admin/generar-semana', 'await fetch("http://" + host + ":8080/api/admin/generar-semana"')
content = content.replace('await fetch(http:// + host + :8080/api/admin/progreso-generacion)', 'await fetch("http://" + host + ":8080/api/admin/progreso-generacion")')
content = content.replace('statusText.textContent = Generadas:  + data.current +  /  + data.total;', 'statusText.textContent = "Generadas: " + data.current + " / " + data.total;')
content = content.replace('await fetch(http:// + host + :8080/api/conexion)', 'await fetch("http://" + host + ":8080/api/conexion")')
content = content.replace('ipDisplay.textContent = http:// + data.ip + : + data.puerto;', 'ipDisplay.textContent = "http://" + data.ip + ":" + data.puerto;')

with open('js/app.js', 'w', encoding='utf-8') as f:
    f.write(content)
