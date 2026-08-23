import re

with open(r'd:\Peidagogos_Oficial\app.js', 'r', encoding='utf-8') as f:
    app = f.read()

target = """window.generarInvitacionDocenteIntransferible = function() {
    const selIE = document.getElementById('admin-inv-ie-select');
    const ie = selIE ? selIE.value : 'IE Instituto Montenegro';
    const nombre = "Enlace General Docentes";
    const documento = "";
    const materia = "Todas";

    // Generar token único intransferible
    const token = 'TK-DOC-' + Math.random().toString(36).substring(2, 9).toUpperCase();
    const baseUrl = window.location.origin + window.location.pathname;
    const urlFinal = `${baseUrl}?reg=docente&ie=${encodeURIComponent(ie)}`;"""

replacement = """window.generarInvitacionDocenteIntransferible = function() {
    const selIE = document.getElementById('admin-inv-ie-select');
    const selRol = document.getElementById('admin-inv-rol-select');
    
    const ie = selIE ? selIE.value : 'IE Instituto Montenegro';
    const rol = (selRol && selRol.value) ? selRol.value : 'director';
    
    const nombre = "Enlace General Docentes";
    const documento = "";
    const materia = "Todas";

    // Generar token único intransferible
    const token = 'TK-DOC-' + Math.random().toString(36).substring(2, 9).toUpperCase();
    const baseUrl = window.location.origin + window.location.pathname;
    const urlFinal = `${baseUrl}?reg=docente&ie=${encodeURIComponent(ie)}&rol=${encodeURIComponent(rol)}`;"""

app = app.replace(target, replacement)

with open(r'd:\Peidagogos_Oficial\app.js', 'w', encoding='utf-8') as f:
    f.write(app)

print('app.js admin patched')
