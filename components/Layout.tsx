
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'clients', label: 'Clientes', icon: '👤' },
    { id: 'equipment', label: 'Equipamentos', icon: '⚙️' },
    { id: 'budgets', label: 'Orçamentos', icon: '📄' },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100 no-print">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 text-white flex-shrink-0">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <span className="text-blue-400 text-2xl">🛠️</span> MPro 
            <span className="text-sm font-normal text-slate-400">v1.0</span>
          </h1>
        </div>
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${
                activeTab === item.id 
                  ? 'bg-blue-600 text-white' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <header className="bg-white border-b h-16 flex items-center justify-between px-8 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 capitalize">
            {activeTab}
          </h2>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">Usuário: Administrador</span>
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
              AD
            </div>
          </div>
        </header>
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
