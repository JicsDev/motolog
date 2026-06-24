import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  LayoutDashboard, List, BarChart2, Settings, Plus, X, Fuel, Wrench, 
  Gauge, Droplets, Calendar, MapPin, Trash2, Info, Map, Square, Navigation, 
  Search, Loader2, CheckCircle2, Database, Download, Upload, Filter 
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('PAINEL');
  const [fabMenuOpen, setFabMenuOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const [selectedEntry, setSelectedEntry] = useState(null);

  // DADOS ZERADOS POR PADRÃO
  const [config, setConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('motolog_config');
      return saved ? JSON.parse(saved) : { tanqueTotal: 0, kmL: 0, odometro: 0 };
    } catch (e) { return { tanqueTotal: 0, kmL: 0, odometro: 0 }; }
  });

  const [currentFuel, setCurrentFuel] = useState(() => {
    try {
      const saved = localStorage.getItem('motolog_fuel');
      return saved ? JSON.parse(saved) : 0;
    } catch (e) { return 0; }
  }); 

  const [entries, setEntries] = useState(() => {
    try {
      const saved = localStorage.getItem('motolog_entries');
      if (saved) return JSON.parse(saved);
    } catch (e) { console.error("Erro ao ler dados:", e); }
    return [];
  });

  const [activeTrip, setActiveTrip] = useState(() => {
    try {
      const saved = localStorage.getItem('motolog_active_trip');
      return saved ? JSON.parse(saved) : null;
    } catch (e) { return null; }
  });

  useEffect(() => { localStorage.setItem('motolog_config', JSON.stringify(config)); }, [config]);
  useEffect(() => { localStorage.setItem('motolog_fuel', JSON.stringify(currentFuel)); }, [currentFuel]);
  useEffect(() => { localStorage.setItem('motolog_entries', JSON.stringify(entries)); }, [entries]);
  useEffect(() => { localStorage.setItem('motolog_active_trip', JSON.stringify(activeTrip)); }, [activeTrip]);

  useEffect(() => { setFabMenuOpen(false); }, [activeTab]);

  const handleCalculateConfig = (newConfig) => {
    const diffKm = newConfig.odometro - config.odometro;
    if (diffKm > 0) {
      const litrosGastos = diffKm / (newConfig.kmL || 1);
      setCurrentFuel(prev => Math.max(0, prev - litrosGastos));
    }
    setConfig(newConfig);
  };

  const handleImportData = (importedData) => {
    if (importedData.config) setConfig(importedData.config);
    if (importedData.currentFuel !== undefined) setCurrentFuel(importedData.currentFuel);
    if (importedData.entries) setEntries(importedData.entries);
  };

  const handleResetData = () => {
    setEntries([]);
    setCurrentFuel(0);
    setActiveTrip(null);
  };

  return (
    <div className="h-[100dvh] w-full bg-[#060b14] flex justify-center font-sans text-slate-200 overflow-hidden">
      <div className="h-full w-full max-w-md bg-gradient-to-b from-[#0a1325] to-[#040811] relative flex flex-col shadow-2xl md:border-x md:border-slate-800 overflow-hidden">
        
        <header className="pt-8 pb-4 px-6 bg-transparent flex justify-between items-center z-10 flex-shrink-0">
          <div>
            <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400 tracking-wider">
              MOTO<span className="text-slate-100">LOG</span>
            </h1>
          </div>
          <div className="flex items-center space-x-2 text-cyan-400 bg-cyan-900/20 px-3 py-1 rounded-full border border-cyan-500/30">
            <Gauge size={16} />
            <span className="text-sm font-bold font-mono tracking-wide">{config.odometro} <span className="text-[10px] text-cyan-600">KM</span></span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto pb-28 px-4 custom-scrollbar z-10 relative">
          {activeTab === 'PAINEL' && <TabPainel currentFuel={currentFuel} tanqueTotal={config.tanqueTotal} config={config} entries={entries} />}
          {activeTab === 'LOG' && <TabLog entries={entries} onSelectEntry={setSelectedEntry} />}
          {activeTab === 'VIAGEM' && <TabViagem config={config} entries={entries} activeTrip={activeTrip} setActiveTrip={setActiveTrip} onStopTrip={() => setActiveModal('encerrar_viagem')} currentFuel={currentFuel} />}
          {activeTab === 'RELATÓRIOS' && <TabRelatorios entries={entries} />}
          {activeTab === 'CONFIGURAÇÕES' && <TabConfiguracoes config={config} currentFuel={currentFuel} entries={entries} onCalculate={handleCalculateConfig} onImportData={handleImportData} onResetData={handleResetData} />}
        </main>

        {activeTab === 'PAINEL' && (
          <div className="absolute bottom-24 right-4 z-40">
            {fabMenuOpen && (
              <div className="absolute bottom-16 right-0 mb-2 flex flex-col space-y-3 items-end animate-fade-in-up">
                <button onClick={() => { setActiveModal('despesa'); setFabMenuOpen(false); }} className="flex items-center space-x-3 bg-slate-800/90 backdrop-blur-md border border-slate-700 p-2 pr-4 rounded-full shadow-lg hover:border-red-500/50 transition-colors">
                  <span className="text-sm font-medium text-slate-200">Adicionar Despesa</span>
                  <div className="bg-red-500/20 p-2 rounded-full text-red-400"><Wrench size={18} /></div>
                </button>
                <button onClick={() => { setActiveModal('odometro'); setFabMenuOpen(false); }} className="flex items-center space-x-3 bg-slate-800/90 backdrop-blur-md border border-slate-700 p-2 pr-4 rounded-full shadow-lg hover:border-purple-500/50 transition-colors">
                  <span className="text-sm font-medium text-slate-200">Atualizar Odômetro</span>
                  <div className="bg-purple-500/20 p-2 rounded-full text-purple-400"><MapPin size={18} /></div>
                </button>
                <button onClick={() => { setActiveModal('abastecimento'); setFabMenuOpen(false); }} className="flex items-center space-x-3 bg-slate-800/90 backdrop-blur-md border border-slate-700 p-2 pr-4 rounded-full shadow-lg hover:border-emerald-500/50 transition-colors">
                  <span className="text-sm font-medium text-slate-200">Adicionar Abastecimento</span>
                  <div className="bg-emerald-500/20 p-2 rounded-full text-emerald-400"><Fuel size={18} /></div>
                </button>
              </div>
            )}
            <button onClick={() => setFabMenuOpen(!fabMenuOpen)} className={`w-14 h-14 rounded-full shadow-[0_0_15px_rgba(255,255,255,0.2)] flex items-center justify-center transition-all duration-300 z-50 ${fabMenuOpen ? 'bg-slate-700 rotate-45' : 'bg-white hover:bg-slate-100'}`}>
              <Plus size={28} className={fabMenuOpen ? 'text-white' : 'text-slate-900'} />
            </button>
          </div>
        )}

        <nav className="absolute bottom-0 w-full h-16 bg-[#0B1221]/95 backdrop-blur-lg border-t border-cyan-900/50 grid grid-cols-5 items-center px-1 z-50 shadow-[0_-5px_20px_rgba(0,0,0,0.5)]">
          <NavItem icon={<LayoutDashboard />} label="PAINEL" isActive={activeTab === 'PAINEL'} onClick={() => setActiveTab('PAINEL')} />
          <NavItem icon={<List />} label="LOG" isActive={activeTab === 'LOG'} onClick={() => setActiveTab('LOG')} />
          <NavItem icon={<Map />} label="VIAGEM" isActive={activeTab === 'VIAGEM'} onClick={() => setActiveTab('VIAGEM')} />
          <NavItem icon={<BarChart2 />} label="RELATÓRIOS" isActive={activeTab === 'RELATÓRIOS'} onClick={() => setActiveTab('RELATÓRIOS')} />
          <NavItem icon={<Settings />} label="CONFIGS" isActive={activeTab === 'CONFIGURAÇÕES'} onClick={() => setActiveTab('CONFIGURAÇÕES')} />
        </nav>

        {activeModal === 'abastecimento' && <ModalAbastecimento onClose={() => setActiveModal(null)} config={config} setConfig={setConfig} currentFuel={currentFuel} setCurrentFuel={setCurrentFuel} setEntries={setEntries} />}
        {activeModal === 'despesa' && <ModalDespesa onClose={() => setActiveModal(null)} config={config} setEntries={setEntries} />}
        {activeModal === 'odometro' && <ModalOdometro onClose={() => setActiveModal(null)} config={config} setConfig={setConfig} currentFuel={currentFuel} setCurrentFuel={setCurrentFuel} setEntries={setEntries} />}
        
        {activeModal === 'encerrar_viagem' && <ModalEncerrarViagem onClose={() => setActiveModal(null)} activeTrip={activeTrip} setActiveTrip={setActiveTrip} config={config} setConfig={setConfig} currentFuel={currentFuel} setCurrentFuel={setCurrentFuel} setEntries={setEntries} />}

        {selectedEntry && <ModalDetalhes entry={selectedEntry} onClose={() => setSelectedEntry(null)} setEntries={setEntries} />}
        {fabMenuOpen && <div className="absolute inset-0 z-30 bg-black/40 backdrop-blur-[1px]" onClick={() => setFabMenuOpen(false)} />}
      </div>
      <style>
        {`
          .animate-fade-in-up { animation: fadeInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
          @keyframes fadeInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
          .custom-scrollbar::-webkit-scrollbar { width: 4px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(34, 211, 238, 0.2); border-radius: 4px; }
          a[href*="codesandbox"], div[style*="z-index: 9999999"] { display: none !important; opacity: 0 !important; pointer-events: none !important; }
          input[type="date"]::-webkit-calendar-picker-indicator, input[type="month"]::-webkit-calendar-picker-indicator { filter: invert(1); opacity: 0.5; cursor: pointer; }
        `}
      </style>
    </div>
  );
}

