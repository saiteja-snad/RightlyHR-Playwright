


export interface IAssetAllocation {
    id?: number;
    assetId: number;
    employeeId: number;
    allocatedDate: any;
    assetDataId?: number;
    allocatedComments?: string;
    returnDate?: any;
    returnComments?: string;
    status: string;
    createdAt?: string;
    createdBy?: number;
    meta?: string;
  }
  
  export interface IAssetid {
    id: number;
    assetID: string;
    isDeleted: boolean;
    status: string;
  }
  export interface IReAssetAllocation {
    id?: number;
    assetId: number;
    employeeId: number;
    allocatedDate?: string;
    allocatedComments?: string;
    returnDate: any;
    returnComments?: string;
    status: string;
    createdAt?: string;
    createdBy?: number;
    meta?: string;
  }
  export interface IVendor {
    id: number;
    name: string;
    status: 'Active' | 'Inactive';
    isDeleted: boolean;
    createdAt: string;
    createdBy: number;
    meta: string;
  }
  
  export interface ICategory {
    id: number;
    name: string;
    parentId: number;
    isDeleted: boolean;
    createdAt: string;
    createdBy: number;
    meta: string;
  }
  
  export interface IAssetTransition {
    id: number;
    assetId: number;
    assetType: string;
    employeeId: number;
    allocatedDate: string; // or Date if you're working with Date objects
    allocatedComments: string;
    returnDate?: string; // Optional if it can be null
    returnComments?: string; // Optional if it can be null
    status: string;
    createdAt: string; // or Date
    createdBy: number;
    meta: string;
    isDeleted: boolean;
    handoverDocument: string;
    returnDocument: string;
  }
  
  export interface IAssetWarrantyVM {
    id?: number;
    assetId?: number;
    warrantyNumber?: string;
    warrantyStartDate: string;
    warrantyExpiryDate: string;
    createdAt?: string;
    createdBy?: number;
    meta?: string;
  }
  export interface IAssignedTo {
    firstName: string;
    middleName: string;
    lastName: string;
    emailaddress: string;
    fusionEmpId: string;
    employeeId: number;
  }
  
  export interface ITransaction {
    id: number;
    assetId: number;
    employeeId: number;
    allocatedDate: string; // ISO date string
    status: string;
    isDeleted: boolean;
    assetWarranties: IAssetWarrantyVM[];
    assignedTo: IAssignedTo;
  }
  export interface IemployeeDetailslocation {
    employeeId: number;
    employeeName: string;
    // Other employee fields if needed
  }
  export interface IAsset {
    id?: number;
    assetType?: string;
    assetModel: string;
    assetCategory: string;
    assetSubCategory: string;
    identificationNumber: string;
    serialNumber: string;
    status: string;
    vendorId: number;
    purchaseDate: string;
    createdAt?: string;
    createdBy?: number;
    meta?: string;
    sublocationName?: string,
    locationName?: string
    assetWarranty: IAssetWarrantyVM;
    comments?: string;
    transactions?: ITransaction[];
    assignedTo?: IAssignedTo;
  }
  export interface IAssignedTo {
    firstName: string;
    lastName: string;
    emailaddress: string;
    fusionEmpId: string;
    employeeId: number;
    transactionId: number;
    assetIdName: string
  }
  export interface AssetMaster {
    id: number;
    assetModel: string;
    assetCategory: string;
    assetSubCategory: string;
    identificationNumber: string;
    serialNumber: string;
    status: string;
    vendorId: number;
    vendorName: string;
    purchaseDate: string;
    createdAt: string;
    createdBy: number;
    comments: string;
  }
  
  // Interface for Assigned To details
  export interface AssignedTo {
    firstName: string;
    lastName: string;
    emailaddress: string;
    fusionEmpId: string;
    employeeId: number;
    transactionId: number;
  }
  
  export interface Employeedata {
    employeeId: number
    employeeName: string
  }
  // Interface for Asset Transaction
  export interface AssetTransaction {
  
    id: number;
    assetId: number;
    employeeId: number;
    firstName: string;
    lastName: string;
    allocatedDate: string;
    fusionEmpId: string;
    returnDate?: string;
    status: string;
    assetIdName?: string;
    assetMaster: AssetMaster[];
    assignedTo?: AssignedTo;
    returnComments?: string
    transferHistory: TransferHistory[];
  }
  export interface TransferHistory {
    assetId: number;
    fromLocationId: number;
    fromlocationname: string;
    fromSubLocationId: number;
    fromsublocationname: string;
    locationId: number;
    locationname: string;
    subLocationId: number;
    sublocationname: string;
    // Add more fields here as needed
  }
  
  export interface Vendor {
    id: number;
    name: string;
    contactnumber: number;
    secondaryContactNumber?:any
    emailaddress: string;
    address: string;
    status?: string;
    isDeleted?: boolean;
    createdAt: string;
    createdBy: number;
    meta: string;
}
export interface AssetCategory {
    id?: number;
    name: string;
    parentId?: number;
    categoryContactNumber?:any
    isDeleted: boolean;
    createdAt: string; 
    createdBy: number;
    meta: string;
}