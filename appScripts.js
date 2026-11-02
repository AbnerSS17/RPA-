let currentRole = 'ADMIN';
let activeContainerTarget = null;
let selectedIconName = 'file';
let isPageDirty = false;
let previousActiveTab = 'conheca';

let subpagesData = {
    'main': [] 
};
let currentEditorSubpage = 'main';

let creatorLibrary = [
    { id: 'c1', name: 'Caixa de Texto', category: 'text_forms', type: 'texto', icon: 'type', html: '<p class="text-slate-200">Texto Editável</p>' },
    { id: 'c2', name: 'Campo Input Texto', category: 'inputs', type: 'input', icon: 'text-cursor-input', html: '<input type="text" placeholder="Digite o texto..." class="bg-slate-950 border border-slate-800 p-2 rounded text-xs text-white w-full pointer-events-none">' },
    { id: 'c3', name: 'Botão Enviar', category: 'actions', type: 'botao', icon: 'mouse-pointer-click', html: '<button class="px-4 py-2 bg-blue-600 text-white rounded text-xs font-semibold pointer-events-none">Enviar Formulário</button>' },
    { id: 'c4', name: 'Exibição Output', category: 'outputs', type: 'output', icon: 'monitor', html: '<div class="p-2 bg-slate-800 rounded border border-slate-700 text-xs text-cyan-400">Resultado Output</div>' },
    { id: 'c5', name: 'Instrução RPA - Click', category: 'rpa', type: 'rpa', icon: 'bot', html: '<div class="p-2 bg-purple-900/40 border border-purple-500/50 rounded text-xs text-purple-300">RPA: Click Element</div>' },
    { 
        id: 'c_grafico', 
        name: 'Gráfico Studio', 
        category: 'outputs', 
        type: 'chart', 
        icon: 'bar-chart-2', 
        html: '<div class="w-full h-full flex flex-col justify-between p-3 bg-slate-900 border border-slate-800 rounded-lg overflow-hidden graph-card-wrapper"><div class="flex items-center justify-between mb-1"><span class="text-xs font-bold text-white flex items-center gap-1.5"><i data-lucide="bar-chart-2" class="w-3.5 h-3.5 text-indigo-400"></i> <span class="chart-title-label">Gráfico RPA Studio</span></span><button type="button" onclick="openPainelFullscreen()" class="px-2 py-0.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-semibold rounded shadow transition flex items-center gap-1 cursor-pointer"><i data-lucide="edit-3" class="w-3.5 h-3.5"></i> Editar</button></div><div class="flex-1 w-full h-full min-h-[140px] relative"><canvas class="canvas-chart-instance w-full h-full"></canvas></div></div>' 
    }
];

let creatorVariables = [];
let targetPagesList = [];

let selectedPaintElement = null;
let isDraggingPaint = false;
let isResizingPaint = false;
let dragOffsetX = 0;
let dragOffsetY = 0;
let activeResizeHandle = null;
let selectedComponentIconName = 'box';

// Listener para capturar atualizações enviadas pelo painel React (Chart Studio)
window.addEventListener('studioConfigUpdated', (e) => {
    updateAllCanvasCharts(e.detail);
});

// Inicialização das instâncias de gráficos no Canvas do Editor
function initCanvasChartInstances() {
    const viewport = document.getElementById('paint-canvas-viewport');
    if (!viewport) return;
    
    let savedState = null;
    try {
        const raw = localStorage.getItem("chart_studio_full_state");
        if (raw) savedState = JSON.parse(raw);
    } catch(e) {}

    viewport.querySelectorAll('.paint-element').forEach(el => {
        const canvas = el.querySelector('.canvas-chart-instance');
        if (canvas && savedState) {
            renderChartOnCanvasElement(canvas, savedState);
        }
    });
}

// Atualiza todos os gráficos visíveis no Canvas em tempo real
function updateAllCanvasCharts(configState) {
    const viewport = document.getElementById('paint-canvas-viewport');
    if (!viewport) return;
    viewport.querySelectorAll('.paint-element').forEach(el => {
        const canvas = el.querySelector('.canvas-chart-instance');
        const titleSpan = el.querySelector('.chart-title-label');
        if (titleSpan && configState.chartTitle) {
            titleSpan.textContent = configState.chartTitle;
        }
        if (canvas) {
            renderChartOnCanvasElement(canvas, configState);
        }
    });
}

// Renderiza o gráfico do Chart.js dentro da tag <canvas>
function renderChartOnCanvasElement(canvasEl, state) {
    if (!canvasEl || !window.Chart) return;
    const ctx = canvasEl.getContext('2d');
    if (canvasEl.chartInstance) {
        canvasEl.chartInstance.destroy();
    }

    const rawData = state.rawData || [];
    const xAxis = state.xAxis || 'Variavel_1';
    const yAxes = state.selectedYAxes || ['Variavel_2'];
    const palette = (typeof COLOR_PALETTES !== 'undefined' && COLOR_PALETTES[state.paletteKey || 'indigo']) 
        ? COLOR_PALETTES[state.paletteKey || 'indigo'] 
        : ["#6366f1", "#818cf8", "#a5b4fc", "#c7d2fe"];
    
    const labels = rawData.map(d => String(d[xAxis] || ''));
    
    let chartType = state.selectedChart === 'horizontal_bar' ? 'bar' : (state.selectedChart || 'bar');
    let indexAxis = state.selectedChart === 'horizontal_bar' ? 'y' : 'x';

    const datasets = yAxes.map((yKey, idx) => {
        const color = palette[idx % palette.length];
        return {
            label: String(yKey).toUpperCase(),
            data: rawData.map(d => Number(d[yKey]) || 0),
            backgroundColor: color + '88',
            borderColor: color,
            borderWidth: 2
        };
    });

    canvasEl.chartInstance = new Chart(ctx, {
        type: chartType,
        data: { labels, datasets },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: indexAxis,
            plugins: {
                legend: { display: false },
                title: { display: false }
            },
            scales: {
                x: { ticks: { color: '#94a3b8', font: { size: 9 } }, grid: { display: false } },
                y: { ticks: { color: '#94a3b8', font: { size: 9 } }, grid: { color: '#1e293b' } }
            }
        }
    });
}

window.onload = function() {
    loadCreatorLibrary();
    renderCreatorLibrary();
    renderIconPickerGrid();
    renderComponentIconPickerGrid();
    renderVariablesList();
    renderTargetPagesList();
    applyRolePermissions();
    initCanvasChartInstances();
}

