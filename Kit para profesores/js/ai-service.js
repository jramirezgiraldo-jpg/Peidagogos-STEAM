// ===========================================
// SERVICIO DE IA - Peidagogos STEAM
// Soporta: OpenRouter, Gemini, DeepSeek, OpenAI GPT
// Configuración persistente en localStorage
// ===========================================

const AIService = {

  // Modelos por defecto para cada proveedor
  modelosPorDefecto: {
    openrouter: 'deepseek/deepseek-chat',
    gemini: 'gemini-2.0-flash',
    deepseek: 'deepseek-chat',
    openai: 'gpt-4o-mini'
  },

  // Endpoints de cada proveedor (OpenAI-compatible)
  endpoints: {
    openrouter: 'https://openrouter.ai/api/v1/chat/completions',
    deepseek: 'https://api.deepseek.com/chat/completions',
    openai: 'https://api.openai.com/v1/chat/completions'
  },

  // Claves predeterminadas configuradas por el usuario
  presetKeys: {
    deepseek: '',
    openai: '',
    gemini: '',
    openrouter: ''
  },

  /**
   * Obtiene la configuración guardada en localStorage o la predeterminada
   * @returns {Object} Configuración { proveedor, apiKey, modelo }
   */
  obtenerConfig() {
    const saved = localStorage.getItem('peidagogos_ai_config');
    if (saved) {
      try { 
        const parsed = JSON.parse(saved);
        if (parsed.apiKey && parsed.apiKey.trim()) return parsed;
      } catch (e) { /* ignorar */ }
    }
    // Por defecto usa DeepSeek que tiene API key activa
    return {
      proveedor: 'deepseek',
      apiKey: this.presetKeys.deepseek,
      modelo: 'deepseek-chat'
    };
  },

  /**
   * Guarda la configuración en localStorage
   * @param {Object} config - Configuración a guardar
   */
  guardarConfig(config) {
    localStorage.setItem('peidagogos_ai_config', JSON.stringify(config));
  },

  /**
   * Verifica si hay una API Key configurada
   * @returns {boolean}
   */
  estaConfigurado() {
    const config = this.obtenerConfig();
    return !!(config.apiKey && config.apiKey.trim());
  },

  /**
   * Envía un prompt al proveedor de IA configurado
   * @param {string} systemPrompt - Instrucciones del sistema
   * @param {string} userPrompt - Mensaje del usuario
   * @returns {Promise<string>} Respuesta de texto del modelo
   */
  async enviarPrompt(systemPrompt, userPrompt) {
    const config = this.obtenerConfig();

    if (!config.apiKey || !config.apiKey.trim()) {
      throw new Error('⚠️ No se ha configurado una API Key. Ve a ⚙️ Configuración para agregar tu clave.');
    }

    const proveedor = config.proveedor || 'openrouter';
    const modelo = config.modelo?.trim() || this.modelosPorDefecto[proveedor];

    console.log(`[AIService] Enviando prompt a ${proveedor} (modelo: ${modelo})`);

    if (proveedor === 'gemini') {
      return this._llamarGemini(config.apiKey, modelo, systemPrompt, userPrompt);
    } else {
      return this._llamarOpenAICompatible(proveedor, config.apiKey, modelo, systemPrompt, userPrompt);
    }
  },

  /**
   * Llamada a APIs compatibles con formato OpenAI (OpenRouter, DeepSeek, OpenAI)
   * @private
   */
  async _llamarOpenAICompatible(proveedor, apiKey, modelo, systemPrompt, userPrompt) {
    const endpoint = this.endpoints[proveedor];
    if (!endpoint) {
      throw new Error(`Proveedor desconocido: ${proveedor}`);
    }

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    };

    // OpenRouter requiere headers adicionales
    if (proveedor === 'openrouter') {
      headers['HTTP-Referer'] = window.location.href || 'https://peidagogos.com';
      headers['X-Title'] = 'Peidagogos STEAM - Kit Interactivo';
    }

    const body = {
      model: modelo,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 4096
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[AIService] Error ${response.status}:`, errorText);
      throw new Error(`Error del proveedor ${proveedor} (${response.status}): ${this._extraerMensajeError(errorText)}`);
    }

    const data = await response.json();

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Respuesta inesperada del proveedor de IA.');
    }

    return data.choices[0].message.content;
  },

  /**
   * Llamada a la API de Google Gemini
   * @private
   */
  async _llamarGemini(apiKey, modelo, systemPrompt, userPrompt) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent?key=${apiKey}`;

    const body = {
      system_instruction: {
        parts: [{ text: systemPrompt }]
      },
      contents: [{
        parts: [{ text: userPrompt }]
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 4096
      }
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[AIService] Error Gemini:', errorText);
      throw new Error(`Error de Gemini (${response.status}): ${this._extraerMensajeError(errorText)}`);
    }

    const data = await response.json();

    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('Respuesta vacía de Gemini. Intenta de nuevo.');
    }

    return data.candidates[0].content.parts[0].text;
  },

  /**
   * Extrae JSON de una respuesta de texto del modelo de IA
   * Busca entre bloques ```json ... ``` o intenta parsear directamente
   * @param {string} texto - Respuesta de texto del modelo
   * @returns {Object|Array} Datos JSON extraídos
   */
  extraerJSON(texto) {
    // Intento 1: Buscar bloque de código JSON
    const matchBloque = texto.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (matchBloque) {
      try { return JSON.parse(matchBloque[1].trim()); } catch (e) { /* continuar */ }
    }

    // Intento 2: Buscar objeto o arreglo JSON directamente
    const matchJSON = texto.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (matchJSON) {
      try { return JSON.parse(matchJSON[1]); } catch (e) { /* continuar */ }
    }

    // Intento 3: Limpiar y parsear todo el texto
    const limpio = texto.replace(/^[^{[]*/, '').replace(/[^}\]]*$/, '');
    try { return JSON.parse(limpio); } catch (e) { /* continuar */ }

    console.error('[AIService] No se pudo extraer JSON de:', texto);
    throw new Error('La IA no devolvió un formato JSON válido. Intenta generar de nuevo.');
  },

  /**
   * Extrae un mensaje de error legible de una respuesta de error
   * @private
   */
  _extraerMensajeError(errorText) {
    try {
      const obj = JSON.parse(errorText);
      return obj.error?.message || obj.message || errorText.substring(0, 200);
    } catch (e) {
      return errorText.substring(0, 200);
    }
  }
};
