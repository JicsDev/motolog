import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  LayoutDashboard, List, BarChart2, Settings, Plus, X, Fuel, Wrench, 
  Gauge, Droplets, Calendar, Banknote, MapPin, CheckCircle2, Download, 
  Upload, Database, AlertCircle, Trash2, Wallet, Edit2, Info
} from 'lucide-react';

export default function App() {
  // --- Estados Principais ---
  const [activeTab, setActiveTab] = useState('PAINEL');
  const [fabMenuOpen, setFabMenuOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const [selectedEntry, setSelectedEntry] = useState(null);

  // --- Estado de Dados (Com salvamento no LocalStorage Forçado) ---
  const [config, setConfig] = useState(() => {
    try {
      const savedConfig = localStorage.getItem('motolog_config');
      return savedConfig ? JSON.parse(savedConfig) : { tanqueTotal: 15, kmL: 25, odometro: 12532 };
    } catch (e) {
      return { tanqueTotal: 15, kmL: 25, odometro: 12532 };
    }
  });

  const [currentFuel, setCurrentFuel] = useState(() => {
    try {
      const savedFuel = localStorage.getItem('motolog_fuel');
      return savedFuel ? JSON.parse(savedFuel) : 11.1;
    } catch (e) {
      return 11.1;
    }
  }); 

  const [entries, setEntries] = useState(() => {
    try {
      const savedEntries = localStorage.getItem('motolog_entries');
      if (savedEntries) return JSON.parse(savedEntries);
    } catch (e) { console.error("Erro ao ler dados:", e); }
    
    // Fallback padrão se for o primeiro acesso
    return [
      {
        id: 1, type: 'abastecimento', date: new Date(Date.now() - 86400000 * 2).toISOString(),
        odometro: 12400, litros: 10, valorTotal: 58.90, precoLitro: 5.89, isFullTank: false,
        descricao: 'Posto Ipiranga perto de casa.'
      },
      {
        id: 2, type: 'despesa', date: new Date(Date.now() - 86400000 * 5).toISOString(),
        titulo: 'Troca de Óleo', valor: 85.00, descricao: 'Óleo Motul 5000 10W40. Próxima troca em 15.000km.'
      }
    ];
  });

  // Efeitos que gravam no celular/navegador em tempo real
  useEffect(() => {
    localStorage.setItem('motolog_config', JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    localStorage.setItem('motolog_fuel', JSON.stringify(currentFuel));
  }, [currentFuel]);

  useEffect(() => {
    localStorage.setItem('motolog_entries', JSON.stringify(entries));
  }, [entries]);

  useEffect(() => {
    setFabMenuOpen(false);
  }, [activeTab]);

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
  };

  return (

    <div className="h-[100dvh] w-full bg-[#060b14] flex justify-center font-sans text-slate-200 overflow-hidden">
      
      {/* Container Mobile */}
      <div className="h-full w-full max-w-md bg-gradient-to-b from-[#0a1325] to-[#040811] relative flex flex-col shadow-2xl md:border-x md:border-slate-800 overflow-hidden">
        
        <header className="pt-8 pb-4 px-6 bg-transparent flex justify-between items-center z-10 flex-shrink-0">
          <div>
            <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400 tracking-wider">
              MOTO<span className="text-slate-100">LOG</span>
            </h1>
          </div>
          <div className="flex items-center space-x-2 text-cyan-400">
            <Gauge size={20} />
            <span className="text-sm font-mono">{config.odometro} km</span>
          </div>
        </header>

        {/* Área Central que Rola */}
        <main className="flex-1 overflow-y-auto pb-28 px-4 custom-scrollbar z-10 relative">
          {activeTab === 'PAINEL' && <TabPainel currentFuel={currentFuel} tanqueTotal={config.tanqueTotal} config={config} />}
          {activeTab === 'LOG' && <TabLog entries={entries} onSelectEntry={setSelectedEntry} />}
          {activeTab === 'RELATÓRIOS' && <TabRelatorios entries={entries} config={config} />}
          {activeTab === 'CONFIGURAÇÕES' && <TabConfiguracoes config={config} currentFuel={currentFuel} entries={entries} onCalculate={handleCalculateConfig} onImportData={handleImportData} onResetData={handleResetData} />}
        </main>

        {/* Botão FAB (+) fixo */}
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

        {/* Menu Inferior Fixo */}
        <nav className="absolute bottom-0 w-full h-16 bg-[#0B1221]/95 backdrop-blur-lg border-t border-cyan-900/50 grid grid-cols-5 items-center px-1 z-50 shadow-[0_-5px_20px_rgba(0,0,0,0.5)]">
          <NavItem icon={<LayoutDashboard />} label="PAINEL" isActive={activeTab === 'PAINEL'} onClick={() => setActiveTab('PAINEL')} />
          <NavItem icon={<List />} label="LOG" isActive={activeTab === 'LOG'} onClick={() => setActiveTab('LOG')} />
          <NavItem icon={<BarChart2 />} label="RELATÓRIOS" isActive={activeTab === 'RELATÓRIOS'} onClick={() => setActiveTab('RELATÓRIOS')} />
          <NavItem icon={<Settings />} label="CONFIGS" isActive={activeTab === 'CONFIGURAÇÕES'} onClick={() => setActiveTab('CONFIGURAÇÕES')} />
          <div className="w-full h-full"></div>
        </nav>

        {/* Modais Principais */}
        {activeModal === 'abastecimento' && <ModalAbastecimento onClose={() => setActiveModal(null)} config={config} setConfig={setConfig} currentFuel={currentFuel} setCurrentFuel={setCurrentFuel} setEntries={setEntries} />}
        {activeModal === 'despesa' && <ModalDespesa onClose={() => setActiveModal(null)} setEntries={setEntries} />}
        {activeModal === 'odometro' && <ModalOdometro onClose={() => setActiveModal(null)} config={config} setConfig={setConfig} currentFuel={currentFuel} setCurrentFuel={setCurrentFuel} setEntries={setEntries} />}

        {/* NOVO: Modal de Detalhes do Registro (Log) */}
        {selectedEntry && (
          <ModalDetalhes 
            entry={selectedEntry} 
            onClose={() => setSelectedEntry(null)} 
            setEntries={setEntries} 
          />
        )}

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
          input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(1); opacity: 0.5; cursor: pointer; }
        `}
      </style>
    </div>
  );
}

function TabPainel({ currentFuel, tanqueTotal, config }) {
  const percent = Math.max(0, Math.min(100, (currentFuel / tanqueTotal) * 100));
  const rotation = -90 + (percent * 1.8);

  return (
    <div className="flex flex-col items-center justify-center h-full pt-10 space-y-12 animate-fade-in-up">
      <div className="relative w-full max-w-[300px] aspect-[2/1] mx-auto mt-8">
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
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center w-full pointer-events-none">
          <div className="flex items-center space-x-2 text-cyan-400 mb-1" style={{ textShadow: '0 0 10px rgba(34,211,238,0.5)' }}>
            <Fuel size={16} />
            <span className="text-3xl font-bold font-mono tracking-wider">{currentFuel.toFixed(1)}L</span>
          </div>
          <span className="text-[10px] text-cyan-700 font-bold tracking-[0.2em] uppercase">Fuel Level</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 w-full mt-16 px-2">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center backdrop-blur-sm">
          <Droplets className="text-emerald-400 mb-2" size={24} />
          <span className="text-xs text-slate-400 uppercase tracking-wider mb-1">Tanque Info</span>
          <span className="text-lg font-bold text-slate-200">{((currentFuel/tanqueTotal)*100).toFixed(0)}% Cheio</span>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center backdrop-blur-sm">
          <Gauge className="text-purple-400 mb-2" size={24} />
          <span className="text-xs text-slate-400 uppercase tracking-wider mb-1">Autonomia Est.</span>
          <span className="text-lg font-bold text-slate-200">~{(currentFuel * config.kmL).toFixed(0)} km</span>
        </div>
      </div>
    </div>
  );
}

function TabLog({ entries, onSelectEntry }) {
  const sortedEntries = [...entries].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="flex flex-col space-y-4 pt-4 animate-fade-in-up">
      <h2 className="text-lg font-bold text-slate-300 px-2 flex items-center">
        <List className="mr-2 text-cyan-500" size={20} /> Histórico de Registros
      </h2>
      
      {sortedEntries.length === 0 ? (
        <p className="text-center text-slate-500 mt-10">Nenhum registro encontrado.</p>
      ) : (
        sortedEntries.map(entry => (
          <div 
            key={entry.id} 
            onClick={() => onSelectEntry(entry)} // Abre o Modal
            className="bg-[#0f172a]/80 backdrop-blur-md border border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-lg cursor-pointer hover:bg-slate-800/80 hover:border-cyan-900/50 transition-colors"
          >
            <div className="flex items-center space-x-4">
              {entry.type === 'abastecimento' ? (
                <div className="bg-emerald-500/20 p-3 rounded-full border border-emerald-500/30 flex-shrink-0">
                  <Fuel className="text-emerald-400" size={20} />
                </div>
              ) : entry.type === 'despesa' ? (
                <div className="bg-red-500/20 p-3 rounded-full border border-red-500/30 flex-shrink-0">
                  <Wrench className="text-red-400" size={20} />
                </div>
              ) : (
                <div className="bg-purple-500/20 p-3 rounded-full border border-purple-500/30 flex-shrink-0">
                  <MapPin className="text-purple-400" size={20} />
                </div>
              )}
              <div className="flex flex-col overflow-hidden">
                <span className="font-bold text-slate-100 flex items-center flex-wrap gap-1">
                  <span className="truncate">{entry.type === 'abastecimento' ? 'Abastecimento' : entry.titulo}</span>
                  {entry.isFullTank && <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 whitespace-nowrap">Tanque Cheio</span>}
                </span>
                <span className="text-xs text-slate-400 flex items-center mt-1">
                  <Calendar size={12} className="mr-1 flex-shrink-0" />
                  {new Date(entry.date).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end flex-shrink-0">
              {entry.type === 'abastecimento' || entry.type === 'despesa' ? (
                <>
                  <span className={`font-mono font-bold text-lg ${entry.type === 'abastecimento' ? 'text-emerald-400' : 'text-red-400'}`}>
                    - R$ {entry.valorTotal ? entry.valorTotal.toFixed(2) : (entry.valor ? entry.valor.toFixed(2) : '0.00')}
                  </span>
                  {entry.type === 'abastecimento' && <span className="text-[10px] text-slate-500 font-mono">R${entry.precoLitro}/L</span>}
                </>
              ) : (
                <>
                  <span className="font-mono font-bold text-lg text-purple-400">-{entry.litrosGastos.toFixed(1)}L</span>
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

function TabRelatorios({ entries, config }) {
  const [monthFilter, setMonthFilter] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const { consumoMedio, kmMes, gastoCombustivel, gastoManutencao, gastoGeral } = useMemo(() => {
    const [yearStr, monthStr] = monthFilter.split('-');
    const filterYear = parseInt(yearStr, 10);
    const filterMonth = parseInt(monthStr, 10) - 1; 

    const entriesMes = entries.filter(e => {
      const d = new Date(e.date);
      return d.getUTCMonth() === filterMonth && d.getUTCFullYear() === filterYear;
    });

    const abastecimentosMes = entriesMes.filter(e => e.type === 'abastecimento');
    const despesasMes = entriesMes.filter(e => e.type === 'despesa');

    const gastoComb = abastecimentosMes.reduce((acc, curr) => acc + (curr.valorTotal || 0), 0);
    const gastoManut = despesasMes.reduce((acc, curr) => acc + (curr.valor || 0), 0);
    const litrosTotais = abastecimentosMes.reduce((acc, curr) => acc + (curr.litros || 0), 0);
    
    let minOdo = config.odometro;
    let maxOdo = config.odometro;
    if (abastecimentosMes.length > 0) {
      const odos = abastecimentosMes.map(e => e.odometro);
      maxOdo = Math.max(...odos);
      minOdo = Math.min(...odos);
    }
    const rodados = maxOdo - minOdo;
    
    const media = litrosTotais > 0 && rodados > 0 ? (rodados / litrosTotais) : config.kmL;

    return { 
      consumoMedio: media.toFixed(1), 
      kmMes: rodados, 
      gastoCombustivel: gastoComb.toFixed(2),
      gastoManutencao: gastoManut.toFixed(2),
      gastoGeral: (gastoComb + gastoManut).toFixed(2)
    };
  }, [entries, config, monthFilter]);

  return (
    <div className="flex flex-col space-y-5 pt-4 animate-fade-in-up">
      <div className="flex items-center justify-between px-2">
        <h2 className="text-lg font-bold text-slate-300 flex items-center"><BarChart2 className="mr-2 text-cyan-500" size={20} /> Relatórios</h2>
        <input 
          type="month" 
          value={monthFilter}
          onChange={(e) => setMonthFilter(e.target.value)}
          className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-2 py-1 focus:outline-none focus:border-cyan-500"
        />
      </div>

      <div className="bg-gradient-to-br from-cyan-900/40 to-blue-900/20 border border-cyan-800/50 rounded-3xl p-6 relative overflow-hidden">
        <div className="absolute -right-4 -top-4 opacity-10"><Gauge size={100} /></div>
        <div className="relative z-10 flex flex-col">
          <span className="text-sm font-medium text-cyan-400/80 mb-1">Consumo Médio Atual</span>
          <div className="flex items-baseline space-x-2">
            <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-emerald-300 font-mono">{consumoMedio}</span>
            <span className="text-lg text-cyan-500/80 font-bold">Km/L</span>
          </div>
          <div className="mt-4 flex items-center text-xs text-slate-400">
            <div className="w-full bg-slate-800 h-1.5 rounded-full mr-3 overflow-hidden">
              <div className="bg-gradient-to-r from-cyan-500 to-emerald-500 h-full rounded-full" style={{ width: '75%' }}></div>
            </div>
            <span>Meta: {config.kmL}</span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#0f172a]/80 backdrop-blur-md border border-slate-800 rounded-2xl p-4 flex flex-col justify-between h-28">
          <div className="flex justify-between items-start mb-2"><span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Km Rodados</span><Gauge size={16} className="text-purple-400" /></div>
          <span className="text-xl font-bold text-slate-100 font-mono">{kmMes} <span className="text-xs text-slate-500">km</span></span>
        </div>
        <div className="bg-[#0f172a]/80 backdrop-blur-md border border-slate-800 rounded-2xl p-4 flex flex-col justify-between h-28">
          <div className="flex justify-between items-start mb-2"><span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Combustível</span><Fuel size={16} className="text-emerald-400" /></div>
          <span className="text-lg font-bold text-emerald-400 font-mono">R$ {gastoCombustivel}</span>
        </div>
        <div className="bg-[#0f172a]/80 backdrop-blur-md border border-slate-800 rounded-2xl p-4 flex flex-col justify-between h-28">
          <div className="flex justify-between items-start mb-2"><span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Manutenção</span><Wrench size={16} className="text-red-400" /></div>
          <span className="text-lg font-bold text-red-400 font-mono">R$ {gastoManutencao}</span>
        </div>
        <div className="bg-gradient-to-br from-slate-800 to-[#0f172a] border border-slate-700 rounded-2xl p-4 flex flex-col justify-between h-28 shadow-lg">
          <div className="flex justify-between items-start mb-2"><span className="text-[10px] font-bold text-slate-300 uppercase tracking-wide">Custo Total</span><Wallet size={16} className="text-cyan-400" /></div>
          <span className="text-lg font-bold text-slate-100 font-mono">R$ {gastoGeral}</span>
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

  const handleSubmit = (e) => {
    e.preventDefault(); onCalculate(localConfig);
    setSaved(true); setTimeout(() => setSaved(false), 3000);
  };

  const handleExportBackup = async () => {
    try {
      const dataToExport = { config, currentFuel, entries, exportDate: new Date().toISOString() };
      const jsonString = JSON.stringify(dataToExport, null, 2);
      const fileName = `motolog_backup_${new Date().toISOString().split('T')[0]}.json`;
      const blob = new Blob([jsonString], { type: 'application/json' });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; 
      a.download = fileName;
      document.body.appendChild(a); 
      a.click(); 
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setBackupMsg({ text: 'Verifique a pasta de Downloads!', type: 'success' });
    } catch (err) { 
      setBackupMsg({ text: 'Erro ao gerar o arquivo de backup.', type: 'error' }); 
    }
    setTimeout(() => setBackupMsg({ text: '', type: '' }), 4000);
  };

  const handleImportBackup = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target.result);
        if (importedData.config && importedData.entries !== undefined) {
          onImportData(importedData); setBackupMsg({ text: 'Dados restaurados com sucesso!', type: 'success' });
        } else { setBackupMsg({ text: 'Arquivo inválido ou corrompido.', type: 'error' }); }
      } catch (err) { setBackupMsg({ text: 'Erro ao ler arquivo. Formato incorreto.', type: 'error' }); }
      if (fileInputRef.current) fileInputRef.current.value = '';
      setTimeout(() => setBackupMsg({ text: '', type: '' }), 4000);
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
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-400 uppercase tracking-wider ml-1">Tanque Total (L)</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500"><Droplets size={16} /></div>
            <input type="number" name="tanqueTotal" value={localConfig.tanqueTotal} onChange={handleChange} step="0.1" className="w-full bg-[#060b14] border border-slate-700 text-slate-200 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono" />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-400 uppercase tracking-wider ml-1">Meta / Média (Km/L)</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500"><BarChart2 size={16} /></div>
            <input type="number" name="kmL" value={localConfig.kmL} onChange={handleChange} step="0.1" className="w-full bg-[#060b14] border border-slate-700 text-slate-200 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono" />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-400 uppercase tracking-wider ml-1">Odômetro Atual (km)</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500"><Gauge size={16} /></div>
            <input type="number" name="odometro" value={localConfig.odometro} onChange={handleChange} className="w-full bg-[#060b14] border border-slate-700 text-slate-200 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono" />
          </div>
        </div>
        <button type="submit" className={`w-full mt-4 font-bold py-3.5 rounded-xl transition-all active:scale-95 flex justify-center items-center ${saved ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'bg-teal-500 hover:bg-teal-400 text-slate-900 shadow-[0_0_15px_rgba(20,184,166,0.4)]'}`}>
          {saved ? <><CheckCircle2 className="mr-2" size={20} /> Salvo!</> : 'Salvar Manualmente'}
        </button>
      </form>

      <div className="bg-[#0f172a]/80 backdrop-blur-md border border-slate-800 rounded-2xl p-5 space-y-4">
        <h3 className="text-sm font-bold text-slate-300 flex items-center border-b border-slate-800 pb-2"><Database className="mr-2 text-cyan-500" size={18} /> Gerenciamento de Dados</h3>
        <p className="text-xs text-slate-400 leading-relaxed">Exporte seus registros, importe um backup, ou zere o aplicativo para começar de novo.</p>
        
        {backupMsg.text && (
          <div className={`flex items-center p-3 rounded-lg text-xs font-medium ${backupMsg.type === 'success' ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-800/50' : 'bg-red-900/30 text-red-400 border border-red-800/50'}`}>
            {backupMsg.type === 'success' ? <CheckCircle2 size={16} className="mr-2 flex-shrink-0" /> : <AlertCircle size={16} className="mr-2 flex-shrink-0" />}
            {backupMsg.text}
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button onClick={handleExportBackup} className="flex flex-col items-center justify-center p-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-xl transition-colors text-cyan-400 hover:text-cyan-300">
            <Download size={20} className="mb-1" /><span className="text-xs font-bold">Exportar</span>
          </button>
          <label className="flex flex-col items-center justify-center p-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-xl transition-colors text-purple-400 hover:text-purple-300 cursor-pointer">
            <Upload size={20} className="mb-1" /><span className="text-xs font-bold">Importar</span>
            <input type="file" accept=".json" onChange={handleImportBackup} ref={fileInputRef} className="hidden" />
          </label>
        </div>
        
        <button 
          onClick={handleWipeData} 
          className={`w-full mt-2 flex items-center justify-center p-3 rounded-xl transition-colors border ${confirmReset ? 'bg-red-600 hover:bg-red-500 text-white border-red-500 shadow-[0_0_15px_rgba(220,38,38,0.4)]' : 'bg-slate-900/50 hover:bg-slate-800 border-red-900/30 text-red-400'}`}
        >
          <Trash2 size={18} className="mr-2" />
          <span className="text-sm font-bold">{confirmReset ? 'Clique novamente para Confirmar!' : 'Zerar Todos os Dados'}</span>
        </button>
      </div>
    </div>
  );
}

function NavItem({ icon, label, isActive, onClick }) {
  return (
    <button onClick={onClick} className={`flex flex-col items-center justify-center w-full h-full transition-colors ${isActive ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}>
      <div className={`mb-1 transition-transform duration-300 ${isActive ? '-translate-y-1' : ''}`}>{icon}</div>
      <span className="text-[9px] font-bold tracking-wider">{label}</span>
      {isActive && <div className="absolute bottom-0 w-8 h-1 bg-cyan-400 rounded-t-md shadow-[0_0_10px_#22d3ee]"></div>}
    </button>
  );
}

// --- Modais Secundários (Ação) ---
function ModalAbastecimento({ onClose, config, setConfig, currentFuel, setCurrentFuel, setEntries }) {
  const today = new Date().toISOString().split('T')[0];
  const [formData, setFormData] = useState({ data: today, odometro: config.odometro, litros: '', valorTotal: '', descricao: '' });
  const [isFullTank, setIsFullTank] = useState(false);

  const precoLitro = useMemo(() => {
    const l = parseFloat(formData.litros);
    const v = parseFloat(formData.valorTotal);
    return (l > 0 && v > 0) ? (v / l).toFixed(2) : '0.00';
  }, [formData.litros, formData.valorTotal]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    const litrosForm = parseFloat(formData.litros) || 0;
    const odometroForm = parseFloat(formData.odometro) || config.odometro;
    const dataRegistro = new Date(formData.data + 'T12:00:00Z').toISOString();
    
    if (isFullTank) {
      setCurrentFuel(config.tanqueTotal);
    } else {
      setCurrentFuel(prev => Math.min(config.tanqueTotal, prev + litrosForm));
    }
    
    if (odometroForm > config.odometro) setConfig(prev => ({ ...prev, odometro: odometroForm }));

    setEntries(prev => [{
      id: Date.now(), 
      type: 'abastecimento', 
      date: dataRegistro,
      odometro: odometroForm, 
      litros: litrosForm, 
      valorTotal: parseFloat(formData.valorTotal) || 0, 
      precoLitro: parseFloat(precoLitro),
      isFullTank: isFullTank,
      descricao: formData.descricao
    }, ...prev]);

    onClose();
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-sm bg-[#111827] border border-emerald-900/50 rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-fade-in-up">
        <div className="h-2 bg-gradient-to-r from-emerald-600 to-cyan-500 w-full flex-shrink-0"></div>
        <div className="p-5 overflow-y-auto custom-scrollbar">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-xl font-bold text-slate-100 flex items-center"><Fuel className="text-emerald-500 mr-2" size={24} /> Novo Abastecimento</h3>
            <button onClick={onClose} className="p-1 text-slate-400 hover:text-white bg-slate-800 rounded-full"><X size={20} /></button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 ml-1">Data</label>
              <input type="date" required name="data" value={formData.data} onChange={handleChange} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl p-3 text-white font-mono focus:border-emerald-500 focus:outline-none" />
            </div>
            <div>
               <label className="text-xs text-slate-400 ml-1">Tipo</label>
               <div className="flex bg-slate-900 border border-slate-700 rounded-xl p-1 mt-1">
                 <button type="button" onClick={() => setIsFullTank(false)} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${!isFullTank ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-300'}`}>Parcial</button>
                 <button type="button" onClick={() => setIsFullTank(true)} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${isFullTank ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-300'}`}>Completar Tanque</button>
               </div>
            </div>
            <div>
              <label className="text-xs text-slate-400 ml-1">Odômetro (km)</label>
              <input type="number" required name="odometro" value={formData.odometro} onChange={handleChange} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl p-3 text-white font-mono focus:border-emerald-500 focus:outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 ml-1">Litros</label>
                <input type="number" step="0.01" required name="litros" value={formData.litros} onChange={handleChange} placeholder="0.00" className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl p-3 text-white font-mono focus:border-emerald-500 focus:outline-none" />
              </div>
              <div>
                <label className="text-xs text-slate-400 ml-1">Valor Total (R$)</label>
                <input type="number" step="0.01" required name="valorTotal" value={formData.valorTotal} onChange={handleChange} placeholder="0.00" className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl p-3 text-white font-mono focus:border-emerald-500 focus:outline-none" />
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-400 ml-1">Descrição / Local</label>
              <textarea name="descricao" value={formData.descricao} onChange={handleChange} rows="2" className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl p-3 text-white text-sm focus:border-emerald-500 focus:outline-none resize-none"></textarea>
            </div>
            <div className="bg-slate-800/50 border border-emerald-900/30 rounded-xl p-3 flex justify-between items-center mt-2">
              <span className="text-sm text-slate-400">Valor por Litro:</span>
              <span className="text-lg font-bold text-emerald-400 font-mono">R$ {precoLitro}</span>
            </div>
            <button type="submit" className="w-full mt-6 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-colors">Salvar Abastecimento</button>
          </form>
        </div>
      </div>
    </div>
  );
}

function ModalDespesa({ onClose, setEntries }) {
  const today = new Date().toISOString().split('T')[0];
  const [formData, setFormData] = useState({ data: today, titulo: '', valor: '', descricao: '' });
  
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  
  const handleSubmit = (e) => {
    e.preventDefault();
    const dataRegistro = new Date(formData.data + 'T12:00:00Z').toISOString();
    setEntries(prev => [{ id: Date.now(), type: 'despesa', date: dataRegistro, titulo: formData.titulo, valor: parseFloat(formData.valor) || 0, descricao: formData.descricao }, ...prev]);
    onClose();
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-sm bg-[#111827] border border-red-900/50 rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-fade-in-up">
        <div className="h-2 bg-gradient-to-r from-red-600 to-orange-500 w-full flex-shrink-0"></div>
        <div className="p-5 overflow-y-auto custom-scrollbar">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-xl font-bold text-slate-100 flex items-center"><Wrench className="text-red-500 mr-2" size={24} /> Nova Despesa</h3>
            <button onClick={onClose} className="p-1 text-slate-400 hover:text-white bg-slate-800 rounded-full"><X size={20} /></button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 ml-1">Data</label>
              <input type="date" required name="data" value={formData.data} onChange={handleChange} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl p-3 text-white font-mono focus:border-red-500 focus:outline-none" />
            </div>
            <div><label className="text-xs text-slate-400 ml-1">Título da Despesa</label><input type="text" required name="titulo" value={formData.titulo} onChange={handleChange} placeholder="Ex: Troca de Óleo" className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:border-red-500 focus:outline-none" /></div>
            <div><label className="text-xs text-slate-400 ml-1">Valor Total (R$)</label><input type="number" step="0.01" required name="valor" value={formData.valor} onChange={handleChange} placeholder="0.00" className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl p-3 text-white font-mono focus:border-red-500 focus:outline-none" /></div>
            <div><label className="text-xs text-slate-400 ml-1">Descrição</label><textarea name="descricao" value={formData.descricao} onChange={handleChange} rows="3" className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl p-3 text-white text-sm focus:border-red-500 focus:outline-none resize-none"></textarea></div>
            <button type="submit" className="w-full mt-6 bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-xl shadow-[0_0_15px_rgba(220,38,38,0.3)] transition-colors">Salvar Despesa</button>
          </form>
        </div>
      </div>
    </div>
  );
}

function ModalOdometro({ onClose, config, setConfig, currentFuel, setCurrentFuel, setEntries }) {
  const today = new Date().toISOString().split('T')[0];
  const [data, setData] = useState(today);
  const [novoOdometro, setNovoOdometro] = useState('');
  const [descricao, setDescricao] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const val = parseFloat(novoOdometro);
    if (isNaN(val) || val <= config.odometro) { setErrorMsg('Deve ser maior que o atual.'); return; }
    
    const diffKm = val - config.odometro;
    const litrosGastos = diffKm / (config.kmL || 1);
    const novoCombustivel = Math.max(0, currentFuel - litrosGastos);
    const dataRegistro = new Date(data + 'T12:00:00Z').toISOString();

    setCurrentFuel(novoCombustivel);
    setConfig(prev => ({ ...prev, odometro: val }));
    setEntries(prev => [{ id: Date.now(), type: 'viagem', date: dataRegistro, titulo: 'Atualização de Rota', kmRodados: diffKm, litrosGastos: litrosGastos, descricao: descricao }, ...prev]);
    onClose();
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-sm bg-[#111827] border border-purple-900/50 rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-fade-in-up">
        <div className="h-2 bg-gradient-to-r from-purple-600 to-indigo-500 w-full flex-shrink-0"></div>
        <div className="p-5 overflow-y-auto custom-scrollbar">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-xl font-bold text-slate-100 flex items-center"><MapPin className="text-purple-500 mr-2" size={24} /> Atualizar Odômetro</h3>
            <button onClick={onClose} className="p-1 text-slate-400 hover:text-white bg-slate-800 rounded-full"><X size={20} /></button>
          </div>
          <p className="text-xs text-slate-400 mb-4">Atualize sua quilometragem para descontar o combustível gasto automaticamente.</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 ml-1">Data</label>
              <input type="date" required value={data} onChange={(e) => setData(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl p-3 text-white font-mono focus:border-purple-500 focus:outline-none" />
            </div>
            <div>
              <label className="text-xs text-slate-400 ml-1">Novo Odômetro (km)</label>
              <input type="number" required value={novoOdometro} onChange={(e) => { setNovoOdometro(e.target.value); setErrorMsg(''); }} placeholder={`Atual: ${config.odometro} km`} className={`w-full mt-1 bg-slate-900 border rounded-xl p-3 text-white font-mono focus:outline-none transition-colors ${errorMsg ? 'border-red-500 focus:border-red-500' : 'border-slate-700 focus:border-purple-500'}`} />
              {errorMsg && <span className="text-[10px] text-red-400 mt-1 ml-1">{errorMsg}</span>}
            </div>
            <div>
              <label className="text-xs text-slate-400 ml-1">Descrição</label>
              <textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} rows="2" placeholder="Opcional" className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl p-3 text-white text-sm focus:border-purple-500 focus:outline-none resize-none"></textarea>
            </div>
            {novoOdometro && !isNaN(parseFloat(novoOdometro)) && parseFloat(novoOdometro) > config.odometro && (
              <div className="bg-purple-900/20 border border-purple-500/30 rounded-xl p-3 animate-fade-in-up">
                <span className="block text-xs text-purple-300">Resumo da Atualização:</span>
                <span className="block text-sm font-bold text-slate-200 mt-1">+{ (parseFloat(novoOdometro) - config.odometro) } km rodados</span>
                <span className="block text-sm font-bold text-red-400">- { ((parseFloat(novoOdometro) - config.odometro) / (config.kmL || 1)).toFixed(1) }L do tanque</span>
              </div>
            )}
            <button type="submit" className="w-full mt-6 bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-xl shadow-[0_0_15px_rgba(147,51,234,0.3)] transition-colors">Confirmar Rota</button>
          </form>
        </div>
      </div>
    </div>
  );
}

// --- NOVO: Modal de Detalhes e Edição ---
function ModalDetalhes({ entry, onClose, setEntries }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    ...entry,
    data: entry.date ? entry.date.split('T')[0] : ''
  });

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSaveEdit = () => {
    let updatedEntry = { ...formData };
    
    // Ajusta a data
    updatedEntry.date = new Date(formData.data + 'T12:00:00Z').toISOString();
    
    // Conversões de número
    if (updatedEntry.type === 'abastecimento') {
      updatedEntry.litros = parseFloat(formData.litros) || 0;
      updatedEntry.valorTotal = parseFloat(formData.valorTotal) || 0;
      updatedEntry.odometro = parseFloat(formData.odometro) || 0;
      updatedEntry.precoLitro = (updatedEntry.litros > 0 && updatedEntry.valorTotal > 0) ? parseFloat((updatedEntry.valorTotal / updatedEntry.litros).toFixed(2)) : 0;
    } else if (updatedEntry.type === 'despesa') {
      updatedEntry.valor = parseFloat(formData.valor) || 0;
    }

    setEntries(prev => prev.map(e => e.id === entry.id ? updatedEntry : e));
    setIsEditing(false);
  };

  const handleDelete = () => {
    setEntries(prev => prev.filter(e => e.id !== entry.id));
    onClose();
  };

  // Cores dinâmicas baseadas no tipo
  const colorData = {
    abastecimento: { bg: 'from-emerald-600 to-cyan-500', icon: Fuel, text: 'text-emerald-400', border: 'border-emerald-500/30' },
    despesa: { bg: 'from-red-600 to-orange-500', icon: Wrench, text: 'text-red-400', border: 'border-red-500/30' },
    viagem: { bg: 'from-purple-600 to-indigo-500', icon: MapPin, text: 'text-purple-400', border: 'border-purple-500/30' }
  };
  const theme = colorData[entry.type];
  const Icon = theme.icon;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-sm bg-[#111827] border border-slate-700 rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-fade-in-up">
        <div className={`h-2 bg-gradient-to-r ${theme.bg} w-full flex-shrink-0`}></div>
        
        <div className="p-5 overflow-y-auto custom-scrollbar">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-slate-100 flex items-center">
              <Icon className={`${theme.text} mr-2`} size={24} />
              {isEditing ? 'Editar Registro' : 'Detalhes'}
            </h3>
            <button onClick={onClose} className="p-1 text-slate-400 hover:text-white bg-slate-800 rounded-full"><X size={20} /></button>
          </div>

          {!isEditing ? (
            // --- MODO VISUALIZAÇÃO ---
            <div className="space-y-4">
              <div className="flex justify-between items-start pb-4 border-b border-slate-800">
                <div>
                  <h4 className="font-bold text-lg text-slate-200">
                    {entry.type === 'abastecimento' ? 'Abastecimento' : entry.titulo}
                  </h4>
                  <span className="text-sm text-slate-400 flex items-center mt-1">
                    <Calendar size={14} className="mr-1.5" />
                    {new Date(entry.date).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}
                  </span>
                </div>
                {entry.isFullTank && <span className="px-2 py-1 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Tanque Cheio</span>}
              </div>

              {/* Informações específicas do tipo */}
              <div className="grid grid-cols-2 gap-4 py-2">
                {entry.type === 'abastecimento' && (
                  <>
                    <div><p className="text-xs text-slate-500 uppercase">Odômetro</p><p className="font-mono text-slate-200 font-bold">{entry.odometro} km</p></div>
                    <div><p className="text-xs text-slate-500 uppercase">Litros</p><p className="font-mono text-slate-200 font-bold">{entry.litros} L</p></div>
                    <div><p className="text-xs text-slate-500 uppercase">Valor Total</p><p className={`font-mono font-bold ${theme.text}`}>R$ {entry.valorTotal?.toFixed(2)}</p></div>
                    <div><p className="text-xs text-slate-500 uppercase">Preço / Litro</p><p className="font-mono text-slate-200 font-bold">R$ {entry.precoLitro?.toFixed(2)}</p></div>
                  </>
                )}
                {entry.type === 'despesa' && (
                  <div><p className="text-xs text-slate-500 uppercase">Valor Total</p><p className={`font-mono text-xl font-bold ${theme.text}`}>R$ {entry.valor?.toFixed(2)}</p></div>
                )}
                {entry.type === 'viagem' && (
                  <>
                    <div><p className="text-xs text-slate-500 uppercase">Km Rodados</p><p className="font-mono text-slate-200 font-bold">+{entry.kmRodados} km</p></div>
                    <div><p className="text-xs text-slate-500 uppercase">Litros Gastos</p><p className={`font-mono font-bold ${theme.text}`}>-{entry.litrosGastos?.toFixed(1)} L</p></div>
                  </>
                )}
              </div>

              {/* Descrição em Destaque */}
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 mt-2">
                <p className="text-xs text-slate-400 uppercase mb-1 flex items-center"><Info size={14} className="mr-1"/> Descrição</p>
                <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {entry.descricao || <span className="italic text-slate-500">Nenhuma descrição adicionada.</span>}
                </p>
              </div>

              {/* Botões de Ação */}
              <div className="flex gap-3 pt-4 mt-4 border-t border-slate-800">
                <button onClick={() => setIsEditing(true)} className="flex-1 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-bold py-3 rounded-xl transition-colors flex justify-center items-center">
                  <Edit2 size={16} className="mr-2" /> Editar
                </button>
                <button onClick={handleDelete} className="bg-red-900/30 hover:bg-red-900/50 border border-red-800/50 text-red-400 font-bold px-4 rounded-xl transition-colors flex justify-center items-center">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ) : (
            // --- MODO EDIÇÃO ---
            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 ml-1">Data</label>
                <input type="date" name="data" value={formData.data} onChange={handleChange} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl p-3 text-white font-mono focus:border-cyan-500 focus:outline-none" />
              </div>

              {entry.type === 'despesa' && (
                <>
                  <div><label className="text-xs text-slate-400 ml-1">Título</label><input type="text" name="titulo" value={formData.titulo} onChange={handleChange} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:border-cyan-500 focus:outline-none" /></div>
                  <div><label className="text-xs text-slate-400 ml-1">Valor Total (R$)</label><input type="number" step="0.01" name="valor" value={formData.valor} onChange={handleChange} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl p-3 text-white font-mono focus:border-cyan-500 focus:outline-none" /></div>
                </>
              )}

              {entry.type === 'abastecimento' && (
                <>
                  <div><label className="text-xs text-slate-400 ml-1">Odômetro (km)</label><input type="number" name="odometro" value={formData.odometro} onChange={handleChange} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl p-3 text-white font-mono focus:border-cyan-500 focus:outline-none" /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="text-xs text-slate-400 ml-1">Litros</label><input type="number" step="0.01" name="litros" value={formData.litros} onChange={handleChange} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl p-3 text-white font-mono focus:border-cyan-500 focus:outline-none" /></div>
                    <div><label className="text-xs text-slate-400 ml-1">Valor (R$)</label><input type="number" step="0.01" name="valorTotal" value={formData.valorTotal} onChange={handleChange} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl p-3 text-white font-mono focus:border-cyan-500 focus:outline-none" /></div>
                  </div>
                </>
              )}

              <div><label className="text-xs text-slate-400 ml-1">Descrição</label><textarea name="descricao" value={formData.descricao || ''} onChange={handleChange} rows="3" className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl p-3 text-white text-sm focus:border-cyan-500 focus:outline-none resize-none"></textarea></div>

              <div className="flex gap-3 pt-4">
                <button onClick={() => setIsEditing(false)} className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 rounded-xl transition-colors">Cancelar</button>
                <button onClick={handleSaveEdit} className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-xl transition-colors">Salvar</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
