const fs = require('fs');
let file = fs.readFileSync('d:/Peidagogos_Local/proyector.html', 'utf8');

const targetHead = `</head>`;
const newHead = `
    <!-- Mermaid & ABCJS for visual schemas -->
    <script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/abcjs/6.2.2/abcjs-basic-min.js"></script>
    <script>
        document.addEventListener("DOMContentLoaded", function() {
            if (window.mermaid) {
                mermaid.initialize({ startOnLoad: false, theme: 'default' });
            }
        });
    </script>
</head>`;

const targetRender = `            const customArea = document.getElementById('slide-custom-area');
            customArea.innerHTML = slide.customHtml || "";`;
const newRender = `            const customArea = document.getElementById('slide-custom-area');
            customArea.innerHTML = slide.customHtml || "";
            
            // Re-render Mermaid
            if (window.mermaid) {
                const mermaidDivs = customArea.querySelectorAll('.mermaid');
                if (mermaidDivs.length > 0) {
                    try {
                        mermaid.init(undefined, mermaidDivs);
                    } catch (e) {
                        console.error("Error rendering mermaid:", e);
                    }
                }
            }
            
            // Re-render ABCJS
            if (window.ABCJS) {
                const abcDivs = customArea.querySelectorAll('.abc-music');
                abcDivs.forEach((div, idx) => {
                    const uniqueId = 'abc-proyector-' + Date.now() + '-' + idx;
                    const code = div.innerText.trim();
                    div.id = uniqueId;
                    div.innerText = "";
                    try {
                        ABCJS.renderAbc(uniqueId, code, { responsive: 'resize' });
                    } catch(e) {
                        console.error("Error rendering abcjs:", e);
                    }
                });
            }`;

let patched = false;
if (file.includes(targetHead) && file.includes(targetRender)) {
    file = file.replace(targetHead, newHead);
    file = file.replace(targetRender, newRender);
    fs.writeFileSync('d:/Peidagogos_Local/proyector.html', file, 'utf8');
    patched = true;
    console.log('Patched proyector.html!');
} else {
    console.log('Targets not found in proyector.html');
}
