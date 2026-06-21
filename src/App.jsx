// src/App.jsx
import React, { useState } from 'react';
import { LayoutDashboard, List, BarChart2, Settings, Fuel } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('PAINEL');

  return (
    <div className="h-screen w-full bg-slate-950 text-slate-200 flex flex-col items-center">
      <div className="w-full max-w-md h-full bg-slate-900 border-x border-slate-800 flex flex-col shadow-2xl">
        
        {/* Header */}
        <header className="p-6 border-b border-slate-800">
          <h1 className="text-xl font-bold text-cyan-400">MotoLog</h1>
        </header>

        {/* Conteúdo Principal */}
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg">
            <h2 className="text-cyan-400 font-bold text-lg">Painel de Controle</h2>
            <p className="text-sm mt-2 text-slate-400">Tudo pronto! O Tailwind está funcionando.</p>
          </div>
        </main>

        {/* Menu Inferior */}
        <nav className="h-16 border-t border-slate-800 flex justify-around items-center bg-slate-900">
          <NavItem icon={<LayoutDashboard size={20} />} label="PAINEL" active={activeTab === 'PAINEL'} onClick={() => setActiveTab('PAINEL')} />
          <NavItem icon={<List size={20} />} label="LOG" active={activeTab === 'LOG'} onClick={() => setActiveTab('LOG')} />
          <NavItem icon={<BarChart2 size={20} />} label="RELATÓRIOS" active={activeTab === 'RELATÓRIOS'} onClick={() => setActiveTab('RELATÓRIOS')} />
          <NavItem icon={<Settings size={20} />} label="CONFIGS" active={activeTab === 'CONFIGURAÇÕES'} onClick={() => setActiveTab('CONFIGURAÇÕES')} />
        </nav>
      </div>
    </div>
  );
}

function NavItem({ icon, label, active, onClick }) {
  return (
    <button onClick={onClick} className={"flex flex-col items-center " + (active ? "text-cyan-400" : "text-slate-500")}>
      {icon}
      <span className="text-[10px] mt-1 font-bold">{label}</span>
    </button>
  );
}
