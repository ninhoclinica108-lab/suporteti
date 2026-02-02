
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

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isTicketFormOpen, setIsTicketFormOpen] = useState(false);
  const [dbStatus, setDbStatus] = useState<'connected' | 'portable' | 'error'>('portable');

  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    // Persistência de Sessão Supabase
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
    const loadData = async () => {
      const isConnected = await dataService.checkConnection();
      setDbStatus(isConnected ? 'connected' : 'error');
      
      const data = await dataService.getTickets();
      setTickets(data);
    };

    if (currentUser) loadData();
  }, [currentUser]);

  const updateTicketStatus = async (id: string, newStatus: TicketStatus) => {
    await dataService.updateTicketStatus(id, newStatus);
    const updated = await dataService.getTickets();
    setTickets(updated);
    if (selectedTicket?.id === id) {
      setSelectedTicket(updated.find(t => t.id === id) || null);
    }
  };

  const handleLogout = async () => {
    if (isSupabaseConfigured()) await supabase.auth.signOut();
    setCurrentUser(null);
    setActiveTab('dashboard');
  };

  if (!currentUser) return <Login onLogin={setCurrentUser} />;

  return (
    <div className="flex min-h-screen bg-[#f8fafc] font-sans selection:bg-blue-100">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} userRole={currentUser.role} onLogout={handleLogout} />

      <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-10 sticky top-0 z-20">
          <div className="flex items-center gap-6">
            <h2 className="text-xl font-black text-slate-800 tracking-tighter uppercase italic">{activeTab}</h2>
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${dbStatus === 'connected' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
              <div className={`w-2 h-2 rounded-full ${dbStatus === 'connected' ? 'bg-emerald-500' : 'bg-slate-300'} animate-pulse`} />
              <span className="text-[9px] font-black tracking-widest">CLOUD ENGINE</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button onClick={() => setIsTicketFormOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg shadow-blue-500/20">
              <ICONS.Plus size={16}/> Abrir Chamado
            </button>
            <div className="h-8 w-px bg-slate-200 mx-2" />
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-black text-slate-800 uppercase">{currentUser.name}</p>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{currentUser.role}</p>
              </div>
              <img src={currentUser.avatar} className="w-10 h-10 rounded-2xl border-2 border-slate-100 shadow-sm" alt="Avatar" />
            </div>
          </div>
        </header>

        <div className="p-10 flex-1 animate-fade-up">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'kanban' && <KanbanBoard tickets={tickets} onUpdateStatus={updateTicketStatus} onSelectTicket={setSelectedTicket} />}
          {activeTab === 'tickets' && (
            <div className="bg-white rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">OS</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Assunto</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ver</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {tickets.map(t => (
                    <tr key={t.id} onClick={() => setSelectedTicket(t)} className="hover:bg-slate-50/80 transition-colors cursor-pointer group">
                      <td className="px-8 py-6 text-sm font-black text-blue-600 tracking-tighter">{t.osNumber}</td>
                      <td className="px-8 py-6">
                        <p className="text-sm font-bold text-slate-800">{t.title}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">{t.priority}</p>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                          t.status === TicketStatus.OPEN ? 'bg-slate-100 text-slate-500' : 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                        }`}>{t.status.replace('_', ' ')}</span>
                      </td>
                      <td className="px-8 py-6 text-right"><ICONS.ChevronRight size={18} className="ml-auto text-slate-300 group-hover:text-blue-600 transition-colors" /></td>
                    </tr>
                  ))}
                  {tickets.length === 0 && (
                    <tr><td colSpan={4} className="py-20 text-center text-slate-400 font-bold italic opacity-50">Nenhum chamado pendente no momento.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
          {activeTab === 'units' && <UnitsManagement />}
          {activeTab === 'sectors' && <SectorsManagement />}
          {activeTab === 'problems' && <ProblemsManagement />}
          {activeTab === 'users' && <UsersManagement />}
          {activeTab === 'equipment' && <EquipmentManagement />}
          {activeTab === 'reports' && <Reports />}
          {activeTab === 'system' && <SystemManagement />}
          {activeTab === 'profile' && <ProfileSettings user={currentUser} onUpdate={dataService.updateUser} />}
        </div>

        <footer className="py-8 text-center opacity-30 mt-auto border-t border-slate-200/50">
          <h1 className="text-[10px] font-black text-slate-900 tracking-[0.4em] uppercase">
            ( Desenvolvido por Sidney Bezerra ) 2026
          </h1>
        </footer>
      </main>

      {selectedTicket && <TicketDetail ticket={selectedTicket} onClose={() => setSelectedTicket(null)} onUpdateStatus={updateTicketStatus} onAddMessage={() => {}} />}
      {isTicketFormOpen && <TicketForm onClose={() => setIsTicketFormOpen(false)} onSubmit={async (t) => {
        await dataService.saveTicket(t as Ticket);
        const data = await dataService.getTickets();
        setTickets(data);
        setIsTicketFormOpen(false);
      }} />}
    </div>
  );
};

export default App;
