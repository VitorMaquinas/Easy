
export enum BudgetStatus {
  ANALYSIS = 'Em Análise',
  APPROVED = 'Aprovado',
  REJECTED = 'Reprovado'
}

export enum ServiceType {
  PREVENTIVE = 'Preventiva',
  CORRECTIVE = 'Corretiva',
  PREDICTIVE = 'Preditiva'
}

export interface Client {
  id: string;
  name: string;
  tradingName: string;
  cnpj: string;
  stateRegistration?: string;
  address: string;
  phone: string;
  email: string;
}

export interface Equipment {
  id: string;
  clientId: string;
  type: string;
  brand: string;
  model: string;
  serialNumber: string;
  assetNumber?: string;
  manufacturingYear?: string;
  installationLocation: string;
  condition: string;
  notes: string;
}

export interface ServiceItem {
  id: string;
  description: string;
  type: ServiceType;
  price: number;
  estimatedHours: number;
}

export interface MaterialItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  partCode?: string;
}

export interface Budget {
  id: string;
  number: number;
  date: string;
  validityDays: number;
  clientId: string;
  equipmentId: string;
  services: ServiceItem[];
  materials: MaterialItem[];
  discount: number;
  travelFee: number;
  paymentTerms: string;
  technicalNotes: string;
  status: BudgetStatus;
  totalLabor: number;
  totalMaterials: number;
  finalTotal: number;
}