function loadCreatorLibrary() {
    const saved = localStorage.getItem('lowcode_creator_library');
    if (saved) {
        try { 
            let parsed = JSON.parse(saved);
            if (!parsed.some(item => item.id === 'c_grafico')) {
                parsed.push(creatorLibrary.find(item => item.id === 'c_grafico'));
            }
            creatorLibrary = parsed;
        } catch(e) {}
    }
}

function saveCreatorLibrary() {
    localStorage.setItem('lowcode_creator_library', JSON.stringify(creatorLibrary));
}

function attemptTabSwitch(targetTabId) {
    const activeTab = document.querySelector('.tab-content.active');
    if (activeTab && activeTab.id === 'tab-criar' && targetTabId !== 'criar' && isPageDirty) {
        const answer = confirm("Deseja salvar a página?\n\n[OK] = Salvar e Sair\n[Cancelar] = Descartar alterações");
        if (answer) saveCreatedPageToMenu();
        isPageDirty = false;
    }
    switchTab(targetTabId);
}

function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('nav button').forEach(el => el.classList.remove('bg-slate-800', 'text-white'));

    const targetTab = document.getElementById('tab-' + tabId);
    const targetNav = document.getElementById('nav-' + tabId);

    if (targetTab) targetTab.classList.add('active');
    if (targetNav) targetNav.classList.add('bg-slate-800', 'text-white');
    if(window.lucide) lucide.createIcons();
}

// Redireciona a página para abrir o criar_pagina.html em tela cheia
function openCriarPaginaFullscreen() {
    window.location.href = 'criar_pagina.html';
}

function toggleUserRole() {
    currentRole = (currentRole === 'ADMIN') ? 'USER' : 'ADMIN';
    const badge = document.getElementById('role-badge');
    if(badge) {
        badge.innerText = (currentRole === 'ADMIN') ? 'ADMINISTRADOR' : 'USUÁRIO COMUM';
        badge.className = (currentRole === 'ADMIN') 
            ? 'px-3 py-1 rounded text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30'
            : 'px-3 py-1 rounded text-[10px] font-bold bg-slate-700 text-slate-300';
    }
    applyRolePermissions();
}

function applyRolePermissions() {
    const body = document.body;
    const adminControls = document.querySelectorAll('.admin-controls');
    const adminOnlyElements = document.querySelectorAll('.admin-only');
    const adminSidebar = document.getElementById('admin-sidebar-controls');

    if (currentRole === 'ADMIN') {
        body.classList.add('is-admin');
        adminControls.forEach(el => el.classList.remove('hidden'));
        adminOnlyElements.forEach(el => el.classList.remove('hidden'));
        if(adminSidebar) adminSidebar.classList.remove('hidden');
    } else {
        body.classList.remove('is-admin');
        adminControls.forEach(el => el.classList.add('hidden'));
        adminOnlyElements.forEach(el => el.classList.add('hidden'));
        if(adminSidebar) adminSidebar.classList.add('hidden');
    }
    renderCreatorLibrary();
}

function switchSubTab(subtabId) {
    document.querySelectorAll('.subtab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.subnav-btn').forEach(el => {
        el.classList.remove('bg-blue-600', 'text-white');
        el.classList.add('text-slate-400');
    });

    const targetSub = document.getElementById('subtab-' + subtabId);
    const targetBtn = document.getElementById('subnav-' + subtabId);

    if (targetSub) targetSub.classList.add('active');
    if (targetBtn) {
        targetBtn.classList.add('bg-blue-600', 'text-white');
        targetBtn.classList.remove('text-slate-400');
    }
    if(window.lucide) lucide.createIcons();
}

function switchEditorSubpage(scope) {
    saveCurrentEditorCanvasState();
    currentEditorSubpage = scope;
    document.querySelectorAll('.subpage-btn').forEach(btn => {
        btn.className = "subpage-btn px-3 py-1 rounded text-xs font-medium text-slate-400 hover:bg-slate-900 border border-transparent cursor-pointer";
    });
    const activeBtn = document.getElementById('btn-subpage-' + scope);
    if (activeBtn) {
        activeBtn.className = "subpage-btn px-3 py-1 rounded text-xs font-medium bg-slate-800 text-blue-400 border border-blue-500/30 cursor-pointer";
    }
    loadEditorCanvasState(scope);
}

function saveCurrentEditorCanvasState() {
    const viewport = document.getElementById('paint-canvas-viewport');
    if (viewport) subpagesData[currentEditorSubpage] = viewport.innerHTML;
}

function loadEditorCanvasState(scope) {
    const viewport = document.getElementById('paint-canvas-viewport');
    if (!viewport) return;
    viewport.innerHTML = subpagesData[scope] || '';
    rebindPaintElementsEvents();
    deselectPaintElement();
    initCanvasChartInstances();
}

function addNewPageScope() {
    saveCurrentEditorCanvasState();
    const list = document.getElementById('subpages-tabs-list');
    const count = Object.keys(subpagesData).length;
    const scopeId = 'sub' + count;
    subpagesData[scopeId] = '';

    const btn = document.createElement('button');
    btn.id = 'btn-subpage-' + scopeId;
    btn.className = "subpage-btn px-3 py-1 rounded text-xs font-medium text-slate-400 hover:bg-slate-900 border border-transparent cursor-pointer";
    btn.textContent = `Subpágina ${count}`;
    btn.onclick = () => switchEditorSubpage(scopeId);

    list.appendChild(btn);
    switchEditorSubpage(scopeId);
    if(window.lucide) lucide.createIcons();
}

function rebindPaintElementsEvents() {
    const viewport = document.getElementById('paint-canvas-viewport');
    if (!viewport) return;
    viewport.querySelectorAll('.paint-element').forEach(elem => {
        elem.onclick = (e) => { e.stopPropagation(); selectPaintElement(elem); };
        elem.onmousedown = (e) => handlePaintElemMouseDown(e, elem);
    });
    if(window.lucide) lucide.createIcons();
}

function filterCreatorComponents() {
    const query = document.getElementById('search-creator-components').value;
    renderCreatorLibrary(query);
}

