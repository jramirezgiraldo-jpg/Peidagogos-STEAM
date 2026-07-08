import re

with open('iniciar_clase.py', 'r', encoding='utf-8') as f:
    pycode = f.read()

# I will find def do_POST(self):
# and replace the whole function with a wrapper that writes to debug.txt.

new_dopost = '''    def do_POST(self):
        try:
            self._real_do_POST()
        except Exception as e:
            import traceback
            with open('debug.txt', 'w', encoding='utf-8') as f:
                f.write(traceback.format_exc())
            raise

    def _real_do_POST(self):
'''

pycode = pycode.replace('    def do_POST(self):', new_dopost)

with open('iniciar_clase.py', 'w', encoding='utf-8') as f:
    f.write(pycode)
