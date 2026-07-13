import io
import re

with io.open('ranking.html', 'r', encoding='utf-8') as f:
    html = f.read()

old_logic = '''        // --- CONTROL DE RUIDO Y PENALIZACIONES ---
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
        }'''

new_logic = '''        // --- CONTROL DE RUIDO AUTOMÁTICO (FILTRO DE CONTINUIDAD) ---
        let audioContext;
        let analyser;
        let microphone;
        let isListening = false;
        let noiseThreshold = 70;
        let lastPenaltyTime = 0;
        let reqAnimFrame;
        let lastFrameTime = 0;
        let sustainedNoiseTime = 0;
        const REQUIRED_SUSTAINED_TIME = 3500; // 3.5 segundos continuos requeridos para penalizar
        const PENALTY_COOLDOWN = 8000; // 8 segundos de gracia tras penalidad
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
                lastFrameTime = 0;
                sustainedNoiseTime = 0;
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
                    lastFrameTime = performance.now();
                    btn.innerHTML = '🛑 Detener Medidor';
                    btn.style.background = '#EF4444';
                    
                    requestAnimationFrame(checkAudioLevel);
                } catch (err) {
                    alert('Error al acceder al micrófono. Por favor, otorga los permisos en tu navegador.');
                    console.error(err);
                }
            }
        }
        
        function checkAudioLevel(timestamp) {
            if (!isListening) return;
            
            if (!lastFrameTime) lastFrameTime = timestamp;
            const deltaTime = timestamp - lastFrameTime;
            lastFrameTime = timestamp;
            
            const array = new Uint8Array(analyser.frequencyBinCount);
            analyser.getByteFrequencyData(array);
            let values = 0;
            const length = array.length;
            for (let i = 0; i < length; i++) {
                values += (array[i]);
            }
            const average = values / length;
            // Amplificar ligeramente
            let percent = Math.round((average / 128) * 100 * 1.5); 
            if (percent > 100) percent = 100;
            
            document.getElementById('noise-value').innerText = percent;
            const bar = document.getElementById('noise-bar');
            bar.style.width = percent + '%';
            
            if (percent < 50) bar.style.background = '#10B981';
            else if (percent < noiseThreshold) bar.style.background = '#F59E0B';
            else bar.style.background = '#EF4444';
            
            // Lógica de Continuidad (Teacher vs Classroom Filter)
            if (percent >= noiseThreshold) {
                sustainedNoiseTime += deltaTime;
                
                // Si el ruido ha sido continuo por más de 3.5 segundos
                if (sustainedNoiseTime >= REQUIRED_SUSTAINED_TIME) {
                    const now = Date.now();
                    if (now - lastPenaltyTime > PENALTY_COOLDOWN) {
                        triggerPenalty();
                        lastPenaltyTime = now;
                    }
                    // Resetear el temporizador después de penalizar para requerir otros 3.5s si el ruido sigue
                    sustainedNoiseTime = 0; 
                }
            } else {
                // Si el ruido cae por debajo del límite (ej. pausa de respiración del profesor),
                // el temporizador de penalidad se reinicia a cero al instante.
                sustainedNoiseTime = 0;
            }
            
            reqAnimFrame = requestAnimationFrame(checkAudioLevel);
        }'''

if old_logic in html:
    html = html.replace(old_logic, new_logic)

with io.open('ranking.html', 'w', encoding='utf-8') as f:
    f.write(html)