function renderCreatorLibrary(filterText = '') {
    const container = document.getElementById('creator-component-library');
    if (!container) return;
    container.innerHTML = '';

    const filtered = creatorLibrary.filter(item => item.name.toLowerCase().includes(filterText.toLowerCase()));
    const countEl = document.getElementById('creator-component-count');
    if (countEl) countEl.textContent = `${filtered.length} itens`;

    const categories = {
        text_forms: 'Caixa de Textos e Formulários',
        media: 'Mídias',
        actions: 'Ações e Botões',
        inputs: 'Entradas (Inputs)',
        outputs: 'Saídas (Outputs)',
        rpa: 'Instruções para o RPA'
    };

    const colors = ['text-blue-400', 'text-cyan-400', 'text-emerald-400', 'text-purple-400', 'text-amber-400', 'text-rose-400'];

    Object.keys(categories).forEach((catKey, idx) => {
        const catItems = filtered.filter(item => item.category === catKey);

        const catDiv = document.createElement('div');
        catDiv.className = 'space-y-2';

        const catHeader = document.createElement('div');
        catHeader.className = 'flex items-center justify-between px-1';
        catHeader.innerHTML = `
            <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <i data-lucide="folder" class="w-3.5 h-3.5 ${colors[idx % colors.length]}"></i> ${categories[catKey]}
            </span>
            ${currentRole === 'ADMIN' ? `
                <button onclick="openCreatorComponentModal(null, '${catKey}')" class="text-[10px] text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 cursor-pointer">
                    <i data-lucide="plus" class="w-3 h-3"></i> Add
                </button>
            ` : ''}
        `;
        catDiv.appendChild(catHeader);

        const grid = document.createElement('div');
        grid.className = 'grid grid-cols-2 gap-2';

        catItems.forEach(item => {
            const card = document.createElement('div');
            card.className = 'p-2 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-blue-500/50 rounded-lg cursor-pointer transition flex flex-col justify-between group relative';
            card.onclick = () => addElementToPaintCanvas(item);

            const isAdmin = (currentRole === 'ADMIN');

            card.innerHTML = `
                <div class="flex items-center justify-between mb-1">
                    <span class="text-[11px] font-semibold text-slate-200 group-hover:text-blue-400 flex items-center gap-1.5 truncate">
                        <i data-lucide="${item.icon || 'box'}" class="w-3.5 h-3.5 ${colors[idx % colors.length]} shrink-0"></i>
                        <span class="truncate">${item.name}</span>
                    </span>
                </div>
               ${isAdmin && item.id !== 'c_grafico' ? `
                <div class="flex items-center justify-end gap-1 pt-1 border-t border-slate-900">
                    <button onclick="event.stopPropagation(); openCreatorComponentModal('${item.id}')" class="text-[10px] text-slate-400 hover:text-blue-400 p-0.5 cursor-pointer"><i data-lucide="edit-3" class="w-3 h-3"></i></button>
                    <button onclick="event.stopPropagation(); deleteCreatorComponent('${item.id}')" class="text-[10px] text-slate-400 hover:text-red-400 p-0.5 cursor-pointer"><i data-lucide="trash-2" class="w-3 h-3"></i></button>
                </div>
                ` : ''}
            `;
            grid.appendChild(card);
        });

        if (catItems.length === 0) {
            const emptyText = document.createElement('p');
            emptyText.className = 'text-[10px] text-slate-600 italic px-1';
            emptyText.textContent = 'Nenhum elemento cadastrado';
            catDiv.appendChild(emptyText);
        } else {
            catDiv.appendChild(grid);
        }

        container.appendChild(catDiv);
    });

    if(window.lucide) lucide.createIcons();
}

function addElementToPaintCanvas(item) {
    isPageDirty = true;
    const viewport = document.getElementById('paint-canvas-viewport');
    const elemId = 'paint-elem-' + Date.now();

    const elem = document.createElement('div');
    elem.id = elemId;
    elem.className = 'paint-element';
    elem.style.left = '40px';
    elem.style.top = '40px';
    
    if (item.type === 'chart') {
        elem.style.width = '380px';
        elem.style.height = '240px';
    } else {
        elem.style.width = '200px';
        elem.style.height = '60px';
    }

    elem.setAttribute('data-elem-type', item.type || 'texto');
    elem.setAttribute('data-action-type', 'none');
    elem.setAttribute('data-count-elems', '1');
    elem.setAttribute('data-count-vars', '1');
    elem.setAttribute('data-elems-map', JSON.stringify(['']));
    elem.setAttribute('data-vars-map', JSON.stringify(['']));
    elem.setAttribute('data-rpa-subaction', 'site');
    elem.setAttribute('data-rpa-dest', '');

    let modifiedHtml = item.html;
    if (item.type !== 'chart' && !modifiedHtml.includes('pointer-events-none')) {
        modifiedHtml = modifiedHtml.replace(/(class="[^"]*)/, '$1 pointer-events-none');
    }

    elem.innerHTML = `
        <div class="element-content w-full h-full flex flex-col justify-center overflow-hidden text-xs text-white">
            ${modifiedHtml}
        </div>
        <div class="resize-handle nw" data-handle="nw"></div>
        <div class="resize-handle ne" data-handle="ne"></div>
        <div class="resize-handle sw" data-handle="sw"></div>
        <div class="resize-handle se" data-handle="se"></div>
    `;

    elem.onclick = (e) => { e.stopPropagation(); selectPaintElement(elem); };
    elem.onmousedown = (e) => handlePaintElemMouseDown(e, elem);
    viewport.appendChild(elem);
    selectPaintElement(elem);

    if (item.type === 'chart') {
        const canvas = elem.querySelector('.canvas-chart-instance');
        let currentState = window.activeStudioConfigState;
        if (!currentState) {
            try {
                currentState = JSON.parse(localStorage.getItem("chart_studio_full_state"));
            } catch(e) {}
        }
        if (canvas && currentState) {
            renderChartOnCanvasElement(canvas, currentState);
        }
    }

    saveCurrentEditorCanvasState();
    if(window.lucide) lucide.createIcons();
}

function selectPaintElement(elem) {
    deselectPaintElement();
    selectedPaintElement = elem;
    selectedPaintElement.classList.add('selected');

    const emptyBox = document.getElementById('creator-inspector-empty');
    const formBox = document.getElementById('creator-inspector-form');
    if (emptyBox) emptyBox.classList.add('hidden');
    if (formBox) formBox.classList.remove('hidden');
    
    const typeBadge = document.getElementById('selected-element-type-badge');
    if (typeBadge) typeBadge.textContent = (elem.getAttribute('data-elem-type') || 'ELEMENTO').toUpperCase();

    const labelInput = document.getElementById('prop-element-label');
    const contentDiv = elem.querySelector('.element-content');
    if (contentDiv && labelInput) labelInput.value = contentDiv.innerText.trim();

    const actionType = elem.getAttribute('data-action-type') || 'none';
    const actionSelect = document.getElementById('prop-element-action-type');
    if (actionSelect) actionSelect.value = actionType;
    handleActionTypeChange(actionType);
}