// ==========================================
// ABAS E COMPONENTES
// ==========================================

function TabPainel({ currentFuel, tanqueTotal, config, entries }) {
  const percent = tanqueTotal > 0 ? Math.max(0, Math.min(100, (currentFuel / tanqueTotal) * 100)) : 0;
  const rotation = -90 + (percent * 1.8);

  const ultimaTrocaOleo = entries.find(e => e.type === 'despesa' && (e.titulo?.toLowerCase().includes('óleo') || e.titulo?.toLowerCase().includes('oleo')));
  const kmDesdeOleo = ultimaTrocaOleo && ultimaTrocaOleo.odometro ? config.odometro - ultimaTrocaOleo.odometro : 0;
  const limiteOleo = 1500;
  const restanteOleo = Math.max(0, limiteOleo - kmDesdeOleo);
  const pctOleo = ultimaTrocaOleo ? Math.max(0, Math.min(100, (restanteOleo / limiteOleo) * 100)) : 0;

  const ultimaLubri = entries.find(e => e.type === 'despesa' && (e.titulo?.toLowerCase().includes('corrente') || e.titulo?.toLowerCase().includes('lubri')));
  const kmDesdeLubri = ultimaLubri && ultimaLubri.odometro ? config.odometro - ultimaLubri.odometro : 0;
  const limiteLubri = 400;
  const restanteLubri = Math.max(0, limiteLubri - kmDesdeLubri);
  const pctLubri = ultimaLubri ? Math.max(0, Math.min(100, (restanteLubri / limiteLubri) * 100)) : 0;

  return (
    <div className="flex flex-col items-center justify-center h-full pt-4 space-y-8 animate-fade-in-up">
      <div className="relative w-full max-w-[260px] aspect-[2/1] mx-auto mt-4">
        <svg viewBox="0 0 200 110" className="w-full h-full drop-shadow-[0_0_15px_rgba(34,211,238,0.1)]">
          <defs>
            <linearGradient id="fuelGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="15%" stopColor="#ef4444" />
              <stop offset="16%" stopColor="#f59e0b" />
              <stop offset="50%" stopColor="#eab308" />
              <stop offset="100%" stopColor="#22c55e" />
            </linearGradient>
            <filter id="neonGlow">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <filter id="cyanGlow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>
          <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#1e293b" strokeWidth="8" strokeLinecap="round" />
          <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="url(#fuelGradient)" strokeWidth="8" strokeLinecap="round" filter="url(#neonGlow)" />
          {[...Array(11)].map((_, i) => {
            const angle = -180 + (i * 18);
            const cx = 100; const cy = 100;
            const r1 = i % 5 === 0 ? 92 : 87; const r2 = 98;
            const x1 = cx + r1 * Math.cos(angle * Math.PI / 180);
            const y1 = cy + r1 * Math.sin(angle * Math.PI / 180);
            const x2 = cx + r2 * Math.cos(angle * Math.PI / 180);
            const y2 = cy + r2 * Math.sin(angle * Math.PI / 180);
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={i <= 1 ? "#ef4444" : "#475569"} strokeWidth={i % 5 === 0 ? 2 : 1} />;
          })}
          <text x="5" y="105" fill="#ef4444" fontSize="14" fontWeight="800" filter="url(#neonGlow)">E</text>
          <text x="100" y="10" fill="#eab308" fontSize="12" fontWeight="800" textAnchor="middle" filter="url(#neonGlow)">1/2</text>
          <text x="195" y="105" fill="#22c55e" fontSize="14" fontWeight="800" textAnchor="end" filter="url(#neonGlow)">F</text>
          <g transform={`rotate(${rotation}, 100, 100)`} className="transition-transform duration-1000 ease-out">
            <polygon points="98.5,100 101.5,100 100,20" fill="#22d3ee" filter="url(#cyanGlow)" />
            <circle cx="100" cy="100" r="7" fill="#0f172a" stroke="#22d3ee" strokeWidth="2" filter="url(#cyanGlow)" />
            <circle cx="100" cy="100" r="3" fill="#22d3ee" />
          </g>
        </svg>
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center w-full pointer-events-none">
          <div className="flex items-center space-x-2 text-cyan-400 mb-0.5" style={{ textShadow: '0 0 10px rgba(34,211,238,0.5)' }}>
            <Fuel size={14} />
            <span className="text-2xl font-bold font-mono tracking-wider">{currentFuel.toFixed(1)}L</span>
          </div>
          <span className="text-[9px] text-cyan-700 font-bold tracking-[0.2em] uppercase">Combustível</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 w-full px-1">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-3 flex flex-col items-center justify-center backdrop-blur-sm">
          <Droplets className="text-emerald-400 mb-1" size={20} />
          <span className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">Tanque Info</span>
          <span className="text-base font-bold text-slate-200">{tanqueTotal > 0 ? ((currentFuel/tanqueTotal)*100).toFixed(0) : 0}% Cheio</span>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-3 flex flex-col items-center justify-center backdrop-blur-sm">
          <Gauge className="text-purple-400 mb-1" size={20} />
          <span className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">Autonomia Est.</span>
          <span className="text-base font-bold text-slate-200">~{(currentFuel * (config.kmL || 0)).toFixed(0)} km</span>
        </div>
      </div>

      <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm space-y-4">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider border-b border-white/10 pb-2 flex items-center">
          <Wrench size={14} className="text-cyan-400 mr-2" /> Status de Manutenção
        </h3>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-300 font-medium">Troca de Óleo (1.500km)</span>
              <span className={`font-mono ${pctOleo < 20 ? 'text-red-400 font-bold' : 'text-slate-400'}`}>
                {ultimaTrocaOleo ? `${restanteOleo} km restam` : 'Sem registros'}
              </span>
            </div>
            <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
              <div className={`h-full rounded-full transition-all duration-500 ${pctOleo < 20 ? 'bg-red-500 shadow-[0_0_10px_#ef4444]' : pctOleo < 50 ? 'bg-yellow-500' : 'bg-emerald-500'}`} style={{ width: `${ultimaTrocaOleo ? pctOleo : 0}%` }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-300 font-medium">Lubrificação da Corrente (400km)</span>
              <span className={`font-mono ${pctLubri < 20 ? 'text-red-400 font-bold' : 'text-slate-400'}`}>
                {ultimaLubri ? `${restanteLubri} km restam` : 'Sem registros'}
              </span>
            </div>
            <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
              <div className={`h-full rounded-full transition-all duration-500 ${pctLubri < 20 ? 'bg-red-500 shadow-[0_0_10px_#ef4444]' : pctLubri < 50 ? 'bg-yellow-500' : 'bg-emerald-500'}`} style={{ width: `${ultimaLubri ? pctLubri : 0}%` }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TabLog({ entries, onSelectEntry }) {
  const [filtro, setFiltro] = useState('todos');

  const sortedEntries = [...entries].sort((a, b) => new Date(b.date) - new Date(a.date));
  const entradasFiltradas = sortedEntries.filter(entry => {
    if (filtro === 'todos') return true;
    if (filtro === 'viagem') return entry.type === 'viagem';
    return entry.type === filtro;
  });

  return (
    <div className="flex flex-col space-y-4 pt-4 animate-fade-in-up">
      <h2 className="text-lg font-bold text-slate-300 px-2 flex items-center">
        <List className="mr-2 text-cyan-500" size={20} /> Histórico de Registros
      </h2>
      
      <div className="flex items-center space-x-2 overflow-x-auto custom-scrollbar pb-2 px-1">
        <Filter size={16} className="text-slate-500 flex-shrink-0 mr-1" />
        <button onClick={() => setFiltro('todos')} className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${filtro === 'todos' ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>Todos</button>
        <button onClick={() => setFiltro('abastecimento')} className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${filtro === 'abastecimento' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>Abastecimentos</button>
        <button onClick={() => setFiltro('despesa')} className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${filtro === 'despesa' ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>Manutenções</button>
        <button onClick={() => setFiltro('viagem')} className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${filtro === 'viagem' ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>Viagens</button>
      </div>
      
      {entradasFiltradas.length === 0 ? (
        <div className="text-center bg-slate-900/50 rounded-2xl p-6 border border-slate-800">
          <p className="text-slate-500 text-sm">Nenhum registro encontrado para este filtro.</p>
        </div>
      ) : (
        entradasFiltradas.map(entry => (
          <div key={entry.id} onClick={() => onSelectEntry(entry)} className="bg-[#0f172a]/80 backdrop-blur-md border border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-lg cursor-pointer hover:bg-slate-800/80 hover:border-cyan-900/50 transition-colors">
            <div className="flex items-center space-x-4">
              {entry.type === 'abastecimento' ? (
                <div className="bg-emerald-500/20 p-3 rounded-full border border-emerald-500/30 flex-shrink-0"><Fuel className="text-emerald-400" size={20} /></div>
              ) : entry.type === 'despesa' ? (
                <div className="bg-red-500/20 p-3 rounded-full border border-red-500/30 flex-shrink-0"><Wrench className="text-red-400" size={20} /></div>
              ) : (
                <div className="bg-purple-500/20 p-3 rounded-full border border-purple-500/30 flex-shrink-0"><MapPin className="text-purple-400" size={20} /></div>
              )}
              <div className="flex flex-col overflow-hidden">
                <span className="font-bold text-slate-100 flex items-center flex-wrap gap-1">
                  <span className="truncate">{entry.type === 'abastecimento' ? 'Abastecimento' : entry.titulo}</span>
                  {entry.isFullTank && <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 whitespace-nowrap">Tanque Cheio</span>}
                </span>
                <span className="text-xs text-slate-400 flex items-center mt-1">
                  <Calendar size={12} className="mr-1 flex-shrink-0" />
                  {new Date(entry.date).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}
                  {entry.type === 'viagem' && entry.duracao && ` • ${entry.duracao}`}
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end flex-shrink-0">
              {entry.type === 'abastecimento' || entry.type === 'despesa' ? (
                <>
                  <span className={`font-mono font-bold text-lg ${entry.type === 'abastecimento' ? 'text-emerald-400' : 'text-red-400'}`}>- R$ {entry.valorTotal ? entry.valorTotal.toFixed(2) : (entry.valor ? entry.valor.toFixed(2) : '0.00')}</span>
                  {entry.type === 'abastecimento' && <span className="text-[10px] text-slate-500 font-mono">R${entry.precoLitro}/L</span>}
                </>
              ) : (
                <>
                  <span className="font-mono font-bold text-lg text-purple-400">-{entry.litrosGastos?.toFixed(1)}L</span>
                  <span className="text-[10px] text-slate-400 font-mono">+{entry.kmRodados} km</span>
                </>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// === NOVA TELA DE RELATÓRIOS FUNCIONAL ===
function TabRelatorios({ entries }) {
  const [mesSelecionado, setMesSelecionado] = useState(new Date().toISOString().slice(0, 7)); // Formato YYYY-MM

  // Filtra as entradas para somar apenas os valores do mês escolhido
  const entradasDoMes = entries.filter(entry => {
    if (!entry.date) return false;
    return entry.date.startsWith(mesSelecionado);
  });

  const totalAbastecimento = entradasDoMes.filter(e => e.type === 'abastecimento').reduce((acc, curr) => acc + (curr.valorTotal || 0), 0);
  const totalDespesa = entradasDoMes.filter(e => e.type === 'despesa').reduce((acc, curr) => acc + (curr.valor || 0), 0);
  const totalViagemKm = entradasDoMes.filter(e => e.type === 'viagem').reduce((acc, curr) => acc + (curr.kmRodados || 0), 0);
  const totalGasto = totalAbastecimento + totalDespesa;

  return (
    <div className="flex flex-col space-y-6 pt-4 animate-fade-in-up px-1">
      <h2 className="text-lg font-bold text-slate-300 flex items-center">
        <BarChart2 className="mr-2 text-cyan-500" size={20} /> Relatórios Financeiros
      </h2>

      {/* Filtro de Mês */}
      <div className="bg-[#0f172a]/80 backdrop-blur-md border border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center text-slate-300">
          <Calendar size={18} className="mr-2 text-cyan-500" />
          <span className="text-sm font-bold">Mês:</span>
        </div>
        <input 
          type="month" 
          value={mesSelecionado}
          onChange={(e) => setMesSelecionado(e.target.value)}
          className="bg-slate-900 border border-slate-700 text-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:border-cyan-500 font-mono text-sm"
        />
      </div>
      
      {/* Total Geral do Mês */}
      <div className="bg-[#0f172a]/80 backdrop-blur-md border border-slate-800 rounded-2xl p-5 flex flex-col items-center justify-center shadow-lg">
        <span className="text-xs text-slate-400 uppercase tracking-wider mb-1">Custo Total no Mês</span>
        <span className="text-3xl font-black text-emerald-400">R$ {totalGasto.toFixed(2)}</span>
      </div>

      {/* Blocos Individuais */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col items-center shadow-lg transition-colors hover:border-emerald-500/50">
          <div className="bg-emerald-500/20 p-3 rounded-full text-emerald-400 mb-3"><Fuel size={24} /></div>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 text-center">Abastecimentos</span>
          <span className="text-lg font-bold text-slate-200">R$ {totalAbastecimento.toFixed(2)}</span>
        </div>
        
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col items-center shadow-lg transition-colors hover:border-red-500/50">
          <div className="bg-red-500/20 p-3 rounded-full text-red-400 mb-3"><Wrench size={24} /></div>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 text-center">Manutenções</span>
          <span className="text-lg font-bold text-slate-200">R$ {totalDespesa.toFixed(2)}</span>
        </div>
      </div>

      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col items-center shadow-lg transition-colors hover:border-purple-500/50">
          <div className="bg-purple-500/20 p-3 rounded-full text-purple-400 mb-3"><Map size={24} /></div>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Km em Viagens (Mês)</span>
          <span className="text-xl font-bold text-slate-200">{totalViagemKm.toFixed(1)} km</span>
      </div>
    </div>
  );
}

function calcHaversine(lat1, lon1, lat2, lon2) {
  const R = 6371; 
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function TabViagem({ config, entries, activeTrip, setActiveTrip, onStopTrip, currentFuel }) {
  const ultimoAbast = entries.find(e => e.type === 'abastecimento');
  const [precoPlan, setPrecoPlan] = useState(ultimoAbast ? ultimoAbast.precoLitro : 5.89);
  const [destinoQuery, setDestinoQuery] = useState('');
  const [distanciaPlan, setDistanciaPlan] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [searchSuccess, setSearchSuccess] = useState('');

  const [elapsed, setElapsed] = useState(activeTrip ? activeTrip.elapsedTime || 0 : 0);
  const [gpsKm, setGpsKm] = useState(activeTrip ? activeTrip.accumulatedKm || 0 : 0);
  const [currentSpeed, setCurrentSpeed] = useState(0); 
  const lastUpdateRef = useRef(Date.now());

  useEffect(() => {
    let interval, watchId;
    if (activeTrip && !activeTrip.isPaused) {
      interval = setInterval(() => { setElapsed(prev => prev + 1); }, 1000);
      if ('geolocation' in navigator) {
        watchId = navigator.geolocation.watchPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            const now = Date.now();
            setActiveTrip(prev => {
              if (!prev || prev.isPaused) return prev;
              let newKm = 0; let calculatedSpeed = 0;
              if (prev.lastLat && prev.lastLon) {
                newKm = calcHaversine(prev.lastLat, prev.lastLon, latitude, longitude);
                const timeDiffInHours = (now - lastUpdateRef.current) / 3600000;
                if (timeDiffInHours > 0) calculatedSpeed = newKm / timeDiffInHours;
              }
              if (newKm > 0.005) { 
                const updatedKm = prev.accumulatedKm + newKm;
                setGpsKm(updatedKm);
                setCurrentSpeed(calculatedSpeed > 150 ? prev.speed || 0 : calculatedSpeed);
                lastUpdateRef.current = now;
                return { ...prev, lastLat: latitude, lastLon: longitude, accumulatedKm: updatedKm, speed: calculatedSpeed };
              }
              return { ...prev, lastLat: latitude, lastLon: longitude };
            });
          },
          (error) => console.log("GPS aguardando..."),
          { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
        );
      }
    }
    return () => { clearInterval(interval); if (watchId) navigator.geolocation.clearWatch(watchId); };
  }, [activeTrip, setActiveTrip]);

  const handleStartTrip = () => {
    setActiveTrip({ startTime: Date.now(), elapsedTime: 0, startOdo: config.odometro, accumulatedKm: 0, lastLat: null, lastLon: null, isPaused: false });
    setGpsKm(0); setElapsed(0); setCurrentSpeed(0); lastUpdateRef.current = Date.now();
  };

  const handleTogglePause = () => {
    setActiveTrip(prev => ({ ...prev, isPaused: !prev.isPaused, elapsedTime: elapsed, lastLat: null, lastLon: null }));
  };

  const handleCalcularRota = async () => {
    if (!destinoQuery) return;
    setIsSearching(true); setSearchError(''); setSearchSuccess(''); setDistanciaPlan(0);
    try {
      const pos = await new Promise((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true }));
      const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(destinoQuery)}`);
      const geoData = await geoRes.json();
      if (geoData.length === 0) throw new Error('Destino não encontrado.');
      const routeRes = await fetch(`https://router.project-osrm.org/route/v1/driving/${pos.coords.longitude},${pos.coords.latitude};${geoData[0].lon},${geoData[0].lat}?overview=false`);
      const routeData = await routeRes.json();
      setDistanciaPlan((routeData.routes[0].distance / 1000).toFixed(1));
      setSearchSuccess(`Rota traçada!`);
    } catch (err) { setSearchError('Erro ao buscar rota. Ative o GPS.'); }
    setIsSearching(false);
  };

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600); const m = Math.floor((seconds % 3600) / 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  const calcLitros = config.kmL > 0 ? (parseFloat(distanciaPlan) || 0) / config.kmL : 0;
  const calcCusto = calcLitros * (parseFloat(precoPlan) || 0);

  if (activeTrip) {
    return (
      <div className="flex flex-col items-center justify-center h-full pt-4 space-y-6 animate-fade-in-up">
        <div className={`border rounded-3xl p-6 w-full flex flex-col items-center shadow-[0_0_30px_rgba(0,0,0,0.3)] relative overflow-hidden ${activeTrip.isPaused ? 'bg-amber-900/20 border-amber-500/30' : 'bg-indigo-900/30 border-indigo-500/50'}`}>
          <span className={`text-xs font-bold mb-2 flex items-center z-10 ${activeTrip.isPaused ? 'text-amber-500' : 'text-cyan-500'}`}>
             {activeTrip.isPaused ? <><div className="w-2 h-2 bg-amber-500 rounded-full mr-2"></div> VIAGEM PAUSADA</> : <><div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2"></div> AO VIVO</>}
          </span>
          <div className="text-7xl font-black font-mono text-cyan-300">{activeTrip.isPaused ? '--' : Math.round(currentSpeed)}</div>
          <span className="text-sm text-slate-400 uppercase tracking-widest mb-6">km/h</span>
          <div className="w-full grid grid-cols-2 gap-4 border-t border-indigo-500/30 pt-6">
             <div className="text-center"><p className="text-xl font-bold text-white">{formatTime(elapsed)}</p><p className="text-[9px] text-slate-400">TEMPO</p></div>
             <div className="text-center"><p className="text-xl font-bold text-purple-400">{gpsKm.toFixed(1)} km</p><p className="text-[9px] text-slate-400">DISTÂNCIA</p></div>
          </div>
        </div>
        <div className="w-full flex space-x-3">
          <button onClick={handleTogglePause} className={`flex-1 font-black py-5 rounded-2xl transition-all ${activeTrip.isPaused ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'}`}>
            {activeTrip.isPaused ? 'RETOMAR' : 'PAUSAR'}
          </button>
          <button onClick={onStopTrip} className="flex-1 bg-red-600 text-white font-black py-5 rounded-2xl">ENCERRAR</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-6 pt-4 animate-fade-in-up">
      <h2 className="text-lg font-bold text-slate-300 px-2 flex items-center"><Map className="mr-2 text-indigo-400" size={20} /> Painel de Viagem</h2>
      <button onClick={handleStartTrip} className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl shadow-lg">Iniciar Rota Agora</button>
      
      <div className="bg-[#0f172a]/80 backdrop-blur-md border border-slate-800 rounded-3xl p-5">
        <h3 className="text-sm font-bold text-slate-300 mb-4">Calculadora de Rota</h3>
        <div className="space-y-4">
           <div className="flex space-x-2"><input type="text" value={destinoQuery} onChange={(e) => setDestinoQuery(e.target.value)} placeholder="Destino..." className="flex-1 bg-slate-900 p-3 rounded-xl text-white text-sm border border-slate-700" /><button onClick={handleCalcularRota} className="bg-cyan-600 p-3 rounded-xl text-white">{isSearching ? <Loader2 className="animate-spin"/> : <Search />}</button></div>
           
           <div className="grid grid-cols-2 gap-3">
              <input type="number" readOnly value={distanciaPlan || ''} placeholder="Distância (km)" className="bg-slate-900/50 border border-slate-800 rounded-xl p-3 text-slate-400" />
              <input type="number" value={precoPlan} onChange={(e) => setPrecoPlan(e.target.value)} placeholder="Preço (R$)" className="bg-slate-900 border border-slate-700 rounded-xl p-3 text-white" />
           </div>

           {distanciaPlan > 0 && (
            <div className="space-y-3 mt-4">
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-700 text-center">
                        <p className="text-[10px] text-slate-400 uppercase">Litros Necessários</p>
                        <p className="text-lg font-bold text-white">{calcLitros.toFixed(1)} L</p>
                    </div>
                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-700 text-center">
                        <p className="text-[10px] text-slate-400 uppercase">Custo Estimado</p>
                        <p className="text-lg font-bold text-emerald-400">R$ {calcCusto.toFixed(2)}</p>
                    </div>
                </div>
                <div className={`p-3 rounded-xl border ${calcLitros > currentFuel ? 'bg-red-900/20 border-red-800 text-red-400' : (currentFuel - calcLitros < 1 ? 'bg-amber-900/20 border-amber-800 text-amber-400' : 'bg-emerald-900/20 border-emerald-800 text-emerald-400')}`}>
                    <p className="text-xs font-bold text-center">
                    {calcLitros > currentFuel ? "⚠️ Combustível insuficiente para a viagem!" : 
                        (currentFuel - calcLitros < 1 ? "⚠️ Combustível no limite! Considere abastecer." : "✅ Combustível suficiente. Boa viagem!")}
                    </p>
                </div>
            </div>
           )}
        </div>
      </div>
    </div>
  );
}

function TabConfiguracoes({ config, currentFuel, entries, onCalculate, onImportData, onResetData }) {
  const [localConfig, setLocalConfig] = useState(config);
  const [saved, setSaved] = useState(false);
  const [backupMsg, setBackupMsg] = useState({ text: '', type: '' });
  const [confirmReset, setConfirmReset] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => { setLocalConfig(config); }, [config]);

  const handleChange = (e) => setLocalConfig(prev => ({ ...prev, [e.target.name]: parseFloat(e.target.value) || 0 }));

  const handleSubmit = (e) => { e.preventDefault(); onCalculate(localConfig); setSaved(true); setTimeout(() => setSaved(false), 3000); };

  const handleExportBackup = async () => {
    try {
      const blob = new Blob([JSON.stringify({ config, currentFuel, entries, exportDate: new Date().toISOString() }, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `motolog_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
      setBackupMsg({ text: 'Backup exportado!', type: 'success' });
    } catch (err) { setBackupMsg({ text: 'Erro ao gerar backup.', type: 'error' }); }
    setTimeout(() => setBackupMsg({ text: '', type: '' }), 4000);
  };

  const handleImportBackup = (e) => {
    const file = e.target.files[0]; if (!file) return; const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (data.config && data.entries !== undefined) { onImportData(data); setBackupMsg({ text: 'Dados restaurados!', type: 'success' }); } 
        else { setBackupMsg({ text: 'Arquivo inválido.', type: 'error' }); }
      } catch (err) { setBackupMsg({ text: 'Formato incorreto.', type: 'error' }); }
      if (fileInputRef.current) fileInputRef.current.value = ''; setTimeout(() => setBackupMsg({ text: '', type: '' }), 4000);
    };
    reader.readAsText(file);
  };

  const handleWipeData = () => {
    if (confirmReset) {
      onResetData();
      setConfirmReset(false);
      setBackupMsg({ text: 'Todos os registros foram apagados!', type: 'success' });
      setTimeout(() => setBackupMsg({ text: '', type: '' }), 4000);
    } else {
      setConfirmReset(true);
      setTimeout(() => setConfirmReset(false), 3000);
    }
  };

  return (
    <div className="flex flex-col space-y-6 pt-4 animate-fade-in-up">
      <h2 className="text-lg font-bold text-slate-300 px-2 flex items-center"><Settings className="mr-2 text-cyan-500" size={20} /> Parâmetros do Veículo</h2>
      <form onSubmit={handleSubmit} className="bg-[#0f172a]/80 backdrop-blur-md border border-slate-800 rounded-2xl p-5 space-y-5">
        <div className="space-y-1"><label className="text-xs font-medium text-slate-400 uppercase tracking-wider ml-1">Tanque Total (L)</label><div className="relative"><div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500"><Droplets size={16} /></div><input type="number" name="tanqueTotal" value={localConfig.tanqueTotal} onChange={handleChange} step="0.1" className="w-full bg-[#060b14] border border-slate-700 text-slate-200 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-cyan-500 font-mono" /></div></div>
        <div className="space-y-1"><label className="text-xs font-medium text-slate-400 uppercase tracking-wider ml-1">Meta / Média (Km/L)</label><div className="relative"><div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500"><BarChart2 size={16} /></div><input type="number" name="kmL" value={localConfig.kmL} onChange={handleChange} step="0.1" className="w-full bg-[#060b14] border border-slate-700 text-slate-200 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-cyan-500 font-mono" /></div></div>
        <div className="space-y-1"><label className="text-xs font-medium text-slate-400 uppercase tracking-wider ml-1">Odômetro Atual (km)</label><div className="relative"><div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500"><Gauge size={16} /></div><input type="number" name="odometro" value={localConfig.odometro} onChange={handleChange} className="w-full bg-[#060b14] border border-slate-700 text-slate-200 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-cyan-500 font-mono" /></div></div>
        <button type="submit" className={`w-full mt-4 font-bold py-3.5 rounded-xl transition-all flex justify-center items-center ${saved ? 'bg-emerald-500 text-white' : 'bg-teal-500 text-slate-900'}`}>{saved ? <><CheckCircle2 className="mr-2" size={20} /> Salvo!</> : 'Salvar Manualmente'}</button>
      </form>

      <div className="bg-[#0f172a]/80 backdrop-blur-md border border-slate-800 rounded-2xl p-5 space-y-4">
        <h3 className="text-sm font-bold text-slate-300 flex items-center border-b border-slate-800 pb-2"><Database className="mr-2 text-cyan-500" size={18} /> Gerenciamento de Dados</h3>
        {backupMsg.text && (<div className={`flex items-center p-3 rounded-lg text-xs font-medium ${backupMsg.type === 'success' ? 'bg-emerald-900/30 text-emerald-400' : 'bg-red-900/30 text-red-400'}`}>{backupMsg.text}</div>)}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button onClick={handleExportBackup} className="flex flex-col items-center justify-center p-3 bg-slate-800 border border-slate-600 rounded-xl text-cyan-400"><Download size={20} className="mb-1" /><span className="text-xs font-bold">Exportar</span></button>
          <label className="flex flex-col items-center justify-center p-3 bg-slate-800 border border-slate-600 rounded-xl text-purple-400 cursor-pointer"><Upload size={20} className="mb-1" /><span className="text-xs font-bold">Importar</span><input type="file" accept=".json" onChange={handleImportBackup} ref={fileInputRef} className="hidden" /></label>
        </div>
        
        <button onClick={handleWipeData} className={`w-full mt-2 flex items-center justify-center p-3 rounded-xl transition-colors border ${confirmReset ? 'bg-red-600 hover:bg-red-500 text-white border-red-500 shadow-[0_0_15px_rgba(220,38,38,0.4)]' : 'bg-slate-900/50 hover:bg-slate-800 border-red-900/30 text-red-400'}`}>
          <Trash2 size={18} className="mr-2" />
          <span className="text-sm font-bold">{confirmReset ? 'Clique novamente para Confirmar!' : 'Zerar Todos os Dados'}</span>
        </button>
      </div>

      {/* RODAPÉ DO DESENVOLVEDOR REINSERIDO AQUI */}
      <div className="mt-8 pb-4 flex flex-col items-center justify-center border-t border-slate-800/50 pt-6 opacity-70">
        <span className="text-[10px] text-slate-500 uppercase tracking-widest font-medium">Desenvolvido por</span>
        <span className="text-xs font-bold text-cyan-500 tracking-wider mt-1">Joseilton Constâncio</span>
      </div>
    </div>
  );
}

function NavItem({ icon, label, isActive, onClick }) {
  return (
    <button onClick={onClick} className={`flex flex-col items-center justify-center w-full h-full transition-colors ${isActive ? 'text-cyan-400' : 'text-slate-500'}`}>
      <div className={`mb-1 transition-transform duration-300 ${isActive ? '-translate-y-1' : ''}`}>{icon}</div>
      <span className="text-[9px] font-bold tracking-wider">{label}</span>
      {isActive && <div className="absolute bottom-0 w-8 h-1 bg-cyan-400 rounded-t-md shadow-[0_0_10px_#22d3ee]"></div>}
    </button>
  );
}

function ModalAbastecimento({ onClose, config, setConfig, currentFuel, setCurrentFuel, setEntries }) {
  const [formData, setFormData] = useState({ data: new Date().toISOString().split('T')[0], odometro: config.odometro, litros: '', valorTotal: '', descricao: '' });
  const [isFullTank, setIsFullTank] = useState(false);
  const precoLitro = useMemo(() => { const l = parseFloat(formData.litros); const v = parseFloat(formData.valorTotal); return (l > 0 && v > 0) ? (v / l).toFixed(2) : '0.00'; }, [formData.litros, formData.valorTotal]);

  const handleSubmit = (e) => {
    e.preventDefault(); const l = parseFloat(formData.litros) || 0; const o = parseFloat(formData.odometro) || config.odometro;
    isFullTank ? setCurrentFuel(config.tanqueTotal) : setCurrentFuel(prev => Math.min(config.tanqueTotal, prev + l));
    if (o > config.odometro) setConfig(prev => ({ ...prev, odometro: o }));
    setEntries(prev => [{ id: Date.now(), type: 'abastecimento', date: new Date(formData.data + 'T12:00:00Z').toISOString(), odometro: o, litros: l, valorTotal: parseFloat(formData.valorTotal)||0, precoLitro: parseFloat(precoLitro), isFullTank, descricao: formData.descricao }, ...prev]);
    onClose();
  };
  return <ModalWrapper title="Novo Abastecimento" color="emerald" icon={<Fuel size={24}/>} onClose={onClose}>
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Data" type="date" value={formData.data} onChange={e => setFormData({...formData, data: e.target.value})} />
      <div className="flex bg-slate-900 border border-slate-700 rounded-xl p-1 mt-1"><button type="button" onClick={() => setIsFullTank(false)} className={`flex-1 py-2 text-xs font-bold rounded-lg ${!isFullTank ? 'bg-slate-700 text-white' : 'text-slate-400'}`}>Parcial</button><button type="button" onClick={() => setIsFullTank(true)} className={`flex-1 py-2 text-xs font-bold rounded-lg ${isFullTank ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}>Completar Tanque</button></div>
      <Input label="Odômetro (km)" type="number" value={formData.odometro} onChange={e => setFormData({...formData, odometro: e.target.value})} />
      <div className="grid grid-cols-2 gap-3"><Input label="Litros" type="number" step="0.01" value={formData.litros} onChange={e => setFormData({...formData, litros: e.target.value})} /><Input label="Valor Total (R$)" type="number" step="0.01" value={formData.valorTotal} onChange={e => setFormData({...formData, valorTotal: e.target.value})} /></div>
      <button type="submit" className="w-full mt-6 bg-emerald-600 text-white font-bold py-3 rounded-xl">Salvar</button>
    </form>
  </ModalWrapper>
}

function ModalDespesa({ onClose, config, setEntries }) {
  const [formData, setFormData] = useState({ data: new Date().toISOString().split('T')[0], titulo: '', valor: '', descricao: '' });
  const handleSubmit = (e) => { e.preventDefault(); setEntries(prev => [{ id: Date.now(), type: 'despesa', date: new Date(formData.data + 'T12:00:00Z').toISOString(), titulo: formData.titulo, valor: parseFloat(formData.valor)||0, odometro: config.odometro, descricao: formData.descricao }, ...prev]); onClose(); };
  return <ModalWrapper title="Nova Despesa" color="red" icon={<Wrench size={24}/>} onClose={onClose}>
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Data" type="date" value={formData.data} onChange={e => setFormData({...formData, data: e.target.value})} />
      <Input label="Título da Despesa" type="text" value={formData.titulo} onChange={e => setFormData({...formData, titulo: e.target.value})} />
      <Input label="Valor Total (R$)" type="number" step="0.01" value={formData.valor} onChange={e => setFormData({...formData, valor: e.target.value})} />
      <button type="submit" className="w-full mt-6 bg-red-600 text-white font-bold py-3 rounded-xl">Salvar</button>
    </form>
  </ModalWrapper>
}

function ModalOdometro({ onClose, config, setConfig, currentFuel, setCurrentFuel, setEntries }) {
  const [data, setData] = useState(new Date().toISOString().split('T')[0]); const [novoOdometro, setNovoOdometro] = useState('');
  const handleSubmit = (e) => { e.preventDefault(); const val = parseFloat(novoOdometro); if (isNaN(val) || val <= config.odometro) return; const diffKm = val - config.odometro; const litrosGastos = config.kmL > 0 ? diffKm / config.kmL : 0; setCurrentFuel(Math.max(0, currentFuel - litrosGastos)); setConfig(prev => ({ ...prev, odometro: val })); setEntries(prev => [{ id: Date.now(), type: 'viagem', date: new Date(data + 'T12:00:00Z').toISOString(), titulo: 'Atualização de Rota', kmRodados: diffKm, litrosGastos, descricao: '' }, ...prev]); onClose(); };
  return <ModalWrapper title="Atualizar Odômetro" color="purple" icon={<MapPin size={24}/>} onClose={onClose}>
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Novo Odômetro (km)" type="number" value={novoOdometro} onChange={e => setNovoOdometro(e.target.value)} placeholder={`Atual: ${config.odometro}`} />
      <button type="submit" className="w-full mt-6 bg-purple-600 text-white font-bold py-3 rounded-xl">Confirmar</button>
    </form>
  </ModalWrapper>
}

function ModalEncerrarViagem({ onClose, activeTrip, setActiveTrip, config, setConfig, currentFuel, setCurrentFuel, setEntries }) {
  const kmGpsSugerido = config.odometro + (activeTrip?.accumulatedKm || 0);
  const [odoFinal, setOdoFinal] = useState(Math.round(kmGpsSugerido).toString());
  const [desc, setDesc] = useState('');
  const [erro, setErro] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault(); const final = parseFloat(odoFinal);
    if (isNaN(final) || final <= activeTrip.startOdo) { setErro('O Km final deve ser maior que o inicial.'); return; }
    const kmRodados = final - activeTrip.startOdo; const litrosGastos = config.kmL > 0 ? kmRodados / config.kmL : 0;
    const segundos = Math.floor((Date.now() - activeTrip.startTime) / 1000);
    const h = Math.floor(segundos / 3600); const m = Math.floor((segundos % 3600) / 60); const duracaoTexto = `${h > 0 ? h + 'h ' : ''}${m}m`;
    setCurrentFuel(prev => Math.max(0, prev - litrosGastos)); setConfig(prev => ({ ...prev, odometro: final }));
    setEntries(prev => [{ id: Date.now(), type: 'viagem', date: new Date().toISOString(), titulo: 'Viagem Registrada', kmRodados, litrosGastos, duracao: duracaoTexto, descricao: desc }, ...prev]);
    setActiveTrip(null); onClose();
  };

  return (
    <ModalWrapper title="Encerrar Viagem" color="indigo" icon={<Square size={24}/>} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-indigo-900/30 p-4 rounded-xl border border-indigo-500/30 flex justify-between items-center mb-4">
          <span className="text-xs text-indigo-300 uppercase">Km de Partida</span>
          <span className="text-lg font-bold font-mono text-white">{activeTrip?.startOdo}</span>
        </div>
        <div>
          <label className="text-xs text-slate-400 ml-1">Odômetro de Chegada (Km do painel da moto)</label>
          <input type="number" required value={odoFinal} onChange={e => {setOdoFinal(e.target.value); setErro('');}} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl p-3 text-white font-mono focus:border-indigo-500 focus:outline-none" />
          <p className="text-[10px] text-slate-500 mt-1 ml-1">Valor acima sugerido pelo rastreador do GPS. Corrija se necessário.</p>
          {erro && <span className="text-[10px] text-red-400 mt-1">{erro}</span>}
        </div>
        <div><label className="text-xs text-slate-400 ml-1">Destino ou Descrição (Opcional)</label><input type="text" value={desc} onChange={e => setDesc(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:border-indigo-500 focus:outline-none" /></div>
        <button type="submit" className="w-full mt-6 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl">Salvar Viagem</button>
      </form>
    </ModalWrapper>
  );
}

function ModalDetalhes({ entry, onClose, setEntries }) {
  const handleDelete = () => { setEntries(prev => prev.filter(e => e.id !== entry.id)); onClose(); };
  return <ModalWrapper title={entry.type === 'abastecimento' ? 'Abastecimento' : entry.titulo} color="slate" icon={<Info size={24}/>} onClose={onClose}>
    <div className="space-y-4">
      {entry.type === 'viagem' && (
         <div className="grid grid-cols-2 gap-4">
           <div><p className="text-xs text-slate-500 uppercase">Km Rodados</p><p className="font-mono text-purple-400 text-lg font-bold">+{entry.kmRodados} km</p></div>
           <div><p className="text-xs text-slate-500 uppercase">Combustível</p><p className="font-mono text-red-400 text-lg font-bold">-{entry.litrosGastos?.toFixed(1)} L</p></div>
           {entry.duracao && <div className="col-span-2"><p className="text-xs text-slate-500 uppercase">Tempo de Viagem</p><p className="font-mono text-slate-200 font-bold">{entry.duracao}</p></div>}
         </div>
      )}
      <button onClick={handleDelete} className="w-full mt-6 bg-red-900/30 text-red-400 border border-red-800/50 font-bold py-3 rounded-xl flex justify-center items-center"><Trash2 size={18} className="mr-2" /> Excluir Registro</button>
    </div>
  </ModalWrapper>
}

function ModalWrapper({ title, color, icon, onClose, children }) {
  const colorMap = { emerald: 'from-emerald-600 to-cyan-500', red: 'from-red-600 to-orange-500', purple: 'from-purple-600 to-indigo-500', indigo: 'from-indigo-600 to-purple-500', slate: 'from-slate-600 to-slate-400' };
  const textMap = { emerald: 'text-emerald-500', red: 'text-red-500', purple: 'text-purple-500', indigo: 'text-indigo-500', slate: 'text-slate-300' };
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-sm bg-[#111827] rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-fade-in-up">
        <div className={`h-2 bg-gradient-to-r ${colorMap[color]} w-full`}></div>
        <div className="p-5 overflow-y-auto custom-scrollbar">
          <div className="flex justify-between items-center mb-5"><h3 className="text-xl font-bold text-slate-100 flex items-center"><span className={`${textMap[color]} mr-2`}>{icon}</span> {title}</h3><button onClick={onClose} className="p-1 text-slate-400 bg-slate-800 rounded-full"><X size={20} /></button></div>
          {children}
        </div>
      </div>
    </div>
  );
}
function Input({ label, type, value, onChange, step, placeholder }) {
  return <div><label className="text-xs text-slate-400 ml-1">{label}</label><input type={type} required step={step} value={value} onChange={onChange} placeholder={placeholder} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl p-3 text-white font-mono focus:border-cyan-500 focus:outline-none" /></div>;
}
