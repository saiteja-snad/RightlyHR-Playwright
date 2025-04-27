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