function deselectPaintElement() {
    if (selectedPaintElement) {
        selectedPaintElement.classList.remove('selected');
        selectedPaintElement = null;
    }
    const emptyBox = document.getElementById('creator-inspector-empty');
    const formBox = document.getElementById('creator-inspector-form');
    if (emptyBox) emptyBox.classList.remove('hidden');
    if (formBox) formBox.classList.add('hidden');
}

function handlePaintElemMouseDown(e, elem) {
    e.stopPropagation();
    selectPaintElement(elem);

    if (e.target.classList.contains('resize-handle')) {
        isResizingPaint = true;
        activeResizeHandle = e.target.getAttribute('data-handle');
    } else {
        isDraggingPaint = true;
        const rect = elem.getBoundingClientRect();
        dragOffsetX = e.clientX - rect.left;
        dragOffsetY = e.clientY - rect.top;
    }

    document.onmousemove = (eEvt) => handlePaintMouseMove(eEvt, elem);
    document.onmouseup = () => {
        isDraggingPaint = false;
        isResizingPaint = false;
        document.onmousemove = null;
        document.onmouseup = null;
        saveCurrentEditorCanvasState();
    };
}

function handlePaintMouseMove(e, elem) {
    const viewport = document.getElementById('paint-canvas-viewport');
    if (!viewport) return;
    const vRect = viewport.getBoundingClientRect();

    if (isDraggingPaint) {
        let left = e.clientX - vRect.left - dragOffsetX;
        let top = e.clientY - vRect.top - dragOffsetY;
        left = Math.max(0, Math.min(left, vRect.width - elem.offsetWidth));
        top = Math.max(0, Math.min(top, vRect.height - elem.offsetHeight));
        elem.style.left = left + 'px';
        elem.style.top = top + 'px';
        isPageDirty = true;
    } else if (isResizingPaint) {
        const elemRect = elem.getBoundingClientRect();
        if (activeResizeHandle === 'se') {
            elem.style.width = Math.max(100, e.clientX - elemRect.left) + 'px';
            elem.style.height = Math.max(80, e.clientY - elemRect.top) + 'px';
        }
        isPageDirty = true;
    }
}

function updatePaintElementLabel(value) {
    if (!selectedPaintElement) return;
    const content = selectedPaintElement.querySelector('.element-content');
    if (content) {
        const innerInteractive = content.querySelector('input, button, p, span, div');
        if (innerInteractive && !selectedPaintElement.querySelector('canvas')) {
            if (innerInteractive.tagName === 'INPUT') innerInteractive.placeholder = value;
            else if (innerInteractive.tagName !== 'BUTTON') innerInteractive.innerText = value;
        }
    }
    isPageDirty = true;
    saveCurrentEditorCanvasState();
}

function handleActionTypeChange(actionType) {
    if (!selectedPaintElement) return;
    selectedPaintElement.setAttribute('data-action-type', actionType);

    const countersBox = document.getElementById('relation-counters-box');
    const rpaGroup = document.getElementById('action-rpa-group');

    if (countersBox) countersBox.classList.add('hidden');
    if (rpaGroup) rpaGroup.classList.add('hidden');

    if (actionType === 'send_var' || actionType === 'get_var') {
        if (countersBox) countersBox.classList.remove('hidden');
        loadElementCountsFromElement();
        renderDynamicSlots();
    } else if (actionType === 'rpa_action') {
        if (rpaGroup) rpaGroup.classList.remove('hidden');
        const sub = selectedPaintElement.getAttribute('data-rpa-subaction') || 'site';
        const subactionSel = document.getElementById('prop-rpa-subaction');
        if (subactionSel) subactionSel.value = sub;
        handleRpaSubactionChange(sub);
        const destInput = document.getElementById('prop-rpa-destination');
        if (destInput) destInput.value = selectedPaintElement.getAttribute('data-rpa-dest') || '';
        populateRpaDestinationSelect();
    }
    isPageDirty = true;
    saveActionMapping();
}

function loadElementCountsFromElement() {
    if (!selectedPaintElement) return;
    const cElems = document.getElementById('count-elems-val');
    const cVars = document.getElementById('count-vars-val');
    if (cElems) cElems.textContent = selectedPaintElement.getAttribute('data-count-elems') || '1';
    if (cVars) cVars.textContent = selectedPaintElement.getAttribute('data-count-vars') || '1';
}

function adjustCount(type, delta) {
    if (!selectedPaintElement) return;
    let countElems = parseInt(selectedPaintElement.getAttribute('data-count-elems') || '1');
    let countVars = parseInt(selectedPaintElement.getAttribute('data-count-vars') || '1');

    if (type === 'elem') {
        countElems = Math.max(1, countElems + delta);
        selectedPaintElement.setAttribute('data-count-elems', countElems);
        const cElems = document.getElementById('count-elems-val');
        if (cElems) cElems.textContent = countElems;
    } else {
        countVars = Math.max(1, countVars + delta);
        selectedPaintElement.setAttribute('data-count-vars', countVars);
        const cVars = document.getElementById('count-vars-val');
        if (cVars) cVars.textContent = countVars;
    }
    renderDynamicSlots();
    saveActionMapping();
}

