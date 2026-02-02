
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import KanbanBoard from './components/KanbanBoard';
import TicketDetail from './components/TicketDetail';
import UsersManagement from './components/UsersManagement';
import TicketForm from './components/TicketForm';
import Reports from './components/Reports';
import Settings from './components/Settings';
import UnitsManagement from './components/UnitsManagement';
import SectorsManagement from './components/SectorsManagement';
import ProblemsManagement from './components/ProblemsManagement';
import EquipmentManagement from './components/EquipmentManagement';
import SystemManagement from './components/SystemManagement';
import ProfileSettings from './components/ProfileSettings';
import Login from './components/Login';
import { ICONS } from './constants';
import { Ticket, TicketStatus, User, Role } from './types';
import { dataService } from './services/db';

interface Alert {
  id: string;
  type: 'message' | 'status' | 'new' | 'error';
  title: string;
  description: string;
}

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [showNotification, setShowNotification] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isTicketFormOpen, setIsTicketFormOpen] = useState(false);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [dbStatus, setDbStatus] = useState<'connected' | 'portable' | 'error'>('portable');

  useEffect(() => {
    const initData = async () => {
      const isConnected = await dataService.checkConnection();
      setDbStatus(isConnected ? 'connected' : 'portable');
      
      const ticketsData = await dataService.getTickets();
      setTickets(ticketsData);
    };
    initData();
  }, []);

  useEffect(() => {
    const restrictedTabs = ['users', 'settings', 'reports', 'dashboard', 'units', 'sectors', 'problems', 'equipment', 'system'];
    if (currentUser?.role === Role.USER && restrictedTabs.includes(activeTab)) {
      setActiveTab('tickets');
    }
  }, [activeTab, currentUser]);

  const addAlert = (type: 'message' | 'status' | 'new' | 'error', title: string, description: string) => {
    const newAlert: Alert = { id: Date.now().toString(), type, title, description };
    setAlerts(prev => [newAlert, ...prev]);
  };

  const updateTicketStatus = async (id: string, newStatus: TicketStatus) => {
    try {
      await dataService.updateTicketStatus(id, newStatus);
      const updatedTickets = await dataService.getTickets();
      setTickets(updatedTickets);

      const ticket = updatedTickets.find(t => t.id === id);
      if (ticket) {
        addAlert('status', 'Status Atualizado', `${ticket.osNumber} movido para ${newStatus.replace('_', ' ')}`);
        if (selectedTicket?.id === id) {
          setSelectedTicket(ticket);
        }
      }
    } catch (err) {
      addAlert('error', 'Erro de Sincronização', 'Não foi possível salvar a alteração no banco de dados.');
    }
  };

  const handleUpdateProfile = async (updatedUser: User) => {
    await dataService.updateUser(updatedUser);
    setCurrentUser(updatedUser);
    addAlert('status', 'Perfil Atualizado', 'Suas informações foram salvas no banco de dados.');
  };

  const handleAddTicket = async (ticketData: Partial<Ticket>) => {
    const newTicket = {
      ...ticketData,
      status: TicketStatus.OPEN,
      requesterId: currentUser?.id || 'u-unknown'
    } as Ticket;
    
    await dataService.saveTicket(newTicket);
    const updated = await dataService.getTickets();
    setTickets(updated);
    setIsTicketFormOpen(false);
    addAlert('new', 'OS Gerada', `A ordem de serviço ${newTicket.osNumber} foi salva com sucesso.`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTab('dashboard');
  };

  if (!currentUser) {
    return <Login onLogin={setCurrentUser} />;
  }

  const userTickets = currentUser.role === Role.USER 
    ? tickets.filter(t => t.requesterId === currentUser.id)
    : tickets;

  const filteredTickets = userTickets.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.osNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-slate-50 print:bg-white relative">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        userRole={currentUser.role}
        onLogout={handleLogout}
      />

      <main className="flex-1 flex flex-col print:hidden pb-16">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative max-w-md w-full">
              <ICONS.Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Pesquisar OS ou Assunto..." 
                className="w-full bg-slate-100 border-none rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none font-medium"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-full border border-slate-100">
               <div className={`w-2 h-2 rounded-full ${dbStatus === 'connected' ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse`} />
               <span className="text-[9px] font-black uppercase text-slate-400 tracking-tighter">
                 DB: {dbStatus === 'connected' ? 'SQL ONLINE' : 'PORTABLE MODE'}
               </span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button 
              className="relative p-2 text-slate-500 hover:bg-slate-50 rounded-full transition-colors"
              onClick={() => setShowNotification(!showNotification)}
            >
              <ICONS.Bell size={20} />
              {alerts.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              )}
            </button>
            
            <div className="flex items-center gap-3 border-l pl-6 border-slate-200">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-800">{currentUser.name}</p>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                  {currentUser.id === 'u-master' ? 'System Administrator' : (currentUser.role === Role.USER ? 'Cliente' : currentUser.role)}
                </p>
              </div>
              <img src={currentUser.avatar} alt="User Avatar" className="w-9 h-9 rounded-full border border-slate-200 shadow-sm" />
            </div>
          </div>
        </header>

        <div className="p-6 md:p-8 flex-1">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                {activeTab === 'dashboard' ? 'Métricas & Painel' : 
                 activeTab === 'tickets' ? 'Central de Chamados' : 
                 activeTab === 'kanban' ? 'Fluxo Operacional (Kanban)' : 
                 activeTab === 'equipment' ? 'Gestão de Ativos' :
                 activeTab === 'system' ? 'Configurações de Core' :
                 activeTab === 'users' ? 'Usuários do Sistema' : 
                 activeTab === 'profile' ? 'Configurações de Perfil' : 'Administração'}
              </h2>
              <p className="text-slate-500 text-sm font-medium uppercase tracking-widest text-[10px] mt-1">Hospedagem cPanel • <span className="text-blue-600">V2.5.0-PRO</span></p>
            </div>
            
            {(activeTab === 'tickets' || activeTab === 'kanban') && (
              <button 
                onClick={() => setIsTicketFormOpen(true)}
                className="bg-slate-900 hover:bg-black text-white px-8 py-3 rounded-2xl flex items-center gap-2 font-black text-xs uppercase tracking-widest shadow-2xl transition-all transform hover:scale-[1.02]"
              >
                <ICONS.Plus size={18} /> Novo Chamado
              </button>
            )}
          </div>

          <div className="animate-fade-up">
            {activeTab === 'dashboard' && <Dashboard />}
            {activeTab === 'kanban' && <KanbanBoard tickets={filteredTickets} onUpdateStatus={updateTicketStatus} onSelectTicket={setSelectedTicket} />}
            {activeTab === 'users' && currentUser.role === Role.ADMIN && <UsersManagement />}
            {activeTab === 'reports' && currentUser.role === Role.ADMIN && <Reports />}
            {activeTab === 'settings' && currentUser.role === Role.ADMIN && <Settings />}
            {activeTab === 'units' && currentUser.role === Role.ADMIN && <UnitsManagement />}
            {activeTab === 'sectors' && currentUser.role === Role.ADMIN && <SectorsManagement />}
            {activeTab === 'problems' && currentUser.role === Role.ADMIN && <ProblemsManagement />}
            {activeTab === 'equipment' && (currentUser.role === Role.ADMIN || currentUser.role === Role.TECHNICIAN) && <EquipmentManagement />}
            {activeTab === 'system' && currentUser.role === Role.ADMIN && <SystemManagement />}
            {activeTab === 'profile' && <ProfileSettings user={currentUser} onUpdate={handleUpdateProfile} />}
            {activeTab === 'tickets' && (
              <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden animate-fade-scale">
                 <table className="w-full text-left">
                    <thead className="bg-slate-50/50 border-b border-slate-100">
                      <tr>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocolo</th>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Informações</th>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status Atual</th>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">SLA</th>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredTickets.map(ticket => (
                        <tr 
                          key={ticket.id} 
                          className="hover:bg-slate-50/50 transition-colors cursor-pointer group"
                          onClick={() => setSelectedTicket(ticket)}
                        >
                          <td className="px-8 py-5 whitespace-nowrap text-sm font-black text-blue-600 tracking-tighter">{ticket.osNumber}</td>
                          <td className="px-8 py-5">
                            <p className="text-sm font-bold text-slate-800">{ticket.title}</p>
                            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">{ticket.priority} • {new Date(ticket.createdAt).toLocaleDateString('pt-BR')}</p>
                          </td>
                          <td className="px-8 py-5 whitespace-nowrap">
                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                              ticket.status === TicketStatus.OPEN ? 'bg-slate-100 text-slate-600' :
                              ticket.status === TicketStatus.IN_PROGRESS ? 'bg-blue-100 text-blue-600' :
                              ticket.status === TicketStatus.RESOLVED ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                            }`}>
                              {ticket.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-8 py-5 whitespace-nowrap">
                             <div className="flex flex-col gap-1">
                                <div className="w-24 bg-slate-100 h-1 rounded-full overflow-hidden">
                                  <div className={`h-full ${ticket.priority === 'CRITICAL' ? 'bg-red-500 w-full' : 'bg-emerald-500 w-2/3'}`}></div>
                                </div>
                                <span className="text-[9px] font-bold text-slate-400 uppercase">Exp: {new Date(ticket.slaDeadline).toLocaleDateString('pt-BR')}</span>
                             </div>
                          </td>
                          <td className="px-8 py-5 whitespace-nowrap text-right">
                            <button className="text-slate-300 group-hover:text-blue-600 transition-all transform group-hover:scale-110">
                              <ICONS.ChevronRight size={20} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                 </table>
              </div>
            )}
          </div>
        </div>
        
        {/* Footer Global em todas as telas de dashboard */}
        <div className="text-center py-6 opacity-30 pointer-events-none">
          <h1 className="text-xs font-black text-slate-900 tracking-[0.3em] uppercase">
            ( Desenvolvido por Sidney Bezerra ) 2026
          </h1>
        </div>
      </main>

      {selectedTicket && (
        <TicketDetail 
          ticket={selectedTicket} 
          onClose={() => setSelectedTicket(null)}
          onUpdateStatus={updateTicketStatus}
          onAddMessage={(msg) => console.log('Log de Mensagem:', msg)}
        />
      )}

      {isTicketFormOpen && (
        <TicketForm 
          onClose={() => setIsTicketFormOpen(false)} 
          onSubmit={handleAddTicket} 
        />
      )}

      {showNotification && (
        <div className="fixed inset-y-0 right-0 w-80 bg-white shadow-3xl z-50 animate-slide-right border-l border-slate-100 flex flex-col print:hidden rounded-l-[40px]">
          <div className="p-8 border-b border-slate-50 flex items-center justify-between">
            <h3 className="font-black text-slate-800 uppercase tracking-widest text-xs">Eventos Recentes</h3>
            <button onClick={() => setShowNotification(false)} className="text-slate-300 hover:text-slate-900 transition-colors">
              <ICONS.X size={20} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {alerts.length > 0 ? (
              alerts.map(alert => (
                <div key={alert.id} className="p-5 rounded-3xl border border-slate-100 bg-slate-50/50 flex gap-3 transition-all hover:scale-[1.02]">
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                    alert.type === 'status' ? 'bg-blue-500 animate-pulse' : 
                    alert.type === 'new' ? 'bg-emerald-500' : 
                    alert.type === 'error' ? 'bg-red-500' : 'bg-purple-500'
                  }`}></div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-tight text-slate-900">{alert.title}</p>
                    <p className="text-[10px] mt-1 font-bold text-slate-500 leading-relaxed">{alert.description}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-24 opacity-20">
                <ICONS.Bell size={48} className="mx-auto mb-4" />
                <p className="text-[10px] font-black uppercase tracking-widest">Silêncio no sistema</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
