export type ChairColorTheme =
  | "blue"
  | "emerald"
  | "purple"
  | "amber"
  | "cyan"
  | "rose"
  | "indigo";

export type ChairOperationalStatus =
  | "READY"
  | "IN_CONSULTATION"
  | "AVAILABLE"
  | "PAUSED"
  | "OFFLINE";

export interface DentalChair {
  id: string;
  name: string;
  room: string;
  doctorName: string;
  doctorId?: string;
  specialty?: string;
  description?: string;
  colorTheme: ChairColorTheme;
  status: ChairOperationalStatus;
  isActive: boolean;
  isDefault?: boolean;
  sortOrder: number;
  currentApptId?: string | null;
  currentPatient?: string | null;
  currentToken?: number | null;
  currentService?: string | null;
  seenCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChairMutationInput {
  name: string;
  room: string;
  doctorName: string;
  doctorId?: string;
  specialty?: string;
  description?: string;
  colorTheme?: ChairColorTheme;
  status?: ChairOperationalStatus;
  isActive?: boolean;
  sortOrder?: number;
}