function renderDynamicSlots() {
    if (!selectedPaintElement) return;
    const countElems = parseInt(selectedPaintElement.getAttribute('data-count-elems') || '1');
    const countVars = parseInt(selectedPaintElement.getAttribute('data-count-vars') || '1');

    let elemsMap = [];
    let varsMap = [];
    try { elemsMap = JSON.parse(selectedPaintElement.getAttribute('data-elems-map') || '[]'); } catch(e){}
    try { varsMap = JSON.parse(selectedPaintElement.getAttribute('data-vars-map') || '[]'); } catch(e){}

    const elemsListContainer = document.getElementById('elements-slots-list');
    if (elemsListContainer) {
        elemsListContainer.innerHTML = '';
        for (let i = 0; i < countElems; i++) {
            const div = document.createElement('div');
            div.className = "flex items-center gap-1";
            div.innerHTML = `<span class="text-[9px] text-slate-500 w-10">El #${i+1}</span><select onchange="saveActionMapping()" class="dyn-elem-select flex-1 bg-slate-950 border border-slate-800 rounded p-1 text-[11px] text-slate-200"><option value="">Selecione elemento...</option></select>`;
            elemsListContainer.appendChild(div);
            populateCanvasElementsSelect(div.querySelector('select'), elemsMap[i] || '');
        }
    }

    const varsListContainer = document.getElementById('variables-slots-list');
    if (varsListContainer) {
        varsListContainer.innerHTML = '';
        for (let i = 0; i < countVars; i++) {
            const div = document.createElement('div');
            div.className = "flex items-center gap-1";
            div.innerHTML = `<span class="text-[9px] text-slate-500 w-10">Var #${i+1}</span><select onchange="saveActionMapping()" class="dyn-var-select flex-1 bg-slate-950 border border-slate-800 rounded p-1 text-[11px] text-slate-200"><option value="">Selecione variável...</option></select>`;
            varsListContainer.appendChild(div);
            populateVariablesSelect(div.querySelector('select'), varsMap[i] || '');
        }
    }
}

function populateCanvasElementsSelect(selectEl, selectedVal) {
    const viewport = document.getElementById('paint-canvas-viewport');
    if (!viewport) return;
    viewport.querySelectorAll('.paint-element').forEach(elem => {
        if (elem === selectedPaintElement) return;
        const elemId = elem.id;
        const elemType = elem.getAttribute('data-elem-type') || 'elemento';
        const content = elem.querySelector('.element-content');
        const opt = document.createElement('option');
        opt.value = elemId;
        opt.textContent = `[${elemType.toUpperCase()}] ${content ? content.innerText.trim().substring(0, 15) : elemId}`;
        if (elemId === selectedVal) opt.selected = true;
        selectEl.appendChild(opt);
    });
}

function populateVariablesSelect(selectEl, selectedVal) {
    if (creatorVariables.length === 0) {
        selectEl.innerHTML = '<option value="">Nenhuma variável criada</option>';
        return;
    }
    creatorVariables.forEach(v => {
        const opt = document.createElement('option');
        opt.value = v.name;
        opt.textContent = `${v.name} (${v.type}) [${v.origin}]`;
        if (v.name === selectedVal) opt.selected = true;
        selectEl.appendChild(opt);
    });
}

function populateRpaDestinationSelect() {
    const selectEl = document.getElementById('prop-rpa-destination-select');
    if (!selectEl) return;
    selectEl.innerHTML = '<option value="">Selecione das Páginas Alvo...</option>';
    targetPagesList.forEach(t => {
        const opt = document.createElement('option');
        opt.value = t.path;
        opt.textContent = `${t.name} (${t.path})`;
        selectEl.appendChild(opt);
    });
}

function handleRpaSubactionChange(subaction) {
    if (!selectedPaintElement) return;
    selectedPaintElement.setAttribute('data-rpa-subaction', subaction);
    const label = document.getElementById('rpa-destination-label');
    const input = document.getElementById('prop-rpa-destination');

    if (subaction === 'site') { if(label) label.textContent = "URL do Site Externo:"; if(input) input.placeholder = "https://exemplo.com"; }
    else if (subaction === 'folder') { if(label) label.textContent = "Caminho da Pasta:"; if(input) input.placeholder = "C:/Pasta"; }
    else if (subaction === 'email') { if(label) label.textContent = "E-mail de Destino:"; if(input) input.placeholder = "contato@exemplo.com"; }
    else if (subaction === 'var_to_element') { if(label) label.textContent = "Variável Origem RPA:"; if(input) input.placeholder = "Nome da Variável..."; }
    saveActionMapping();
}

function saveActionMapping() {
    if (!selectedPaintElement) return;
    const actionSelect = document.getElementById('prop-element-action-type');
    const actionType = actionSelect ? actionSelect.value : 'none';
    selectedPaintElement.setAttribute('data-action-type', actionType);

    if (actionType === 'send_var' || actionType === 'get_var') {
        let elemsArr = [], varsArr = [];
        document.querySelectorAll('.dyn-elem-select').forEach(s => elemsArr.push(s.value));
        document.querySelectorAll('.dyn-var-select').forEach(s => varsArr.push(s.value));
        selectedPaintElement.setAttribute('data-elems-map', JSON.stringify(elemsArr));
        selectedPaintElement.setAttribute('data-vars-map', JSON.stringify(varsArr));
    } else if (actionType === 'rpa_action') {
        const subactionSel = document.getElementById('prop-rpa-subaction');
        const destInput = document.getElementById('prop-rpa-destination');
        selectedPaintElement.setAttribute('data-rpa-subaction', subactionSel ? subactionSel.value : 'site');
        selectedPaintElement.setAttribute('data-rpa-dest', destInput ? destInput.value : '');
    }
    isPageDirty = true;
    saveCurrentEditorCanvasState();
}

function deleteSelectedPaintElement() {
    if (selectedPaintElement) {
        selectedPaintElement.remove();
        deselectPaintElement();
        isPageDirty = true;
        saveCurrentEditorCanvasState();
    }
}

function openPainelFullscreen() {
    const activeTabEl = document.querySelector('.tab-content.active');
    if (activeTabEl) {
        previousActiveTab = activeTabEl.id.replace('tab-', '');
    }
    const fullPanel = document.getElementById('fullscreen-painel-view');
    if (fullPanel) fullPanel.classList.remove('hidden');
    if (window.lucide) window.lucide.createIcons();
}

function closePainelFullscreen() {
    const fullPanel = document.getElementById('fullscreen-painel-view');
    if (fullPanel) fullPanel.classList.add('hidden');
    switchTab(previousActiveTab || 'conheca');
}

function createNewVariable(customName = null, customType = null, customOrigin = 'Manual', customSync = 'onload') {
    const nameInput = document.getElementById('new-var-name');
    const typeSelect = document.getElementById('new-var-type');
    const syncSelect = document.getElementById('new-var-sync');

    const name = customName || (nameInput ? nameInput.value.trim() : '');
    const type = customType || (typeSelect ? typeSelect.value : 'Variável Simples');
    const syncMode = customSync || (syncSelect ? syncSelect.value : 'onload');

    if (!name) { if (!customName) alert("Informe o nome da variável."); return; }

    creatorVariables.push({ name, type, syncMode, origin: customOrigin, value: '' });
    if (nameInput) nameInput.value = '';
    renderVariablesList();
    if (!customName) alert(`Variável "${name}" criada com sucesso!`);
}

