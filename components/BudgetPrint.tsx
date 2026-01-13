
import React from 'react';
import { Budget, Client, Equipment } from '../types';
import { getClients, getEquipment } from '../store';

interface BudgetPrintProps {
  budget: Budget;
  onClose: () => void;
}

const BudgetPrint: React.FC<BudgetPrintProps> = ({ budget, onClose }) => {
  const client = getClients().find(c => c.id === budget.clientId);
  const equipment = getEquipment().find(e => e.id === budget.equipmentId);

  if (!client || !equipment) return null;

  const Copy = ({ title }: { title: string }) => (
    <div className="border border-gray-300 p-8 flex flex-col h-[48%] relative mb-4">
      <div className="absolute top-4 right-8 text-xs font-bold text-gray-400 uppercase tracking-widest border border-gray-400 px-2 py-1">
        {title}
      </div>
      
      {/* Header */}
      <div className="flex justify-between items-start mb-6 pb-4 border-b">
        <div>
          <h1 className="text-2xl font-extrabold text-blue-800">MPro SERVIÇOS TÉCNICOS</h1>
          <p className="text-xs text-gray-500">Soluções em Manutenção Preditiva e Corretiva</p>
        </div>
        <div className="text-right">
          <div className="text-xl font-bold text-gray-800">ORÇAMENTO Nº {budget.number.toString().padStart(6, '0')}</div>
          <div className="text-sm text-gray-600">Emissão: {new Date(budget.date).toLocaleDateString()}</div>
          <div className="text-sm text-gray-600">Vencimento: {new Date(new Date(budget.date).getTime() + (budget.validityDays * 86400000)).toLocaleDateString()}</div>
        </div>
      </div>

      {/* Info Sections */}
      <div className="grid grid-cols-2 gap-8 mb-6">
        <div>
          <h3 className="text-xs font-bold text-blue-700 border-b mb-2 uppercase">Dados do Cliente</h3>
          <p className="text-sm font-bold">{client.name}</p>
          <p className="text-xs">CNPJ: {client.cnpj}</p>
          <p className="text-xs">{client.address}</p>
          <p className="text-xs">Fone: {client.phone}</p>
        </div>
        <div>
          <h3 className="text-xs font-bold text-blue-700 border-b mb-2 uppercase">Equipamento</h3>
          <p className="text-sm font-bold">{equipment.brand} - {equipment.model}</p>
          <p className="text-xs">Série: {equipment.serialNumber}</p>
          <p className="text-xs">Tipo: {equipment.type}</p>
          <p className="text-xs">Local: {equipment.installationLocation}</p>
        </div>
      </div>

      {/* Items Table */}
      <div className="flex-1 overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-100 border-y border-gray-300">
            <tr>
              <th className="py-1 px-2">Descrição</th>
              <th className="py-1 px-2 text-right">Qtd</th>
              <th className="py-1 px-2 text-right">Unitário</th>
              <th className="py-1 px-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {budget.services.map(s => (
              <tr key={s.id} className="border-b border-gray-100">
                <td className="py-1 px-2">SERVIÇO: {s.description} ({s.type})</td>
                <td className="py-1 px-2 text-right">1</td>
                <td className="py-1 px-2 text-right">{s.price.toFixed(2)}</td>
                <td className="py-1 px-2 text-right">{s.price.toFixed(2)}</td>
              </tr>
            ))}
            {budget.materials.map(m => (
              <tr key={m.id} className="border-b border-gray-100">
                <td className="py-1 px-2">PEÇA: {m.description}</td>
                <td className="py-1 px-2 text-right">{m.quantity}</td>
                <td className="py-1 px-2 text-right">{m.unitPrice.toFixed(2)}</td>
                <td className="py-1 px-2 text-right">{(m.quantity * m.unitPrice).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer / Totals */}
      <div className="mt-4 pt-4 border-t flex justify-between">
        <div className="w-2/3 text-[10px] text-gray-500 italic">
          <p className="font-bold text-gray-700 mb-1">Observações:</p>
          <p>{budget.technicalNotes || 'Nenhuma observação técnica adicional.'}</p>
          <p className="mt-2">Pagamento: {budget.paymentTerms}</p>
        </div>
        <div className="w-1/3 text-right space-y-1">
          <div className="flex justify-between text-xs"><span>Serviços:</span><span>R$ {budget.totalLabor.toFixed(2)}</span></div>
          <div className="flex justify-between text-xs"><span>Materiais:</span><span>R$ {budget.totalMaterials.toFixed(2)}</span></div>
          {budget.travelFee > 0 && <div className="flex justify-between text-xs"><span>Deslocamento:</span><span>R$ {budget.travelFee.toFixed(2)}</span></div>}
          {budget.discount > 0 && <div className="flex justify-between text-xs text-red-600"><span>Desconto:</span><span>- R$ {budget.discount.toFixed(2)}</span></div>}
          <div className="flex justify-between text-lg font-bold border-t pt-1 mt-1"><span>TOTAL:</span><span>R$ {budget.finalTotal.toFixed(2)}</span></div>
        </div>
      </div>

      <div className="mt-8 flex justify-center gap-20">
        <div className="w-48 border-t border-gray-400 text-center text-[10px] pt-1">Responsável Técnico</div>
        <div className="w-48 border-t border-gray-400 text-center text-[10px] pt-1">Assinatura Cliente</div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-70 flex items-center justify-center overflow-auto p-4 print:p-0 print:bg-white no-print-overlay">
      <div className="a4-page print-only flex flex-col justify-between">
        <Copy title="1ª Via - Cliente" />
        <div className="border-t-2 border-dashed border-gray-400 my-2 relative">
          <span className="absolute left-1/2 -translate-x-1/2 -top-3 bg-white px-4 text-xs text-gray-400 no-print">✂️ Picote para separação</span>
        </div>
        <Copy title="2ª Via - Arquivo" />
        
        <div className="no-print mt-4 flex justify-center gap-4">
          <button 
            onClick={() => window.print()}
            className="px-8 py-3 bg-blue-600 text-white rounded-xl shadow-xl hover:bg-blue-700 flex items-center gap-2 font-bold"
          >
            🖨️ IMPRIMIR AGORA
          </button>
          <button 
            onClick={onClose}
            className="px-8 py-3 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 font-bold"
          >
            FECHAR
          </button>
        </div>
      </div>
    </div>
  );
};

export default BudgetPrint;
