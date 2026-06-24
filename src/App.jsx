import React, { useState, useEffect, useMemo, useRef } from 'react';
import { LayoutDashboard, List, BarChart2, Settings, Plus, X, Fuel, Wrench, Gauge, Droplets, Calendar, MapPin, Trash2, Wallet, Info, Map, Play, Square, Route, Navigation, Search, Loader2, CheckCircle2, Database, Download, Upload } from 'lucide-react';

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

  const handleCalculateConfig = (newConfig) => {
    const diffKm = newConfig.odometro - config.odometro;
    if (diffKm > 0) {
      const litrosGastos = diffKm / (newConfig.kmL || 1);
      setCurrentFuel(prev => Math.max(0, prev - litrosGastos));
    }
    setConfig(newConfig);
  };

  return (
    <div className="h-[100dvh] w-full bg-[#060b14] flex justify-center font-sans text-slate-200 overflow-hidden">
      <div className="h-full w-full max-w-md bg-gradient-to-b from-[#0a1325] to-[#040811] relative flex flex-col shadow-2xl md:border-x md:border-slate-800 overflow-hidden">
        
        <header className="pt-8 pb-4 px-6 bg-transparent flex justify-between items-center z-10 flex-shrink-0">
          <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400 tracking-wider">MOTO<span className="text-slate-100">LOG</span></h1>
          <div className="flex items-center space-x-2 text-cyan-400 bg-cyan-900/20 px-3 py-1 rounded-full border border-cyan-500/30">
            <Gauge size={16} />
            <span className="text-sm font-bold font-mono tracking-wide">{config.odometro} <span className="text-[10px] text-cyan-600">KM</span></span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto pb-28 px-4 custom-scrollbar z-10 relative">
          {activeTab === 'PAINEL' && <TabPainel currentFuel={currentFuel} tanqueTotal={config.tanqueTotal} config={config} entries={entries} />}
          {activeTab === 'LOG' && <TabLog entries={entries} onSelectEntry={setSelectedEntry} />}
          {activeTab === 'VIAGEM' && <TabViagem config={config} entries={entries} activeTrip={activeTrip} setActiveTrip={setActiveTrip} onStopTrip={() => setActiveModal('encerrar_viagem')} currentFuel={currentFuel} />}
          {activeTab === 'CONFIGURAÇÕES' && <TabConfiguracoes config={config} currentFuel={currentFuel} entries={entries} onCalculate={handleCalculateConfig} onResetData={() => {setEntries([]); setCurrentFuel(0); setActiveTrip(null);}} />}
        </main>

        <nav className="absolute bottom-0 w-full h-16 bg-[#0B1221]/95 backdrop-blur-lg border-t border-cyan-900/50 grid grid-cols-5 items-center px-1 z-50">
          <NavItem icon={<LayoutDashboard />} label="PAINEL" isActive={activeTab === 'PAINEL'} onClick={() => setActiveTab('PAINEL')} />
          <NavItem icon={<List />} label="LOG" isActive={activeTab === 'LOG'} onClick={() => setActiveTab('LOG')} />
          <NavItem icon={<Map />} label="VIAGEM" isActive={activeTab === 'VIAGEM'} onClick={() => setActiveTab('VIAGEM')} />
          <NavItem icon={<BarChart2 />} label="RELATÓRIOS" isActive={activeTab === 'RELATÓRIOS'} onClick={() => setActiveTab('RELATÓRIOS')} />
          <NavItem icon={<Settings />} label="CONFIGS" isActive={activeTab === 'CONFIGURAÇÕES'} onClick={() => setActiveTab('CONFIGURAÇÕES')} />
        </nav>
      </div>
      {activeModal === 'encerrar_viagem' && <ModalEncerrarViagem onClose={() => setActiveModal(null)} activeTrip={activeTrip} setActiveTrip={setActiveTrip} config={config} setConfig={setConfig} currentFuel={currentFuel} setCurrentFuel={setCurrentFuel} setEntries={setEntries} />}
    </div>
  );
}

// === COMPONENTES OMITIDOS POR EXTENSÃO, MAS CERTIFIQUE-SE DE MANTÊ-LOS NO FINAL DO ARQUIVO ===
// (Apenas substitua a estrutura do App e TabViagem acima)
