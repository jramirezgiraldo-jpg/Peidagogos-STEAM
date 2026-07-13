import io
import re

with io.open('app.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Replace Completado and En Progreso with Pendiente in the obtenerMateriasPorGrupo function
old_func = '''function obtenerMateriasPorGrupo(grupoName) {
    if (grupoName === '6A' || grupoName === '6B') {
        return [{ nombre: 'Física', horas: '2h', estado: 'Completado', color: '#10B981' }];
    } else if (grupoName === '7A') {
        return [
            { nombre: 'Turismo', horas: '1h', estado: 'Completado', color: '#10B981' },
            { nombre: 'Física', horas: '3h', estado: 'En Progreso', color: '#F59E0B' }
        ];
    } else if (grupoName === '7B') {
        return [
            { nombre: 'Turismo', horas: '1h', estado: 'Completado', color: '#10B981' },
            { nombre: 'Física', horas: '2h', estado: 'En Progreso', color: '#F59E0B' }
        ];
    } else if (grupoName === '7C') {
        return [
            { nombre: 'Turismo', horas: '1h', estado: 'Completado', color: '#10B981' },
            { nombre: 'Ética', horas: '1h', estado: 'Completado', color: '#10B981' },
            { nombre: 'Física', horas: '2h', estado: 'Pendiente', color: '#6B7280' }
        ];
    } else if (grupoName === '8A' || grupoName === '8B' || grupoName === '9A') {
        return [{ nombre: 'Artística', horas: '1h', estado: 'En Progreso', color: '#F59E0B' }];
    } else if (grupoName === '10A' || grupoName === '10D') {
        return [{ nombre: 'Ética', horas: '1h', estado: 'Completado', color: '#10B981' }];
    } else if (grupoName === 'PENS') {
        return [
            { nombre: 'Turismo', horas: '1h', estado: 'Completado', color: '#10B981' },
            { nombre: 'Química', horas: '2h', estado: 'En Progreso', color: '#F59E0B' }
        ];
    } else {
        return [{ nombre: 'Asignaturas Básicas', horas: 'Varias', estado: 'Pendiente', color: '#6B7280' }];
    }
}'''

new_func = '''function obtenerMateriasPorGrupo(grupoName) {
    if (grupoName === '6A' || grupoName === '6B') {
        return [{ nombre: 'Física', horas: '2h', estado: 'Pendiente', color: '#6B7280' }];
    } else if (grupoName === '7A') {
        return [
            { nombre: 'Turismo', horas: '1h', estado: 'Pendiente', color: '#6B7280' },
            { nombre: 'Física', horas: '3h', estado: 'Pendiente', color: '#6B7280' }
        ];
    } else if (grupoName === '7B') {
        return [
            { nombre: 'Turismo', horas: '1h', estado: 'Pendiente', color: '#6B7280' },
            { nombre: 'Física', horas: '2h', estado: 'Pendiente', color: '#6B7280' }
        ];
    } else if (grupoName === '7C') {
        return [
            { nombre: 'Turismo', horas: '1h', estado: 'Pendiente', color: '#6B7280' },
            { nombre: 'Ética', horas: '1h', estado: 'Pendiente', color: '#6B7280' },
            { nombre: 'Física', horas: '2h', estado: 'Pendiente', color: '#6B7280' }
        ];
    } else if (grupoName === '8A' || grupoName === '8B' || grupoName === '9A') {
        return [{ nombre: 'Artística', horas: '1h', estado: 'Pendiente', color: '#6B7280' }];
    } else if (grupoName === '10A' || grupoName === '10D') {
        return [{ nombre: 'Ética', horas: '1h', estado: 'Pendiente', color: '#6B7280' }];
    } else if (grupoName === 'PENS') {
        return [
            { nombre: 'Turismo', horas: '1h', estado: 'Pendiente', color: '#6B7280' },
            { nombre: 'Química', horas: '2h', estado: 'Pendiente', color: '#6B7280' }
        ];
    } else {
        return [{ nombre: 'Asignaturas Básicas', horas: 'Varias', estado: 'Pendiente', color: '#6B7280' }];
    }
}'''

if old_func in js:
    js = js.replace(old_func, new_func)

with io.open('app.js', 'w', encoding='utf-8') as f:
    f.write(js)
