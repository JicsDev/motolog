import React, { useState, useEffect, useMemo, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import { CircleMarker, MapContainer, Polyline, TileLayer, useMap } from 'react-leaflet';
import { 
  LayoutDashboard, List, BarChart2, Settings, Plus, X, Fuel, Wrench, 
  Gauge, Droplets, Calendar, MapPin, Trash2, Info, Map, Square, Navigation, 
  Search, Loader2, CheckCircle2, Database, Download, Upload, Filter,
  TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Activity, DollarSign,
  Sun, Moon, Volume2, VolumeX
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('PAINEL');
  const [isLightTheme, setIsLightTheme] = useState(() => localStorage.getItem('motolog_theme') === 'light');
  const [fabMenuOpen, setFabMenuOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const mainRef = useRef(null);

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
  const isTripActive = activeTrip !== null;

  useEffect(() => { localStorage.setItem('motolog_config', JSON.stringify(config)); }, [config]);
  useEffect(() => { localStorage.setItem('motolog_fuel', JSON.stringify(currentFuel)); }, [currentFuel]);
  useEffect(() => { localStorage.setItem('motolog_entries', JSON.stringify(entries)); }, [entries]);
  useEffect(() => { localStorage.setItem('motolog_active_trip', JSON.stringify(activeTrip)); }, [activeTrip]);
  useEffect(() => { localStorage.setItem('motolog_theme', isLightTheme ? 'light' : 'dark'); }, [isLightTheme]);

  useEffect(() => { setFabMenuOpen(false); }, [activeTab]);
  useEffect(() => { mainRef.current?.scrollTo({ top: 0 }); }, [activeTab, isTripActive]);

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
    <div className={`h-[100dvh] w-full bg-[#060b14] flex justify-center font-sans text-slate-200 overflow-hidden ${isLightTheme ? 'theme-light' : ''}`}>
      <div className="h-full w-full max-w-md bg-gradient-to-b from-[#0a1325] to-[#040811] relative flex flex-col shadow-2xl md:border-x md:border-slate-800 overflow-hidden">
        
        <header className="pt-8 pb-4 px-6 bg-transparent flex justify-between items-center z-10 flex-shrink-0">
          <div>
            <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400 tracking-wider">
              MOTO<span className="text-slate-100">LOG</span>
            </h1>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2 text-cyan-400 bg-cyan-900/20 px-3 py-1 rounded-full border border-cyan-500/30">
              <Gauge size={16} />
              <span className="text-sm font-bold font-mono tracking-wide">{config.odometro} <span className="text-[10px] text-cyan-600">KM</span></span>
            </div>
            <button
              type="button"
              onClick={() => setIsLightTheme(theme => !theme)}
              className="rounded-full border border-slate-700 p-2 text-slate-300 transition-colors hover:bg-slate-800"
              aria-label={isLightTheme ? 'Ativar tema escuro' : 'Ativar tema claro'}
              title={isLightTheme ? 'Ativar tema escuro' : 'Ativar tema claro'}
            >
              {isLightTheme ? <Moon size={18} /> : <Sun size={18} />}
            </button>
          </div>
        </header>

        <main ref={mainRef} className="flex-1 overflow-y-auto pb-28 px-4 custom-scrollbar z-10 relative">
          {activeTab === 'PAINEL' && <TabPainel currentFuel={currentFuel} tanqueTotal={config.tanqueTotal} config={config} entries={entries} />}
          {activeTab === 'LOG' && <TabLog entries={entries} onSelectEntry={setSelectedEntry} />}
          {activeTab === 'VIAGEM' && <TabViagem config={config} entries={entries} activeTrip={activeTrip} setActiveTrip={setActiveTrip} onStopTrip={() => setActiveModal('encerrar_viagem')} currentFuel={currentFuel} />}
          {activeTab === 'RELATÓRIOS' && <TabRelatorios entries={entries} config={config} />}
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

// ==========================================
// NOVA TELA DE RELATÓRIOS (ESTILO FUELIO)
// ==========================================
function TabRelatorios({ entries, config }) {
  const [subTab, setSubTab] = useState('abastecimentos'); 

  // Datas Base
  const now = new Date();
  const currYear = now.getFullYear().toString();
  const currMonth = now.toISOString().slice(0, 7);
  const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonth = prevMonthDate.toISOString().slice(0, 7);
  const prevYear = (now.getFullYear() - 1).toString();

  // Filtros
  const abast = entries.filter(e => e.type === 'abastecimento').sort((a,b) => new Date(a.date) - new Date(b.date));
  const desp = entries.filter(e => e.type === 'despesa').sort((a,b) => new Date(a.date) - new Date(b.date));
  const odoEntries = entries.filter(e => e.odometro).sort((a,b) => new Date(a.date) - new Date(b.date));
  
  const getSum = (arr, key) => arr.reduce((sum, e) => sum + (parseFloat(e[key]) || 0), 0);
  const filterByDate = (arr, prefix) => arr.filter(e => e.date && e.date.startsWith(prefix));

  // --- NOVA LÓGICA DE CONSUMO "TANK-TO-TANK" (Correção) ---
  const calculateConsumption = () => {
    let consumptions = [];
    let lastFullOdo = null;
    let litersBetween = 0;

    for (let i = 0; i < abast.length; i++) {
      const entry = abast[i];
      litersBetween += (parseFloat(entry.litros) || 0);

      // Só calcula se for tanque cheio e se já tivermos um ponto de partida anterior
      if (entry.isFullTank) {
        if (lastFullOdo !== null) {
          const dist = entry.odometro - lastFullOdo;
          if (dist > 0 && litersBetween > 0) {
            consumptions.push(dist / litersBetween);
          }
          litersBetween = 0; // Reseta após calcular
        }
        lastFullOdo = entry.odometro;
      }
    }
    return consumptions;
  };

  const consumptions = calculateConsumption();
  const avgKml = consumptions.length ? consumptions.reduce((a,b) => a + b, 0) / consumptions.length : (config.kmL || 0);
  const bestKml = consumptions.length ? Math.max(...consumptions) : avgKml;
  const worstKml = consumptions.length ? Math.min(...consumptions) : avgKml;

  // --- DADOS DE ABASTECIMENTOS ---
  const litrosTotal = getSum(abast, 'litros');
  const abastStats = {
    count: abast.length, 
    countThisYear: filterByDate(abast, currYear).length, 
    countLastYear: filterByDate(abast, prevYear).length,
    countThisMonth: filterByDate(abast, currMonth).length, 
    countLastMonth: filterByDate(abast, prevMonth).length,
    litros: litrosTotal, 
    litrosThisYear: getSum(filterByDate(abast, currYear), 'litros'), 
    litrosLastYear: getSum(filterByDate(abast, prevYear), 'litros'),
    litrosThisMonth: getSum(filterByDate(abast, currMonth), 'litros'), 
    litrosLastMonth: getSum(filterByDate(abast, prevMonth), 'litros'),
    minLitros: abast.length ? Math.min(...abast.map(a => parseFloat(a.litros) || 0)) : 0,
    maxLitros: abast.length ? Math.max(...abast.map(a => parseFloat(a.litros) || 0)) : 0,
  };

  // --- DADOS DE DESPESAS ---
  const allExpenses = entries.map(e => ({...e, cost: e.type === 'abastecimento' ? e.valorTotal : (e.type === 'despesa' ? e.valor : 0) })).filter(e => e.cost > 0);
  const totalCost = getSum(allExpenses, 'cost');
  const despStats = {
    total: totalCost,
    thisYear: getSum(filterByDate(allExpenses, currYear), 'cost'),
    lastYear: getSum(filterByDate(allExpenses, prevYear), 'cost'),
    thisMonth: getSum(filterByDate(allExpenses, currMonth), 'cost'),
    lastMonth: getSum(filterByDate(allExpenses, prevMonth), 'cost'),
    minDespesa: desp.length ? Math.min(...desp.map(d => parseFloat(d.valor) || 0)) : 0,
    maxDespesa: desp.length ? Math.max(...desp.map(d => parseFloat(d.valor) || 0)) : 0,
    minPreco: abast.length ? Math.min(...abast.map(a => parseFloat(a.precoLitro) || 0)) : 0,
    maxPreco: abast.length ? Math.max(...abast.map(a => parseFloat(a.precoLitro) || 0)) : 0,
  };

  // --- DADOS DE DISTÂNCIA ---
  const getDist = (arr) => arr.length > 1 ? arr[arr.length-1].odometro - arr[0].odometro : 0;
  const totalDist = odoEntries.length > 1 ? odoEntries[odoEntries.length-1].odometro - odoEntries[0].odometro : 0;
  const realTotalDist = totalDist > 0 ? totalDist : getSum(entries.filter(e => e.type === 'viagem'), 'kmRodados');
  const distStats = {
    total: realTotalDist,
    thisYear: getDist(filterByDate(odoEntries, currYear)) || getSum(filterByDate(entries.filter(e=>e.type==='viagem'), currYear), 'kmRodados'),
    lastYear: getDist(filterByDate(odoEntries, prevYear)) || getSum(filterByDate(entries.filter(e=>e.type==='viagem'), prevYear), 'kmRodados'),
    thisMonth: getDist(filterByDate(odoEntries, currMonth)) || getSum(filterByDate(entries.filter(e=>e.type==='viagem'), currMonth), 'kmRodados'),
    lastMonth: getDist(filterByDate(odoEntries, prevMonth)) || getSum(filterByDate(entries.filter(e=>e.type==='viagem'), prevMonth), 'kmRodados'),
  };

  const firstDate = odoEntries.length > 0 ? new Date(odoEntries[0].date) : now;
  const daysSince = Math.max(1, Math.ceil((now - firstDate) / (1000 * 60 * 60 * 24)));
  const monthsSince = Math.max(1, daysSince / 30);

  const StatGrid = ({ valThisYear, valLastYear, valThisMonth, valLastMonth, formatFn = (v) => v }) => (
    <div className="grid grid-cols-2 gap-y-4 gap-x-2 pt-4 mt-4 border-t border-slate-800/50">
      <div className="flex space-x-2"><TrendingUp size={16} className="text-emerald-500/70" /><div><p className="text-sm font-bold text-slate-200">{formatFn(valThisYear)}</p><p className="text-[10px] text-slate-500">Este ano</p></div></div>
      <div className="flex space-x-2"><TrendingDown size={16} className="text-slate-500/70" /><div><p className="text-sm font-bold text-slate-400">{formatFn(valThisMonth)}</p><p className="text-[10px] text-slate-500">Este mês</p></div></div>
      <div className="flex space-x-2"><ArrowUpRight size={16} className="text-slate-600" /><div><p className="text-sm font-bold text-slate-400">{formatFn(valLastYear)}</p><p className="text-[10px] text-slate-500">Ano ant.</p></div></div>
      <div className="flex space-x-2"><ArrowDownRight size={16} className="text-slate-600" /><div><p className="text-sm font-bold text-slate-400">{formatFn(valLastMonth)}</p><p className="text-[10px] text-slate-500">Mês ant.</p></div></div>
    </div>
  );

  return (
    <div className="flex flex-col h-full animate-fade-in-up pb-6">
      <div className="flex border-b border-slate-800 mb-4 sticky top-0 bg-[#060b14] z-10 pt-2">
        {['abastecimentos', 'despesas', 'distancia'].map(tab => (
          <button key={tab} onClick={() => setSubTab(tab)} className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-wider text-center transition-all duration-300 ${subTab === tab ? 'text-cyan-400 border-b-2 border-cyan-400 bg-cyan-900/10' : 'text-slate-500 hover:text-slate-300'}`}>
            {tab === 'distancia' ? 'Distância' : tab}
          </button>
        ))}
      </div>

      <div className="px-2 space-y-4">
        {subTab === 'abastecimentos' && (
          <>
            <div className="bg-[#0f172a]/80 backdrop-blur-md border border-slate-800 rounded-3xl p-5 shadow-lg">
              <p className="text-xs text-slate-400 mb-1">Total de Abastecimentos</p>
              <p className="text-3xl font-black text-cyan-400">{abastStats.count}</p>
              <StatGrid valThisYear={abastStats.countThisYear} valLastYear={abastStats.countLastYear} valThisMonth={abastStats.countThisMonth} valLastMonth={abastStats.countLastMonth} />
            </div>
            <div className="bg-[#0f172a]/80 backdrop-blur-md border border-slate-800 rounded-3xl p-5 shadow-lg">
              <p className="text-xs text-slate-400 mb-1">Combustível Total</p>
              <p className="text-3xl font-black text-emerald-400">{abastStats.litros.toFixed(1).replace('.', ',')} L</p>
              <StatGrid valThisYear={abastStats.litrosThisYear} valLastYear={abastStats.litrosLastYear} valThisMonth={abastStats.litrosThisMonth} valLastMonth={abastStats.litrosLastMonth} formatFn={v => `${v.toFixed(1).replace('.', ',')} L`} />
            </div>
            <div className="bg-[#0f172a]/80 backdrop-blur-md border border-slate-800 rounded-3xl p-5 shadow-lg">
              <p className="text-xs text-slate-400 mb-1">Consumo Médio (Tanque a Tanque)</p>
              <p className="text-3xl font-black text-purple-400">{avgKml.toFixed(2).replace('.', ',')} km/l</p>
              <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-800/50">
                <div className="flex space-x-2"><Droplets size={16} className="text-emerald-500" /><div><p className="text-sm font-bold text-emerald-400">{bestKml.toFixed(2).replace('.', ',')} km/l</p><p className="text-[10px] text-slate-500">Melhor</p></div></div>
                <div className="flex space-x-2"><Droplets size={16} className="text-red-500" /><div><p className="text-sm font-bold text-red-400">{worstKml.toFixed(2).replace('.', ',')} km/l</p><p className="text-[10px] text-slate-500">Pior</p></div></div>
              </div>
            </div>
          </>
        )}
        {subTab === 'despesas' && (
          <>
            <div className="bg-[#0f172a]/80 backdrop-blur-md border border-slate-800 rounded-3xl p-5 shadow-lg">
              <p className="text-xs text-slate-400 mb-1">Despesas Totais</p>
              <p className="text-3xl font-black text-red-400">R$ {despStats.total.toFixed(2).replace('.', ',')}</p>
              <StatGrid valThisYear={despStats.thisYear} valLastYear={despStats.lastYear} valThisMonth={despStats.thisMonth} valLastMonth={despStats.lastMonth} formatFn={v => `R$ ${v.toFixed(2).replace('.', ',')}`} />
            </div>
          </>
        )}
        {subTab === 'distancia' && (
          <div className="bg-[#0f172a]/80 backdrop-blur-md border border-slate-800 rounded-3xl p-5 shadow-lg">
             <p className="text-xs text-slate-400 mb-1">Distância Total Percorrida</p>
             <p className="text-3xl font-black text-indigo-400">{distStats.total.toFixed(0)} km</p>
             <StatGrid valThisYear={`${distStats.thisYear.toFixed(0)} km`} valLastYear={`${distStats.lastYear.toFixed(0)} km`} valThisMonth={`${distStats.thisMonth.toFixed(0)} km`} valLastMonth={`${distStats.lastMonth.toFixed(0)} km`} />
          </div>
        )}
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

function formatManeuver(step) {
  const { type, modifier, exit } = step.maneuver;
  const street = step.name ? ` para ${step.name}` : '';
  const directions = {
    left: 'à esquerda',
    right: 'à direita',
    'slight left': 'levemente à esquerda',
    'slight right': 'levemente à direita',
    'sharp left': 'acentuadamente à esquerda',
    'sharp right': 'acentuadamente à direita',
    straight: 'em frente',
    uturn: 'faça o retorno',
  };
  const direction = directions[modifier] || '';

  if (type === 'arrive') return 'Você chegou ao destino.';
  if (type === 'roundabout' || type === 'rotary') {
    return `Na rotatória, pegue a saída ${exit || ''}${street}.`.replace('  ', ' ');
  }
  if (type === 'depart') return `Siga${street}.`;
  if (type === 'merge' || type === 'on ramp' || type === 'off ramp') {
    return `${type === 'merge' ? 'Entre' : 'Acesse'} ${direction}${street}.`.replace('  ', ' ');
  }
  if (type === 'fork' || type === 'end of road' || type === 'turn') {
    return `Vire ${direction || 'na via'}${street}.`;
  }
  return `Continue${street}.`;
}

function FitRouteBounds({ route }) {
  const map = useMap();

  useEffect(() => {
    if (route?.coordinates?.length) {
      map.fitBounds(route.coordinates, { padding: [24, 24] });
    }
  }, [map, route]);

  return null;
}

function FollowCurrentPosition({ position }) {
  const map = useMap();

  useEffect(() => {
    if (position) map.panTo(position);
  }, [map, position]);

  return null;
}

function speakPortuguese(message) {
  if (!('speechSynthesis' in window)) return false;

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(message);
  utterance.lang = 'pt-BR';
  utterance.rate = 1;
  window.speechSynthesis.speak(utterance);
  return true;
}

function RouteMap({ route, currentPosition, height = 'h-64', follow = false }) {
  const center = currentPosition || route.coordinates[0];

  return (
    <div className={`${height} w-full overflow-hidden rounded-2xl border border-slate-700`}>
      <MapContainer center={center} zoom={14} scrollWheelZoom className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitRouteBounds route={route} />
        {follow && currentPosition && <FollowCurrentPosition position={currentPosition} />}
        <Polyline positions={route.coordinates} pathOptions={{ color: '#0891b2', weight: 6, opacity: 0.9 }} />
        <CircleMarker center={route.origin} radius={7} pathOptions={{ color: '#fff', fillColor: '#16a34a', fillOpacity: 1 }} />
        <CircleMarker center={route.destination} radius={7} pathOptions={{ color: '#fff', fillColor: '#dc2626', fillOpacity: 1 }} />
        {currentPosition && (
          <CircleMarker center={currentPosition} radius={8} pathOptions={{ color: '#fff', fillColor: '#2563eb', fillOpacity: 1, weight: 3 }} />
        )}
      </MapContainer>
    </div>
  );
}

function TabViagem({ config, entries, activeTrip, setActiveTrip, onStopTrip, currentFuel }) {
  const ultimoAbast = entries.find(e => e.type === 'abastecimento');
  const [precoPlan, setPrecoPlan] = useState(ultimoAbast ? ultimoAbast.precoLitro : 5.89);
  const [destinoQuery, setDestinoQuery] = useState('');
  const [routePlan, setRoutePlan] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [searchSuccess, setSearchSuccess] = useState('');
  const [voiceEnabled, setVoiceEnabled] = useState(Boolean(activeTrip?.voiceEnabled));
  const [gpsError, setGpsError] = useState('');
  const lastAnnouncedStepRef = useRef(-1);

  const [elapsed, setElapsed] = useState(activeTrip ? activeTrip.elapsedTime || 0 : 0);
  const [gpsKm, setGpsKm] = useState(activeTrip ? activeTrip.accumulatedKm || 0 : 0);
  const [currentSpeed, setCurrentSpeed] = useState(0); 
  const activeTripRef = useRef(activeTrip);
  const lastUpdateRef = useRef(Date.now());
  const isTrackingTrip = Boolean(activeTrip && !activeTrip.isPaused);

  const speak = (message) => {
    if (!speakPortuguese(message)) {
      setSearchError('Este navegador não oferece comandos de voz.');
    }
  };

  const handleToggleVoice = () => {
    if (!('speechSynthesis' in window)) {
      setSearchError('Este navegador não oferece comandos de voz.');
      return;
    }

    const enabled = !voiceEnabled;
    setVoiceEnabled(enabled);
    setActiveTrip(prev => prev ? { ...prev, voiceEnabled: enabled } : prev);
    if (enabled) speak('Orientação por voz ativada.');
    else window.speechSynthesis.cancel();
  };

  useEffect(() => {
    activeTripRef.current = activeTrip;
  }, [activeTrip]);

  useEffect(() => {
    let interval, watchId;
    if (isTrackingTrip) {
      interval = setInterval(() => { setElapsed(prev => prev + 1); }, 1000);
      if (navigator.geolocation && typeof navigator.geolocation.watchPosition === 'function') {
        watchId = navigator.geolocation.watchPosition(
          (position) => {
            if (position.coords.accuracy && position.coords.accuracy > 30) return;
            const { latitude, longitude } = position.coords;
            const now = Date.now();
            const timeDiffInSeconds = (now - lastUpdateRef.current) / 1000;
            if (timeDiffInSeconds < 2) return;

            const previousTrip = activeTripRef.current;
            if (!previousTrip || previousTrip.isPaused) return;

            const navigationRoute = previousTrip.navigationRoute;
            let nextStepIndex = previousTrip.nextStepIndex || 0;
            const nextStep = navigationRoute?.steps[nextStepIndex];
            if (nextStep) {
              const distanceToStep = calcHaversine(latitude, longitude, nextStep.location[0], nextStep.location[1]) * 1000;
              if (distanceToStep <= 45) {
                if (previousTrip.voiceEnabled) speakPortuguese(nextStep.instruction);
                nextStepIndex += 1;
                lastAnnouncedStepRef.current = -1;
              } else if (previousTrip.voiceEnabled && distanceToStep <= 500 && lastAnnouncedStepRef.current !== nextStepIndex) {
                const distanceText = distanceToStep >= 100 ? `${Math.round(distanceToStep / 50) * 50} metros` : 'menos de 100 metros';
                speakPortuguese(`Em ${distanceText}, ${nextStep.instruction}`);
                lastAnnouncedStepRef.current = nextStepIndex;
              }
            }

            let newKm = 0;
            let calculatedSpeed = 0;
            if (previousTrip.lastLat != null && previousTrip.lastLon != null) {
              newKm = calcHaversine(previousTrip.lastLat, previousTrip.lastLon, latitude, longitude);
              const timeDiffInHours = (now - lastUpdateRef.current) / 3600000;
              if (timeDiffInHours > 0) calculatedSpeed = newKm / timeDiffInHours;
            }

            const traveled = newKm > 0.005;
            const updatedKm = traveled ? previousTrip.accumulatedKm + newKm : previousTrip.accumulatedKm;
            const oldSpeed = previousTrip.speed || 0;
            const smoothedSpeed = oldSpeed === 0 ? calculatedSpeed : (oldSpeed * 0.6) + (calculatedSpeed * 0.4);
            const finalSpeed = traveled ? (smoothedSpeed > 160 ? oldSpeed : smoothedSpeed) : (oldSpeed < 2 ? 0 : oldSpeed * 0.4);
            const updatedTrip = {
              ...previousTrip,
              lastLat: traveled ? latitude : previousTrip.lastLat,
              lastLon: traveled ? longitude : previousTrip.lastLon,
              currentLat: latitude,
              currentLon: longitude,
              accumulatedKm: updatedKm,
              speed: finalSpeed,
              nextStepIndex,
            };

            activeTripRef.current = updatedTrip;
            setActiveTrip(updatedTrip);
            setCurrentSpeed(finalSpeed);
            if (traveled) setGpsKm(updatedKm);
            if (traveled) lastUpdateRef.current = now;
          },
          (error) => setGpsError(error.code === 1 ? 'Permita o acesso à localização para acompanhar a rota.' : 'Não foi possível obter o GPS. Verifique a conexão e o sinal.'),
          { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
        );
      }
    }
    return () => {
      clearInterval(interval);
      if (watchId !== undefined && navigator.geolocation && typeof navigator.geolocation.clearWatch === 'function') {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [isTrackingTrip, setActiveTrip]);

  const handleStartTrip = (navigationRoute = null) => {
    const newTrip = { startTime: Date.now(), elapsedTime: 0, startOdo: config.odometro, accumulatedKm: 0, lastLat: null, lastLon: null, isPaused: false, navigationRoute, nextStepIndex: 0, voiceEnabled };
    activeTripRef.current = newTrip;
    setActiveTrip(newTrip);
    setGpsKm(0); setElapsed(0); setCurrentSpeed(0); lastUpdateRef.current = Date.now();
    lastAnnouncedStepRef.current = -1;
    setGpsError(navigator.geolocation && typeof navigator.geolocation.watchPosition === 'function'
      ? ''
      : 'Este navegador não oferece acompanhamento por GPS.');
    if (voiceEnabled) speak(navigationRoute ? `Navegação iniciada. ${navigationRoute.steps[0]?.instruction || 'Siga pela rota.'}` : 'Viagem iniciada.');
  };

  const handleTogglePause = () => {
    const pausedTrip = { ...activeTripRef.current, isPaused: !activeTripRef.current.isPaused, elapsedTime: elapsed, lastLat: null, lastLon: null };
    activeTripRef.current = pausedTrip;
    setActiveTrip(pausedTrip);
  };

  const handleCalcularRota = async (event) => {
    event.preventDefault();
    if (!destinoQuery.trim()) return;
    setIsSearching(true); setSearchError(''); setSearchSuccess(''); setRoutePlan(null);
    try {
      if (!navigator.geolocation || typeof navigator.geolocation.getCurrentPosition !== 'function') {
        throw new Error('Este navegador não oferece acesso ao GPS.');
      }
      const pos = await new Promise((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }));
      const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(destinoQuery.trim())}`);
      if (!geoRes.ok) throw new Error('Não foi possível pesquisar o endereço.');
      const geoData = await geoRes.json();
      if (geoData.length === 0) throw new Error('Endereço não encontrado. Confira o endereço e tente novamente.');
      const origin = [pos.coords.latitude, pos.coords.longitude];
      const destination = [Number(geoData[0].lat), Number(geoData[0].lon)];
      const routeRes = await fetch(`https://router.project-osrm.org/route/v1/driving/${origin[1]},${origin[0]};${destination[1]},${destination[0]}?overview=full&geometries=geojson&steps=true`);
      if (!routeRes.ok) throw new Error('Não foi possível calcular a rota agora.');
      const routeData = await routeRes.json();
      if (routeData.code !== 'Ok' || !routeData.routes?.[0]) throw new Error('Não foi encontrada uma rota para esse endereço.');
      const route = routeData.routes[0];
      const steps = route.legs.flatMap(leg => leg.steps)
        .filter(step => step.maneuver.type !== 'depart')
        .map(step => ({
          instruction: formatManeuver(step),
          distance: step.distance,
          location: [step.maneuver.location[1], step.maneuver.location[0]],
        }));
      setRoutePlan({
        id: Date.now(),
        origin,
        destination,
        destinationName: geoData[0].display_name,
        coordinates: route.geometry.coordinates.map(([longitude, latitude]) => [latitude, longitude]),
        distance: route.distance,
        duration: route.duration,
        steps,
      });
      setSearchSuccess(`Rota traçada!`);
    } catch (err) {
      setSearchError(typeof err?.code === 'number' && [1, 2, 3].includes(err.code)
        ? 'Não foi possível acessar o GPS. Permita a localização e tente novamente.'
        : err.message || 'Erro ao buscar a rota.');
    }
    setIsSearching(false);
  };

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600); const m = Math.floor((seconds % 3600) / 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  const distanciaPlan = routePlan ? routePlan.distance / 1000 : 0;
  const calcLitros = config.kmL > 0 ? distanciaPlan / config.kmL : 0;
  const calcCusto = calcLitros * (parseFloat(precoPlan) || 0);

  if (activeTrip) {
    const currentPosition = activeTrip.currentLat != null && activeTrip.currentLon != null
      ? [activeTrip.currentLat, activeTrip.currentLon]
      : activeTrip.navigationRoute?.origin;
    const nextInstruction = activeTrip.navigationRoute?.steps[activeTrip.nextStepIndex || 0];

    return (
      <div className="flex flex-col items-center pt-4 space-y-4 animate-fade-in-up">
        {activeTrip.navigationRoute && (
          <>
            <RouteMap route={activeTrip.navigationRoute} currentPosition={currentPosition} follow height="h-56" />
            <div className="w-full rounded-2xl border border-cyan-700/40 bg-cyan-950/30 p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">Próxima instrução</p>
              <p className="mt-1 text-sm font-bold text-slate-100">{nextInstruction?.instruction || 'Você chegou ao destino.'}</p>
              <p className="mt-1 text-xs text-slate-400">{activeTrip.navigationRoute.destinationName}</p>
            </div>
            <button type="button" onClick={handleToggleVoice} className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 py-3 text-sm font-bold text-slate-200">
              {voiceEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
              {voiceEnabled ? 'Desativar orientação por voz' : 'Ativar orientação por voz'}
            </button>
          </>
        )}
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
        {gpsError && <p role="status" className="w-full text-center text-xs text-amber-400">{gpsError}</p>}
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
        <h3 className="text-sm font-bold text-slate-300 mb-4">Planejar rota</h3>
        <form onSubmit={handleCalcularRota} className="space-y-4">
           <div className="flex space-x-2"><input type="text" value={destinoQuery} onChange={(e) => setDestinoQuery(e.target.value)} placeholder="Digite o endereço de destino" aria-label="Endereço de destino" required className="flex-1 bg-slate-900 p-3 rounded-xl text-white text-sm border border-slate-700" /><button type="submit" disabled={isSearching} aria-label="Buscar rota" className="bg-cyan-600 p-3 rounded-xl text-white disabled:opacity-60">{isSearching ? <Loader2 className="animate-spin"/> : <Search />}</button></div>
           
           <div className="grid grid-cols-2 gap-3">
              <input type="text" readOnly value={routePlan ? `${distanciaPlan.toFixed(1)} km` : ''} placeholder="Distância da rota" aria-label="Distância da rota" className="bg-slate-900/50 border border-slate-800 rounded-xl p-3 text-slate-400" />
              <input type="number" value={precoPlan} onChange={(e) => setPrecoPlan(e.target.value)} placeholder="Preço (R$)" className="bg-slate-900 border border-slate-700 rounded-xl p-3 text-white" />
           </div>

           {searchError && <p role="alert" className="text-xs text-red-400">{searchError}</p>}
           {searchSuccess && <p role="status" className="text-xs text-emerald-400">{searchSuccess}</p>}
           {routePlan && (
            <div className="space-y-3 mt-4">
                <RouteMap route={routePlan} />
                <div className="flex items-center justify-between gap-2 text-xs text-slate-400">
                  <span>{routePlan.destinationName}</span>
                  <span className="shrink-0">{Math.round(routePlan.duration / 60)} min</span>
                </div>
                <button
                  type="button"
                  onClick={handleToggleVoice}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 py-3 text-sm font-bold text-slate-200"
                >
                  {voiceEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                  {voiceEnabled ? 'Orientação por voz ativada' : 'Ativar orientação por voz'}
                </button>
                <button type="button" onClick={() => handleStartTrip(routePlan)} className="w-full rounded-xl bg-indigo-600 py-3 font-bold text-white">
                  Iniciar navegação
                </button>
                <div className="max-h-44 space-y-2 overflow-y-auto rounded-xl border border-slate-800 p-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Instruções da rota</p>
                  {routePlan.steps.map((step, index) => (
                    <p key={`${index}-${step.location.join(',')}`} className="border-t border-slate-800 pt-2 text-xs text-slate-300">
                      {step.instruction} {step.distance >= 1000 ? `(${(step.distance / 1000).toFixed(1)} km)` : `(${Math.round(step.distance)} m)`}
                    </p>
                  ))}
                </div>
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
        </form>
      </div>
      <p className="px-2 text-[10px] text-slate-500">Mapas © OpenStreetMap. Rotas para carro: confirme as condições e sinalização locais; mantenha o foco na direção.</p>
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

      <div className="mt-8 pb-4 flex flex-col items-center justify-center border-t border-slate-800/50 pt-6 opacity-70">
        <span className="text-[10px] text-slate-500 uppercase tracking-widest font-medium">Desenvolvido por</span>
        <span className="text-xs font-bold text-cyan-500 tracking-wider mt-1">Joseilton Constâncio V-3.0.0 </span>
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
    e.preventDefault(); 
    const l = parseFloat(formData.litros) || 0; 
    const o = parseFloat(formData.odometro) || config.odometro;
    
    // Atualiza o combustível atual
    isFullTank ? setCurrentFuel(config.tanqueTotal) : setCurrentFuel(prev => Math.min(config.tanqueTotal, prev + l));
    
    // Atualiza o odômetro apenas se for um registro novo (maior que o atual)
    if (o > config.odometro) setConfig(prev => ({ ...prev, odometro: o }));
    
    // Salva o registro no histórico
    setEntries(prev => [{ 
      id: Date.now(), 
      type: 'abastecimento', 
      date: new Date(formData.data + 'T12:00:00Z').toISOString(), 
      odometro: o, 
      litros: l, 
      valorTotal: parseFloat(formData.valorTotal)||0, 
      precoLitro: parseFloat(precoLitro), 
      isFullTank, 
      descricao: formData.descricao 
    }, ...prev]);
    
    onClose();
  };

  return (
    <ModalWrapper title="Novo Abastecimento" color="emerald" icon={<Fuel size={24}/>} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Data" type="date" value={formData.data} onChange={e => setFormData({...formData, data: e.target.value})} />
        
        <div className="flex bg-slate-900 border border-slate-700 rounded-xl p-1 mt-1">
          <button type="button" onClick={() => setIsFullTank(false)} className={`flex-1 py-2 text-xs font-bold rounded-lg ${!isFullTank ? 'bg-slate-700 text-white' : 'text-slate-400'}`}>Parcial</button>
          <button type="button" onClick={() => setIsFullTank(true)} className={`flex-1 py-2 text-xs font-bold rounded-lg ${isFullTank ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}>Completar Tanque</button>
        </div>
        
        <Input label="Odômetro (km)" type="number" value={formData.odometro} onChange={e => setFormData({...formData, odometro: e.target.value})} />
        
        <div className="grid grid-cols-2 gap-3">
          <Input label="Litros" type="number" step="0.01" value={formData.litros} onChange={e => setFormData({...formData, litros: e.target.value})} />
          <Input label="Valor Total (R$)" type="number" step="0.01" value={formData.valorTotal} onChange={e => setFormData({...formData, valorTotal: e.target.value})} />
        </div>
        
        <div>
          <label className="text-xs text-slate-400 ml-1">Descrição / Posto (Opcional)</label>
          <input type="text" value={formData.descricao} onChange={e => setFormData({...formData, descricao: e.target.value})} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:border-emerald-500 focus:outline-none" />
        </div>

        <button type="submit" className="w-full mt-6 bg-emerald-600 text-white font-bold py-3 rounded-xl">Salvar</button>
      </form>
    </ModalWrapper>
  );
}

function ModalDespesa({ onClose, config, setEntries }) {
  const [formData, setFormData] = useState({ data: new Date().toISOString().split('T')[0], titulo: '', valor: '', descricao: '' });
  const handleSubmit = (e) => { e.preventDefault(); setEntries(prev => [{ id: Date.now(), type: 'despesa', date: new Date(formData.data + 'T12:00:00Z').toISOString(), titulo: formData.titulo, valor: parseFloat(formData.valor)||0, odometro: config.odometro, descricao: formData.descricao }, ...prev]); onClose(); };
  return <ModalWrapper title="Nova Despesa" color="red" icon={<Wrench size={24}/>} onClose={onClose}>
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Data" type="date" value={formData.data} onChange={e => setFormData({...formData, data: e.target.value})} />
      <Input label="Título da Despesa" type="text" value={formData.titulo} onChange={e => setFormData({...formData, titulo: e.target.value})} />
      <Input label="Valor Total (R$)" type="number" step="0.01" value={formData.valor} onChange={e => setFormData({...formData, valor: e.target.value})} />
      
      {/* CAMPO DE DESCRIÇÃO ADICIONADO */}
      <div>
        <label className="text-xs text-slate-400 ml-1">Observação (Opcional)</label>
        <input type="text" value={formData.descricao} onChange={e => setFormData({...formData, descricao: e.target.value})} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:border-red-500 focus:outline-none" />
      </div>

      <button type="submit" className="w-full mt-6 bg-red-600 text-white font-bold py-3 rounded-xl">Salvar</button>
    </form>
  </ModalWrapper>
}

function ModalOdometro({ onClose, config, setConfig, currentFuel, setCurrentFuel, setEntries }) {
  const [data, setData] = useState(new Date().toISOString().split('T')[0]); 
  const [novoOdometro, setNovoOdometro] = useState('');
  const [descricao, setDescricao] = useState('');
  const [erro, setErro] = useState('');

  const handleSubmit = (e) => { 
    e.preventDefault(); 
    const val = parseFloat(novoOdometro); 
    
    if (isNaN(val)) { setErro('Digite um número válido.'); return; }
    
    // REMOVI A TRAVA: Agora você pode digitar odômetros antigos!
    // Ele só atualiza o odômetro "oficial" da moto se o número novo for MAIOR que o atual !!!
    if (val > config.odometro) {
      const diffKm = val - config.odometro; 
      const litrosGastos = config.kmL > 0 ? diffKm / config.kmL : 0; 
      setCurrentFuel(Math.max(0, currentFuel - litrosGastos)); 
      setConfig(prev => ({ ...prev, odometro: val })); 
    }
    
    setEntries(prev => [{ id: Date.now(), type: 'viagem', date: new Date(data + 'T12:00:00Z').toISOString(), titulo: 'Atualização de Rota', kmRodados: val > config.odometro ? val - config.odometro : 0, litrosGastos: 0, descricao }, ...prev]); 
    onClose(); 
  };
  
  return <ModalWrapper title="Atualizar Odômetro" color="purple" icon={<MapPin size={24}/>} onClose={onClose}>
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Data" type="date" value={data} onChange={e => setData(e.target.value)} />
      
      <div>
        <label className="text-xs text-slate-400 ml-1">Novo Odômetro (km)</label>
        <input type="number" required step="0.1" value={novoOdometro} onChange={e => {setNovoOdometro(e.target.value); setErro('');}} placeholder={`Atual: ${config.odometro}`} className={`w-full mt-1 bg-slate-900 border rounded-xl p-3 text-white font-mono focus:outline-none ${erro ? 'border-red-500 focus:border-red-500' : 'border-slate-700 focus:border-purple-500'}`} />
        {erro && <p className="text-[10px] text-red-400 mt-1 ml-1">{erro}</p>}
      </div>

      <div>
        <label className="text-xs text-slate-400 ml-1">Motivo / Descrição (Opcional)</label>
        <input type="text" value={descricao} onChange={e => setDescricao(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:border-purple-500 focus:outline-none" />
      </div>

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
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ ...entry });

  const handleDelete = () => { setEntries(prev => prev.filter(e => e.id !== entry.id)); onClose(); };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    setEntries(prev => prev.map(item => {
      if (item.id === entry.id) {
        const updated = { ...editData };
        if (updated.type === 'abastecimento') {
          updated.litros = parseFloat(updated.litros) || 0;
          updated.valorTotal = parseFloat(updated.valorTotal) || 0;
          updated.odometro = parseFloat(updated.odometro) || 0;
          updated.precoLitro = updated.litros > 0 ? parseFloat((updated.valorTotal / updated.litros).toFixed(2)) : 0;
        } else if (updated.type === 'despesa') {
          updated.valor = parseFloat(updated.valor) || 0;
        } else if (updated.type === 'viagem') {
          updated.kmRodados = parseFloat(updated.kmRodados) || 0;
          updated.litrosGastos = parseFloat(updated.litrosGastos) || 0;
        }
        return updated;
      }
      return item;
    }));
    onClose();
  };

  if (isEditing) {
    return (
      <ModalWrapper title="Editar Registro" color="slate" icon={<Info size={24}/>} onClose={onClose}>
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <Input label="Data" type="date" value={editData.date ? editData.date.split('T')[0] : ''} onChange={e => setEditData({...editData, date: new Date(e.target.value + 'T12:00:00Z').toISOString()})} />
          
          {entry.type === 'abastecimento' && (
            <>
              <Input label="Odômetro (km)" type="number" value={editData.odometro || ''} onChange={e => setEditData({...editData, odometro: e.target.value})} />
              <div className="grid grid-cols-2 gap-3">
                <Input label="Litros" type="number" step="0.01" value={editData.litros || ''} onChange={e => setEditData({...editData, litros: e.target.value})} />
                <Input label="Valor Total (R$)" type="number" step="0.01" value={editData.valorTotal || ''} onChange={e => setEditData({...editData, valorTotal: e.target.value})} />
              </div>
            </>
          )}

          {entry.type === 'despesa' && (
            <>
              <Input label="Título da Despesa" type="text" value={editData.titulo || ''} onChange={e => setEditData({...editData, titulo: e.target.value})} />
              <Input label="Valor Total (R$)" type="number" step="0.01" value={editData.valor || ''} onChange={e => setEditData({...editData, valor: e.target.value})} />
            </>
          )}

          {entry.type === 'viagem' && (
            <>
              <Input label="Título da Viagem" type="text" value={editData.titulo || ''} onChange={e => setEditData({...editData, titulo: e.target.value})} />
              <div className="grid grid-cols-2 gap-3">
                <Input label="Km Rodados" type="number" step="0.1" value={editData.kmRodados || ''} onChange={e => setEditData({...editData, kmRodados: e.target.value})} />
                <Input label="Litros Gastos" type="number" step="0.1" value={editData.litrosGastos || ''} onChange={e => setEditData({...editData, litrosGastos: e.target.value})} />
              </div>
            </>
          )}

          <div>
            <label className="text-xs text-slate-400 ml-1">Observação / Descrição</label>
            <input type="text" value={editData.descricao || ''} onChange={e => setEditData({...editData, descricao: e.target.value})} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:border-cyan-500 focus:outline-none" />
          </div>

          <div className="flex space-x-2 pt-4">
            <button type="button" onClick={() => setIsEditing(false)} className="flex-1 bg-slate-800 text-slate-300 font-bold py-3 rounded-xl">Cancelar</button>
            <button type="submit" className="flex-1 bg-cyan-600 text-white font-bold py-3 rounded-xl">Salvar Alterações</button>
          </div>
        </form>
      </ModalWrapper>
    );
  }

  return (
    <ModalWrapper title={entry.type === 'abastecimento' ? 'Abastecimento' : entry.titulo} color="slate" icon={<Info size={24}/>} onClose={onClose}>
      <div className="space-y-4">
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 text-sm space-y-2 text-slate-300">
          <p><span className="text-slate-200 font-medium">Data:</span> {new Date(entry.date).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</p>
          <p><span className="text-slate-200 font-medium">Tipo:</span> <span className="capitalize">{entry.type === 'despesa' ? 'Manutenção' : entry.type}</span></p>
          
          {entry.type === 'abastecimento' && (
            <>
              <p><span className="text-slate-200 font-medium">Odômetro:</span> {entry.odometro} km</p>
              <p><span className="text-slate-200 font-medium">Litros:</span> {entry.litros} L</p>
              <p><span className="text-slate-200 font-medium">Preço por Litro:</span> R$ {entry.precoLitro?.toFixed(2)}</p>
              <p><span className="text-slate-200 font-medium">Valor Total:</span> <span className="text-emerald-400 font-bold">R$ {entry.valorTotal?.toFixed(2)}</span></p>
            </>
          )}

          {entry.type === 'despesa' && (
            <>
              <p><span className="text-slate-200 font-medium">Valor Total:</span> <span className="text-red-400 font-bold">R$ {entry.valor?.toFixed(2)}</span></p>
            </>
          )}

          {entry.type === 'viagem' && (
            <>
              <p><span className="text-slate-200 font-medium">Km Rodados:</span> {entry.kmRodados?.toFixed(1)} km</p>
              <p><span className="text-slate-200 font-medium">Litros Gastos:</span> {entry.litrosGastos?.toFixed(1)} L</p>
              {entry.duracao && <p><span className="text-slate-200 font-medium">Duração:</span> {entry.duracao}</p>}
            </>
          )}

          {/* EXIBIÇÃO DA DESCRIÇÃO COM DESTAQUE */}
          {entry.descricao && (
            <div className="mt-3 pt-3 border-t border-slate-700/50">
              <span className="text-slate-400 text-[10px] uppercase tracking-wider block mb-1">Observação:</span>
              <span className="text-slate-200 italic">"{entry.descricao}"</span>
            </div>
          )}
        </div>

        <div className="flex space-x-3 pt-2">
          <button onClick={() => setIsEditing(true)} className="flex-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-400 font-bold py-3.5 rounded-xl flex justify-center items-center">
            Editar
          </button>
          <button onClick={handleDelete} className="flex-1 bg-red-900/30 hover:bg-red-900/50 text-red-400 border border-red-800/50 font-bold py-3.5 rounded-xl flex justify-center items-center">
            Excluir
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
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
