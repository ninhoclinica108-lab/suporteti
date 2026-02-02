
import React from 'react';
import { 
  LayoutDashboard, 
  Ticket, 
  Kanban, 
  MessageSquare, 
  Users, 
  Settings, 
  LogOut, 
  Plus, 
  Search, 
  Bell, 
  Moon, 
  Sun,
  Camera,
  FileText,
  AlertCircle,
  Clock,
  CheckCircle2,
  ChevronRight,
  MoreVertical,
  Paperclip,
  Send,
  Download,
  Filter,
  Inbox,
  Printer,
  X,
  ArrowLeft,
  Building2,
  Layers,
  ShieldAlert,
  Monitor,
  Laptop,
  Cpu,
  History,
  ArrowUpRight,
  ArrowDownLeft,
  Database,
  Upload,
  HardDrive,
  Play
} from 'lucide-react';

export const ICONS = {
  Dashboard: LayoutDashboard,
  Ticket,
  Kanban,
  Chat: MessageSquare,
  Users,
  Settings,
  LogOut,
  Plus,
  Search,
  Bell,
  Moon,
  Sun,
  Camera,
  File: FileText,
  Alert: AlertCircle,
  Clock,
  Check: CheckCircle2,
  ChevronRight,
  More: MoreVertical,
  Paperclip,
  Send,
  Download,
  Filter,
  Inbox,
  Printer,
  X,
  ArrowLeft,
  Unit: Building2,
  Sector: Layers,
  Problem: ShieldAlert,
  Equipment: Laptop,
  Monitor: Monitor,
  Cpu: Cpu,
  History: History,
  Entry: ArrowDownLeft,
  Exit: ArrowUpRight,
  System: Database,
  Upload: Upload,
  Disk: HardDrive,
  Play: Play
};

export const COLORS = {
  primary: '#2563eb', // blue-600
  secondary: '#64748b', // slate-500
  success: '#10b981', // emerald-500
  warning: '#f59e0b', // amber-500
  danger: '#ef4444', // red-500
  info: '#06b6d4', // cyan-500
};

export const CATEGORIES = [
  { id: 'cat-1', name: 'Hardware', slaHours: 24 },
  { id: 'cat-2', name: 'Software', slaHours: 8 },
  { id: 'cat-3', name: 'Network', slaHours: 4 },
  { id: 'cat-4', name: 'Access Control', slaHours: 2 },
  { id: 'cat-5', name: 'Email', slaHours: 4 },
];
