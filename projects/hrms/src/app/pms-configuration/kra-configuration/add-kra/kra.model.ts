// src/app/pms-configuration/kra-configuration/kra.model.ts

export interface KraCategory {
  categoryId?: number;
  categoryName: string;
  categoryCode: string;
  description: string;
  status?: string;
  effectiveFrom?: string;
  createdBy?: number;
  createdOn?: string;
  updatedBy?: number;
  updatedOn?: string;
}

export interface KraCategoryResponse {
  items: KraCategory[];
  totalCount: number;
}

// ← This line makes it a valid module
export default {};
