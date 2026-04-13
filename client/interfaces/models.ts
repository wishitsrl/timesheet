export interface User {
  id: string;
  email: string;
  fullName: string;
  firstName: string;
  lastName: string;
  role: 'USER' | 'ADMIN';
  isActive: boolean;
  accessToken: string;
  createdAt: string;
}

export interface Timesheet {
  email: string;
  data: string; // Formato YYYY-MM-DD consigliato
  presenza: boolean;
  ferie: boolean;
  malattia: boolean;
  giorni104: boolean;
  permessi: string;
  permessiRol: string;
  certificato: string;
  straordinari: string;
  note: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginatedBandi {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  data: Timesheet[];
}

export interface PaginatedUsers {
  total: number;
  page: number;
  limit: number;
  pages: number;
  users: User[];
}

export interface InserimentoProps {
  onAddTimesheet?: (bando: Partial<Timesheet>) => void;
  onUpdateTimesheet?: (id: string, bando: Partial<Timesheet>) => void;
  timesheetDaModificare?: Timesheet | null;
  onClose?: () => void;
}