function renderVariablesList() {
    const box = document.getElementById('variables-list-box');
    if (!box) return;
    if (creatorVariables.length === 0) {
        box.innerHTML = '<p class="text-xs text-slate-500 italic">Nenhuma variável criada até o momento.</p>';
        return;
    }
    box.innerHTML = '';
    creatorVariables.forEach((v, idx) => {
        const item = document.createElement('div');
        item.className = "flex items-center justify-between bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-xs";
        item.innerHTML = `<div><span class="font-bold text-white">${v.name}</span> <span class="text-[10px] text-blue-400 bg-blue-500/10 ml-2 px-1.5 py-0.5 rounded border border-blue-500/30">${v.type}</span></div><button onclick="deleteVariable(${idx})" class="text-red-400 hover:text-red-300 p-1"><i data-lucide="trash-2" class="w-3.5 h-3.5"></i></button>`;
        box.appendChild(item);
    });
    if(window.lucide) lucide.createIcons();
}

function deleteVariable(idx) { creatorVariables.splice(idx, 1); renderVariablesList(); }

function addTargetPage() {
    const nameEl = document.getElementById('target-name');
    const typeEl = document.getElementById('target-type');
    const pathEl = document.getElementById('target-path');

    const name = nameEl ? nameEl.value.trim() : '';
    const type = typeEl ? typeEl.value : 'site';
    const path = pathEl ? pathEl.value.trim() : '';

    if (!name || !path) { alert("Preencha o nome e o link ou caminho."); return; }
    targetPagesList.push({ id: 'target-' + Date.now(), name, type, path });
    if (nameEl) nameEl.value = '';
    if (pathEl) pathEl.value = '';
    renderTargetPagesList();
}

function renderTargetPagesList() {
    const box = document.getElementById('target-pages-list-box');
    if (!box) return;
    if (targetPagesList.length === 0) { box.innerHTML = '<p class="text-xs text-slate-500 italic">Nenhum alvo cadastrado.</p>'; return; }
    box.innerHTML = '';
    targetPagesList.forEach((t, idx) => {
        const item = document.createElement('div');
        item.className = "flex items-center justify-between bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs cursor-pointer hover:border-blue-500 transition";
        item.onclick = () => openTargetPreviewModal(t);
        item.innerHTML = `<div class="flex items-center gap-2"><i data-lucide="globe" class="w-4 h-4 text-cyan-400"></i><div><span class="font-bold text-white">${t.name}</span><p class="text-[10px] text-slate-400 font-mono">${t.path}</p></div></div><button onclick="event.stopPropagation(); deleteTargetPage(${idx})" class="text-red-400 hover:text-red-300 p-1"><i data-lucide="trash-2" class="w-3.5 h-3.5"></i></button>`;
        box.appendChild(item);
    });
    if(window.lucide) lucide.createIcons();
}

function deleteTargetPage(idx) { targetPagesList.splice(idx, 1); renderTargetPagesList(); }

function openTargetPreviewModal(targetItem) {
    const titleModal = document.getElementById('preview-modal-title');
    const urlBar = document.getElementById('preview-url-bar');
    if (titleModal) titleModal.innerHTML = `<i data-lucide="globe" class="w-4 h-4 text-cyan-400"></i> Visualizador RPA: ${targetItem.name}`;
    if (urlBar) urlBar.textContent = targetItem.path;
    const viewport = document.getElementById('real-site-viewport');
    if (viewport) {
        viewport.innerHTML = `<div class="w-full h-full min-h-[500px] bg-white p-6 flex flex-col items-center justify-center text-slate-800"><h1 class="text-4xl font-bold mb-4 text-blue-600">Google Clone</h1><input type="text" placeholder="Pesquisar..." class="border p-2 rounded w-96 mb-4 cloned-real-element" onclick="openElementConfigModal('Barra de Pesquisa', 'Variável Simples')"><button class="px-4 py-2 bg-blue-600 text-white rounded cloned-real-element" onclick="openElementConfigModal('Botão Pesquisa', 'Variável Simples')">Pesquisa Google</button></div>`;
    }
    openModal('modal-target-preview');
    if(window.lucide) lucide.createIcons();
}

function openElementConfigModal(elemName, suggestedType) {
    const configElemName = document.getElementById('config-clicked-element-name');
    const configVarName = document.getElementById('config-var-name');
    const configVarType = document.getElementById('config-var-type');

    if (configElemName) configElemName.value = elemName;
    if (configVarName) configVarName.value = 'var_' + elemName.toLowerCase().replace(/[^a-z0-9]/g, '_');
    if (configVarType) configVarType.value = suggestedType;
    openModal('modal-element-rpa-config');
    if(window.lucide) lucide.createIcons();
}

function saveElementRpaConfiguration() {
    const varNameInput = document.getElementById('config-var-name');
    const varTypeSelect = document.getElementById('config-var-type');

    const varName = varNameInput ? varNameInput.value.trim() : '';
    const varType = varTypeSelect ? varTypeSelect.value : 'Variável Simples';

    if (!varName) { alert("Informe o nome da variável."); return; }
    createNewVariable(varName, varType, 'RPA', 'onload');
    closeModal('modal-element-rpa-config');
    alert(`Variável "${varName}" criada com sucesso via captura RPA!`);
}

function renderIconPickerGrid(filter = '') {
    const grid = document.getElementById('icon-picker-grid');
    if (!grid) return;
    grid.innerHTML = '';
    ['file', 'folder', 'database', 'settings', 'users', 'user', 'shield', 'star', 'globe', 'wrench', 'activity', 'home', 'cpu', 'server', 'calendar', 'check-circle', 'lock', 'mail', 'message-square', 'shopping-cart', 'tag', 'terminal', 'zap', 'layers', 'layout', 'key', 'search', 'tool', 'bar-chart-2'].filter(i => i.includes(filter.toLowerCase())).forEach(iconName => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `icon-opt p-2 rounded-lg border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center ${selectedIconName === iconName ? 'selected' : ''}`;
        btn.onclick = () => {
            selectedIconName = iconName;
            document.querySelectorAll('#icon-picker-grid .icon-opt').forEach(el => el.classList.remove('selected'));
            btn.classList.add('selected');
        };
        btn.innerHTML = `<i data-lucide="${iconName}" class="w-4 h-4"></i>`;
        grid.appendChild(btn);
    });
    if(window.lucide) lucide.createIcons();
}

function filterIcons(query) { renderIconPickerGrid(query); }

