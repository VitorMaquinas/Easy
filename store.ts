
import { Client, Equipment, Budget } from './types';

// Using localStorage to persist data across sessions (simulating a database)
const STORAGE_KEYS = {
  CLIENTS: 'mpro_clients',
  EQUIPMENT: 'mpro_equipment',
  BUDGETS: 'mpro_budgets'
};

export const getClients = (): Client[] => {
  const data = localStorage.getItem(STORAGE_KEYS.CLIENTS);
  return data ? JSON.parse(data) : [];
};

export const saveClient = (client: Client) => {
  const clients = getClients();
  const index = clients.findIndex(c => c.id === client.id);
  if (index > -1) clients[index] = client;
  else clients.push(client);
  localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
};

export const getEquipment = (): Equipment[] => {
  const data = localStorage.getItem(STORAGE_KEYS.EQUIPMENT);
  return data ? JSON.parse(data) : [];
};

export const saveEquipment = (eq: Equipment) => {
  const equipments = getEquipment();
  const index = equipments.findIndex(e => e.id === eq.id);
  if (index > -1) equipments[index] = eq;
  else equipments.push(eq);
  localStorage.setItem(STORAGE_KEYS.EQUIPMENT, JSON.stringify(equipments));
};

export const getBudgets = (): Budget[] => {
  const data = localStorage.getItem(STORAGE_KEYS.BUDGETS);
  return data ? JSON.parse(data) : [];
};

export const saveBudget = (budget: Budget) => {
  const budgets = getBudgets();
  const index = budgets.findIndex(b => b.id === budget.id);
  if (index > -1) budgets[index] = budget;
  else budgets.push(budget);
  localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
};
