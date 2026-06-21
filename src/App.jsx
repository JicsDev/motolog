import React, { useState } from 'react';
import { LayoutDashboard, List, BarChart2, Settings, Trash2, Fuel, Wrench, MapPin, Calendar, Info, Edit2, X } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('PAINEL');
  const [logs, setLogs] = useState([]);
  const [selectedEntry, setSelectedEntry] = useState(null);

  // Função para adicionar (mantendo a estrutura completa)
  const adicionarRegistro = (novoLog) => {
    setLogs([{ ...novoLog, id: Date.now() }, ...logs]);
  };

  // Função para excluir
  const excluirLog = (id) => {
    setLogs(logs.filter(log => log.id !== id));
  };

  // Função para editar
  const editarLog = (id, dadosAtualizados) => {
    setLogs(logs.map(log => log.id === id ? { ...log, ...dadosAtualizados } : log));
    setSelectedEntry(null);
  };

  return (
    <div className="h-screen w-full bg-slate-950 text-slate-200 flex flex-col items-center">
      <div className="w-full max-w-md h-full bg-slate-900 border-x border-slate-800 flex flex-col shadow-2xl">
        
        <header className="p-6 border-b border-slate-800">
          <h1 className="text-xl font-bold text-cyan-400">MotoLog Completo</h1>
        </header>

        <main className="flex-1 p-6 overflow-y-auto">
          {activeTab === 'LOG' && (
            <div className="space-y-4">
              {/* Exemplo de botão simples de adicionar para teste rápido */}
              <button onClick={() => adicionarRegistro({ titulo: 'Nova Entrada', valor: 0, date: new Date().toISOString().split('T')[0] })} className="w-full bg-cyan-600 py-2 rounded font-bold mb-4">
                + Adicionar Registro de Teste
              </button>

              {logs.map(log => (
                <div key={log.id} className="bg-slate-800 p-4 rounded-lg flex justify-between items-center border border-slate-700">
                  <div onClick={() => setSelectedEntry(log)} className="cursor-pointer flex-1">
                    <p className="font-bold">{log.titulo || 'Registro'}</p>
                    <p className="text-xs text-slate-400">R$ {log.valor} - {log.date}</p>
                  </div>
                  <button onClick={() => excluirLog(log.id)} className="text-red-400 ml-4"><Trash2 size={20} /></button>
                </div>
              ))}
            </div>
          )}
          {activeTab === 'PAINEL' && <div className="text-center mt-20 text-slate-500">Painel em construção...</div>}
        </main>

        <nav className="h-16 border-t border-slate-800 flex justify-around items-center bg-slate-900">
          <NavItem icon={<LayoutDashboard size={20} />} label="PAINEL" active={activeTab === 'PAINEL'} onClick={() => setActiveTab('PAINEL')} />
          <NavItem icon={<List size={20} />} label="LOG" active={activeTab === 'LOG'} onClick={() => setActiveTab('LOG')} />
          <NavItem icon={<BarChart2 size={20} />} label="RELATÓRIOS" active={activeTab === 'RELATÓRIOS'} onClick={() => setActiveTab('RELATÓRIOS')} />
          <NavItem icon={<Settings size={20} />} label="CONFIGS" active={activeTab === 'CONFIGURAÇÕES'} onClick={() => setActiveTab('CONFIGURAÇÕES')} />
        </nav>
      </div>

      {/* Modal de Detalhes (O que você queria ver ao clicar no log) */}
      {selectedEntry && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 p-6 rounded-2xl w-full max-w-sm border border-slate-700">
            <div className="flex justify-between mb-4">
              <h2 className="text-lg font-bold">Detalhes</h2>
              <button onClick={() => setSelectedEntry(null)}><X /></button>
            </div>
            <p>Título: {selectedEntry.titulo}</p>
            <p>Valor: R$ {selectedEntry.valor}</p>
            <button onClick={() => editarLog(selectedEntry.id, { titulo: 'Título Editado' })} className="mt-4 w-full bg-blue-600 py-2 rounded">Simular Edição</button>
          </div>
        </div>
      )}
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
