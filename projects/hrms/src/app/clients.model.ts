export interface Client {
  clientId: number;
  clientName: string;
  taxId: string;
  websiteUrl: string;
  industryType: string;
  logoPath: string;
  address: string;
  status: string;
  overtimeEligibile: boolean;
  billable: boolean;
  weekendWorkAllowed: boolean;

  createdBy: {
    id: number;
    name: string;
  };
  updatedBy: {
    id: number;
    name: string;
  };

  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string

  contact: {
    contactId: number;
    entityRefId: number;
    name: string;
    email: string;
    phoneNumber: string;
    phoneCountryCode: string;
    phoneDialCode: string;
    role: string;
    primaryContact: boolean;
    active: boolean;
    createdAt: string;
    updatedAt: string;
  };

  
}

export interface Project {
  projectId: number;
  projectName: string;
  startDate?: string | null;
  endDate?: string | null;
  status?: string | null;
  role?: string | null;
  isWeekendAllowed?: boolean;
  isOverTimeAllowed?: boolean;
  isBillable?: boolean;
  isNoClientProject?: boolean;
}

export interface ClientData {
  clientId: number;
  clientName: string;

  // 👇 Add this line
  projects?: Project[];
}


