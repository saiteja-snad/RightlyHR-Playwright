import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { ICreateSubDir, IFolders } from '../../../Interfaces/document.model';
import { DocumentService } from '../../../services/document/document.service';
import { LastValuePipe } from '../../../Pipes/last-value/last-value.pipe';
import { DateformatPipe } from '../../../Pipes/dateformat.pipe';
import { FormsModule, NgForm } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslatePipe } from '@ngx-translate/core';
import { SettingsEmployeeFieldsModuleTabsComponent } from "../../../shared/settings-tabs/settings-employee-fields-module-tabs/settings-employee-fields-module-tabs.component";
import { OpenModalService } from '../../../services/open-modal.service';
@Component({
  selector: 'app-documents-creation',
  imports: [LastValuePipe, DateformatPipe, FormsModule, TranslatePipe, SettingsEmployeeFieldsModuleTabsComponent],
  templateUrl: './documents-creation.component.html',
  styleUrl: './documents-creation.component.scss'
})

export class DocumentsCreationComponent implements OnInit, OnDestroy {
  subscription!: Subscription;
  folders = [] as IFolders[];
  selectedFile = {} as IFolders;
  selectedFolder = [] as IFolders[];
  mainDir = {} as ICreateSubDir;
  subDir = {} as ICreateSubDir;
  isMainfolderTouched: boolean = false;
  searchfolder!: string;
  Files = [] as IFolders[]
  datafile: any
  file: any
  imageDirPath!: string
  Status: any

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

  openmodel(content: any) {
    this.modalService.open(content, { centered: true })
  }

  createSubDirectory(f: NgForm) {
    this.subscription = this.documentService.createSubDirectorySubmit(this.subDir).subscribe({
      next: (data: any) => {
        this.getMainFolders();
        this.modalService.dismissAll();
        this.conformationPopup.openSuccessModal("Folder Created sucessfully");
      },
      error: (reason) => console.log(reason),
      complete: () => f.resetForm()
    });
  }

  onSelectDelete(data: IFolders) {
    if (data.isDirectory) {
      this.subscription = this.documentService.deleteDirectory(data.name).subscribe({
        next: (data: any) => {
          this.modalService.dismissAll();
          this.conformationPopup.openSuccessModal("Folder Deleted Sucessfully");
          this.getMainFolders();
        },
        error: (reason) => console.log(reason),
      });
    }
  }

  onClose() {
    this.modalService.dismissAll();
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}