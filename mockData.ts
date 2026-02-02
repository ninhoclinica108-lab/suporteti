
import { TicketStatus, TicketPriority, Role, Ticket, ChatMessage, TicketHistory, User, UserStatus, Unit, Sector, PredefinedProblem, Equipment, EquipmentType, EquipmentStatus, EquipmentMovement } from './types';

// O usuário master é definido logicamente no Login.tsx
// Esta base de dados inicia vazia para produção.

// FIX: Added CURRENT_USER export to resolve import errors in TicketDetail and TicketForm
export const CURRENT_USER: User = {
  id: 'u-master',
  name: 'TI MASTER',
  email: 'ti@master.com.br',
  role: Role.ADMIN,
  companyId: 'comp-master',
  avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=MasterAdmin&backgroundColor=0f172a',
  status: UserStatus.ACTIVE,
};

export const MOCK_UNITS: Unit[] = [];

export const MOCK_SECTORS: Sector[] = [];

export const MOCK_PROBLEMS: PredefinedProblem[] = [];

export const MOCK_EQUIPMENTS: Equipment[] = [];

export const MOCK_EQUIPMENT_MOVEMENTS: EquipmentMovement[] = [];

export const MOCK_USERS: User[] = [];

export const TICKETS: Ticket[] = [];

export const INITIAL_CHAT_MESSAGES: ChatMessage[] = [];

export const INITIAL_HISTORY: TicketHistory[] = [];
