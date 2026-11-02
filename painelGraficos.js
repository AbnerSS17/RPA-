const { useState, useEffect, useRef, useMemo } = React;

const SAMPLE_DATASETS = {
  generic1: {
    name: "Vendas Mensais (Multi-Métrica)",
    data: [
      { Variavel_1: "Jan", Variavel_2: 4200, Variavel_3: 1200, Variavel_4: 450, Status: "Ok" },
      { Variavel_1: "Fev", Variavel_2: 5300, Variavel_3: 1800, Variavel_4: 520, Status: "Ok" },
      { Variavel_1: "Mar", Variavel_2: 6100, Variavel_3: 2400, Variavel_4: 610, Status: "Alerta" },
      { Variavel_1: "Abr", Variavel_2: 5800, Variavel_3: 2100, Variavel_4: 590, Status: "Ok" },
      { Variavel_1: "Mai", Variavel_2: 7200, Variavel_3: 3100, Variavel_4: 780, Status: "Critico" },
      { Variavel_1: "Jun", Variavel_2: 8500, Variavel_3: 3900, Variavel_4: 920, Status: "Ok" }
    ]
  },
  generic2: {
    name: "Categorias & Participação",
    data: [
      { Variavel_1: "Tecnologia", Variavel_2: 88000, Variavel_3: 12, Variavel_4: 1500, Status: "Ok" },
      { Variavel_1: "Tecnologia", Variavel_2: 42000, Variavel_3: 8, Variavel_4: 900, Status: "Ok" },
      { Variavel_1: "Serviços", Variavel_2: 74000, Variavel_3: 6, Variavel_4: 1100, Status: "Ok" },
      { Variavel_1: "Varejo", Variavel_2: 95000, Variavel_3: 16, Variavel_4: 2100, Status: "Alerta" },
      { Variavel_1: "Varejo", Variavel_2: 31000, Variavel_3: 5, Variavel_4: 400, Status: "Ok" },
      { Variavel_1: "Logística", Variavel_2: 62000, Variavel_3: 4, Variavel_4: 850, Status: "Critico" }
    ]
  },
  rpaSample: {
    name: "Dados em Tempo Real (RPA)",
    data: [
      { Variavel_1: "08:00", Variavel_2: 320, Variavel_3: 2, Variavel_4: 45, Status: "Ok" },
      { Variavel_1: "09:00", Variavel_2: 540, Variavel_3: 5, Variavel_4: 80, Status: "Ok" },
      { Variavel_1: "10:00", Variavel_2: 890, Variavel_3: 1, Variavel_4: 120, Status: "Alerta" },
      { Variavel_1: "11:00", Variavel_2: 1200, Variavel_3: 8, Variavel_4: 210, Status: "Critico" },
      { Variavel_1: "12:00", Variavel_2: 750, Variavel_3: 3, Variavel_4: 95, Status: "Ok" }
    ]
  },
  waterfallSample: {
    name: "DRE / Variação Financeira (Waterfall)",
    data: [
      { Variavel_1: "Receita Bruta", Variavel_2: 10000, Variavel_3: 10000, Variavel_4: 100 },
      { Variavel_1: "Impostos", Variavel_2: -1800, Variavel_3: 8200, Variavel_4: 82 },
      { Variavel_1: "Custo Produtos", Variavel_2: -3200, Variavel_3: 5000, Variavel_4: 50 },
      { Variavel_1: "Despesas Ops", Variavel_2: -1500, Variavel_3: 3500, Variavel_4: 35 },
      { Variavel_1: "Novas Vendas", Variavel_2: 2500, Variavel_3: 6000, Variavel_4: 60 },
      { Variavel_1: "Lucro Líquido", Variavel_2: 6000, Variavel_3: 6000, Variavel_4: 60 }
    ]
  },
  funnelSample: {
    name: "Funil de Vendas & Conversão",
    data: [
      { Variavel_1: "Visitantes", Variavel_2: 12000, Variavel_3: 100, Variavel_4: 0 },
      { Variavel_1: "Leads", Variavel_2: 4500, Variavel_3: 37.5, Variavel_4: 120 },
      { Variavel_1: "Oportunidades", Variavel_2: 1800, Variavel_3: 15, Variavel_4: 450 },
      { Variavel_1: "Propostas Sent", Variavel_2: 650, Variavel_3: 5.4, Variavel_4: 980 },
      { Variavel_1: "Clientes Fechados", Variavel_2: 220, Variavel_3: 1.8, Variavel_4: 1450 }
    ]
  }
};

const CHART_LIBRARY = [
  {
    category: "Comparação & Categoria",
    items: [
      { id: "bar", name: "Gráfico de Barras", icon: "bar-chart-3", type: "bar" },
      { id: "horizontal_bar", name: "Barras Horizontais", icon: "align-left", type: "horizontal_bar" },
      { id: "stacked_bar", name: "Barras Empilhadas", icon: "layers", type: "stacked_bar" },
      { id: "waterfall", name: "Gráfico Waterfall (Cascata)", icon: "bar-chart-2", type: "waterfall" }
    ]
  },
  {
    category: "Tendência & Séries Temporais",
    items: [
      { id: "line", name: "Gráfico de Linha", icon: "trending-up", type: "line" },
      { id: "area", name: "Gráfico de Área", icon: "activity", type: "area" },
      { id: "stacked_area", name: "Área Empilhada", icon: "layers", type: "stacked_area" }
    ]
  },
  {
    category: "Proporção & Conversão",
    items: [
      { id: "pie", name: "Gráfico de Pizza", icon: "pie-chart", type: "pie" },
      { id: "donut", name: "Gráfico de Rosca", icon: "disc", type: "doughnut" },
      { id: "polar", name: "Área Polar", icon: "compass", type: "polarArea" },
      { id: "funnel", name: "Funil de Conversão", icon: "filter", type: "funnel" }
    ]
  },
  {
    category: "Estatística & Dispersão",
    items: [
      { id: "scatter", name: "Dispersão (Scatter)", icon: "scatter-chart", type: "scatter" },
      { id: "bubble", name: "Gráfico de Bolhas", icon: "circle-dot", type: "bubble" },
      { id: "radar", name: "Gráfico Radar", icon: "shield-alert", type: "radar" },
      { id: "boxplot", name: "Boxplot & Distribuição", icon: "box", type: "boxplot" },
      { id: "heatmap", name: "Matriz de Correlação", icon: "grid", type: "heatmap" }
    ]
  },
  {
    category: "Métricas Executivas",
    items: [
      { id: "kpi", name: "Cartão KPI Executivo", icon: "gauge", type: "kpi" }
    ]
  }
];

const COLOR_PALETTES = {
  indigo: ["#6366f1", "#818cf8", "#a5b4fc", "#c7d2fe", "#312e81", "#4f46e5"],
  emerald: ["#10b981", "#34d399", "#6ee7b7", "#a7f3d0", "#065f46", "#059669"],
  sunset: ["#f43f5e", "#fb7185", "#fb923c", "#fbbf24", "#9f1239", "#e11d48"],
  cyber: ["#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899", "#1e40af", "#7c3aed"]
};

