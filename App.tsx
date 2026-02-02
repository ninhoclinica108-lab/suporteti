
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
import { supabase, isSupabaseConfigured } from './services/supabase';

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

  // Monitorar Estado de Autenticação Supabase
  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        dataService.getCurrentUserProfile(session.user.id).then(user => {
          if (user) setCurrentUser(user);
        });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        dataService.getCurrentUserProfile(session.user.id).then(user => {
          if (user) setCurrentUser(user);
        });
      } else {
        setCurrentUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const initData = async () => {
      const isConnected = await dataService.checkConnection();
      setDbStatus(isConnected ? 'connected' : 'error');
      
      const ticketsData = await dataService.getTickets();
      setTickets(ticketsData);
    };
    if (currentUser) initData();
  }, [currentUser]);

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
        if (selectedTicket?.id === id) setSelectedTicket(ticket);
      }
    } catch (err) {
      addAlert('error', 'Erro Cloud', 'Falha ao sincronizar com Supabase.');
    }
  };

  const handleLogout = async () => {
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut();
    }
    setCurrentUser(null);
    setActiveTab('dashboard');
  };

  if (!currentUser) {
    return <Login onLogin={setCurrentUser} />;
  }

  const filteredTickets = tickets.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.osNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-slate-50 print:bg-white relative">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} userRole={currentUser.role} onLogout={handleLogout} />

      <main className="flex-1 flex flex-col print:hidden pb-16">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative max-w-md w-full">
              <ICONS.Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="text" placeholder="Pesquisar OS ou Assunto..." className="w-full bg-slate-100 border-none rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${dbStatus === 'connected' ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
               <div className={`w-2 h-2 rounded-full ${dbStatus === 'connected' ? 'bg-emerald-500' : 'bg-red-500'} animate-pulse`} />
               <span className="text-[9px] font-black uppercase text-slate-400">SUPABASE CLOUD</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button className="relative p-2 text-slate-500 hover:bg-slate-50 rounded-full" onClick={() => setShowNotification(!showNotification)}>
              <ICONS.Bell size={20} />
              {alerts.length > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>}
            </button>
            <div className="flex items-center gap-3 border-l pl-6 border-slate-200">
              <div className="text-right">
                <p className="text-sm font-bold text-slate-800">{currentUser.name}</p>
                <p className="text-[10px] text-slate-400 uppercase font-black">{currentUser.role}</p>
              </div>
              <img src={currentUser.avatar} alt="Avatar" className="w-9 h-9 rounded-full border border-slate-200" />
            </div>
          </div>
        </header>

        <div className="p-6 md:p-8 flex-1">
          <div className="animate-fade-up">
            {activeTab === 'dashboard' && <Dashboard />}
            {activeTab === 'kanban' && <KanbanBoard tickets={filteredTickets} onUpdateStatus={updateTicketStatus} onSelectTicket={setSelectedTicket} />}
            {activeTab === 'tickets' && (
               <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
                  <table className="w-full text-left">
                     <thead className="bg-slate-50/50 border-b border-slate-100">
                       <tr>
                         <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocolo</th>
                         <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Informações</th>
                         <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                         <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ação</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-50">
                       {filteredTickets.map(ticket => (
                         <tr key={ticket.id} className="hover:bg-slate-50/50 transition-colors cursor-pointer" onClick={() => setSelectedTicket(ticket)}>
                           <td className="px-8 py-5 text-sm font-black text-blue-600">{ticket.osNumber}</td>
                           <td className="px-8 py-5">
                             <p className="text-sm font-bold text-slate-800">{ticket.title}</p>
                             <p className="text-[10px] text-slate-400 uppercase font-black">{ticket.priority}</p>
                           </td>
                           <td className="px-8 py-5">
                             <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                               ticket.status === TicketStatus.OPEN ? 'bg-slate-100 text-slate-600' : 
                               ticket.status === TicketStatus.IN_PROGRESS ? 'bg-blue-100 text-blue-600' :
                               ticket.status === TicketStatus.RESOLVED ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                             }`}>{ticket.status.replace('_', ' ')}</span>
                           </td>
                           <td className="px-8 py-5 text-right"><ICONS.ChevronRight size={18} className="text-slate-300 ml-auto" /></td>
                         </tr>
                       ))}
                       {filteredTickets.length === 0 && (
                         <tr>
                           <td colSpan={4} className="px-8 py-20 text-center text-slate-400 font-medium italic">Nenhum chamado encontrado.</td>
                         </tr>
                       )}
                     </tbody>
                  </table>
               </div>
            )}
            {activeTab === 'profile' && <ProfileSettings user={currentUser} onUpdate={dataService.updateUser} />}
            {activeTab === 'users' && currentUser.role === Role.ADMIN && <UsersManagement />}
            {activeTab === 'reports' && currentUser.role === Role.ADMIN && <Reports />}
            {activeTab === 'settings' && currentUser.role === Role.ADMIN && <Settings />}
            {activeTab === 'units' && currentUser.role === Role.ADMIN && <UnitsManagement />}
            {activeTab === 'sectors' && currentUser.role === Role.ADMIN && <SectorsManagement />}
            {activeTab === 'problems' && currentUser.role === Role.ADMIN && <ProblemsManagement />}
            {activeTab === 'equipment' && (currentUser.role === Role.ADMIN || currentUser.role === Role.TECHNICIAN) && <EquipmentManagement />}
            {activeTab === 'system' && currentUser.role === Role.ADMIN && <SystemManagement />}
          </div>
        </div>
        
        <div className="text-center py-6 opacity-30 pointer-events-none mt-auto">
          <h1 className="text-xs font-black text-slate-900 tracking-[0.3em] uppercase">
            ( Desenvolvido por Sidney Bezerra ) 2026
          </h1>
        </div>
      </main>

      {selectedTicket && <TicketDetail ticket={selectedTicket} onClose={() => setSelectedTicket(null)} onUpdateStatus={updateTicketStatus} onAddMessage={() => {}} />}
      {isTicketFormOpen && <TicketForm onClose={() => setIsTicketFormOpen(false)} onSubmit={async (t) => {
        await dataService.saveTicket(t as Ticket);
        const updated = await dataService.getTickets();
        setTickets(updated);
        setIsTicketFormOpen(false);
        addAlert('new', 'OS Gerada', `A ordem de serviço ${t.osNumber} foi aberta.`);
      }} />}
    </div>
  );
};

export default App;
