with open('iniciar_clase.py', 'r', encoding='utf-8') as f:
    pycode = f.read()

target = '''    def do_POST(self):

        parsed_path = urlparse(self.path)'''

injection = '''    def do_POST(self):
        try:
            self._do_POST_inner()
        except Exception as e:
            import traceback
            with open("POST_CRASH.log", "w", encoding='utf-8') as crashf:
                crashf.write(traceback.format_exc())
            self.send_response(500)
            self.send_header('Content-Type', 'text/plain')
            self.end_headers()
            self.wfile.write(str(e).encode('utf-8'))

    def _do_POST_inner(self):
        parsed_path = urlparse(self.path)'''

pycode = pycode.replace(target, injection)

with open('iniciar_clase.py', 'w', encoding='utf-8') as f:
    f.write(pycode)
print("Injected global try-catch")
