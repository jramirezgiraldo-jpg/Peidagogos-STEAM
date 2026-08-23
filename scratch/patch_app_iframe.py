import re
with open(r'd:\Peidagogos_Oficial\app.js', 'r', encoding='utf-8') as f:
    app = f.read()

target = """            let deck = { slides: [] };
            if (result.diapositivas) {
                deck.slides = result.diapositivas.map((s, i) => ({
                    numero: i + 1,
                    titulo: s.titulo || s.title || `Diapositiva ${i+1}`,
                    contenido_html: s.contenido_html || s.content || `<p>${s.texto || ''}</p>`,
                    notas_orador: s.notas_orador || s.notes || ''
                }));
            } else {
                // If it returns raw HTML string instead of object
                deck.slides = [
                    { numero: 1, titulo: "Presentacin", contenido_html: result.html || result.contenido_html || JSON.stringify(result) }
                ];
            }
            window.cerrarConfiguradorDiapositivas();
            window.abrirPresentadorDiapositivas(deck);"""

target2 = target.replace('"Presentacin"', "'Presentación'")

replacement = """            window.cerrarConfiguradorDiapositivas();
            
            if (result.html) {
                const fullHTML = result.html;
                let modalPresentacion = document.getElementById('modal-presentacion-html-fullscreen');
                if (!modalPresentacion) {
                    modalPresentacion = document.createElement('div');
                    modalPresentacion.id = 'modal-presentacion-html-fullscreen';
                    modalPresentacion.style.position = 'fixed';
                    modalPresentacion.style.top = '0';
                    modalPresentacion.style.left = '0';
                    modalPresentacion.style.width = '100vw';
                    modalPresentacion.style.height = '100vh';
                    modalPresentacion.style.backgroundColor = '#000';
                    modalPresentacion.style.zIndex = '999999';
                    
                    const closeBtn = document.createElement('button');
                    closeBtn.innerHTML = '❌ Cerrar Presentación';
                    closeBtn.style.position = 'absolute';
                    closeBtn.style.top = '20px';
                    closeBtn.style.right = '20px';
                    closeBtn.style.zIndex = '1000000';
                    closeBtn.style.padding = '10px 20px';
                    closeBtn.style.background = '#EF4444';
                    closeBtn.style.color = 'white';
                    closeBtn.style.border = 'none';
                    closeBtn.style.borderRadius = '8px';
                    closeBtn.style.cursor = 'pointer';
                    closeBtn.style.fontWeight = 'bold';
                    closeBtn.onclick = () => { modalPresentacion.style.display = 'none'; };
                    
                    const iframe = document.createElement('iframe');
                    iframe.id = 'iframe-presentacion-html';
                    iframe.style.width = '100%';
                    iframe.style.height = '100%';
                    iframe.style.border = 'none';
                    
                    modalPresentacion.appendChild(closeBtn);
                    modalPresentacion.appendChild(iframe);
                    document.body.appendChild(modalPresentacion);
                }
                
                modalPresentacion.style.display = 'block';
                const iframeDoc = document.getElementById('iframe-presentacion-html').contentWindow.document;
                iframeDoc.open();
                iframeDoc.write(fullHTML);
                iframeDoc.close();
            } else {
                let deck = { slides: [] };
                if (result.diapositivas) {
                    deck.slides = result.diapositivas.map((s, i) => ({
                        numero: i + 1,
                        titulo: s.titulo || s.title || `Diapositiva ${i+1}`,
                        contenido_html: s.contenido_html || s.content || `<p>${s.texto || ''}</p>`,
                        notas_orador: s.notas_orador || s.notes || ''
                    }));
                } else {
                    deck.slides = [ { numero: 1, titulo: 'Presentación', contenido_html: result.contenido_html || JSON.stringify(result) } ];
                }
                window.abrirPresentadorDiapositivas(deck);
            }"""

new_app = app.replace(target, replacement)
if new_app == app:
    new_app = app.replace(target2, replacement)

if new_app == app:
    # Try regex because of formatting
    print('Trying regex patch')
    pattern = re.compile(r'let deck = \{ slides: \[\] \};\s*if \(result\.diapositivas\).*?window\.abrirPresentadorDiapositivas\(deck\);', re.DOTALL)
    new_app = pattern.sub(replacement, app)

if new_app == app:
    print('Failed to patch app.js - could not find target string')
else:
    with open(r'd:\Peidagogos_Oficial\app.js', 'w', encoding='utf-8') as f:
        f.write(new_app)
    print('Successfully patched app.js for Diapositivas HTML iframe')
