import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { DocumentService } from '../../../services/document/document.service';
import { LastValuePipe } from '../../../Pipes/last-value/last-value.pipe';
import { DateformatPipe } from '../../../Pipes/dateformat.pipe';
import { FormsModule, NgForm } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslatePipe } from '@ngx-translate/core';
import { SettingsEmployeeFieldsModuleTabsComponent } from "../../../shared/settings-tabs/settings-employee-fields-module-tabs/settings-employee-fields-module-tabs.component";
import { OpenModalService } from '../../../services/open-modal.service';
import { ICreateSubDir, IFolders } from '../../../Interfaces/document.model';
import { CommonModule } from '@angular/common';
import { DataLoaderContentComponent } from "../../../shared/data-loader-content/data-loader-content.component";
import { FormValidationsService } from '../../../services/form-validations.service';
import { NoDataFoundComponent } from '../../../shared/no-data-found/no-data-found.component';
@Component({
  selector: 'app-documents-creation',
  imports: [LastValuePipe, DateformatPipe, FormsModule, TranslatePipe, SettingsEmployeeFieldsModuleTabsComponent, CommonModule, DataLoaderContentComponent, NoDataFoundComponent],
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
  selectedMainFolder ={} as IFolders;
  dataLoad= false;


  constructor(private documentService: DocumentService, private modalService: NgbModal, private conformationPopup: OpenModalService,
    public formValidations: FormValidationsService
  ) { }

  ngOnInit(): void {
    this.getMainFolders()
  }

  getMainFolders(dirPath?: string, previousSelectedFolder?: IFolders) {
    dirPath = dirPath ? dirPath : '/FusionDocuments';
    this.dataLoad = true;
    const previousSelectedFolderName = previousSelectedFolder?.name;
    this.subscription = this.documentService.getMainFolders(dirPath).subscribe({
      next: (data: any) => {
        this.folders = data as IFolders[];
        this.folders.forEach((folder: any) => {
          folder.expanded = false;
          this.getFolders(folder.name, folder);
        });

        setTimeout(() => {
          if (this.folders.length > 0) {
            let folderToSelect = this.folders.find(f => f.name === previousSelectedFolderName);
            if (!folderToSelect) {
              folderToSelect = this.folders[0];
            }
            this.selectedMainFolder = folderToSelect;
            this.dataLoad = false;
            this.onFolderSelectded(folderToSelect, folderToSelect.name);
          } else {
            this.dataLoad = false;
          }
        }, 100);
        this.dataLoad = false;
      },
      error: (error) => {
        this.dataLoad = false;
        console.error(error);
      },
    });
  }

  onFolderSelectded(folder: IFolders | undefined, mainFolderName: string) {
    console.log(folder,mainFolderName);
    
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
    const currentSelectedFolder = this.selectedMainFolder;
    this.subscription = this.documentService.createSubDirectorySubmit(this.subDir).subscribe({
      next: (data: any) => {
        this.getMainFolders(undefined, currentSelectedFolder);
        this.modalService.dismissAll();
        this.conformationPopup.openSuccessModal("Sub Folder created sucessfully");
      },
      error: (reason) => console.log(reason),
      complete: () => f.resetForm()
    });
  }

  onSelectDelete(data: IFolders) {
    const currentSelectedFolder = this.selectedMainFolder;
    if (data.isDirectory) {
      this.subscription = this.documentService.deleteDirectory(data.name).subscribe({
        next: (data: any) => {
          this.modalService.dismissAll();
          this.conformationPopup.openSuccessModal("Sub Folder deleted sucessfully");
          this.getMainFolders(undefined, currentSelectedFolder);
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