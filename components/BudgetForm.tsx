
import React, { useState, useEffect } from 'react';
import { Client, Equipment, Budget, BudgetStatus, ServiceItem, MaterialItem, ServiceType } from '../types';
import { getClients, getEquipment, saveBudget, getBudgets } from '../store';

interface BudgetFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  editItem?: Budget;
}

const BudgetForm: React.FC<BudgetFormProps> = ({ onSuccess, onCancel, editItem }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [availableEquip, setAvailableEquip] = useState<Equipment[]>([]);
  
  const [clientId, setClientId] = useState(editItem?.clientId || '');
  const [equipmentId, setEquipmentId] = useState(editItem?.equipmentId || '');
  const [validity, setValidity] = useState(editItem?.validityDays || 15);
  const [paymentTerms, setPaymentTerms] = useState(editItem?.paymentTerms || 'A vista');
  const [notes, setNotes] = useState(editItem?.technicalNotes || '');
  const [travelFee, setTravelFee] = useState(editItem?.travelFee || 0);
  const [discount, setDiscount] = useState(editItem?.discount || 0);
  const [status, setStatus] = useState<BudgetStatus>(editItem?.status || BudgetStatus.ANALYSIS);

  const [services, setServices] = useState<ServiceItem[]>(editItem?.services || []);
  const [materials, setMaterials] = useState<MaterialItem[]>(editItem?.materials || []);

  useEffect(() => {
    setClients(getClients());
  }, []);

  useEffect(() => {
    if (clientId) {
      const allEq = getEquipment();
      setAvailableEquip(allEq.filter(e => e.clientId === clientId));
    } else {
      setAvailableEquip([]);
    }
  }, [clientId]);

  const addService = () => {
    setServices([...services, { 
      id: crypto.randomUUID(), 
      description: '', 
      type: ServiceType.CORRECTIVE, 
      price: 0, 
      estimatedHours: 1 
    }]);
  };

  const addMaterial = () => {
    setMaterials([...materials, { 
      id: crypto.randomUUID(), 
      description: '', 
      quantity: 1, 
      unitPrice: 0 
    }]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId || !equipmentId) {
      alert('Selecione cliente e equipamento obrigatórios');
      return;
    }

    const laborTotal = services.reduce((acc, s) => acc + s.price, 0);
    const materialTotal = materials.reduce((acc, m) => acc + (m.quantity * m.unitPrice), 0);
    const final = (laborTotal + materialTotal + travelFee) - discount;

    const newBudget: Budget = {
      id: editItem?.id || crypto.randomUUID(),
      number: editItem?.number || getBudgets().length + 1,
      date: editItem?.date || new Date().toISOString(),
      clientId,
      equipmentId,
      validityDays: validity,
      paymentTerms,
      technicalNotes: notes,
      travelFee,
      discount,
      status,
      services,
      materials,
      totalLabor: laborTotal,
      totalMaterials: materialTotal,
      finalTotal: final
    };

    saveBudget(newBudget);
    onSuccess();
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 max-w-5xl mx-auto">
      <h3 className="text-xl font-bold mb-6 text-gray-800">
        {editItem ? 'Editar Orçamento' : 'Novo Orçamento'}
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Header Data */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Cliente *</label>
              <select 
                value={clientId} 
                onChange={(e) => setClientId(e.target.value)}
                className="mt-1 w-full border rounded-lg px-3 py-2 bg-gray-50 focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Selecione um cliente</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name} ({c.cnpj})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Equipamento *</label>
              <select 
                value={equipmentId} 
                onChange={(e) => setEquipmentId(e.target.value)}
                className="mt-1 w-full border rounded-lg px-3 py-2 bg-gray-50 focus:ring-2 focus:ring-blue-500"
                required
                disabled={!clientId}
              >
                <option value="">Selecione o equipamento</option>
                {availableEquip.map(e => <option key={e.id} value={e.id}>{e.brand} - {e.model} ({e.serialNumber})</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Validade (Dias)</label>
                <input type="number" value={validity} onChange={(e) => setValidity(Number(e.target.value))} className="mt-1 w-full border rounded-lg px-3 py-2 bg-gray-50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value as BudgetStatus)} className="mt-1 w-full border rounded-lg px-3 py-2 bg-gray-50">
                  {Object.values(BudgetStatus).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Condições de Pagamento</label>
              <input type="text" value={paymentTerms} onChange={(e) => setPaymentTerms(e.target.value)} className="mt-1 w-full border rounded-lg px-3 py-2 bg-gray-50" />
            </div>
          </div>
        </div>

        {/* Services */}
        <div className="border rounded-xl p-4 bg-gray-50">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-bold text-gray-700 flex items-center gap-2">
              🛠️ Serviços e Mão de Obra
            </h4>
            <button type="button" onClick={addService} className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">
              + Adicionar
            </button>
          </div>
          {services.map((s, idx) => (
            <div key={s.id} className="grid grid-cols-1 md:grid-cols-12 gap-2 mb-2 items-end">
              <div className="md:col-span-6">
                <input 
                  placeholder="Descrição do serviço"
                  value={s.description}
                  onChange={(e) => {
                    const newS = [...services];
                    newS[idx].description = e.target.value;
                    setServices(newS);
                  }}
                  className="w-full border rounded px-3 py-1.5"
                />
              </div>
              <div className="md:col-span-3">
                <select
                  value={s.type}
                  onChange={(e) => {
                    const newS = [...services];
                    newS[idx].type = e.target.value as ServiceType;
                    setServices(newS);
                  }}
                  className="w-full border rounded px-3 py-1.5 text-sm"
                >
                  {Object.values(ServiceType).map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="md:col-span-2">
                <input 
                  type="number"
                  placeholder="Valor"
                  value={s.price}
                  onChange={(e) => {
                    const newS = [...services];
                    newS[idx].price = Number(e.target.value);
                    setServices(newS);
                  }}
                  className="w-full border rounded px-3 py-1.5"
                />
              </div>
              <div className="md:col-span-1">
                <button type="button" onClick={() => setServices(services.filter((_, i) => i !== idx))} className="text-red-500 p-2">🗑️</button>
              </div>
            </div>
          ))}
        </div>

        {/* Materials */}
        <div className="border rounded-xl p-4 bg-gray-50">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-bold text-gray-700 flex items-center gap-2">
              📦 Peças e Materiais
            </h4>
            <button type="button" onClick={addMaterial} className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">
              + Adicionar
            </button>
          </div>
          {materials.map((m, idx) => (
            <div key={m.id} className="grid grid-cols-1 md:grid-cols-12 gap-2 mb-2 items-end">
              <div className="md:col-span-6">
                <input 
                  placeholder="Descrição da peça/material"
                  value={m.description}
                  onChange={(e) => {
                    const newM = [...materials];
                    newM[idx].description = e.target.value;
                    setMaterials(newM);
                  }}
                  className="w-full border rounded px-3 py-1.5"
                />
              </div>
              <div className="md:col-span-2">
                <input 
                  type="number"
                  placeholder="Qtd"
                  value={m.quantity}
                  onChange={(e) => {
                    const newM = [...materials];
                    newM[idx].quantity = Number(e.target.value);
                    setMaterials(newM);
                  }}
                  className="w-full border rounded px-3 py-1.5"
                />
              </div>
              <div className="md:col-span-3">
                <input 
                  type="number"
                  placeholder="R$ Unit"
                  value={m.unitPrice}
                  onChange={(e) => {
                    const newM = [...materials];
                    newM[idx].unitPrice = Number(e.target.value);
                    setMaterials(newM);
                  }}
                  className="w-full border rounded px-3 py-1.5"
                />
              </div>
              <div className="md:col-span-1">
                <button type="button" onClick={() => setMaterials(materials.filter((_, i) => i !== idx))} className="text-red-500 p-2">🗑️</button>
              </div>
            </div>
          ))}
        </div>

        {/* Totals and Notes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Observações Técnicas</label>
            <textarea 
              rows={4} 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 bg-gray-50"
              placeholder="Detalhes adicionais, recomendações..."
            />
          </div>
          <div className="bg-slate-50 p-6 rounded-xl space-y-3">
            <div className="flex justify-between text-gray-600">
              <span>Total de Mão de Obra:</span>
              <span>R$ {services.reduce((acc, s) => acc + s.price, 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Total de Materiais:</span>
              <span>R$ {materials.reduce((acc, m) => acc + (m.quantity * m.unitPrice), 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-gray-600">
              <span>Taxa de Deslocamento:</span>
              <input type="number" value={travelFee} onChange={(e) => setTravelFee(Number(e.target.value))} className="w-24 text-right border rounded px-2 py-1" />
            </div>
            <div className="flex justify-between items-center text-gray-600">
              <span>Desconto:</span>
              <input type="number" value={discount} onChange={(e) => setDiscount(Number(e.target.value))} className="w-24 text-right border rounded px-2 py-1" />
            </div>
            <div className="flex justify-between text-xl font-bold text-slate-900 pt-3 border-t">
              <span>VALOR FINAL:</span>
              <span>R$ {(services.reduce((acc, s) => acc + s.price, 0) + materials.reduce((acc, m) => acc + (m.quantity * m.unitPrice), 0) + travelFee - discount).toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-6">
          <button type="button" onClick={onCancel} className="px-6 py-2 border rounded-lg hover:bg-gray-100 transition-colors">
            Cancelar
          </button>
          <button type="submit" className="px-8 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md transition-colors">
            Salvar Orçamento
          </button>
        </div>
      </form>
    </div>
  );
};

export default BudgetForm;
