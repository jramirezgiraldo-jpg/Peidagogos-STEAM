import io

with io.open('ranking.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. FIX THE LOGO
old_logo = '''<div class="logo">Peidagogos<span>STEAM</span></div>'''
new_logo = '''<img src="logo-peidagogos.png" alt="Peidagogos STEAM" style="height: 60px; width: auto; object-fit: contain;">'''
if old_logo in html:
    html = html.replace(old_logo, new_logo)

# 2. ADD NOISE CONTROL PANEL
# We will place it right below the header
header_end = '''    </div>
    
    <div class="table-container">'''

noise_panel = '''    </div>
    
    <div id="noise-control-panel" style="background: white; border-bottom: 1px solid #E5E7EB; padding: 15px 40px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
        <div style="display: flex; align-items: center; gap: 20px;">
            <button id="btn-mic" onclick="toggleMic()" style="background: #10B981; color: white; border: none; padding: 12px 20px; border-radius: 8px; font-weight: bold; font-size: 1rem; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: 0.2s;">
                🎙️ Activar Micrófono
            </button>
            <div style="display: flex; flex-direction: column; width: 300px; background: #F9FAFB; padding: 10px; border-radius: 8px; border: 1px solid #E5E7EB;">
                <div style="display: flex; justify-content: space-between; font-size: 0.9rem; font-weight: bold; color: #6B7280; margin-bottom: 5px;">
                    <span>Nivel de Ruido: <span id="noise-value" style="color: #374151;">0</span>%</span>
                    <span>Límite (Max): <span id="threshold-value" style="color: #EF4444;">70</span>%</span>
                </div>
                <div style="height: 15px; background: #E5E7EB; border-radius: 8px; overflow: hidden; position: relative;">
                    <div id="noise-bar" style="height: 100%; width: 0%; background: #10B981; transition: width 0.1s, background-color 0.2s;"></div>
                    <div id="threshold-marker" style="position: absolute; top: 0; bottom: 0; left: 70%; width: 3px; background: #EF4444; z-index: 10;"></div>
                </div>
            </div>
            <div style="display: flex; flex-direction: column; align-items: center;">
                <label for="threshold-slider" style="font-size: 0.8rem; font-weight: bold; color: #6B7280;">Ajustar Límite</label>
                <input type="range" id="threshold-slider" min="10" max="100" value="70" oninput="updateThreshold(this.value)" style="width: 120px; cursor: pointer;">
            </div>
        </div>
        
        <div id="penalty-alert" style="color: #EF4444; font-weight: 900; font-size: 1.3rem; opacity: 0; transition: opacity 0.3s; background: #FEE2E2; padding: 10px 20px; border-radius: 8px; border: 2px solid #EF4444; display: flex; align-items: center; gap: 10px;">
            🚨 ¡RUIDO EXCEDIDO! PENALIZACIÓN APLICADA (-10 XP)
        </div>
    </div>
    
    <div class="table-container">'''

if header_end in html:
    html = html.replace(header_end, noise_panel)


# 3. ADD JAVASCRIPT FOR AUDIO CONTEXT AND PENALTY LOGIC
# We insert it right after the `<script>` tag
script_start = '''    <script>
        const urlParams = new URLSearchParams(window.location.search);'''

audio_js = '''    <script>
        // --- CONTROL DE RUIDO Y PENALIZACIONES ---
        let audioContext;
        let analyser;
        let microphone;
        let isListening = false;
        let noiseThreshold = 70;
        let lastPenaltyTime = 0;
        let reqAnimFrame;
        const PENALTY_COOLDOWN = 8000; // 8 segundos de gracia
        const PENALTY_AMOUNT = 10;
        
        function updateThreshold(val) {
            noiseThreshold = val;
            document.getElementById('threshold-value').innerText = val;
            document.getElementById('threshold-marker').style.left = val + '%';
        }
        
        async function toggleMic() {
            const btn = document.getElementById('btn-mic');
            if (isListening) {
                if (audioContext) audioContext.close();
                isListening = false;
                cancelAnimationFrame(reqAnimFrame);
                btn.innerHTML = '🎙️ Activar Micrófono';
                btn.style.background = '#10B981';
                document.getElementById('noise-bar').style.width = '0%';
                document.getElementById('noise-value').innerText = '0';
            } else {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
                    audioContext = new (window.AudioContext || window.webkitAudioContext)();
                    analyser = audioContext.createAnalyser();
                    microphone = audioContext.createMediaStreamSource(stream);
                    
                    analyser.smoothingTimeConstant = 0.8;
                    analyser.fftSize = 1024;
                    microphone.connect(analyser);
                    
                    isListening = true;
                    btn.innerHTML = '🛑 Detener Medidor';
                    btn.style.background = '#EF4444';
                    
                    checkAudioLevel();
                } catch (err) {
                    alert('Error al acceder al micrófono. Por favor, otorga los permisos en tu navegador.');
                    console.error(err);
                }
            }
        }
        
        function checkAudioLevel() {
            if (!isListening) return;
            const array = new Uint8Array(analyser.frequencyBinCount);
            analyser.getByteFrequencyData(array);
            let values = 0;
            const length = array.length;
            for (let i = 0; i < length; i++) {
                values += (array[i]);
            }
            const average = values / length;
            // Amplificar ligeramente para que sea visible (el máximo suele rondar 128)
            let percent = Math.round((average / 128) * 100 * 1.5); 
            if (percent > 100) percent = 100;
            
            document.getElementById('noise-value').innerText = percent;
            const bar = document.getElementById('noise-bar');
            bar.style.width = percent + '%';
            
            if (percent < 50) bar.style.background = '#10B981';
            else if (percent < noiseThreshold) bar.style.background = '#F59E0B';
            else bar.style.background = '#EF4444';
            
            if (percent >= noiseThreshold) {
                const now = Date.now();
                if (now - lastPenaltyTime > PENALTY_COOLDOWN) {
                    triggerPenalty();
                    lastPenaltyTime = now;
                }
            }
            
            reqAnimFrame = requestAnimationFrame(checkAudioLevel);
        }
        
        function triggerPenalty() {
            if (!grupoActual) return;
            
            // Visual Alert
            const alertElem = document.getElementById('penalty-alert');
            alertElem.style.opacity = '1';
            document.body.style.transition = 'box-shadow 0.2s';
            document.body.style.boxShadow = 'inset 0 0 100px rgba(239, 68, 68, 0.4)';
            
            setTimeout(() => {
                alertElem.style.opacity = '0';
                document.body.style.boxShadow = 'none';
            }, 3000);
            
            // Registrar penalidad localmente
            const key = `penalty_${grupoActual}_p3`;
            let currentPenalty = parseInt(localStorage.getItem(key)) || 0;
            localStorage.setItem(key, currentPenalty + PENALTY_AMOUNT);
            
            // Recargar ranking con penalidad
            cargarRanking();
        }

        // --- FIN CONTROL DE RUIDO ---

        const urlParams = new URLSearchParams(window.location.search);'''

if script_start in html:
    html = html.replace(script_start, audio_js)

# 4. MODIFICAR EL CÁLCULO DE PUNTOS PARA RESTAR LA PENALIDAD
old_calc = '''                const estudiantesConXP = estudiantes.map(est => {
                    let xpTotal = 0;
                    // Solo calculamos el Periodo 3
                    const prefix = `prog_${est.documento}_`;
                    const suffix = `_p3`;
                    for (let i = 0; i < localStorage.length; i++) {
                        const k = localStorage.key(i);
                        if (k.startsWith(prefix) && k.endsWith(suffix)) {
                            let maxSemanaUnlocked = parseInt(localStorage.getItem(k));
                            if (!isNaN(maxSemanaUnlocked) && maxSemanaUnlocked > 1) {
                                xpTotal += (maxSemanaUnlocked - 1) * 100;
                            }
                        }
                    }
                    return { ...est, xp: xpTotal };
                });'''

new_calc = '''                // Obtener penalidad grupal total
                const penaltyKey = `penalty_${grupoActual}_p3`;
                const globalPenalty = parseInt(localStorage.getItem(penaltyKey)) || 0;
                
                const estudiantesConXP = estudiantes.map(est => {
                    let xpTotal = 0;
                    // Solo calculamos el Periodo 3
                    const prefix = `prog_${est.documento}_`;
                    const suffix = `_p3`;
                    for (let i = 0; i < localStorage.length; i++) {
                        const k = localStorage.key(i);
                        if (k.startsWith(prefix) && k.endsWith(suffix)) {
                            let maxSemanaUnlocked = parseInt(localStorage.getItem(k));
                            if (!isNaN(maxSemanaUnlocked) && maxSemanaUnlocked > 1) {
                                xpTotal += (maxSemanaUnlocked - 1) * 100;
                            }
                        }
                    }
                    
                    // Restar penalidad a todos por igual (no menor a 0 si prefieres, pero permitimos negativos)
                    xpTotal = xpTotal - globalPenalty;
                    
                    return { ...est, xp: xpTotal };
                });'''

if old_calc in html:
    html = html.replace(old_calc, new_calc)

with io.open('ranking.html', 'w', encoding='utf-8') as f:
    f.write(html)