function renderComponentIconPickerGrid(filter = '') {
    const grid = document.getElementById('component-icon-picker-grid');
    if (!grid) return;
    grid.innerHTML = '';
    ['type', 'text-cursor-input', 'mouse-pointer-click', 'monitor', 'bot', 'image', 'box', 'folder', 'database', 'settings', 'users', 'user', 'shield', 'star', 'globe', 'wrench', 'activity', 'home', 'cpu', 'server', 'calendar', 'check-circle', 'lock', 'mail', 'message-square', 'shopping-cart', 'tag', 'terminal', 'zap', 'layers', 'layout', 'key', 'search', 'tool', 'bar-chart-2'].filter(i => i.includes(filter.toLowerCase())).forEach(iconName => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `icon-opt p-2 rounded-lg border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center ${selectedComponentIconName === iconName ? 'selected' : ''}`;
        btn.onclick = () => {
            selectedComponentIconName = iconName;
            document.querySelectorAll('#component-icon-picker-grid .icon-opt').forEach(el => el.classList.remove('selected'));
            btn.classList.add('selected');
        };
        btn.innerHTML = `<i data-lucide="${iconName}" class="w-4 h-4"></i>`;
        grid.appendChild(btn);
    });
    if(window.lucide) lucide.createIcons();
}

function filterComponentIcons(query) { renderComponentIconPickerGrid(query); }

function openCreatorComponentModal(id = null, defaultCategory = 'text_forms') {
    if (currentRole !== 'ADMIN') return;
    const titleModal = document.getElementById('modal-creator-title');
    const idInput = document.getElementById('edit-creator-elem-id');
    const nameInput = document.getElementById('edit-creator-elem-name');
    const catInput = document.getElementById('edit-creator-elem-category');
    const typeInput = document.getElementById('edit-creator-elem-type');
    const htmlInput = document.getElementById('edit-creator-elem-html');

    if (titleModal) titleModal.innerText = 'Adicionar Elemento à Biblioteca';
    if (idInput) idInput.value = '';
    if (nameInput) nameInput.value = '';
    if (catInput) catInput.value = defaultCategory;
    if (typeInput) typeInput.value = 'texto';
    if (htmlInput) htmlInput.value = '<div class="p-2 bg-slate-800 text-white rounded">Novo Elemento</div>';
    openModal('modal-creator-component');
}

function saveCreatorComponentFromModal() {
    const nameInput = document.getElementById('edit-creator-elem-name');
    const catInput = document.getElementById('edit-creator-elem-category');
    const typeInput = document.getElementById('edit-creator-elem-type');
    const htmlInput = document.getElementById('edit-creator-elem-html');

    const name = nameInput ? nameInput.value.trim() : '';
    const category = catInput ? catInput.value : 'text_forms';
    const type = typeInput ? typeInput.value : 'texto';
    const html = htmlInput ? htmlInput.value : '';

    if (!name || !html) { alert("Preencha o nome e o HTML."); return; }
    creatorLibrary.push({ id: 'elem-' + Date.now(), name, category, type, icon: 'box', html });
    saveCreatorLibrary();
    renderCreatorLibrary();
    closeModal('modal-creator-component');
}

function deleteCreatorComponent(id) {
    if (currentRole !== 'ADMIN' || id === 'c_grafico') return;
    if (confirm("Deseja excluir este elemento?")) {
        creatorLibrary = creatorLibrary.filter(c => c.id !== id);
        saveCreatorLibrary();
        renderCreatorLibrary();
    }
}

