import { Injectable } from '@angular/core';
import { HttpService } from '../http.service';
import { ICreateSubDir, IFolders } from '../../Interfaces/document.model';

@Injectable({
  providedIn: 'root',
})
export class DocumentService {
  constructor(private http: HttpService) {}

  getMainFolders(dirPath: string) {
    return this.http.getDataWithQuery('FileSystem/Folders', dirPath);
  }

  createSubDirectorySubmit(data: ICreateSubDir) {
   
    return this.http.postdata('FileSystem/subdirectories', data);
  }
  deleteDirectory(directoryName:string) {
    let sdata = {
      directoryPath: directoryName,
    };
    return this.http.postdata('FileSystem/deletedirectories', sdata);
  }
}
