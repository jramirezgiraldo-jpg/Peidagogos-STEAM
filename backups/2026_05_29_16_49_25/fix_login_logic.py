with open('iniciar_clase.py', 'r', encoding='utf-8') as f:
    pycode = f.read()

target = '''            except Exception as e:
                with open('DEBUG_LOGIN_ERROR.txt', 'w', encoding='utf-8') as dbg:
                    import traceback
                    dbg.write(traceback.format_exc())
                print(f"[!] Error en Login: {e}")
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))
                return'''

clean = '''            except Exception as e:
                import traceback
                print(f"[!] Error en Login: {e}")
                traceback.print_exc()
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))
                return'''

pycode = pycode.replace(target, clean)

# Also let's add a return to the success block!
target2 = '''                if encontrado:
                    print(f"[✅] ACCESO CONCEDIDO: Estudiante {nombre_estudiante}")
                    self.wfile.write(json.dumps({"status": "success", "nombre": nombre_estudiante}).encode('utf-8'))
                else:
                    print(f"[❌] ACCESO DENEGADO: Intento fallido con doc {usuario_input}")
                    self.wfile.write(json.dumps({"status": "error", "message": "Credenciales inválidas"}).encode('utf-8'))'''

clean2 = '''                if encontrado:
                    print(f"[✅] ACCESO CONCEDIDO: Estudiante {nombre_estudiante}")
                    self.wfile.write(json.dumps({"status": "success", "nombre": nombre_estudiante}).encode('utf-8'))
                    return
                else:
                    print(f"[❌] ACCESO DENEGADO: Intento fallido con doc {usuario_input}")
                    self.wfile.write(json.dumps({"status": "error", "message": "Credenciales inválidas"}).encode('utf-8'))
                    return'''

pycode = pycode.replace(target2, clean2)

with open('iniciar_clase.py', 'w', encoding='utf-8') as f:
    f.write(pycode)
print("Fixed!")
