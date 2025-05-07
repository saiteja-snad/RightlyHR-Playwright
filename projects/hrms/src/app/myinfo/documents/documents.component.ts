import { Component, SimpleChanges } from '@angular/core';
import { DocumentService } from '../../services/document/document.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { OpenModalService } from '../../services/open-modal.service';
import { ICreateSubDir, IFolders } from '../../Interfaces/document.model';
import { Subscription } from 'rxjs';
import { LastValuePipe } from '../../Pipes/last-value/last-value.pipe';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DateformatPipe } from '../../Pipes/dateformat.pipe';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { HttpService } from '../../services/http.service';
import { FileSizePipe } from "../../Pipes/file-size.pipe";
import { NoDataFoundComponent } from "../../shared/no-data-found/no-data-found.component";


@Component({
  selector: 'app-documents',
  imports: [LastValuePipe, DateformatPipe, ReactiveFormsModule, FormsModule, TranslateModule, CommonModule, FileSizePipe, NoDataFoundComponent],
  templateUrl: './documents.component.html',
  styleUrl: './documents.component.scss'
})
export class DocumentsComponent {
  subscription!: Subscription;
  spinnerLoader=false;
  selectedMainFolder = {} as IFolders
  isMainfolderTouched: boolean = false;
  folders = [] as IFolders[];
  selectedFile !: any;
  selectedFolder = [] as IFolders[];
  mainDir = {} as ICreateSubDir;
  Files = [] as IFolders[];
  empdata: any;
  searchfolder!: string;
  uploadfrom!: FormGroup;
  file: any;
  showUploadIcon: boolean = false;
  subDir = {} as ICreateSubDir;
  constructor(private documentService: DocumentService, private modalService: NgbModal, private conformationPopup: OpenModalService, private fb: FormBuilder, private http: HttpService) { }

  ngOnInit(): void {
    this.empdata = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    this.getMainFolders()
    this.initializejobForm();

  }
  initializejobForm(): void {
    this.uploadfrom = this.fb.group({
      filename: ['',Validators.required],
   
    });
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

  
  toggleFolder(folder: any): void {
    // Collapse all other folders
    this.folders.forEach((f) => {
      if (f !== folder) {
        f.expanded = false; // Collapse other folders
      }
    });
  
    folder.expanded = !folder.expanded;
    this.selectedMainFolder = folder;
    if (!folder.subfolders || folder.subfolders.length === 0) {
      this.Files=[]// or however you're using getVisibleFiles
      this.selectedFile=null
    }
   
  }
  onSubFolderSelected(subFolder: any): void {
    this.selectedFile = subFolder;
    console.log('Selected Subfolder:', subFolder);
    if (subFolder.isDirectory) {
      this.getAllFiles();
    } else {
      this.Files = [] as IFolders[];
    }
  }
  getVisibleFiles() {
    return this.Files.filter(file => file && !file.isNotVisible);
  }

  getAllFiles() {
    if (!this.selectedFile.isEmpDir) {
      this.subscription = this.http
        .getDataWithQuery('FileSystem/Files',  `${this.selectedFile.name}/${this.empdata.employeeId}`)
        .subscribe({
          next: (data: any) => {
            console.log(data);
            this.Files = data as IFolders[];
          },
          error: (err: any) => {
            this.Files = [];
          },
        });
    } else {
      this.subscription = this.http
        .getDataWithQuery(
          'FileSystem/Files',
          `${this.selectedFile.name}/${this.empdata.employeeId}`
        )
        .subscribe({
          next: (data: any) => {
            console.log(data);
            this.Files = data as IFolders[];
          },
          error: (err: any) => {
            console.error(err);
            this.Files = [];

          },
        });
    }
  }

  openModal(content: any) {
    this.modalService.open(content, {
      centered: true,
      backdrop: 'static',
    });
  }
  
  filechange(event: any) {
    this.file = event.target.files[0];
    if ( this.file) {
      const fileSizeInMB = this.file.size / (1024 * 1024);
      if (fileSizeInMB > 25) {
        this.file = null;
        this.conformationPopup.openErrorModal('The file size should be less than 25MB.');
        this.uploadfrom.get('filename')?.reset();
        this.uploadfrom.get('filename')?.markAsUntouched();
        
        return;
      }
    }

    
  }

  filterFolder() {
    const value: string = this.searchfolder.toLowerCase();
    const filteredData = this.Files.filter((o) =>
      Object.entries(o).some((entry) =>
        String(entry[1]).toLowerCase().includes(value)
      )
    );
    // console.log(this.Files);

    this.Files.forEach((element) => {
      const found = filteredData.findIndex((item) => item.name == element.name);
      // console.log(found);

      if (found >= 0) {
        element.isNotVisible = false;
      } else {
        element.isNotVisible = true;
      }
    });
  }


  fileUploaded() {
    if (this.selectedFile.name) {
        this.spinnerLoader=true;
      let filePath = `${this.selectedFile.name}/${this.empdata.employeeId}`;

      this.subscription = this.http
        .uploadFileWithQuery(
          'FileSystem/uploadfiletodirectory',
          filePath,
          this.file
        )
        .subscribe({
          next: (data: any) => {
      
              this.spinnerLoader=false;
              this.getAllFiles();
              this.uploadfrom.reset();
              this.conformationPopup.openSuccessModal(
                'File uploaded successfully',
              );
              this.modalService.dismissAll();
            
          },
          error: (reason: any) => {
            this.spinnerLoader=false;
            this.conformationPopup.openErrorModal(reason.error.message,)
          },

        });

    }
  }

  onSelectDownload(file: IFolders) {
    this.subscription = this.http
      .DownloadDataWithQuery('FileSystem/Downloadfile', file.name)
      .subscribe({
        next: (res: any) => {
          let fileName = res.headers
            .get('content-disposition')
            ?.split(':')[1]
            .split('=')[1];
          let blob: Blob = res.body as Blob;
          console.log(fileName);

          let a = document.createElement('a');
          a.href = window.URL.createObjectURL(blob);
          let filename = file.name.split('/')[file.name.split('/').length - 1];
          a.download = filename;
          a.click();
        },
        error: (reason) => console.log(reason),
      });
  }



 

}
