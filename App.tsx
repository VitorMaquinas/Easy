
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import BudgetForm from './components/BudgetForm';
import BudgetPrint from './components/BudgetPrint';
import { Client, Equipment, Budget, BudgetStatus } from './types';
import { getClients, saveClient, getEquipment, saveEquipment, getBudgets } from './store';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [clients, setClients] = useState<Client[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  
  // Modal states
  const [showClientModal, setShowClientModal] = useState(false);
  const [showEqModal, setShowEqModal] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [printBudget, setPrintBudget] = useState<Budget | null>(null);
  
  // Form states
  const [clientForm, setClientForm] = useState<Partial<Client>>({});
  const [eqForm, setEqForm] = useState<Partial<Equipment>>({});

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setClients(getClients());
    setEquipment(getEquipment());
    setBudgets(getBudgets());
  };

  const handleSaveClient = (e: React.FormEvent) => {
    e.preventDefault();
    const newClient = { ...clientForm, id: clientForm.id || crypto.randomUUID() } as Client;
    saveClient(newClient);
    setShowClientModal(false);
    setClientForm({});
    refreshData();
  };

  const handleSaveEq = (e: React.FormEvent) => {
    e.preventDefault();
    const newEq = { ...eqForm, id: eqForm.id || crypto.randomUUID() } as Equipment;
    saveEquipment(newEq);
    setShowEqModal(false);
    setEqForm({});
    refreshData();
  };

  const getClientName = (id: string) => clients.find(c => c.id === id)?.name || 'N/A';
  const getEqLabel = (id: string) => {
    const eq = equipment.find(e => e.id === id);
    return eq ? `${eq.brand} - ${eq.model}` : 'N/A';
  };

  const renderDashboard = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {[
        { label: 'Total Clientes', value: clients.length, color: 'blue' },
        { label: 'Orçamentos em Análise', value: budgets.filter(b => b.status === BudgetStatus.ANALYSIS).length, color: 'amber' },
        { label: 'Orçamentos Aprovados', value: budgets.filter(b => b.status === BudgetStatus.APPROVED).length, color: 'green' },
        { label: 'Faturamento Estimado', value: `R$ ${budgets.filter(b => b.status === BudgetStatus.APPROVED).reduce((a, b) => a + b.finalTotal, 0).toFixed(0)}`, color: 'emerald' },
      ].map((card, i) => (
        <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="text-gray-500 text-sm font-medium">{card.label}</div>
          <div className={`text-3xl font-bold mt-1 text-${card.color}-600`}>{card.value}</div>
        </div>
      ))}
    </div>
  );

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === 'dashboard' && (
        <>
          {renderDashboard()}
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <h3 className="font-bold mb-4 text-gray-800">Atividades Recentes</h3>
            <div className="space-y-4">
              {budgets.slice(-5).reverse().map(b => (
                <div key={b.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors border-b">
                  <div>
                    <div className="font-semibold text-gray-900">ORÇ #{b.number} - {getClientName(b.clientId)}</div>
                    <div className="text-xs text-gray-500">{new Date(b.date).toLocaleDateString()} • {getEqLabel(b.equipmentId)}</div>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-bold ${b.status === BudgetStatus.APPROVED ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                    {b.status}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {activeTab === 'clients' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold">Gestão de Clientes</h3>
            <button onClick={() => { setClientForm({}); setShowClientModal(true); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 shadow-md">
              + Novo Cliente
            </button>
          </div>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 font-semibold text-sm text-gray-600">Nome / Razão</th>
                  <th className="px-6 py-4 font-semibold text-sm text-gray-600">CNPJ</th>
                  <th className="px-6 py-4 font-semibold text-sm text-gray-600">Telefone</th>
                  <th className="px-6 py-4 font-semibold text-sm text-gray-600 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {clients.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium">{c.name}</div>
                      <div className="text-xs text-gray-500">{c.tradingName}</div>
                    </td>
                    <td className="px-6 py-4 text-sm">{c.cnpj}</td>
                    <td className="px-6 py-4 text-sm">{c.phone}</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => { setClientForm(c); setShowClientModal(true); }} className="text-blue-600 hover:underline">Editar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'equipment' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold">Base de Equipamentos</h3>
            <button onClick={() => { setEqForm({}); setShowEqModal(true); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 shadow-md">
              + Novo Equipamento
            </button>
          </div>
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 font-semibold text-sm text-gray-600">Cliente</th>
                  <th className="px-6 py-4 font-semibold text-sm text-gray-600">Modelo / Marca</th>
                  <th className="px-6 py-4 font-semibold text-sm text-gray-600">Nº de Série</th>
                  <th className="px-6 py-4 font-semibold text-sm text-gray-600 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {equipment.map(e => (
                  <tr key={e.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm">{getClientName(e.clientId)}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium">{e.model}</div>
                      <div className="text-xs text-gray-500">{e.brand}</div>
                    </td>
                    <td className="px-6 py-4 text-sm font-mono">{e.serialNumber}</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => { setEqForm(e); setShowEqModal(true); }} className="text-blue-600 hover:underline">Editar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'budgets' && !showBudgetModal && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold">Orçamentos de Serviço</h3>
            <button onClick={() => setShowBudgetModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 shadow-md">
              + Novo Orçamento
            </button>
          </div>
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 font-semibold text-sm text-gray-600">Número</th>
                  <th className="px-6 py-4 font-semibold text-sm text-gray-600">Cliente / Equipamento</th>
                  <th className="px-6 py-4 font-semibold text-sm text-gray-600">Valor Total</th>
                  <th className="px-6 py-4 font-semibold text-sm text-gray-600">Status</th>
                  <th className="px-6 py-4 font-semibold text-sm text-gray-600 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {budgets.map(b => (
                  <tr key={b.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-mono font-bold">#{b.number.toString().padStart(6, '0')}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium">{getClientName(b.clientId)}</div>
                      <div className="text-xs text-gray-500">{getEqLabel(b.equipmentId)}</div>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-800">R$ {b.finalTotal.toFixed(2)}</td>
                    <td className="px-6 py-4 text-xs font-bold uppercase">
                      <span className={`px-2 py-1 rounded-full ${b.status === BudgetStatus.APPROVED ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-3">
                      <button onClick={() => setPrintBudget(b)} className="text-indigo-600 hover:underline">🖨️ Imprimir</button>
                      <button onClick={() => { setPrintBudget(b); setShowBudgetModal(true); }} className="text-blue-600 hover:underline">Editar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showBudgetModal && (
        <BudgetForm 
          editItem={budgets.find(b => b.id === printBudget?.id)}
          onSuccess={() => { setShowBudgetModal(false); setPrintBudget(null); refreshData(); }}
          onCancel={() => { setShowBudgetModal(false); setPrintBudget(null); }}
        />
      )}

      {/* Client Modal */}
      {showClientModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-8">
            <h3 className="text-xl font-bold mb-6">Cadastro de Cliente</h3>
            <form onSubmit={handleSaveClient} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Razão Social / Nome *</label>
                  <input required value={clientForm.name || ''} onChange={e => setClientForm({...clientForm, name: e.target.value})} className="w-full border rounded-lg px-3 py-2 bg-gray-50" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">CNPJ *</label>
                  <input required value={clientForm.cnpj || ''} onChange={e => setClientForm({...clientForm, cnpj: e.target.value})} className="w-full border rounded-lg px-3 py-2 bg-gray-50" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">I.E.</label>
                  <input value={clientForm.stateRegistration || ''} onChange={e => setClientForm({...clientForm, stateRegistration: e.target.value})} className="w-full border rounded-lg px-3 py-2 bg-gray-50" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Endereço Completo</label>
                <input value={clientForm.address || ''} onChange={e => setClientForm({...clientForm, address: e.target.value})} className="w-full border rounded-lg px-3 py-2 bg-gray-50" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Telefone</label>
                  <input value={clientForm.phone || ''} onChange={e => setClientForm({...clientForm, phone: e.target.value})} className="w-full border rounded-lg px-3 py-2 bg-gray-50" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">E-mail</label>
                  <input type="email" value={clientForm.email || ''} onChange={e => setClientForm({...clientForm, email: e.target.value})} className="w-full border rounded-lg px-3 py-2 bg-gray-50" />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-8">
                <button type="button" onClick={() => setShowClientModal(false)} className="px-4 py-2 border rounded-lg">Cancelar</button>
                <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Equipment Modal */}
      {showEqModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-8 max-h-[90vh] overflow-auto">
            <h3 className="text-xl font-bold mb-6">Cadastro de Equipamento</h3>
            <form onSubmit={handleSaveEq} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Cliente Vinculado *</label>
                <select required value={eqForm.clientId || ''} onChange={e => setEqForm({...eqForm, clientId: e.target.value})} className="w-full border rounded-lg px-3 py-2 bg-gray-50">
                  <option value="">Selecione o cliente</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Tipo de Equipamento *</label>
                  <input required value={eqForm.type || ''} onChange={e => setEqForm({...eqForm, type: e.target.value})} className="w-full border rounded-lg px-3 py-2 bg-gray-50" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Marca *</label>
                  <input required value={eqForm.brand || ''} onChange={e => setEqForm({...eqForm, brand: e.target.value})} className="w-full border rounded-lg px-3 py-2 bg-gray-50" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Modelo *</label>
                  <input required value={eqForm.model || ''} onChange={e => setEqForm({...eqForm, model: e.target.value})} className="w-full border rounded-lg px-3 py-2 bg-gray-50" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Nº de Série *</label>
                  <input required value={eqForm.serialNumber || ''} onChange={e => setEqForm({...eqForm, serialNumber: e.target.value})} className="w-full border rounded-lg px-3 py-2 bg-gray-50" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Patrimônio / Etiqueta</label>
                  <input value={eqForm.assetNumber || ''} onChange={e => setEqForm({...eqForm, assetNumber: e.target.value})} className="w-full border rounded-lg px-3 py-2 bg-gray-50" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Ano Fabr.</label>
                  <input value={eqForm.manufacturingYear || ''} onChange={e => setEqForm({...eqForm, manufacturingYear: e.target.value})} className="w-full border rounded-lg px-3 py-2 bg-gray-50" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Local Instalação</label>
                  <input value={eqForm.installationLocation || ''} onChange={e => setEqForm({...eqForm, installationLocation: e.target.value})} className="w-full border rounded-lg px-3 py-2 bg-gray-50" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Estado Físico</label>
                  <input value={eqForm.condition || ''} onChange={e => setEqForm({...eqForm, condition: e.target.value})} className="w-full border rounded-lg px-3 py-2 bg-gray-50" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Observações Técnicas</label>
                <textarea rows={3} value={eqForm.notes || ''} onChange={e => setEqForm({...eqForm, notes: e.target.value})} className="w-full border rounded-lg px-3 py-2 bg-gray-50" />
              </div>
              <div className="flex justify-end gap-3 mt-8">
                <button type="button" onClick={() => setShowEqModal(false)} className="px-4 py-2 border rounded-lg">Cancelar</button>
                <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Print View Overlay */}
      {printBudget && (
        <BudgetPrint budget={printBudget} onClose={() => setPrintBudget(null)} />
      )}
    </Layout>
  );
};

export default App;
