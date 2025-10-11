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
  createdAt: string;
  updatedAt: string;
}

export interface ClientsApiResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: Client[];
}