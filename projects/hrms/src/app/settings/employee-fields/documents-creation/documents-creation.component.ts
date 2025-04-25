import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { ICreateSubDir, IFolders } from '../../../Interfaces/document.model';
import { DocumentService } from '../../../services/document/document.service';
import { LastValuePipe } from '../../../Pipes/last-value/last-value.pipe';
import { DateformatPipe } from '../../../Pipes/dateformat.pipe';
import { FormsModule, NgForm } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-documents-creation',
  imports: [
    LastValuePipe,
    DateformatPipe,
    FormsModule,
    TranslatePipe
  ],
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
  datafile:any
  file: any
  imageDirPath!: string
  Status: any
  @ViewChild('addSubDirModal') private readonly addSubModal!: NgbModal;
  @ViewChild('successhide') private readonly successhide!: NgbModal;
  @ViewChild('errorhide') private readonly errorhide!: NgbModal;

  
  constructor(
    private documentService:DocumentService,
    private modalService: NgbModal
  ) { }
  
  ngOnInit(): void {
    this.getMainFolders()
  }

  getMainFolders(dirPath?: string) {
    dirPath = dirPath ? dirPath : '/FusionDocuments';
    this.subscription = this.documentService.getMainFolders(dirPath)
    .subscribe({
      next: (data:any) => {
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

    if( folder.subfolders && folder.subfolders?.length>0) {
      this.selectedFolder = folder.subfolders as IFolders[] ;
    }else{
      this.selectedFolder = [] as IFolders[];
    }
    
    if (folder.isDirectory) {
      this.isMainfolderTouched = true;
    }
    console.log(this.selectedFolder);
    this.subDir.mainDir = mainFolderName;

  }


  getFolders(dirPath: string, folder: IFolders) {
    this.subscription = this.documentService.getMainFolders(dirPath)
      .subscribe({
        next: (data: any) => {
          folder.subfolders = data as IFolders[];
          folder.subfolders.forEach((subfolder: any) => {
            subfolder['isCompanyDir'] =
              subfolder.name.includes('Company Documents');
          });
        },
        error: (reason) => console.log(reason),
      });
  }

  openAddSubfoldersModal() {
    this.modalService.open(this.addSubModal, { centered: true });
  }
  createSubDirectory(f:NgForm){
    debugger
    console.log(this.subDir);
    
    this.subscription = this.documentService.createSubDirectorySubmit(this.subDir)
    .subscribe({
      next: (data: any) => {
        this.getMainFolders();
        this.dataSuccessMsg("Folder Created sucessfully")
      },
      error: (reason) => console.log(reason),
      complete: () => f.resetForm()
    });
  }


  onSelectDelete(data: IFolders) {
    if (data.isDirectory) {
      this.subscription = this.documentService.deleteDirectory(data.name)
        .subscribe({
          next: (data: any) => {
            this.dataSuccessMsg('Folder Deleted Sucessfully');
            this.getMainFolders();
          },
          error: (reason) => console.log(reason),
        });

    }
  }

  dataSuccessMsg(msg: string) {
    this.Status = msg;
    this.openmodel(this.successhide);
    setTimeout(() => {
      this.modalService.dismissAll();
    }, 2000);

  }

  openmodel(content: any) {
    this.modalService.open(content, { centered: true })
  }

  onClose(){
    this.modalService.dismissAll();
  }


  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  

}
