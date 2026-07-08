with open('iniciar_clase.py', 'r', encoding='utf-8') as f:
    pycode = f.read()

bad_wrapper = '''    def do_POST(self):
        try:
            self._real_do_POST()
        except Exception as e:
            import traceback
            with open('debug.txt', 'w', encoding='utf-8') as f:
                f.write(traceback.format_exc())
            raise

    def _real_do_POST(self):'''

pycode = pycode.replace(bad_wrapper, '    def do_POST(self):')

with open('iniciar_clase.py', 'w', encoding='utf-8') as f:
    f.write(pycode)
