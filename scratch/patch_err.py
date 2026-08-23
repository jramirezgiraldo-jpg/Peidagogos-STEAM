import re

with open(r'd:\Peidagogos_Oficial\server.js', 'r', encoding='utf-8') as f:
    srv = f.read()

target = """                const parsed = JSON.parse(responseText);
                res.json(parsed);
            } catch(e) {
                console.error("JSON parse error from IA:", e, "Raw:", responseText);
                res.status(500).json({ error: "Respuesta IA no válida" });
            }
        } else {
            res.status(500).json({ error: "No se pudo generar con IA." });
        }
    } catch (error) {
        console.error("Error general AI:", error);
        res.status(500).json({ error: "Falló la generación AI." });
    }"""

replacement = """                const parsed = JSON.parse(responseText);
                res.json(parsed);
            } catch(e) {
                console.error("JSON parse error from IA:", e, "Raw:", responseText);
                res.status(500).json({ error: "Respuesta IA no válida: " + e.message, raw: responseText });
            }
        } else {
            res.status(500).json({ error: "Respuesta vacía de DeepSeek." });
        }
    } catch (error) {
        console.error("Error general AI:", error);
        res.status(500).json({ error: "Excepción en el backend: " + error.message });
    }"""

srv = srv.replace(target, replacement)

with open(r'd:\Peidagogos_Oficial\server.js', 'w', encoding='utf-8') as f:
    f.write(srv)
print('server.js error reporting patched')
