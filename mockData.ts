
import { TicketStatus, TicketPriority, Role, Ticket, ChatMessage, TicketHistory, User, UserStatus, Unit, Sector, PredefinedProblem, Equipment, EquipmentType, EquipmentStatus, EquipmentMovement } from './types';

// O sistema inicia sem dados pré-carregados para produção.
// O Master deve configurar Unidades e Setores no primeiro login.

export const MOCK_UNITS: Unit[] = [];
export const MOCK_SECTORS: Sector[] = [];
export const MOCK_PROBLEMS: PredefinedProblem[] = [];
export const MOCK_EQUIPMENTS: Equipment[] = [];
export const MOCK_EQUIPMENT_MOVEMENTS: EquipmentMovement[] = [];
export const MOCK_USERS: User[] = [];
export const TICKETS: Ticket[] = [];
export const INITIAL_CHAT_MESSAGES: ChatMessage[] = [];
export const INITIAL_HISTORY: TicketHistory[] = [];

// Fallback para evitar quebras em componentes que dependem de um usuário logado
export const CURRENT_USER: User = {
  id: 'guest',
  name: 'Visitante',
  email: 'visitante@nextti.com',
  role: Role.USER,
  companyId: 'comp-1',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Guest',
  status: UserStatus.ACTIVE,
};
