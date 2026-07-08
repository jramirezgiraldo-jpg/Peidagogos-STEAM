const mockOvaData = {
    6: {
        1: {
            1: {
                titulo: "La Célula: Unidad de Vida",
                texto_inductivo: "En el año 2077, una expedición a la luna Europa descubrió formas de vida microscópicas bajo el hielo. Estas entidades, similares a nuestras células terrestres, abrieron un nuevo capítulo en la biología astrobiológica. Comprender cómo funciona la célula no es solo una lección de ciencias; es la llave para entender nuestra propia existencia y la de cualquier otro ser vivo en el cosmos. \n\n Todo ser vivo está formado por células. Desde la bacteria más sencilla hasta la ballena azul más gigantesca, la unidad básica funcional es la célula. Poseen maquinaria increíblemente sofisticada: mitocondrias que actúan como plantas de energía, un núcleo que resguarda el código genético (ADN) como una bóveda acorazada, y membranas que deciden qué entra y qué sale con la precisión de un control aduanero estricto.\n\n Al adentrarte en esta misión, tu tarea será decodificar estos componentes. Identificarás cómo las organelas trabajan juntas en armonía para mantener la vida. ¿Estás listo para reducir tu tamaño a escala nanométrica y explorar el universo interior?",
                sopa_letras: {
                    letras: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
                    palabras: ["CELULA", "NUCLEO", "MEMBRANA", "MITOCONDRIA", "RIBOSOMA", "VACUOLA", "CITOPLASMA", "CLOROPLASTO", "LISOSOMA", "GOLGI"]
                },
                drag_drop_letras: [
                    { palabra: "NUCLEO", letras: ["C", "L", "O", "N", "E", "U"] },
                    { palabra: "CELULA", letras: ["E", "L", "C", "A", "L", "U"] },
                    { palabra: "TEJIDO", letras: ["D", "I", "J", "E", "O", "T"] },
                    { palabra: "ORGANO", letras: ["O", "N", "G", "R", "A", "O"] },
                    { palabra: "SISTEMA", letras: ["M", "A", "E", "T", "S", "I", "S"] }
                ],
                texto_deductivo: "Al explorar las intrincadas redes del citoplasma, hemos comprendido que la vida a nivel microscópico es una danza de interacciones químicas y físicas perfectas. Cada orgánulo tiene un rol definido que no puede ser sustituido. \n\n El transporte de nutrientes a través de la membrana plasmática, ya sea activo o pasivo, demuestra una regulación térmica y de fluidos que la ingeniería humana apenas comienza a imitar. Así mismo, la síntesis de proteínas en los ribosomas, dictada por los planos del ARN mensajero, es una línea de ensamblaje impecable.\n\n Has concluido la observación deductiva de esta misión. Ahora es momento de aplicar este conocimiento en situaciones prácticas. Demuestra que no solo recuerdas los nombres de estos elementos, sino que comprendes la trascendencia de sus interacciones.",
                drag_drop_frases: [
                    { frase: "LA CELULA ES LA UNIDAD DE VIDA", palabras: ["UNIDAD", "CELULA", "VIDA", "LA", "ES", "LA", "DE"] },
                    { frase: "EL NUCLEO CONTIENE EL ADN", palabras: ["EL", "CONTIENE", "ADN", "EL", "NUCLEO"] },
                    { frase: "MITOCONDRIA GENERA LA ENERGIA", palabras: ["GENERA", "MITOCONDRIA", "ENERGIA", "LA"] },
                    { frase: "RIBOSOMAS SINTETIZAN LAS PROTEINAS", palabras: ["PROTEINAS", "RIBOSOMAS", "LAS", "SINTETIZAN"] },
                    { frase: "MEMBRANA PROTEGE A LA CELULA", palabras: ["LA", "MEMBRANA", "CELULA", "A", "PROTEGE"] }
                ],
                evaluacion_icfes: [
                    {
                        competencia: "Explicación de Fenómenos",
                        contexto: "Un investigador observa en el microscopio una célula que posee una pared rígida y cloroplastos verdes, pero carece de centriolos.",`n                        recurso_grafico: "<table class='icfes-table'><tr><th>Organelo</th><th>Presencia</th></tr><tr><td>Cloroplastos</td><td>Sí</td></tr><tr><td>Pared Celular</td><td>Sí</td></tr><tr><td>Centriolos</td><td>No</td></tr></table>",
                        enunciado: "Basado en la observación, ¿qué tipo de célula está estudiando el investigador?",
                        opciones: ["Célula Animal", "Célula Vegetal", "Célula Fúngica", "Bacteria Protista"],
                        clave: "Célula Vegetal",
                        justificacion: "La presencia de pared celular (celulosa) y cloroplastos es característica exclusiva de las células vegetales en estos taxones."
                    }
                ],
                cuaderno_mision: "Dibuja una célula vegetal y una célula animal, señalando al menos 5 diferencias fundamentales entre ambas. Escribe un párrafo explicando por qué las plantas necesitan pared celular.",
                crucigrama: [
                    { pista: "Centro de control de la célula", respuesta: "NUCLEO", orientacion: "H", x: 1, y: 1 },
                    { pista: "Unidad funcional de los seres vivos", respuesta: "CELULA", orientacion: "V", x: 3, y: 1 },
                    { pista: "Líquido gelatinoso interior", respuesta: "CITOPLASMA", orientacion: "H", x: 1, y: 3 },
                    { pista: "Generador de energía", respuesta: "MITOCONDRIA", orientacion: "V", x: 8, y: 2 },
                    { pista: "Fabrica proteínas", respuesta: "RIBOSOMA", orientacion: "H", x: 6, y: 5 },
                    { pista: "Capa protectora exterior", respuesta: "MEMBRANA", orientacion: "V", x: 6, y: 4 },
                    { pista: "Almacén de agua", respuesta: "VACUOLA", orientacion: "H", x: 3, y: 7 },
                    { pista: "Realiza fotosíntesis", respuesta: "CLOROPLASTO", orientacion: "V", x: 10, y: 1 },
                    { pista: "Recicla desechos", respuesta: "LISOSOMA", orientacion: "H", x: 5, y: 9 },
                    { pista: "Empaqueta proteínas", respuesta: "GOLGI", orientacion: "V", x: 12, y: 4 }
                ]
            }
        }
    }
};

