with open('iniciar_clase.py', 'r', encoding='utf-8') as f:
    pycode = f.read()

target = '''            except Exception as e:
                print(f"[!] Error en Login: {e}")'''

injection = '''            except Exception as e:
                with open('DEBUG_LOGIN_ERROR.txt', 'w', encoding='utf-8') as dbg:
                    import traceback
                    dbg.write(traceback.format_exc())
                print(f"[!] Error en Login: {e}")'''

if target in pycode:
    pycode = pycode.replace(target, injection)
    with open('iniciar_clase.py', 'w', encoding='utf-8') as f:
        f.write(pycode)
    print("Injected debug block")
else:
    print("Target not found")
