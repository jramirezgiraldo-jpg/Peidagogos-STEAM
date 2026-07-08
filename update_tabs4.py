with open('app.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Buscamos el inicio y el fin del bloque
start_idx = js.find('// L\ufffdgica de Pesta\ufffdas')
if start_idx == -1:
    start_idx = js.find('// Lgica de Pestaas')
if start_idx == -1:
    start_idx = js.find('const tabBtns = document.querySelectorAll(')
    # retrocedemos a la linea anterior
    start_idx = js.rfind('\n', 0, start_idx)

end_str = '});\n          });\n      });\n  }\n  });'
end_idx = js.find(end_str, start_idx)

if end_idx != -1:
    end_idx += len(end_str)
    
    new_logic = '''// Lógica de Pestañas (Tabs) Estricta
  const tabBtns = document.querySelectorAll('.tab-btn');
  if (tabBtns.length > 0) {
      tabBtns.forEach(btn => {
          btn.addEventListener('click', function(e) {
              e.preventDefault();
              
              // 1. Capturar el clic
              const id_capturado = this.getAttribute('data-target') ? this.getAttribute('data-target').trim().toLowerCase() : '';
              console.log("Pestaña clickeada:", id_capturado);
              
              if (!id_capturado) return;
              
              // 2. Manejo de Estilos visuales
              tabBtns.forEach(b => {
                  b.classList.remove('activa', 'active');
                  b.style.borderBottom = '3px solid transparent';
                  b.style.color = '#6B7280';
              });
              this.classList.add('activa', 'active');
              this.style.borderBottom = '3px solid #3B82F6';
              this.style.color = '#3B82F6';
              
              // 3. Ocultar todos los .vista-grado
              const todasLasVistas = document.querySelectorAll('.vista-grado');
              console.log("Ocultando " + todasLasVistas.length + " contenedores.");
              todasLasVistas.forEach(vista => {
                  vista.style.display = 'none';
              });
              
              // 4. Mostrar solo el div con el ID correspondiente
              const mallaActiva = document.getElementById('contenido-grado-' + id_capturado);
              if (mallaActiva) {
                  mallaActiva.style.display = 'block';
                  console.log("Mostrando div: contenido-grado-" + id_capturado);
              } else {
                  console.log("Error: div contenido-grado-" + id_capturado + " no encontrado.");
              }
              
              // (Extra opcional: ocultar filas de estudiantes que no coincidan)
              document.querySelectorAll('.fila-estudiante').forEach(fila => {
                  const filaGrado = fila.getAttribute('data-grado') ? fila.getAttribute('data-grado').replace('°', '').trim().toLowerCase() : '';
                  if (filaGrado === id_capturado) {
                      fila.style.display = 'table-row';
                  } else {
                      fila.style.display = 'none';
                  }
              });
          });
      });
  }
});'''
    
    new_js = js[:start_idx] + '\n  ' + new_logic + js[end_idx:]
    with open('app.js', 'w', encoding='utf-8') as f:
        f.write(new_js)
    with open('js/app.js', 'w', encoding='utf-8') as f:
        f.write(new_js)
    print("Reemplazo exitoso mediante indices de string.")
else:
    print("No se encontro el final del bloque.")
