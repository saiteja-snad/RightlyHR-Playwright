import { Component } from '@angular/core';
import { DocumentService } from '../../services/document/document.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { OpenModalService } from '../../services/open-modal.service';
import { ICreateSubDir, IFolders } from '../../Interfaces/document.model';
import { Subscription } from 'rxjs';
import { LastValuePipe } from '../../Pipes/last-value/last-value.pipe';
import { FormsModule } from '@angular/forms';
import { DateformatPipe } from '../../Pipes/dateformat.pipe';
import { TranslatePipe } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-documents',
  imports: [LastValuePipe, DateformatPipe, FormsModule,TranslatePipe,CommonModule],
  templateUrl: './documents.component.html',
  styleUrl: './documents.component.scss'
})
export class DocumentsComponent {
 subscription!: Subscription;
 selectedMainFolder ={} as IFolders
 isMainfolderTouched: boolean = false;
  folders = [] as IFolders[];
  selectedFile = {} as IFolders;
  selectedFolder = [] as IFolders[];
  mainDir = {} as ICreateSubDir;
  
  subDir = {} as ICreateSubDir;
  constructor(private documentService: DocumentService, private modalService: NgbModal, private conformationPopup: OpenModalService) { }

  ngOnInit(): void {
    this.getMainFolders()
  }
 getMainFolders(dirPath?: string) {
    dirPath = dirPath ? dirPath : '/FusionDocuments';
    this.subscription = this.documentService.getMainFolders(dirPath).subscribe({
      next: (data: any) => {
        this.folders = data as IFolders[];
        this.folders.forEach((folder: any) => {
          folder.expanded = false;
          this.getFolders(folder.name, folder);
        });
        this.selectedFolder = this.folders[0]['subfolders'] as IFolders[];
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  getFolders(dirPath: string, folder: IFolders) {
    this.subscription = this.documentService.getMainFolders(dirPath).subscribe({
      next: (data: any) => {
        folder.subfolders = data as IFolders[];
        folder.subfolders.forEach((subfolder: any) => {
          subfolder['isCompanyDir'] = subfolder.name.includes('Company Documents');
        });
      },
      error: (reason) => console.log(reason),
    });
  }
  
  onFolderSelectded(folder: IFolders | undefined, mainFolderName: string) {
    if (!folder) {
      return;
    }
    if (folder.subfolders && folder.subfolders?.length > 0) {
      this.selectedFolder = folder.subfolders as IFolders[];
    } else {
      this.selectedFolder = [] as IFolders[];
    }
    if (folder.isDirectory) {
      this.isMainfolderTouched = true;
    }
    this.subDir.mainDir = mainFolderName;
    this.selectedMainFolder = folder;
  }

 

}
