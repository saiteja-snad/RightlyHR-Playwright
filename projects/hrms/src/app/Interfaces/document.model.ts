export interface IFolders {
  isNotVisible: boolean;
  name: string;
  isDirectory: boolean;
  isCompanyDir?: boolean;
  lastModified: string;
  eTag: string;
  contentLength: number;
  owner: string;
  group: string;
  isEmpDir?:boolean;
  permissions: string;
  createdOn: string;
  expiresOn: string | null;
  encryptionScope: null;
  expanded?: boolean;
  subfolders?: IFolders[];
}

export interface ICreateSubDir {
  mainDir: string;
  subDirName: string;
}

export interface DocumentData {
  id: number;
  empId?: number;
  documentType?: string;
  referenceNumber?: string;
  submittedDate?: string;
  documentUrl?: string;
  status?: string;
  rejectedBy?: string;
  reason?: string;
  referenceId?: string;
}
