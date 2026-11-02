/**
 * RPA Widget Global - Low-Code RPA Studio (UNIVESP)
 * Injeta automaticamente o widget flutuante e gerencia a IA com Supabase e Gemini.
 */

(function() {
  // Injeta os estilos CSS necessários no <head> da página
  const style = document.createElement('style');
  style.innerHTML = `
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: rgba(15, 23, 42, 0.6); }
    ::-webkit-scrollbar-thumb { background: rgba(99, 102, 241, 0.4); border-radius: 4px; }
    #rpa-chat-window {
      resize: both;
      overflow: hidden;
      min-width: 300px;
      min-height: 400px;
      max-width: 90vw;
      max-height: 90vh;
    }
  `;
  document.head.appendChild(style);

  // HTML do Widget Flutuante com estado inicial offline/vermelho por segurança
  const widgetContainer = document.createElement('div');
  widgetContainer.id = 'rpa-global-widget';
  widgetContainer.innerHTML = `
    <div class="fixed bottom-6 right-6 z-50 flex flex-col items-end font-sans">
      
      <!-- Janela de Chat Flutuante -->
      <div id="rpa-chat-window" class="hidden w-80 h-[480px] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden mb-4 transition-all text-slate-100">
        
        <!-- Cabeçalho -->
        <div class="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between cursor-move">
          <div class="flex items-center gap-3">
            <div class="relative">
              <img src="rpa_avatar.jpg" alt="RPA" class="w-9 h-9 rounded-full object-cover border border-cyan-500/40" onerror="this.onerror=null; this.src='https://mtipyhwprnjniexgcsrs.supabase.co/storage/v1/object/public/assets-publicos/rpa_avatar.jpg';">
              <span id="rpa-dot-status" class="absolute bottom-0 right-0 w-2.5 h-2.5 bg-rose-500 border-2 border-slate-950 rounded-full"></span>
            </div>
            <div>
              <h3 class="text-xs font-bold text-white">Robô RPA</h3>
              <span id="rpa-subtitle-status" class="text-[10px] text-rose-400 font-mono">A verificar sistema...</span>
            </div>
          </div>

          <div class="flex items-center gap-1">
            <button onclick="window.toggleMaximizeRpaChat()" class="p-1 text-slate-400 hover:text-white rounded transition" title="Maximizar / Restaurar">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>
            </button>
            <button onclick="window.toggleRpaChat()" class="p-1 text-slate-400 hover:text-red-400 rounded transition" title="Fechar">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
        </div>

        <!-- Mensagens -->
        <div id="rpa-chat-messages" class="flex-1 p-3 overflow-y-auto space-y-3 bg-slate-950/50 text-xs">
          <div class="flex items-start gap-2">
            <div class="bg-slate-800 text-slate-200 p-2.5 rounded-2xl rounded-tl-sm max-w-[85%] leading-relaxed shadow-sm">
              Olá! Eu sou o <strong>RPA</strong>. Estou validando a conexão segura com o Supabase e a chave de API para começarmos. 😊
            </div>
          </div>
        </div>

        <!-- Input com Bloqueio de Digitação -->
        <div class="p-3 bg-slate-950 border-t border-slate-800 flex flex-col gap-1.5">
          <div class="flex items-center gap-2">
            <input 
              type="text" 
              id="rpa-chat-input" 
              placeholder="Aguardando conexão segura..." 
              disabled
              onkeydown="if(event.key==='Enter') window.sendRpaWidgetMessage()"
              class="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
            <button id="rpa-send-btn" disabled onclick="window.sendRpaWidgetMessage()" class="p-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl shadow transition flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
            </button>
          </div>
          <span id="rpa-lock-tip" class="text-slate-500 text-[10px]">Aguardando verificação do sistema.</span>
        </div>
      </div>

      <!-- Botão Flutuante Circular -->
      <button onclick="window.toggleRpaChat()" class="relative group cursor-pointer focus:outline-none transition transform hover:scale-105">
        <div class="w-14 h-14 rounded-full p-0.5 bg-gradient-to-tr from-cyan-500 to-emerald-400 shadow-xl shadow-cyan-500/30 flex items-center justify-center">
          <img src="rpa_avatar.jpg" alt="Robô RPA" class="w-full h-full rounded-full object-cover" onerror="this.onerror=null; this.src='https://mtipyhwprnjniexgcsrs.supabase.co/storage/v1/object/public/assets-publicos/rpa_avatar.jpg';">
        </div>
        <span id="rpa-main-dot" class="absolute bottom-0 right-0 w-4 h-4 bg-rose-500 border-2 border-slate-950 rounded-full"></span>
        
        <div class="absolute right-16 top-2 bg-slate-900 border border-slate-800 text-slate-200 text-[11px] px-3 py-1.5 rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap">
          Falar com o RPA 🤖
        </div>
      </button>

    </div>
  `;
  document.body.appendChild(widgetContainer);

  let isMaximized = false;
  let verifiedApiKey = "";
  let globalProjectContext = "";

  window.toggleRpaChat = function() {
    const win = document.getElementById('rpa-chat-window');
    win.classList.toggle('hidden');
    if (!win.classList.contains('hidden') && verifiedApiKey) {
      document.getElementById('rpa-chat-input').focus();
    }
  };

  window.toggleMaximizeRpaChat = function() {
    const win = document.getElementById('rpa-chat-window');
    isMaximized = !isMaximized;
    if (isMaximized) {
      win.style.position = 'fixed';
      win.style.inset = '20px';
      win.style.width = 'auto';
      win.style.height = 'auto';
      win.style.zIndex = '9999';
    } else {
      win.style.position = 'relative';
      win.style.inset = 'auto';
      win.style.width = '320px';
      win.style.height = '480px';
    }
  };

  // Verificação Estrita de Conexão (Supabase + Chave Gemini + ProjectContext)
  async function initWidgetDataStrict() {
    const dotStatus = document.getElementById('rpa-dot-status');
    const mainDot = document.getElementById('rpa-main-dot');
    const subtitle = document.getElementById('rpa-subtitle-status');
    const inputField = document.getElementById('rpa-chat-input');
    const sendBtn = document.getElementById('rpa-send-btn');
    const lockTip = document.getElementById('rpa-lock-tip');

    let supabaseConnected = false;
    let apiKeyFound = "";

    // 1. Tentar buscar chave no Supabase com segurança na tabela app_config
    try {
      if (window.supabaseClient || window.supabase) {
        const client = window.supabaseClient || window.supabase;
        const { data, error } = await client
          .from('app_config')
          .select('api_value')
          .eq('key_name', 'gemini_api_key')
          .single();

        if (!error && data && data.api_value) {
          apiKeyFound = data.api_value;
          supabaseConnected = true;
        }
      }
    } catch (e) {
      console.warn("Supabase connection warning:", e);
    }

    // 2. Carregar projectContext.json para dar identidade ao robô[cite: 17]
    try {
      const res = await fetch('projectContext.json');
      if (res.ok) {
        const json = await res.json();
        globalProjectContext = JSON.stringify(json);
      }
    } catch (e) {
      console.warn("ProjectContext load warning:", e);
    }

    // 3. Validação Estrita: Só fica VERDE (Online) se o Supabase/Chave E o Contexto existirem simultaneamente
    if (supabaseConnected && apiKeyFound && globalProjectContext) {
      verifiedApiKey = apiKeyFound;

      dotStatus.className = "absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-950 rounded-full animate-pulse";
      mainDot.className = "absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-slate-950 rounded-full animate-pulse";
      subtitle.textContent = "Online • Seguro";
      subtitle.className = "text-[10px] text-emerald-400 font-mono";

      inputField.disabled = false;
      sendBtn.disabled = false;
      inputField.placeholder = "Digite sua mensagem...";
      lockTip.textContent = "Pressione Enter para enviar.";
    } else {
      // Caso contrário, fica VERMELHO (Offline) e bloqueia o chat estritamente
      verifiedApiKey = "";

      dotStatus.className = "absolute bottom-0 right-0 w-2.5 h-2.5 bg-rose-500 border-2 border-slate-950 rounded-full";
      mainDot.className = "absolute bottom-0 right-0 w-4 h-4 bg-rose-500 border-2 border-slate-950 rounded-full";
      subtitle.textContent = "Offline • Sem Conexão";
      subtitle.className = "text-[10px] text-rose-400 font-mono";

      inputField.disabled = true;
      sendBtn.disabled = true;
      inputField.placeholder = "⚠️ Robô offline (Verifique Supabase / Chave)";
      lockTip.innerHTML = "<span class='text-rose-400'>Erro: Conectividade ou Chave do Supabase ausente.</span>";
    }
  }

  window.sendRpaWidgetMessage = async function() {
    const input = document.getElementById('rpa-chat-input');
    const text = input.value.trim();
    if (!text || !verifiedApiKey) return;

    const chatMsgs = document.getElementById('rpa-chat-messages');
    
    const userBubble = document.createElement('div');
    userBubble.className = 'flex justify-end';
    userBubble.innerHTML = `<div class="bg-blue-600 text-white p-2.5 rounded-2xl rounded-tr-sm max-w-[85%] leading-relaxed">${escapeHtml(text)}</div>`;
    chatMsgs.appendChild(userBubble);
    input.value = '';
    chatMsgs.scrollTop = chatMsgs.scrollHeight;

    setWidgetLoading(true);

    const typingId = 'typing-' + Date.now();
    const typingDiv = document.createElement('div');
    typingDiv.id = typingId;
    typingDiv.className = 'flex items-start gap-2';
    typingDiv.innerHTML = `<div class="bg-slate-800 text-cyan-400 p-2.5 rounded-2xl rounded-tl-sm max-w-[85%] italic">O RPA está a organizar a resposta...</div>`;
    chatMsgs.appendChild(typingDiv);
    chatMsgs.scrollTop = chatMsgs.scrollHeight;

    try {
      const reply = await callGeminiAPI(verifiedApiKey, text);
      document.getElementById(typingId).remove();
      appendRpaBotMessage(reply);
    } catch (err) {
      document.getElementById(typingId).remove();
      appendRpaBotMessage("⚠️ Erro ao comunicar com a IA: " + err.message);
    } finally {
      setWidgetLoading(false);
    }
  };

  function setWidgetLoading(isLoading) {
    const input = document.getElementById('rpa-chat-input');
    const btn = document.getElementById('rpa-send-btn');
    const tip = document.getElementById('rpa-lock-tip');

    input.disabled = isLoading;
    btn.disabled = isLoading;
    if (isLoading) {
      tip.innerHTML = "<span class='text-cyan-400 font-bold animate-pulse'>🔒 A IA está a processar...</span>";
    } else {
      tip.textContent = "Pressione Enter para enviar.";
      input.focus();
    }
  }

  async function callGeminiAPI(apiKey, prompt) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const systemPrompt = `Você é o robô RPA, assistente simpático e inteligente do Low-Code RPA Studio (Projeto Integrador UNIVESP). Dados do projeto: ${globalProjectContext}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: systemPrompt }, { text: prompt }] }]
      })
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    return data.candidates[0].content.parts[0].text.replace(/\n/g, '<br>');
  }

  function appendRpaBotMessage(html) {
    const chatMsgs = document.getElementById('rpa-chat-messages');
    const botBubble = document.createElement('div');
    botBubble.className = 'flex items-start gap-2';
    botBubble.innerHTML = `<div class="bg-slate-800 text-slate-200 p-2.5 rounded-2xl rounded-tl-sm max-w-[85%] leading-relaxed shadow-sm">${html}</div>`;
    chatMsgs.appendChild(botBubble);
    chatMsgs.scrollTop = chatMsgs.scrollHeight;
  }

  function escapeHtml(text) {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
  }

  // Inicializa a verificação estrita ao carregar a página
  initWidgetDataStrict();
})();