import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  LayoutDashboard, List, BarChart2, Settings, Plus, X, Fuel, Wrench, 
  Gauge, Droplets, Calendar, Banknote, MapPin, CheckCircle2, Download, 
  Upload, Database, AlertCircle, Trash2, Wallet, Edit2, Info,
  Map, Play, Square, Route, Timer, Filter, Navigation, Search, Loader2
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('PAINEL');
  const [fabMenuOpen, setFabMenuOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const [selectedEntry, setSelectedEntry] = useState(null);

  const [config, setConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('motolog_config');
      return saved ? JSON.parse(saved) : { tanqueTotal: 15, kmL: 25, odometro: 12532 };
    } catch (e) { return { tanqueTotal: 15, kmL: 25, odometro: 12532 }; }
  });

  const [currentFuel, setCurrentFuel] = useState(() => {
    try {
      const saved = localStorage.getItem('motolog_fuel');
      return saved ? JSON.parse(saved) : 11.1;
    } catch (e) { return 11.1; }
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
          {activeTab === 'VIAGEM' && <TabViagem config={config} entries={entries} activeTrip={activeTrip} setActiveTrip={setActiveTrip} onStopTrip={() => setActiveModal('encerrar_viagem')} />}
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
  const percent = Math.max(0, Math.min(100, (currentFuel / tanqueTotal) * 100));
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
          <span className="text-base font-bold text-slate-200">{((currentFuel/tanqueTotal)*100).toFixed(0)}% Cheio</span>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-3 flex flex-col items-center justify-center backdrop-blur-sm">
          <Gauge className="text-purple-400 mb-1" size={20} />
          <span className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">Autonomia Est.</span>
          <span className="text-base font-bold text-slate-200">~{(currentFuel * config.kmL).toFixed(0)} km</span>
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

function calcHaversine(lat1, lon1, lat2, lon2) {
  const R = 6371; 
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

