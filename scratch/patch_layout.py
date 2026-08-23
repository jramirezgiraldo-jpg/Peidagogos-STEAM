import re

html_path = r'd:\Peidagogos_Oficial\login.html'
with open(html_path, 'r', encoding='utf-8') as f:
    html = f.read()

# We need to find the specific block starting from "Proyectar el código QR"
# and ending at "</header>"

start_marker = "Proyecta el código QR institucional gigante en el aula para que tus estudiantes se matriculen en segundos desde el celular."
end_marker = "</header>"

start_idx = html.find(start_marker)
end_idx = html.find(end_marker, start_idx) + len(end_marker)

if start_idx != -1 and end_idx != -1:
    target_block = html[start_idx-112:end_idx] # Includes the <p> opening tag
    
    replacement = """                        <p style="margin: 0; color: #475569; font-size: 0.92rem; line-height: 1.5;">
                            Proyecta el código QR institucional gigante en el aula para que tus estudiantes se matriculen en segundos desde el celular.
                        </p>
                    </div>
                    <button onclick="window.abrirProyectorQRMatricula()" style="margin-top: 18px; background: linear-gradient(135deg, #0284C7, #0369A1); color: white; border: none; padding: 14px; border-radius: 12px; font-weight: 900; font-size: 1rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 4px 15px rgba(2,132,199,0.3);">
                        <span>📱</span> Abrir Proyector QR <span>➔</span>
                    </button>
                </div>
            </div>
        </div>
    </div>
</div>"""
    
    html = html.replace(target_block, replacement)
    
    with open(html_path, 'w', encoding='utf-8') as f:
        f.write(html)
    print("Fixed unclosed tags and deleted old admin header artifact.")
else:
    print("Markers not found!")
