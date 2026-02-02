
export enum Role {
  ADMIN = 'ADMIN',
  TECHNICIAN = 'TECHNICIAN',
  USER = 'USER'
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE'
}

export enum TicketStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  PENDING = 'PENDING',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED'
}

export enum TicketPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export enum EquipmentStatus {
  AVAILABLE = 'AVAILABLE',
  LENT = 'LENT',
  MAINTENANCE = 'MAINTENANCE',
  DISCARDED = 'DISCARDED'
}

export enum EquipmentType {
  LAPTOP = 'LAPTOP',
  MONITOR = 'MONITOR',
  PERIPHERAL = 'PERIPHERAL',
  NETWORK = 'NETWORK',
  OTHER = 'OTHER'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  companyId: string;
  avatar: string;
  status: UserStatus;
  lastLogin?: string;
  unitId?: string;
  sectorId?: string;
}

export interface Unit {
  id: string;
  name: string;
  address?: string;
}

export interface Sector {
  id: string;
  name: string;
  unitId: string;
}

export interface Equipment {
  id: string;
  name: string;
  serialNumber: string;
  type: EquipmentType;
  status: EquipmentStatus;
  assignedToUserId?: string;
  assignedToUserName?: string;
  unitId: string;
  sectorId: string;
  purchaseDate: string;
}

export interface EquipmentMovement {
  id: string;
  equipmentId: string;
  type: 'LEND' | 'RETURN' | 'ENTRY' | 'EXIT';
  userId: string;
  userName: string;
  targetUserId?: string;
  targetUserName?: string;
  timestamp: string;
  notes?: string;
}

export interface Ticket {
  id: string;
  osNumber: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  categoryId: string;
  unitId: string;
  sectorId: string;
  problemId?: string;
  requesterId: string;
  technicianId?: string;
  companyId: string;
  createdAt: string;
  updatedAt: string;
  slaDeadline: string;
  solution?: string;
}

export interface ChatMessage {
  id: string;
  ticketId: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  type: 'text' | 'image' | 'system';
}

export interface TicketHistory {
  id: string;
  ticketId: string;
  userId: string;
  userName: string;
  action: string;
  timestamp: string;
}

export interface PredefinedProblem {
  id: string;
  title: string;
  categoryId: string;
  defaultPriority: TicketPriority;
}
