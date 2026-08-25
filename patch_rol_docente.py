with open(r'd:\Peidagogos_Oficial\app.js', 'r', encoding='utf-8') as f:
    code = f.read()

# FIX 1: Save rolDocente in payloadDocente during token-based registration
old_payload = """        const payloadDocente = {
            documento: docFinal,
            cedula: docFinal,
            usuario: docFinal,
            nombre: nomFinal,
            nombres: nomFinal,
            apellidos: '',
            nombre_completo: nomFinal,
            edad: '35',
            genero: 'otro',
            rol: 'docente',
            tipo: 'docente_regular',
            institucion: ieFinal,
            asignatura: matFinal,
            materias: [matFinal],
            grados: ['6', '7', '8', '9', '10', '11'],
            pago_realizado: true,
            pago_activo: true,
            fecha_registro: new Date().toISOString()
        };"""

new_payload = """        const rolParamReg = (params.get('rol') || '').toLowerCase().trim();
        const esDirectorReg = rolParamReg === 'director';
        const payloadDocente = {
            documento: docFinal,
            cedula: docFinal,
            usuario: docFinal,
            nombre: nomFinal,
            nombres: nomFinal,
            apellidos: '',
            nombre_completo: nomFinal,
            edad: '35',
            genero: 'otro',
            rol: 'docente',
            tipo: esDirectorReg ? 'docente_director' : 'docente_regular',
            rolDocente: esDirectorReg ? 'director' : 'regular',
            es_director: esDirectorReg,
            institucion: ieFinal,
            asignatura: matFinal,
            materias: [matFinal],
            grados: ['6', '7', '8', '9', '10', '11'],
            pago_realizado: true,
            pago_activo: true,
            fecha_registro: new Date().toISOString()
        };"""

if old_payload in code:
    code = code.replace(old_payload, new_payload, 1)
    print('FIX 1: rolDocente saved in registration payload OK')
else:
    print('FIX 1: NOT FOUND')

# FIX 2: After setting window.rolDocente from URL, also persist to localStorage
old_rol_set = """        const rolParam = params.get('rol');
        if (rolParam) {
            window.rolDocente = rolParam.toLowerCase().trim();
        }"""

new_rol_set = """        const rolParam = params.get('rol');
        if (rolParam) {
            const rolNorm = rolParam.toLowerCase().trim();
            window.rolDocente = rolNorm;
            // Persist so it survives page reloads and normal logins
            try {
                localStorage.setItem('rolDocente_' + docFinal, rolNorm);
            } catch(e) {}
        }"""

if old_rol_set in code:
    code = code.replace(old_rol_set, new_rol_set, 1)
    print('FIX 2: rolDocente localStorage persist OK')
else:
    print('FIX 2: NOT FOUND')

# FIX 3: In obtenerDatosDocenteSesion, check localStorage fallback
old_fallback = """    if (!rolDoc) rolDoc = 'regular';
    window.rolDocente = rolDoc;"""

new_fallback = """    // FALLBACK: Check localStorage persisted role key
    if (!rolDoc || rolDoc === 'regular') {
        try {
            const persisted = localStorage.getItem('rolDocente_' + doc);
            if (persisted) rolDoc = persisted;
        } catch(e) {}
    }
    if (!rolDoc) rolDoc = 'regular';
    window.rolDocente = rolDoc;"""

if old_fallback in code:
    code = code.replace(old_fallback, new_fallback, 1)
    print('FIX 3: localStorage fallback in obtenerDatosDocenteSesion OK')
else:
    print('FIX 3: NOT FOUND')

with open(r'd:\Peidagogos_Oficial\app.js', 'w', encoding='utf-8') as f:
    f.write(code)

print('All fixes applied')
