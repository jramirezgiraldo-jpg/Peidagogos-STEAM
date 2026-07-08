import py_compile
import sys

try:
    py_compile.compile('iniciar_clase.py', doraise=True)
    print("Syntax OK")
except Exception as e:
    print(e)
