export interface Team {
  id: string;
  name: string;
  preferredSlots?: string[];
}

export interface Slot {
  id: string;
  venue: string;
  time: string;
  assignedTeam?: string;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export interface TableProps {
  data: any[];
  columns: Column[];
  onRowClick?: (row: any) => void;
}

export interface Column {
  key: string;
  label: string;
}