function previewInFrontend() {
    saveCurrentEditorCanvasState();
    let combinedHtml = '';
    Object.keys(subpagesData).forEach(scope => {
        combinedHtml += `<div class="mb-12 border-b border-slate-800 pb-8"><h3 class="text-sm font-bold text-blue-400 mb-4 uppercase">Escopo: ${scope}</h3>${subpagesData[scope]}</div>`;
    });
    const previewWin = window.open('', '_blank');
    previewWin.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Pré-visualização</title><script src="https://cdn.tailwindcss.com"><\/script></head><body class="bg-slate-950 text-white p-8">${combinedHtml}</body></html>`);
    previewWin.document.close();
}

function saveCreatedPageToMenu() {
    saveCurrentEditorCanvasState();
    const pageName = prompt("Digite o nome da nova página:", "Nova Página");
    if (!pageName) return;
    const pageId = 'saved-page-' + Date.now();
    const viewportNode = document.getElementById('paint-canvas-viewport');
    const viewport = viewportNode ? viewportNode.cloneNode(true) : null;

    const menuNav = document.getElementById('sidebar-menu-list');
    if (menuNav) {
        const menuButtonWrapper = document.createElement('div');
        menuButtonWrapper.id = 'wrapper-' + pageId;
        menuButtonWrapper.className = "flex items-center gap-1 w-full custom-menu-item";
        menuButtonWrapper.innerHTML = `<button onclick="switchTab('${pageId}'); closeSidebar();" id="nav-${pageId}" class="nav-btn flex-1 px-3 py-2.5 rounded-l-lg text-xs font-semibold flex items-center gap-3 transition text-slate-400 hover:bg-slate-800 hover:text-white truncate"><i data-lucide="file-check" class="w-4 h-4 text-emerald-400 shrink-0"></i> <span class="truncate">${pageName}</span></button>`;
        menuNav.appendChild(menuButtonWrapper);
    }

    const tabsContainer = document.getElementById('dynamic-tabs-container');
    if (tabsContainer) {
        const newTabContent = document.createElement('div');
        newTabContent.id = 'tab-' + pageId;
        newTabContent.className = "tab-content space-y-6 max-w-5xl mx-auto p-6 overflow-y-auto w-full h-full";
        newTabContent.innerHTML = `<div class="bg-slate-900 border border-slate-800 rounded-xl p-6 relative"><h2 class="text-2xl font-bold text-white mb-4">${pageName}</h2><div class="relative w-full h-[500px] border border-slate-800 rounded-lg p-4 bg-slate-950">${viewport ? viewport.innerHTML : ''}</div></div>`;
        tabsContainer.appendChild(newTabContent);
    }

    isPageDirty = false;
    alert(`Página "${pageName}" salva com sucesso!`);
    if(window.lucide) lucide.createIcons();
}

function openAddMenuModal() {
    if (currentRole !== 'ADMIN') return;
    const menuNameInput = document.getElementById('new-menu-name-input');
    if (menuNameInput) menuNameInput.value = '';
    renderIconPickerGrid();
    openModal('modal-add-menu');
}

function confirmCreateNewPageAndMenu() {
    const menuNameInput = document.getElementById('new-menu-name-input');
    const pageName = menuNameInput ? menuNameInput.value.trim() : '';
    if (!pageName) return;
    const pageId = 'custom-page-' + Date.now();
    const menuNav = document.getElementById('sidebar-menu-list');
    if (menuNav) {
        const menuButtonWrapper = document.createElement('div');
        menuButtonWrapper.id = 'wrapper-' + pageId;
        menuButtonWrapper.className = "flex items-center gap-1 w-full custom-menu-item";
        menuButtonWrapper.innerHTML = `<button onclick="switchTab('${pageId}'); closeSidebar();" id="nav-${pageId}" class="nav-btn flex-1 px-3 py-2.5 rounded-l-lg text-xs font-semibold flex items-center gap-3 transition text-slate-400 hover:bg-slate-800 hover:text-white truncate"><i data-lucide="${selectedIconName}" class="w-4 h-4 text-cyan-400 shrink-0"></i> <span class="truncate">${pageName}</span></button><button onclick="deleteCustomPage('${pageId}')" class="px-2.5 py-3 bg-slate-800 hover:bg-red-600/30 text-slate-400 hover:text-red-400 rounded-r-lg transition text-xs"><i data-lucide="trash-2" class="w-3.5 h-3.5"></i></button>`;
        menuNav.appendChild(menuButtonWrapper);
    }

    const tabsContainer = document.getElementById('dynamic-tabs-container');
    if (tabsContainer) {
        const newTabContent = document.createElement('div');
        newTabContent.id = 'tab-' + pageId;
        newTabContent.className = "tab-content space-y-6 max-w-5xl mx-auto p-6 overflow-y-auto w-full h-full";
        newTabContent.innerHTML = `<div class="container-editable bg-slate-900 border border-slate-800 rounded-xl p-6 relative"><div class="container-html"><h2 class="text-2xl font-bold text-white mb-2">${pageName}</h2><p class="text-slate-400 text-sm">Página customizada.</p></div></div>`;
        tabsContainer.appendChild(newTabContent);
    }

    closeModal('modal-add-menu');
    switchTab(pageId);
    closeSidebar();
}

function deleteCustomPage(pageId) {
    if (currentRole !== 'ADMIN') return;
    if (confirm("Excluir esta página?")) {
        const wrapper = document.getElementById('wrapper-' + pageId);
        const tab = document.getElementById('tab-' + pageId);
        if (wrapper) wrapper.remove();
        if (tab) tab.remove();
        switchTab('conheca');
    }
}

function openSidebar() { 
    const sidebar = document.getElementById('main-sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    if (sidebar) sidebar.classList.remove('-translate-x-full'); 
    if (overlay) overlay.classList.remove('hidden'); 
}

function closeSidebar() { 
    const sidebar = document.getElementById('main-sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    if (sidebar) sidebar.classList.add('-translate-x-full'); 
    if (overlay) overlay.classList.add('hidden'); 
}

function toggleSidebar() { 
    const sb = document.getElementById('main-sidebar'); 
    if (sb) {
        sb.classList.contains('-translate-x-full') ? openSidebar() : closeSidebar(); 
    }
}

function openModal(id) { 
    const modal = document.getElementById(id);
    if (modal) modal.classList.remove('hidden'); 
}

function closeModal(id) { 
    const modal = document.getElementById(id);
    if (modal) modal.classList.add('hidden'); 
}

function editContainerCode(btn) {
    activeContainerTarget = btn.closest('.container-editable');
    if (!activeContainerTarget) return;
    const htmlDiv = activeContainerTarget.querySelector('.container-html');
    const codeInput = document.getElementById('code-html-input');
    if (codeInput) codeInput.value = htmlDiv ? htmlDiv.innerHTML.trim() : '';
    openModal('modal-edit-code');
}

function saveContainerCodeChanges() {
    if (!activeContainerTarget) return;
    const htmlDiv = activeContainerTarget.querySelector('.container-html');
    const codeInput = document.getElementById('code-html-input');
    if (htmlDiv && codeInput) htmlDiv.innerHTML = codeInput.value;
    closeModal('modal-edit-code');
}

function deleteContainer(btn) { 
    const container = btn.closest('.container-editable');
    if (container) container.remove(); 
}

function triggerRPASync() { alert('Payload enviado ao bot RPA com sucesso!'); }

async function saveProjectToSupabase() {
    if (typeof supabase === 'undefined' || !supabase) {
        alert('Supabase Client não encontrado. Verifique se o supabaseClient.js foi configurado.');
        return;
    }

    // Sincroniza estado das subpáginas do canvas
    saveCurrentEditorCanvasState();

    const chartStateRaw = localStorage.getItem("chart_studio_full_state");
    const chartState = chartStateRaw ? JSON.parse(chartStateRaw) : {};

    const payload = {
        project_name: "Projeto RPA Studio",
        subpages: subpagesData,
        variables: creatorVariables,
        targets: targetPagesList,
        chart_state: chartState,
        updated_at: new Date().toISOString()
    };

    try {
        const { data, error } = await supabase
            .from('rpa_studio_projects')
            .upsert([payload], { onConflict: 'project_name' });

        if (error) throw error;
        alert('Projeto salvo com sucesso no Supabase!');
    } catch (err) {
        console.error('Erro ao salvar no Supabase:', err);
        alert('Erro ao salvar no Supabase. Verifique o console para detalhes.');
    }
}

function sendChatMessage() {
    const input = document.getElementById('chat-input');
    if(!input || !input.value.trim()) return;
    const chatBox = document.getElementById('chat-messages');
    if (!chatBox) return;

    const userMsg = document.createElement('div');
    userMsg.className = 'bg-blue-600/30 border border-blue-500/30 p-3 rounded-lg max-w-md text-slate-100 ml-auto text-right';
    userMsg.textContent = input.value;
    chatBox.appendChild(userMsg);
    input.value = '';
    chatBox.scrollTop = chatBox.scrollHeight;

    setTimeout(() => {
        const botMsg = document.createElement('div');
        botMsg.className = 'bg-slate-800 p-3 rounded-lg max-w-md text-slate-200';
        botMsg.textContent = `Resposta simulada do assistente RPA Studio.`;
        chatBox.appendChild(botMsg);
        chatBox.scrollTop = chatBox.scrollHeight;
    }, 600);
}