function EditPanelApp() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [analysisType, setAnalysisType] = useState("regression");
  const [datasetKey, setDatasetKey] = useState("rpaSample");
  
  const [rawData, setRawData] = useState(SAMPLE_DATASETS.rpaSample.data);
  const [columnTypes, setColumnTypes] = useState({});
  const [newVarName, setNewVarName] = useState("");

  const [customFormulaName, setCustomFormulaName] = useState("");
  const [customFormulaExpr, setCustomFormulaExpr] = useState("");
  
  const [filterCol, setFilterCol] = useState("ALL");
  const [filterOp, setFilterOp] = useState("equals");
  const [filterVal, setFilterVal] = useState("");
  const [nullStrategy, setNullStrategy] = useState("zero");
  
  const [enableGroupBy, setEnableGroupBy] = useState(false);
  const [groupByAgg, setGroupByAgg] = useState("sum");
  const [hueColumn, setHueColumn] = useState("NONE");

  const [selectedChart, setSelectedChart] = useState("horizontal_bar");
  const [xAxis, setXAxis] = useState("Variavel_1");
  const [selectedYAxes, setSelectedYAxes] = useState(["Variavel_2"]);
  
  const [inputMode, setInputMode] = useState("rpa");
  const [rpaStatus, setRpaStatus] = useState({ connected: true, lastSync: "Agora mesmo" });
  const [uploadFileName, setUploadFileName] = useState("");

  const [paletteKey, setPaletteKey] = useState("indigo");
  const [showFormula, setShowFormula] = useState(true);
  const [showTrendline, setShowTrendline] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [chartTitle, setChartTitle] = useState("Dados em Tempo Real (RPA)");
  
  const [codeTab, setCodeTab] = useState("python");
  const [savedProjects, setSavedProjects] = useState([]);
  const [projectName, setProjectName] = useState("");

  const initialStateRef = useRef(null);
  const canvasRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (window.lucide) window.lucide.createIcons();
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) root.classList.add('dark');
    else root.classList.remove('dark');
  }, [isDarkMode]);

  useEffect(() => {
    try {
      const loaded = localStorage.getItem("chart_studio_projects");
      if (loaded) setSavedProjects(JSON.parse(loaded));

      const currentSaved = localStorage.getItem("chart_studio_full_state");
      let loadedState = {
        selectedChart: "horizontal_bar",
        xAxis: "Variavel_1",
        selectedYAxes: ["Variavel_2"],
        chartTitle: "Dados em Tempo Real (RPA)",
        paletteKey: "indigo",
        isDarkMode: true,
        showTrendline: true,
        showGrid: true,
        analysisType: "regression",
        rawData: SAMPLE_DATASETS.rpaSample.data
      };

      if (currentSaved) {
        const parsed = JSON.parse(currentSaved);
        loadedState = { ...loadedState, ...parsed };
      }

      setSelectedChart(loadedState.selectedChart);
      setXAxis(loadedState.xAxis);
      setSelectedYAxes(loadedState.selectedYAxes);
      setChartTitle(loadedState.chartTitle);
      setPaletteKey(loadedState.paletteKey);
      setIsDarkMode(loadedState.isDarkMode);
      setShowTrendline(loadedState.showTrendline);
      setShowGrid(loadedState.showGrid);
      setAnalysisType(loadedState.analysisType);
      setRawData(loadedState.rawData);

      initialStateRef.current = JSON.stringify(loadedState);
    } catch (e) { 
      console.error("Erro ao carregar do localStorage", e); 
    }
  }, []);

  useEffect(() => {
    const fullState = {
      selectedChart,
      xAxis,
      selectedYAxes,
      chartTitle,
      paletteKey,
      isDarkMode,
      showTrendline,
      showGrid,
      analysisType,
      rawData
    };
    localStorage.setItem("chart_studio_full_state", JSON.stringify(fullState));
    window.activeStudioConfigState = fullState;
    window.dispatchEvent(new CustomEvent('studioConfigUpdated', { detail: fullState }));
  }, [selectedChart, xAxis, selectedYAxes, chartTitle, paletteKey, isDarkMode, showTrendline, showGrid, analysisType, rawData]);

  const saveFullState = () => {
    const fullState = {
      selectedChart,
      xAxis,
      selectedYAxes,
      chartTitle,
      paletteKey,
      isDarkMode,
      showTrendline,
      showGrid,
      analysisType,
      rawData
    };
    localStorage.setItem("chart_studio_full_state", JSON.stringify(fullState));
    initialStateRef.current = JSON.stringify(fullState);
  };

  const handleExit = () => {
    const currentState = {
      selectedChart,
      xAxis,
      selectedYAxes,
      chartTitle,
      paletteKey,
      isDarkMode,
      showTrendline,
      showGrid,
      analysisType,
      rawData
    };

    const hasChanges = JSON.stringify(currentState) !== initialStateRef.current;

    if (hasChanges) {
      const confirmSave = window.confirm("Existem alterações não salvas no gráfico. Deseja salvar antes de sair?");
      if (confirmSave) {
        saveFullState();
      }
    }

    if (typeof window.closePainelFullscreen === 'function') {
        window.closePainelFullscreen();
    } else {
        document.getElementById('fullscreen-painel-view').classList.add('hidden');
    }
  };

  useEffect(() => {
    if (inputMode !== "preset") return;
    const selected = SAMPLE_DATASETS[datasetKey];
    if (selected) {
      setRawData(selected.data);
      const keys = Object.keys(selected.data[0] || {});
      if (keys.length > 0) {
        setXAxis(keys[0]);
        const yCandidates = keys.filter(k => k !== keys[0] && typeof selected.data[0][k] === 'number');
        setSelectedYAxes(yCandidates.length > 0 ? [yCandidates[0]] : [keys[1] || keys[0]]);
      }
      setChartTitle(`${selected.name}`);
    }
  }, [datasetKey, inputMode]);

  const availableKeys = useMemo(() => {
    return rawData && rawData.length > 0 ? Object.keys(rawData[0]) : [];
  }, [rawData]);

  const handleAddVariable = () => {
    if (!newVarName.trim()) return;
    const cleanName = newVarName.trim().replace(/\s+/g, '_');
    if (availableKeys.includes(cleanName)) {
      alert("Uma variável com este nome já existe!");
      return;
    }

    const updated = rawData.map(row => ({
      ...row,
      [cleanName]: 0
    }));

    setRawData(updated);
    setNewVarName("");
  };

  const handleApplyCustomFormula = () => {
    if (!customFormulaName.trim() || !customFormulaExpr.trim()) {
      alert("Por favor, preencha o nome da variável e a fórmula matemática!");
      return;
    }

    const cleanVarName = customFormulaName.trim().replace(/\s+/g, '_');

    try {
      const updatedData = rawData.map(row => {
        let expr = customFormulaExpr;
        availableKeys.forEach(key => {
          const val = Number(row[key]) || 0;
          const regex = new RegExp(`\\b${key}\\b`, 'g');
          expr = expr.replace(regex, val);
        });

        const evaluatedVal = Function(`"use strict"; return (${expr})`)();

        return {
          ...row,
          [cleanVarName]: isNaN(evaluatedVal) ? 0 : Number(evaluatedVal.toFixed(2))
        };
      });

      setRawData(updatedData);
      setCustomFormulaName("");
      setCustomFormulaExpr("");
      alert(`Variável '${cleanVarName}' gerada com sucesso a partir da fórmula!`);
    } catch (err) {
      alert("Erro na fórmula matemática. Exemplo de uso: Variavel_2 - Variavel_3 ou Variavel_2 * 1.15");
    }
  };

  const handleDeleteVariable = (varKey) => {
    if (availableKeys.length <= 1) {
      alert("O dataset precisa ter pelo menos 1 variável!");
      return;
    }

    const updated = rawData.map(row => {
      const copy = { ...row };
      delete copy[varKey];
      return copy;
    });

    if (xAxis === varKey) {
      const remaining = availableKeys.filter(k => k !== varKey);
      setXAxis(remaining[0]);
    }

    setSelectedYAxes(prev => {
      const filtered = prev.filter(k => k !== varKey);
      return filtered.length > 0 ? filtered : [availableKeys.filter(k => k !== varKey)[0]];
    });

    setRawData(updated);
  };

  const toggleYAxis = (key) => {
    setSelectedYAxes(prev => {
      if (prev.includes(key)) {
        if (prev.length === 1) return prev;
        return prev.filter(k => k !== key);
      } else {
        return [...prev, key];
      }
    });
  };

  const processedData = useMemo(() => {
    if (!rawData || rawData.length === 0) return [];
    let data = JSON.parse(JSON.stringify(rawData));

    data = data.map(row => {
      const newRow = { ...row };
      availableKeys.forEach(key => {
        let val = newRow[key];
        const explicitType = columnTypes[key];

        if (val === null || val === undefined || val === "" || Number.isNaN(val)) {
          if (nullStrategy === "zero") val = 0;
          else if (nullStrategy === "drop") val = null;
        }

        if (explicitType === "number") {
          const parsed = Number(val);
          val = isNaN(parsed) ? (nullStrategy === "zero" ? 0 : null) : parsed;
        } else if (explicitType === "string") {
          val = String(val ?? "");
        }

        newRow[key] = val;
      });
      return newRow;
    }).filter(row => {
      if (nullStrategy === "drop") {
        return Object.values(row).every(v => v !== null && v !== undefined);
      }
      return true;
    });

    if (filterCol !== "ALL" && filterVal !== "") {
      data = data.filter(row => {
        const cellVal = row[filterCol];
        if (cellVal === undefined || cellVal === null) return false;
        
        if (filterOp === "equals") return String(cellVal).toLowerCase() === filterVal.toLowerCase();
        if (filterOp === "contains") return String(cellVal).toLowerCase().includes(filterVal.toLowerCase());
        if (filterOp === "gt") return Number(cellVal) > Number(filterVal);
        if (filterOp === "lt") return Number(cellVal) < Number(filterVal);
        return true;
      });
    }

    if (enableGroupBy && xAxis && selectedYAxes.length > 0) {
      const groups = {};
      data.forEach(row => {
        const groupKey = String(row[xAxis] ?? "Outros");
        if (!groups[groupKey]) groups[groupKey] = [];
        groups[groupKey].push(row);
      });

      data = Object.keys(groups).map(gKey => {
        const rowsInGroup = groups[gKey];
        const aggregatedRow = { [xAxis]: gKey };

        selectedYAxes.forEach(yKey => {
          const vals = rowsInGroup.map(r => Number(r[yKey]) || 0);
          let aggregatedVal = 0;

          if (groupByAgg === "sum") aggregatedVal = vals.reduce((a, b) => a + b, 0);
          else if (groupByAgg === "avg") aggregatedVal = vals.reduce((a, b) => a + b, 0) / (vals.length || 1);
          else if (groupByAgg === "count") aggregatedVal = vals.length;
          else if (groupByAgg === "min") aggregatedVal = Math.min(...vals);
          else if (groupByAgg === "max") aggregatedVal = Math.max(...vals);
          else if (groupByAgg === "distinct") aggregatedVal = new Set(vals).size;

          aggregatedRow[yKey] = Number(aggregatedVal.toFixed(2));
        });

        if (hueColumn !== "NONE" && rowsInGroup[0]) {
          aggregatedRow[hueColumn] = String(rowsInGroup[0][hueColumn]);
        }

        return aggregatedRow;
      });
    }

    return data;
  }, [rawData, columnTypes, nullStrategy, filterCol, filterOp, filterVal, enableGroupBy, groupByAgg, xAxis, selectedYAxes, hueColumn, availableKeys]);

  const mathStats = useMemo(() => {
    const primaryY = selectedYAxes[0] || availableKeys[1] || availableKeys[0];
    if (!processedData || processedData.length === 0 || !xAxis || !primaryY) {
      return { 
        mean: 0, sum: 0, min: 0, max: 0, stdDev: 0, variance: 0,
        growthRate: 0, movingAvg: [], slope: 0, intercept: 0, trendPoints: [],
        maxCategory: "-", minCategory: "-", q1: 0, median: 0, q3: 0, iqr: 0, outliers: []
      };
    }

    const yValues = processedData.map(d => Number(d[primaryY]) || 0);
    const sum = yValues.reduce((a, b) => a + b, 0);
    const mean = sum / (yValues.length || 1);
    const min = Math.min(...yValues);
    const max = Math.max(...yValues);

    let maxCategory = "-";
    let minCategory = "-";
    const maxIndex = yValues.indexOf(max);
    const minIndex = yValues.indexOf(min);
    if (maxIndex !== -1 && processedData[maxIndex]) maxCategory = String(processedData[maxIndex][xAxis]);
    if (minIndex !== -1 && processedData[minIndex]) minCategory = String(processedData[minIndex][xAxis]);

    const variance = yValues.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (yValues.length || 1);
    const stdDev = Math.sqrt(variance);

    const firstVal = yValues[0] || 1;
    const lastVal = yValues[yValues.length - 1] || 0;
    const growthRate = (((lastVal - firstVal) / Math.abs(firstVal)) * 100).toFixed(2);

    const movingAvg = yValues.map((val, idx, arr) => {
      if (idx < 2) return val;
      return Number(((arr[idx - 2] + arr[idx - 1] + val) / 3).toFixed(2));
    });

    const n = yValues.length;
    const xValues = Array.from({ length: n }, (_, i) => i + 1);
    const sumX = xValues.reduce((a, b) => a + b, 0);
    const sumY = sum;
    const sumXY = xValues.reduce((acc, x, i) => acc + x * yValues[i], 0);
    const sumXX = xValues.reduce((acc, x) => acc + x * x, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX) || 0;
    const intercept = (sumY - slope * sumX) / n || 0;
    const trendPoints = xValues.map(x => Number((slope * x + intercept).toFixed(2)));

    const sortedY = [...yValues].sort((a, b) => a - b);
    const getPercentile = (arr, p) => {
      const idx = (arr.length - 1) * p;
      const lower = Math.floor(idx);
      const upper = Math.ceil(idx);
      if (lower === upper) return arr[lower];
      return arr[lower] + (arr[upper] - arr[lower]) * (idx - lower);
    };

    const q1 = getPercentile(sortedY, 0.25);
    const median = getPercentile(sortedY, 0.5);
    const q3 = getPercentile(sortedY, 0.75);
    const iqr = q3 - q1;
    const lowerFence = q1 - 1.5 * iqr;
    const upperFence = q3 + 1.5 * iqr;
    const outliers = sortedY.filter(v => v < lowerFence || v > upperFence);

    return {
      mean: mean.toFixed(2),
      sum: sum.toFixed(2),
      min: min.toFixed(2),
      max: max.toFixed(2),
      stdDev: stdDev.toFixed(2),
      variance: variance.toFixed(2),
      growthRate,
      movingAvg,
      slope: slope.toFixed(2),
      intercept: intercept.toFixed(2),
      trendPoints,
      maxCategory,
      minCategory,
      q1: q1.toFixed(2),
      median: median.toFixed(2),
      q3: q3.toFixed(2),
      iqr: iqr.toFixed(2),
      outliers
    };
  }, [processedData, xAxis, selectedYAxes, availableKeys]);

  const autoInsights = useMemo(() => {
    if (!processedData || processedData.length === 0) return "Nenhum dado disponível para análise.";

    const primaryY = selectedYAxes[0] || availableKeys[1] || availableKeys[0];
    const gRate = Number(mathStats.growthRate);
    const trendDirection = gRate > 0 ? "ascendente 📈" : gRate < 0 ? "descendente 📉" : "estável ⚖️";
    const volatility = Number(mathStats.stdDev) > (Number(mathStats.mean) * 0.3) ? "alta volatilidade" : "baixa variação";

    let story = `Análise do dataset **"${chartTitle}"**: A métrica principal **${primaryY}** (${selectedYAxes.length} métrica(s) selecionada(s)) apresenta uma tendência **${trendDirection}** com variação total de **${mathStats.growthRate}%**. `;
    story += `Média calculada de **${mathStats.mean}**, registrando pico máximo em **${mathStats.maxCategory} (${mathStats.max})** e mínimo em **${mathStats.minCategory} (${mathStats.min})**. `;
    
    if (mathStats.outliers.length > 0) {
      story += `⚠️ **Atenção:** Foram identificados ${mathStats.outliers.length} valores discrepantes (outliers: ${mathStats.outliers.join(', ')}). `;
    } else {
      story += `Os dados possuem uma distribuição com ${volatility}. `;
    }

    if (analysisType === 'regression') {
      story += `Regressão linear: variação estimada em **${mathStats.slope}** por período, com projeção de **${(Number(mathStats.slope) * (processedData.length + 1) + Number(mathStats.intercept)).toFixed(2)}** para o próximo ponto.`;
    }

    return story;
  }, [processedData, mathStats, chartTitle, selectedYAxes, availableKeys, analysisType]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadFileName(file.name);
    const fileName = file.name.toLowerCase();

    if (fileName.endsWith('.csv')) {
      Papa.parse(file, {
        header: true, dynamicTyping: true, skipEmptyLines: true,
        complete: (results) => { if (results.data.length > 0) applyParsedData(results.data, file.name); }
      });
    } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const wb = XLSX.read(evt.target.result, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const parsedData = XLSX.utils.sheet_to_json(ws);
        if (parsedData.length > 0) applyParsedData(parsedData, file.name);
      };
      reader.readAsBinaryString(file);
    } else if (fileName.endsWith('.json')) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const parsed = JSON.parse(evt.target.result);
          if (Array.isArray(parsed) && parsed.length > 0) applyParsedData(parsed, file.name);
        } catch (err) { alert("Erro ao ler JSON!"); }
      };
      reader.readAsText(file);
    }
  };

  const applyParsedData = (parsedArray, sourceName) => {
    setRawData(parsedArray);
    const keys = Object.keys(parsedArray[0]);
    setXAxis(keys[0]);
    const yCandidates = keys.filter(k => k !== keys[0] && typeof parsedArray[0][k] === 'number');
    setSelectedYAxes(yCandidates.length > 0 ? [yCandidates[0]] : [keys[1] || keys[0]]);
    setChartTitle(`Análise: ${sourceName.replace(/\.[^/.]+$/, "")}`);
  };

  const handleCellChange = (rowIndex, colKey, value) => {
    const updated = [...rawData];
    const numVal = Number(value);
    updated[rowIndex][colKey] = isNaN(numVal) || value === "" ? value : numVal;
    setRawData(updated);
  };

  const handleAddRow = () => {
    if (!rawData || rawData.length === 0) return;
    const newRow = {};
    Object.keys(rawData[0]).forEach(k => {
      newRow[k] = typeof rawData[0][k] === 'number' ? 0 : "Novo Item";
    });
    setRawData([...rawData, newRow]);
  };

  const handleRemoveRow = (index) => {
    if (rawData.length <= 1) return;
    setRawData(rawData.filter((_, idx) => idx !== index));
  };

  const handleSimulateRPA = () => {
    const timestamp = new Date().toLocaleTimeString();
    const robotGeneratedData = [
      { Variavel_1: "08:00", Variavel_2: 320, Variavel_3: 2, Variavel_4: 45, Status: "Ok" },
      { Variavel_1: "09:00", Variavel_2: 540, Variavel_3: 5, Variavel_4: 80, Status: "Ok" },
      { Variavel_1: "10:00", Variavel_2: 890, Variavel_3: 1, Variavel_4: 120, Status: "Alerta" },
      { Variavel_1: "11:00", Variavel_2: 1200, Variavel_3: 8, Variavel_4: 210, Status: "Critico" },
      { Variavel_1: "12:00", Variavel_2: 750, Variavel_3: 3, Variavel_4: 95, Status: "Ok" }
    ];
    setRawData(robotGeneratedData);
    setXAxis("Variavel_1");
    setSelectedYAxes(["Variavel_2"]);
    setChartTitle("Dados em Tempo Real (RPA)");
    setRpaStatus({ connected: true, lastSync: timestamp });
  };

  const handleSaveProject = () => {
    if (!projectName.trim()) return;
    const newProj = {
      id: Date.now(),
      name: projectName,
      selectedChart,
      xAxis,
      selectedYAxes,
      chartTitle,
      rawData,
      enableGroupBy,
      groupByAgg,
      hueColumn,
      paletteKey
    };
    const updated = [...savedProjects, newProj];
    setSavedProjects(updated);
    localStorage.setItem("chart_studio_projects", JSON.stringify(updated));
    setProjectName("");
  };

  const handleLoadProject = (proj) => {
    setSelectedChart(proj.selectedChart);
    setXAxis(proj.xAxis);
    setSelectedYAxes(proj.selectedYAxes || [proj.yAxis]);
    setChartTitle(proj.chartTitle);
    setRawData(proj.rawData);
    setEnableGroupBy(proj.enableGroupBy || false);
    setGroupByAgg(proj.groupByAgg || "sum");
    setHueColumn(proj.hueColumn || "NONE");
    setPaletteKey(proj.paletteKey || "indigo");

    const projState = {
      selectedChart: proj.selectedChart,
      xAxis: proj.xAxis,
      selectedYAxes: proj.selectedYAxes || [proj.yAxis],
      chartTitle: proj.chartTitle,
      paletteKey: proj.paletteKey || "indigo",
      isDarkMode,
      showTrendline,
      showGrid,
      analysisType,
      rawData: proj.rawData
    };
    initialStateRef.current = JSON.stringify(projState);
  };

  const handleDeleteProject = (id) => {
    const updated = savedProjects.filter(p => p.id !== id);
    setSavedProjects(updated);
    localStorage.setItem("chart_studio_projects", JSON.stringify(updated));
  };

  useEffect(() => {
    if (!canvasRef.current || !processedData || processedData.length === 0) return;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const ctx = canvasRef.current.getContext("2d");
    const colors = COLOR_PALETTES[paletteKey];

    const labels = processedData.map(d => String(d[xAxis]));
    let chartType = 'line';
    let isFillArea = false;
    let indexAxis = 'x';
    let customDatasets = [];

    const primaryY = selectedYAxes[0] || availableKeys[1] || availableKeys[0];

    if (selectedChart === "waterfall") {
      chartType = 'bar';
      let cumulative = 0;
      const backgroundColors = [];
      const rawYValues = processedData.map(d => Number(d[primaryY]) || 0);
      const dataPoints = rawYValues.map(val => {
        cumulative += val;
        backgroundColors.push(val >= 0 ? '#10b981' : '#f43f5e');
        return cumulative;
      });

      customDatasets = [{
        label: `Variação Acumulada (${primaryY})`,
        data: dataPoints,
        backgroundColor: backgroundColors,
        borderRadius: 6
      }];
    } else if (selectedChart === "funnel") {
      chartType = 'bar';
      indexAxis = 'y';
      const rawYValues = processedData.map(d => Number(d[primaryY]) || 0);
      customDatasets = [{
        label: `Funil (${primaryY})`,
        data: rawYValues,
        backgroundColor: colors,
        borderRadius: 6
      }];
    } else if (selectedChart === "boxplot") {
      chartType = 'bar';
      customDatasets = [
        { label: 'Q1 (25%)', data: processedData.map(() => Number(mathStats.q1)), backgroundColor: colors[1] || '#818cf8' },
        { label: 'Mediana (50%)', data: processedData.map(() => Number(mathStats.median)), backgroundColor: colors[0] || '#6366f1' },
        { label: 'Q3 (75%)', data: processedData.map(() => Number(mathStats.q3)), backgroundColor: colors[4] || '#4f46e5' }
      ];
    } else if (selectedChart === "heatmap") {
      chartType = 'bar';
      const rawYValues = processedData.map(d => Number(d[primaryY]) || 0);
      customDatasets = [{
        label: "Densidade de Correlação",
        data: rawYValues,
        backgroundColor: rawYValues.map(v => v > Number(mathStats.mean) ? '#f43f5e' : '#3b82f6')
      }];
    } else {
      switch (selectedChart) {
        case 'bar': chartType = 'bar'; break;
        case 'horizontal_bar': chartType = 'bar'; indexAxis = 'y'; break;
        case 'stacked_bar': chartType = 'bar'; break;
        case 'line': chartType = 'line'; break;
        case 'area': chartType = 'line'; isFillArea = true; break;
        case 'stacked_area': chartType = 'line'; isFillArea = true; break;
        case 'pie': chartType = 'pie'; break;
        case 'donut': chartType = 'doughnut'; break;
        case 'polar': chartType = 'polarArea'; break;
        case 'scatter': chartType = 'scatter'; break;
        case 'bubble': chartType = 'bubble'; break;
        case 'radar': chartType = 'radar'; break;
        default: chartType = 'line';
      }

      const isCircularChart = ['pie', 'doughnut', 'polarArea', 'radar'].includes(chartType);

      if (isCircularChart) {
        const rawYValues = processedData.map(d => Number(d[primaryY]) || 0);
        customDatasets = [{
          label: String(primaryY).toUpperCase(),
          data: rawYValues,
          backgroundColor: colors,
          borderColor: isDarkMode ? '#0f172a' : '#ffffff',
          borderWidth: 2
        }];
      } else {
        customDatasets = selectedYAxes.map((yKey, index) => {
          const color = colors[index % colors.length];
          const rawYValues = processedData.map(d => Number(d[yKey]) || 0);
          return {
            label: String(yKey).toUpperCase(),
            data: rawYValues,
            backgroundColor: isFillArea ? color + '44' : color + '88',
            borderColor: color,
            borderWidth: 2,
            fill: isFillArea,
            tension: 0.35
          };
        });
      }

      if (showTrendline && !isCircularChart && ['line', 'bar', 'horizontal_bar', 'scatter', 'area'].includes(selectedChart)) {
        if (analysisType === 'regression') {
          customDatasets.push({
            label: `Regressão (y = ${mathStats.slope}x + ${mathStats.intercept})`,
            data: mathStats.trendPoints,
            borderColor: '#ef4444',
            borderWidth: 2,
            borderDash: [6, 6],
            pointRadius: 0,
            type: 'line',
            fill: false
          });
        } else if (analysisType === 'timeSeries') {
          customDatasets.push({
            label: `Média Móvel (3 P)`,
            data: mathStats.movingAvg,
            borderColor: '#f59e0b',
            borderWidth: 2,
            borderDash: [3, 3],
            pointRadius: 2,
            type: 'line',
            fill: false
          });
        }
      }
    }

    const textColor = isDarkMode ? '#94a3b8' : '#475569';
    const gridColor = isDarkMode ? '#334155' : '#e2e8f0';
    const isCircular = ['pie', 'doughnut', 'polarArea', 'radar'].includes(chartType);

    try {
      chartInstanceRef.current = new Chart(ctx, {
        type: chartType,
        data: { labels, datasets: customDatasets },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          indexAxis: indexAxis,
          plugins: {
            legend: { display: true, labels: { color: textColor } },
            title: {
              display: true,
              text: chartTitle,
              color: isDarkMode ? '#f8fafc' : '#0f172a',
              font: { size: 18, weight: 'bold' }
            }
          },
          scales: isCircular ? {} : {
            x: {
              grid: { display: showGrid, color: gridColor },
              ticks: { color: textColor },
              stacked: selectedChart.includes('stacked')
            },
            y: {
              grid: { display: showGrid, color: gridColor },
              ticks: { color: textColor },
              stacked: selectedChart.includes('stacked')
            }
          }
        }
      });
    } catch (err) {
      console.error("Erro ao renderizar gráfico no painel:", err);
    }

    return () => {
      if (chartInstanceRef.current) chartInstanceRef.current.destroy();
    };
  }, [processedData, selectedChart, xAxis, selectedYAxes, paletteKey, showTrendline, showGrid, chartTitle, mathStats, analysisType, isDarkMode, availableKeys]);

  const generateCode = () => {
    const yColsStr = JSON.stringify(selectedYAxes);
    if (codeTab === "python") {
      return `# Python Data Science Snippet (Plotly / Pandas) - Multi-Variável
import pandas as pd
import plotly.express as px

# 1. Carregar Dados
data = ${JSON.stringify(processedData.slice(0, 5), null, 2)}
df = pd.DataFrame(data)

${enableGroupBy ? `# 2. Agregação GroupBy (${groupByAgg.toUpperCase()})
df = df.groupby('${xAxis}').agg({col: '${groupByAgg}' for col in ${yColsStr}}).reset_index()` : ''}

# 3. Gerar Gráfico Multi-Métrica (${selectedChart.toUpperCase()})
fig = px.${selectedChart === 'bar' ? 'bar' : 'line'}(
    df, x="${xAxis}", y=${yColsStr}, title="${chartTitle}"${hueColumn !== "NONE" ? `, color="${hueColumn}"` : ""}
)
fig.show()`;
    }

    if (codeTab === "r") {
      return `# R Statistical Computing (ggplot2)
library(ggplot2)
library(dplyr)

df <- data.frame(
  ${xAxis} = c(${processedData.map(d => `"${d[xAxis]}"`).join(", ")}),
  ${selectedYAxes[0] || 'Variavel_2'} = c(${processedData.map(d => d[selectedYAxes[0] || 'Variavel_2']).join(", ")})
)

ggplot(df, aes(x = ${xAxis}, y = ${selectedYAxes[0] || 'Variavel_2'})) +
  geom_col(fill = "${COLOR_PALETTES[paletteKey][0]}") +
  labs(title = "${chartTitle}") +
  theme_minimal()`;
    }

    if (codeTab === "dax") {
      return `// Fórmulas DAX para Power BI (Multi-Variável)
${selectedYAxes.map(y => `Total_${y} = SUM(Data[${y}])\nMédia_${y} = AVERAGE(Data[${y}])`).join('\n\n')}

${enableGroupBy ? `// Agregação Calculada
Métrica_Grouped = 
SUMX(
    SUMMARIZE(Data, Data[${xAxis}], "Agregado", ${groupByAgg.toUpperCase()}(Data[${selectedYAxes[0]}])),
    [Agregado]
)` : ''}`;
    }

    if (codeTab === "react") {
      return `// Componente React + Chart.js (Multi-Variável)
import React from 'react';
import { Chart as ChartJS } from 'chart.js/auto';
import { Chart } from 'react-chartjs-2';

const data = ${JSON.stringify(processedData, null, 2)};
const yAxes = ${yColsStr};

export default function MeuGrafico() {
  const chartData = {
    labels: data.map(d => d.${xAxis}),
    datasets: yAxes.map((yKey, idx) => ({
      label: yKey,
      data: data.map(d => d[yKey]),
      borderColor: ['${COLOR_PALETTES[paletteKey].join("', '")}'][idx % ${COLOR_PALETTES[paletteKey].length}]
    }))
  };

  return <Chart type="${selectedChart === 'horizontal_bar' ? 'bar' : selectedChart}" data={chartData} />;
}`;
    }
  };

  return (
    <div className={`flex flex-col h-screen overflow-hidden ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <header className={`h-16 border-b px-6 flex items-center justify-between z-10 ${isDarkMode ? 'border-slate-800 bg-slate-900/80' : 'border-slate-200 bg-white/80'} backdrop-blur`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-brand-600 rounded-lg text-white shadow-lg shadow-brand-500/30">
            <i data-lucide="bar-chart-2" className="w-6 h-6"></i>
          </div>
          <div>
            <h1 className="font-bold text-lg flex items-center gap-2">
              Low-Code Chart Studio <span className="text-xs px-2 py-0.5 rounded bg-brand-900/60 text-brand-300 border border-brand-700 font-mono">Math Engine Pro</span>
            </h1>
            <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>ETL Multi-Variável, Fórmulas Matemáticas Customizadas & Data Storytelling</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExit}
            className="px-3 py-2 rounded-lg border text-xs font-semibold bg-red-600/20 border-red-500/40 text-red-300 hover:bg-red-600 hover:text-white transition flex items-center gap-2 cursor-pointer"
          >
            <i data-lucide="log-out" className="w-4 h-4"></i> Sair
          </button>

          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2 rounded-lg border text-xs font-medium transition flex items-center gap-1.5 cursor-pointer ${
              isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700' : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <i data-lucide={isDarkMode ? "sun" : "moon"} className="w-4 h-4"></i>
            <span>{isDarkMode ? "Claro" : "Escuro"}</span>
          </button>

          <button 
            onClick={() => {
              const canvas = canvasRef.current;
              if (!canvas) return;
              const link = document.createElement('a');
              link.download = `${chartTitle.replace(/\s+/g, '_')}.png`;
              link.href = canvas.toDataURL();
              link.click();
            }}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-sm font-medium transition flex items-center gap-2 shadow cursor-pointer"
          >
            <i data-lucide="download" className="w-4 h-4"></i> Exportar PNG
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className={`w-64 border-r p-4 overflow-y-auto ${isDarkMode ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200 bg-slate-100/60'}`}>
          <h2 className={`text-xs font-semibold uppercase tracking-wider mb-4 flex items-center gap-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            <i data-lucide="grid" className="w-4 h-4"></i> Tipos de Visualização
          </h2>

          <div className="space-y-6">
            {CHART_LIBRARY.map((cat, idx) => (
              <div key={idx}>
                <span className={`text-xs font-medium block mb-2 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>{cat.category}</span>
                <div className="space-y-1">
                  {cat.items.map(item => (
                    <button
                      key={item.id}
                      onClick={() => setSelectedChart(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-left transition cursor-pointer ${
                        selectedChart === item.id 
                          ? 'bg-brand-600/20 text-brand-500 border border-brand-500/40 font-medium' 
                          : isDarkMode ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200' : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                      }`}
                    >
                      <i data-lucide={item.icon} className="w-4 h-4"></i>
                      {item.name}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </aside>

        <aside className={`w-80 border-r p-5 overflow-y-auto space-y-6 ${isDarkMode ? 'border-slate-800 bg-slate-900/30' : 'border-slate-200 bg-white'}`}>
          <div className="p-3 bg-brand-950/30 border border-brand-500/30 rounded-xl">
            <label className="text-xs font-bold text-brand-400 uppercase tracking-wider block mb-2 flex items-center gap-2">
              <i data-lucide="brain-circuit" className="w-4 h-4"></i> Objetivo da Análise
            </label>
            
            <select
              value={analysisType}
              onChange={(e) => setAnalysisType(e.target.value)}
              className={`w-full border rounded-lg p-2 text-xs font-semibold focus:outline-none focus:border-brand-500 ${
                isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-800'
              }`}
            >
              <option value="descriptive">1. Totais & Estatística Descritiva</option>
              <option value="timeSeries">2. Série Temporal & Evolução</option>
              <option value="distribution">3. Distribuição & Dispersão</option>
              <option value="regression">4. Regressão, Correlação & Previsão</option>
            </select>
          </div>

          <div>
            <label className={`text-xs font-semibold uppercase tracking-wider block mb-2 flex items-center gap-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              <i data-lucide="database" className="w-4 h-4"></i> 1. Fonte de Dados (Ingestão)
            </label>

            <div className={`grid grid-cols-2 gap-1.5 p-1 rounded-lg border mb-3 ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'}`}>
              <button
                onClick={() => setInputMode("preset")}
                className={`py-1 text-[11px] font-medium rounded transition flex items-center justify-center gap-1 cursor-pointer ${
                  inputMode === 'preset' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <i data-lucide="layers" className="w-3 h-3"></i> Exemplo
              </button>

              <button
                onClick={() => setInputMode("file")}
                className={`py-1 text-[11px] font-medium rounded transition flex items-center justify-center gap-1 cursor-pointer ${
                  inputMode === 'file' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <i data-lucide="file-up" className="w-3 h-3"></i> Arquivo
              </button>

              <button
                onClick={() => setInputMode("manual")}
                className={`py-1 text-[11px] font-medium rounded transition flex items-center justify-center gap-1 cursor-pointer ${
                  inputMode === 'manual' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <i data-lucide="table" className="w-3 h-3"></i> Manual
              </button>

              <button
                onClick={() => setInputMode("rpa")}
                className={`py-1 text-[11px] font-medium rounded transition flex items-center justify-center gap-1 cursor-pointer ${
                  inputMode === 'rpa' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <i data-lucide="bot" className="w-3 h-3"></i> RPA / Webhook
              </button>
            </div>

            {inputMode === 'preset' && (
              <select 
                value={datasetKey}
                onChange={(e) => setDatasetKey(e.target.value)}
                className={`w-full border rounded-lg p-2 text-xs ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-800'}`}
              >
                <option value="generic1">Dataset A (Série Temporal Multi-Variável)</option>
                <option value="generic2">Dataset B (Categorias & Participação)</option>
                <option value="rpaSample">Dataset C (Dados RPA Tempo Real)</option>
                <option value="waterfallSample">Dataset D (DRE / Waterfall)</option>
                <option value="funnelSample">Dataset E (Funil de Vendas)</option>
              </select>
            )}

            {inputMode === 'file' && (
              <div className="space-y-2 mt-2">
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".csv, .xlsx, .xls, .json" className="hidden" />
                <button
                  onClick={() => fileInputRef.current && fileInputRef.current.click()}
                  className={`w-full py-2.5 border border-dashed rounded-lg text-xs flex flex-col items-center justify-center gap-1 transition cursor-pointer ${
                    isDarkMode ? 'bg-slate-800 border-slate-600 hover:border-brand-500 text-slate-300' : 'bg-slate-50 border-slate-300 hover:border-brand-500 text-slate-700'
                  }`}
                >
                  <i data-lucide="upload-cloud" className="w-4 h-4 text-brand-500"></i>
                  <span>Carregar .CSV, .XLSX ou .JSON</span>
                </button>
              </div>
            )}

            {inputMode === 'rpa' && (
              <div className={`p-3 rounded-lg border text-xs space-y-2 mt-2 ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <div className="flex items-center justify-between">
                  <span className="font-medium flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Bot RPA Status:</span>
                  <span className="text-emerald-500 font-mono">ONLINE</span>
                </div>
                <button onClick={handleSimulateRPA} className="w-full py-1.5 bg-brand-600 hover:bg-brand-500 text-white rounded font-medium transition cursor-pointer">
                  Simular Ingestão RPA
                </button>
              </div>
            )}
          </div>

          <div className={`p-3 border rounded-xl space-y-3 ${isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
            <label className="text-xs font-bold text-brand-400 uppercase tracking-wider block flex items-center gap-1.5">
              <i data-lucide="plus-circle" className="w-3.5 h-3.5"></i> Gerenciar Variáveis (Colunas)
            </label>

            <div className="flex gap-1.5">
              <input
                type="text"
                placeholder="Nome da nova variável..."
                value={newVarName}
                onChange={(e) => setNewVarName(e.target.value)}
                className={`flex-1 border rounded p-1.5 text-xs ${isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-white border-slate-300 text-slate-800'}`}
              />
              <button 
                onClick={handleAddVariable}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                <i data-lucide="plus" className="w-3.5 h-3.5"></i> Add
              </button>
            </div>

            <div className="space-y-1 max-h-32 overflow-y-auto">
              <span className="text-[10px] text-slate-400 font-semibold block mb-1">Variáveis Atuais no Dataset:</span>
              {availableKeys.map(k => (
                <div key={k} className="flex items-center justify-between text-xs p-1.5 rounded bg-slate-800/40 border border-slate-700/50">
                  <span className="font-mono text-slate-200 truncate">{k}</span>
                  <button 
                    onClick={() => handleDeleteVariable(k)} 
                    title="Excluir Variável"
                    className="text-red-400 hover:text-red-300 p-0.5 rounded hover:bg-red-950/40 cursor-pointer"
                  >
                    <i data-lucide="trash-2" className="w-3.5 h-3.5"></i>
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className={`p-3 border rounded-xl space-y-2.5 ${isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
            <label className="text-xs font-bold text-brand-400 uppercase tracking-wider block flex items-center gap-1.5">
              <i data-lucide="calculator" className="w-3.5 h-3.5"></i> Criar Variável por Fórmula
            </label>

            <input
              type="text"
              placeholder="Nome da Nova Coluna (ex: Margem)"
              value={customFormulaName}
              onChange={(e) => setCustomFormulaName(e.target.value)}
              className={`w-full border rounded p-1.5 text-xs ${isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-white border-slate-300 text-slate-800'}`}
            />

            <input
              type="text"
              placeholder="Fórmula (ex: Variavel_2 - Variavel_3)"
              value={customFormulaExpr}
              onChange={(e) => setCustomFormulaExpr(e.target.value)}
              className={`w-full border rounded p-1.5 text-xs font-mono ${isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-white border-slate-300 text-slate-800'}`}
            />

            <button
              onClick={handleApplyCustomFormula}
              className="w-full py-1.5 bg-brand-600 hover:bg-brand-500 text-white rounded text-xs font-semibold shadow transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <i data-lucide="sparkles" className="w-3.5 h-3.5"></i> Calcular & Adicionar ao Gráfico
            </button>
          </div>

          <div className={`p-3 border rounded-xl space-y-3 ${isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
            <label className="text-xs font-bold text-brand-400 uppercase tracking-wider block flex items-center gap-1.5">
              <i data-lucide="filter" className="w-3.5 h-3.5"></i> 2. ETL & Limpeza de Dados
            </label>

            <div>
              <span className="text-[11px] text-slate-400 block mb-1">Tipos de Dados das Colunas:</span>
              {availableKeys.map(k => (
                <div key={k} className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[10px] font-mono truncate w-24">{k}:</span>
                  <select
                    value={columnTypes[k] || "auto"}
                    onChange={(e) => setColumnTypes({ ...columnTypes, [k]: e.target.value })}
                    className={`flex-1 border rounded px-1.5 py-0.5 text-[10px] ${isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-white border-slate-300 text-slate-800'}`}
                  >
                    <option value="auto">Auto (Detectar)</option>
                    <option value="number">Número (Float/Int)</option>
                    <option value="string">Texto (String)</option>
                  </select>
                </div>
              ))}
            </div>

            <div>
              <span className="text-[11px] text-slate-400 block mb-1">Tratamento de Nulos / Faltantes:</span>
              <select
                value={nullStrategy}
                onChange={(e) => setNullStrategy(e.target.value)}
                className={`w-full border rounded p-1.5 text-xs ${isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-white border-slate-300 text-slate-800'}`}
              >
                <option value="zero">Substituir por Zero (0)</option>
                <option value="drop">Remover Linha (Drop NaN)</option>
              </select>
            </div>

            <div>
              <span className="text-[11px] text-slate-400 block mb-1">Filtro Dinâmico de Linhas:</span>
              <div className="grid grid-cols-3 gap-1">
                <select
                  value={filterCol}
                  onChange={(e) => setFilterCol(e.target.value)}
                  className={`border rounded p-1 text-[10px] ${isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-white border-slate-300 text-slate-800'}`}
                >
                  <option value="ALL">Sem Filtro</option>
                  {availableKeys.map(k => <option key={k} value={k}>{k}</option>)}
                </select>
                <select
                  value={filterOp}
                  onChange={(e) => setFilterOp(e.target.value)}
                  className={`border rounded p-1 text-[10px] ${isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-white border-slate-300 text-slate-800'}`}
                >
                  <option value="equals">=</option>
                  <option value="contains">Contém</option>
                  <option value="gt">&gt;</option>
                  <option value="lt">&lt;</option>
                </select>
                <input
                  type="text"
                  placeholder="Valor..."
                  value={filterVal}
                  onChange={(e) => setFilterVal(e.target.value)}
                  className={`border rounded p-1 text-[10px] ${isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-white border-slate-300 text-slate-800'}`}
                />
              </div>
            </div>
          </div>

          <div className={`p-3 border rounded-xl space-y-3 ${isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
            <label className="text-xs font-bold text-brand-400 uppercase tracking-wider block flex items-center justify-between">
              <span className="flex items-center gap-1.5"><i data-lucide="layers" className="w-3.5 h-3.5"></i> 3. Group By & Hue Color</span>
              <input 
                type="checkbox" 
                checked={enableGroupBy} 
                onChange={(e) => setEnableGroupBy(e.target.checked)} 
                className="accent-brand-500 w-4 h-4 rounded cursor-pointer"
              />
            </label>

            {enableGroupBy && (
              <div className="space-y-2">
                <div>
                  <span className="text-[11px] text-slate-400 block mb-1">Função de Agregação no Eixo Y:</span>
                  <select
                    value={groupByAgg}
                    onChange={(e) => setGroupByAgg(e.target.value)}
                    className={`w-full border rounded p-1.5 text-xs ${isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-white border-slate-300 text-slate-800'}`}
                  >
                    <option value="sum">SOMA (SUM)</option>
                    <option value="avg">MÉDIA (AVG)</option>
                    <option value="count">CONTAGEM (COUNT)</option>
                    <option value="min">MÍNIMO (MIN)</option>
                    <option value="max">MÁXIMO (MAX)</option>
                    <option value="distinct">CONTAGEM DISTINTA</option>
                  </select>
                </div>

                <div>
                  <span className="text-[11px] text-slate-400 block mb-1">Dimensão de Cor (Hue):</span>
                  <select
                    value={hueColumn}
                    onChange={(e) => setHueColumn(e.target.value)}
                    className={`w-full border rounded p-1.5 text-xs ${isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-white border-slate-300 text-slate-800'}`}
                  >
                    <option value="NONE">Sem Separação Por Cores</option>
                    {availableKeys.map(k => <option key={k} value={k}>{k}</option>)}
                  </select>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className={`text-xs font-semibold uppercase tracking-wider block mb-2 flex items-center gap-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              <i data-lucide="sliders" className="w-4 h-4"></i> 4. Mapeamento de Eixos Multi-Métrica
            </label>
            
            <div className="space-y-3">
              <div>
                <span className="text-xs text-slate-400 mb-1 block">Eixo X / Categoria</span>
                <select
                  value={xAxis}
                  onChange={(e) => setXAxis(e.target.value)}
                  className={`w-full border rounded-lg p-2 text-xs ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-800'}`}
                >
                  {availableKeys.map(k => <option key={k} value={k}>{k}</option>)}
                </select>
              </div>

              <div>
                <span className="text-xs text-slate-400 mb-1.5 block">Eixo Y / Métricas Numéricas (Selecione Várias):</span>
                <div className={`p-2 border rounded-lg max-h-36 overflow-y-auto space-y-1 ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-300'}`}>
                  {availableKeys.map(k => (
                    <label key={k} className="flex items-center gap-2 text-xs cursor-pointer hover:bg-slate-800/40 p-1 rounded">
                      <input
                        type="checkbox"
                        checked={selectedYAxes.includes(k)}
                        onChange={() => toggleYAxis(k)}
                        className="accent-brand-500 w-3.5 h-3.5 rounded"
                      />
                      <span className="font-mono">{k}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className={`p-3 border rounded-xl space-y-3 ${isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
            <label className="text-xs font-bold text-brand-400 uppercase tracking-wider block flex items-center justify-between">
              <span className="flex items-center gap-1.5"><i data-lucide="save" className="w-3.5 h-3.5"></i> 5. Projetos & Dashboards</span>
            </label>

            <div className="flex gap-1">
              <input
                type="text"
                placeholder="Nome do projeto..."
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className={`flex-1 border rounded p-1 text-xs ${isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-white border-slate-300 text-slate-800'}`}
              />
              <button onClick={handleSaveProject} className="px-2 py-1 bg-brand-600 hover:bg-brand-500 text-white rounded text-xs font-semibold cursor-pointer">
                Salvar
              </button>
            </div>

            {savedProjects.length > 0 && (
              <div className="space-y-1 max-h-24 overflow-y-auto">
                {savedProjects.map(proj => (
                  <div key={proj.id} className="flex items-center justify-between text-xs p-1 rounded bg-slate-800/40">
                    <span className="truncate cursor-pointer hover:text-brand-400" onClick={() => handleLoadProject(proj)}>
                      {proj.name}
                    </span>
                    <button onClick={() => handleDeleteProject(proj.id)} className="text-red-400 hover:text-red-300 p-0.5 cursor-pointer">
                      <i data-lucide="x" className="w-3 h-3"></i>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>

        <main className="flex-1 flex flex-col overflow-y-auto p-6 gap-6">
          <div className="p-4 rounded-xl border bg-gradient-to-r from-brand-950/40 via-slate-900/80 to-slate-900/80 border-brand-500/30 flex items-start gap-3 shadow-lg">
            <div className="p-2 bg-brand-600/20 text-brand-400 rounded-lg border border-brand-500/30">
              <i data-lucide="sparkles" className="w-5 h-5"></i>
            </div>
            <div className="flex-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-brand-400 mb-1">Insights Automáticos & Storytelling (IA):</h4>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">{autoInsights}</p>
            </div>
          </div>

          {showFormula && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className={`border p-4 rounded-xl ${isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                <span className="text-xs text-slate-400 block mb-1">Soma (&sum;)</span>
                <div className="font-mono text-lg text-amber-500 font-bold">{mathStats.sum}</div>
                <span className="text-[10px] text-slate-500">Métrica principal</span>
              </div>
              <div className={`border p-4 rounded-xl ${isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                <span className="text-xs text-slate-400 block mb-1">Média (&mu;)</span>
                <div className="font-mono text-lg text-emerald-500 font-bold">{mathStats.mean}</div>
                <span className="text-[10px] text-slate-500">Valor médio calculated</span>
              </div>
              <div className={`border p-4 rounded-xl ${isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                <span className="text-xs text-slate-400 block mb-1">Mediana / Q2</span>
                <div className="font-mono text-lg text-brand-400 font-bold">{mathStats.median}</div>
                <span className="text-[10px] text-slate-500">Centro distributivo</span>
              </div>
              <div className={`border p-4 rounded-xl ${isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                <span className="text-xs text-slate-400 block mb-1">Desvio Padrão (&sigma;)</span>
                <div className="font-mono text-lg text-sky-400 font-bold">{mathStats.stdDev}</div>
                <span className="text-[10px] text-slate-500">Dispersão estatística</span>
              </div>
            </div>
          )}

          <div className={`flex-1 min-h-[380px] border rounded-2xl p-5 relative flex flex-col ${
            isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="flex-1 relative w-full h-full min-h-[300px]">
              <canvas ref={canvasRef}></canvas>
            </div>
          </div>

          {inputMode === 'manual' && (
            <div className={`border rounded-2xl p-4 overflow-hidden ${isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <i data-lucide="edit-3" className="w-4 h-4 text-brand-500"></i> Edição Interativa de Dados
                </h3>
                <button
                  onClick={handleAddRow}
                  className="px-3 py-1 bg-brand-600 hover:bg-brand-500 text-white rounded text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <i data-lucide="plus" className="w-3.5 h-3.5"></i> Adicionar Linha
                </button>
              </div>

              <div className="overflow-x-auto max-h-60">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className={`border-b ${isDarkMode ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-600'}`}>
                      {availableKeys.map(k => (
                        <th key={k} className="p-2 font-mono">{k}</th>
                      ))}
                      <th className="p-2 w-10">Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rawData.map((row, rIdx) => (
                      <tr key={rIdx} className={`border-b ${isDarkMode ? 'border-slate-800/50 hover:bg-slate-800/30' : 'border-slate-100 hover:bg-slate-50'}`}>
                        {availableKeys.map(k => (
                          <td key={k} className="p-1">
                            <input
                              type="text"
                              value={row[k] ?? ""}
                              onChange={(e) => handleCellChange(rIdx, k, e.target.value)}
                              className={`w-full p-1 rounded border ${isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-white border-slate-300 text-slate-800'}`}
                            />
                          </td>
                        ))}
                        <td className="p-1 text-center">
                          <button
                            onClick={() => handleRemoveRow(rIdx)}
                            className="text-red-400 hover:text-red-300 p-1 cursor-pointer"
                            title="Remover Linha"
                          >
                            <i data-lucide="trash" className="w-3.5 h-3.5"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className={`border rounded-2xl overflow-hidden ${isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
            <div className={`border-b px-6 py-3 flex items-center justify-between ${isDarkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-slate-50'}`}>
              <div className="flex items-center gap-2">
                <i data-lucide="code-2" className="w-4 h-4 text-brand-500"></i>
                <h3 className="text-sm font-semibold">Código Gerado & Exportação de Pipeline</h3>
              </div>

              <div className={`flex p-1 rounded-lg border ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-200 border-slate-300'}`}>
                {['python', 'r', 'dax', 'react'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setCodeTab(tab)}
                    className={`px-3 py-1 rounded-md text-xs font-medium uppercase transition cursor-pointer ${
                      codeTab === tab 
                        ? 'bg-brand-600 text-white shadow' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className={`p-4 relative ${isDarkMode ? 'bg-slate-950' : 'bg-slate-900 text-slate-100'}`}>
              <pre className="font-mono text-xs text-slate-300 overflow-x-auto p-3 rounded-lg leading-relaxed">
                {generateCode()}
              </pre>
              
              <button
                onClick={() => navigator.clipboard.writeText(generateCode())}
                className="absolute top-6 right-6 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs border border-slate-700 flex items-center gap-1.5 transition cursor-pointer"
              >
                <i data-lucide="copy" className="w-3.5 h-3.5"></i> Copiar Código
              </button>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}

// Renderização segura verificando a existência do elemento DOM
const rootElement = document.getElementById("painel-react-root");
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(<EditPanelApp />);
}