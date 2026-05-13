import { Component, OnDestroy, OnInit, TemplateRef, ViewEncapsulation } from '@angular/core';
import { HttpService } from '../../services/http.service';
import { NgbModal, NgbOffcanvas, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { Ipersonal } from '../../Interfaces/members-model';
import { CommonModule } from '@angular/common';
import { NoDataFoundComponent } from "../../shared/no-data-found/no-data-found.component";
import { debounceTime, distinctUntilChanged, filter, Subject, Subscription, takeUntil } from 'rxjs';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Select } from 'primeng/select';
import { TranslateModule } from '@ngx-translate/core';
import { OpenModalService } from '../../services/open-modal.service';
import { IDepartment } from '../../Interfaces/letters-model';
import { DateformatPipe } from "../../Pipes/dateformat.pipe";
import { RbacService } from '../../services/rbac.service';
import { ModuleInformationComponent } from "../../shared/module-information/module-information.component";
import { MODULE_INFOS } from '../../shared/modules-info';
import { ItsuporrtHeaderTabsComponent } from "../../shared/itsuporrt-header-tabs/itsuporrt-header-tabs.component";
import { DataLoaderContentComponent } from "../../shared/data-loader-content/data-loader-content.component";
import { ModuleInfoIconComponent } from '../../icons/module-info-icon/module-info-icon.component';
import { HelpdeskHeaderTabsComponent } from '../../shared/helpdesk-header-tabs/helpdesk-header-tabs.component';
import { ProfileIconComponent } from "../../icons/profile-icon/profile-icon.component";
import { content } from 'html2canvas/dist/types/css/property-descriptors/content';
import { InfoIconComponent } from "../../icons/info-icon/info-icon.component";
import { HelpdeskPipe } from "../../Pipes/helpdesk.pipe";
import { Paginator } from "primeng/paginator";
import { HelpdeskCreatequeires } from '../helpdesk-model';
@Component({
  selector: 'app-employee-help-desk',
  imports: [CommonModule, Select, RouterModule, ReactiveFormsModule, NoDataFoundComponent, NgbPopoverModule,
    TranslateModule, DateformatPipe, FormsModule, ModuleInformationComponent, ItsuporrtHeaderTabsComponent, DataLoaderContentComponent, ModuleInfoIconComponent, ProfileIconComponent, InfoIconComponent, HelpdeskPipe, HelpdeskHeaderTabsComponent, Paginator],
  templateUrl: './employee-help-desk.component.html',
  styleUrl: './employee-help-desk.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class EmployeeHelpDeskComponent {
  moduleinfo: string = '';
  subscription!: Subscription;
  empinfo = {} as Ipersonal;
  tickets: any = [];
  isLoading: boolean = false;
  helpDeskForm!: FormGroup;
  departmentDetails = [] as any[];
  employeeId: any;
  searchValue!: string;
  searchSubject = new Subject<string>();
  dataloader = false;
  Assigndetails: any[] = [];
  priorityDetails = [
    { value: 'Urgent', label: 'Urgent' },
    { value: 'High', label: 'High' },
    { value: 'Medium', label: 'Medium' },
    { value: 'Low', label: 'Low' }

  ];
  status = [
    { value: 'Open', label: 'Open' },
    { value: 'Closed', label: 'Closed' },
    { value: 'Await On User', label: 'Await On User' },
    { value: 'Rejected', label: 'Rejected' }

  ];
  destroy$: Subject<boolean> = new Subject<boolean>();
  categoryDetails = [] as any;
  subCategoryDetails = [] as any;
  clientAttachment: File | null = null;
  displayClientAttachment: string = '';
  fileErrorMessage: string = '';
  selectedTicket: any;
  page = 1;
  pageSize = 10;
  rows = 10;
  collectionSize!: number;
  first = 0;
  totalRecords = 0;
  options = [
    { label: 10, value: 10 },
    { label: 15, value: 15 },
    { label: 20, value: 20 },
    { label: 25, value: 25 }
  ];
  constructor(private readonly http: HttpService, private readonly modalService: NgbModal, private fb: FormBuilder, private confirmation: OpenModalService,
    private offcanvasService: NgbOffcanvas, public rbac: RbacService, public readonly router: Router) { }

  ngOnInit() {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.getemployedeshdata();
    // this.getDepartment();
    this.getCategories();
    this.helpDeskForm = this.fb.group({
      attachment: [''],
      // department: [null, [Validators.required]],
      categoryId: [null, [Validators.required]],
      subcategoryId: [{ value: null, disabled: true }, [Validators.required]],
      description: [null, [Validators.required, Validators.pattern(/^\S.*$/)]],
    });
    this.updateModuleInfo();
    this.initiateUpdateModuleInfo();
    this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.page = 1;
      this.first = 0;
      this.getemployedeshdata(this.page, this.pageSize);
    });

  }

    onSearchChange() {
    this.searchSubject.next(this.searchValue || '');
  }

  // Called when first size changes
  onPageSizeChange(newPageSize: number) {
    this.pageSize = newPageSize;
    this.rows = newPageSize;
    this.page = 1;
    this.first = 0;
    this.getemployedeshdata(this.page, this.pageSize);
  }
  onPageChange(event: any) {
    this.page = event.page + 1;
    this.pageSize = event.rows;
    this.first = event.first;
    this.getemployedeshdata(this.page, this.pageSize);
  }

  onRowsChange() {
    this.page = 1;
    this.first = 0;
    this.getemployedeshdata(this.page, this.pageSize);

  }

  // onDepartmentClear() {
  //   this.helpDeskForm.get('department')?.reset();
  //   this.helpDeskForm.get('department')?.markAsUntouched();
  //   this.helpDeskForm.get('department')?.markAsPristine();

  //   // Disable category & subcategory again
  //   this.helpDeskForm.get('categoryId')?.reset();
  //   this.helpDeskForm.get('categoryId')?.disable();

  //   this.helpDeskForm.get('subcategoryId')?.reset();
  //   this.helpDeskForm.get('subcategoryId')?.disable();
  // }

  onCategoryClear() {

    // Disable category & subcategory again
    this.helpDeskForm.get('categoryId')?.reset();

    this.helpDeskForm.get('subcategoryId')?.reset();
    this.helpDeskForm.get('subcategoryId')?.disable();
  }
  onsubCategoryClear() {
    // Disable category & subcategory again
    this.helpDeskForm.get('subcategoryId')?.reset();
  }
  // attachment changes
  onChangeClientAttachment(event: any): void {

    this.displayClientAttachment = '';
    this.fileErrorMessage = '';

    const file: File = event.target.files[0];
    if (!file) return;

    const maxSizeInMB = 25;
    const fileSizeInMB = file.size / (1024 * 1024);

    const allowedTypes = ['application/pdf'];
    const isImage = file.type.startsWith('image/');
    //  File size validation
    if (fileSizeInMB > maxSizeInMB) {
      this.fileErrorMessage = 'The file size should be less than 25MB.';
      this.resetClientFormAttachment();
      return;
    }

    //  Rename File
    const timestamp = new Date().getTime();

    const renamedFile = this.renameFile(
      file,
      `${this.empinfo.employeeId}_${timestamp}_${file.name}`
    );

    const year = new Date().getFullYear();
    const folderPath = `/HelpDesk/${year}`;

    //  Upload to server (same like policy component)
    this.subscription = this.http
      .uploadFileWithQuery(
        'FileSystem/uploadfiletodirectory',
        folderPath,
        renamedFile
      )
      .subscribe({
        next: (response: any) => {

          // store file path in form
          this.helpDeskForm.get('attachment')?.setValue(response.path);

          this.displayClientAttachment = renamedFile.name;
        },
        error: (err) => {
          console.error('File upload failed:', err);
          this.fileErrorMessage = 'File upload failed. Please try again.';
          this.resetClientFormAttachment();
        }
      });
  }
  resetClientFormAttachment() {
    this.helpDeskForm.get('attachment')?.reset();
    this.helpDeskForm.get('attachment')?.markAsUntouched();
  }


  renameFile(file: File, newName: string): File {
    const sanitizedFileName = newName.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9._-]/g, '');
    return new File([file], sanitizedFileName, { type: file.type });
  }


  // attachment end

  // update the module info
  initiateUpdateModuleInfo() {
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(() => {
      this.updateModuleInfo();
    });
  }

  updateModuleInfo() {
    const url = this.router.url;
    const routeToInfoMap: { [key: string]: string } = {
      '/help-desk/employee-desk': MODULE_INFOS.HELP_DESK_MY_QUERIES
    };
    const matchedEntry = Object.entries(routeToInfoMap).find(([route]) => url.includes(route));
    this.moduleinfo = matchedEntry ? matchedEntry[1] : '';
  }
  // update the module info end

  // get the department details for dropdown
  // getDepartment() {
  //   this.subscription = this.http.getData('HelpDeskCategory/getAll').subscribe({
  //     next: (response: any) => {
  //       if (response && Array.isArray(response)) {
  //         const departmentMap = new Map();
  //         response.forEach((item: any) => {
  //           if (item.departmentId && item.departmentName) {
  //             if (!departmentMap.has(item.departmentId)) {
  //               departmentMap.set(item.departmentId, {
  //                 department: item.departmentId,
  //                 departmentName: item.departmentName
  //               });
  //             }
  //           }
  //         });
  //         this.departmentDetails = Array.from(departmentMap.values())
  //           .sort((a, b) => a.departmentName.localeCompare(b.departmentName));
  //       }
  //     },
  //     error: (err) => {
  //       console.error('Error fetching departments:', err);
  //       this.departmentDetails = [];
  //     }
  //   });
  // }

  // get categories directly without department filter
  getCategories() {
    this.subscription = this.http.getData('HelpDeskCategory/getAll').subscribe({
      next: (response: any) => {
        if (response && Array.isArray(response)) {
          const categoryMap = new Map();
          response.forEach((item: any) => {
            if (item.categoryId && item.categoryName) {
              if (!categoryMap.has(item.categoryId)) {
                categoryMap.set(item.categoryId, {
                  label: item.categoryName,
                  value: item.categoryId
                });
              }
            }
          });
          this.categoryDetails = Array.from(categoryMap.values())
            .sort((a, b) => a.label.localeCompare(b.label));
        }
      },
      error: (err) => {
        console.error('Error fetching categories:', err);
        this.categoryDetails = [];
      }
    });
  }

  // on department change to get the category and assignee details
  // onDepartmentChange(department: any) {
  //   this.helpDeskForm.get('categoryId')?.reset();
  //   this.helpDeskForm.get('subcategoryId')?.reset();
  //   this.subCategoryDetails = [];
  //   this.categoryDetails = [];
    
  //   if (!department || !department.department) {
  //     this.helpDeskForm.get('categoryId')?.disable();
  //     this.helpDeskForm.get('subcategoryId')?.disable();
  //     return;
  //   }
    
  //   const departmentId = department.department;
  //   this.subscription = this.http.getData(`HelpDeskCategory/getAll?deptId=${departmentId}`).subscribe({
  //     next: (response: any) => {
  //       if (response && Array.isArray(response)) {
  //         const categoryMap = new Map();
  //         response.forEach((item: any) => {
  //           if (item.categoryId && item.categoryName) {
  //             if (!categoryMap.has(item.categoryId)) {
  //               categoryMap.set(item.categoryId, {
  //                 label: item.categoryName,
  //                 value: item.categoryId
  //               });
  //             }
  //           }
  //         });
  //         this.categoryDetails = Array.from(categoryMap.values())
  //           .sort((a, b) => a.label.localeCompare(b.label));
          
  //         if (this.categoryDetails.length > 0) {
  //           this.helpDeskForm.get('categoryId')?.enable();
  //         } else {
  //           this.helpDeskForm.get('categoryId')?.disable();
  //         }
  //       }
  //     },
  //     error: (err) => {
  //       console.error('Error fetching categories:', err);
  //       this.categoryDetails = [];
  //       this.helpDeskForm.get('categoryId')?.disable();
  //     }
  //   });
  // }
  // on category change to get the subcategory details
  getsubcategoryName(categoryId: number) {
    this.helpDeskForm.get('subcategoryId')?.reset();
    this.subCategoryDetails = [];
    
    if (!categoryId) {
      this.helpDeskForm.get('subcategoryId')?.disable();
      return;
    }
    
    this.subscription = this.http.getData(`HelpDeskCategory/getAll?categoryId=${categoryId}`).subscribe({
      next: (response: any) => {
        if (response && Array.isArray(response) && response.length > 0) {
          const subcategoryMap = new Map();
          response.forEach((item: any) => {
            if (item.subCategoryId && item.subCategoryName) {
              if (!subcategoryMap.has(item.subCategoryId)) {
                subcategoryMap.set(item.subCategoryId, {
                  label: item.subCategoryName,
                  value: item.subCategoryId
                });
              }
            }
          });
          this.subCategoryDetails = Array.from(subcategoryMap.values())
            .sort((a, b) => a.label.localeCompare(b.label));
          
          if (this.subCategoryDetails.length > 0) {
            this.helpDeskForm.get('subcategoryId')?.enable();
          } else {
            this.helpDeskForm.get('subcategoryId')?.disable();
          }
        } else {
          this.helpDeskForm.get('subcategoryId')?.disable();
        }
      },
      error: (err) => {
        console.error('Error fetching subcategories:', err);
        this.subCategoryDetails = [];
        this.helpDeskForm.get('subcategoryId')?.disable();
      }
    });
  }
  openEnd(ticket: any) {
    localStorage.setItem('selectedTicket', JSON.stringify(ticket));
    this.router.navigate(['/help-desk/employee-desk/myqueries', ticket.id]);

  }

  // get employee helpdesk data
  getemployedeshdata(page?: number, pageSize?: number) {
    this.dataloader = true;
    let EmpId = parseInt(this.empinfo.employeeId);

  let url = `HelpDeskQueries/${EmpId}?pageNumber=${this.page}&pageSize=${this.pageSize}`;

  // Add search only when value exists
  if (this.searchValue && this.searchValue.trim() !== '') {
    url += `&search=${this.searchValue}`;
  }
    this.subscription = this.http.getData(url).subscribe({
      next: (response: any) => {
        this.dataloader = false;
        if (response.success) {
          this.tickets = response.data.data;
          this.collectionSize = response.data.totalCount;
        } else {
          this.tickets = [];
        }
        console.log("Tickets:", this.tickets);
      },
      error: (err: any) => {
        this.dataloader = false;
        console.log(err);
        this.tickets = [];
      }
    });
  }
  // get employee helpdesk data end

  // update the query status to close or await on user
  submitmess() {
    if (!this.selectedTicket) return;
    const payload = {
      id: this.selectedTicket.id,
      employeeId: this.selectedTicket.employeeId,
      categoryId: this.selectedTicket.categoryId,
      subcategoryId: this.selectedTicket.subcategoryId,
      departmentId: this.selectedTicket.departmentId,
      status: this.selectedTicket.status,
      // subject: this.selectedTicket.subject,
      description: this.selectedTicket.description,
      updatedDate: new Date().toISOString(),
      updatedBy: parseInt(this.empinfo.employeeId)
    };
    console.log("PUT Payload:", payload);
    this.http.putData('HelpDeskQueries', payload).subscribe({
      next: (res: any) => {
        console.log("Updated Successfully", res);
        this.getemployedeshdata(); // refresh table
        this.confirmation.openSuccessModal('Query updated successfully');
        setTimeout(() => {
          this.offcanvasService.dismiss();
          this.getemployedeshdata();  // refresh table
        }, 1500);// close offcanvas
      },
      error: (err: any) => {
        console.log("Update Error", err);
      }
    });
  }
  // confirmation modal for closing query
  openConfirmationModal(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  // on submit of new query by raised query button click(post api)
  onSubmit() {
    if (this.helpDeskForm.invalid) {
      this.helpDeskForm.markAllAsTouched();
      return;
    }
    console.log('from');
    
    this.isLoading = true;
    const payload: HelpdeskCreatequeires = {
      employeeId: this.empinfo.employeeId,
      categoryId: this.helpDeskForm.value.categoryId,
      subcategoryId: this.helpDeskForm.value.subcategoryId,
      // departmentId: this.helpDeskForm.value.department.department,
      // subject: '',
      description: this.helpDeskForm.value.description,
      attachmentUrl: this.helpDeskForm.value.attachment || null,
      createdBy: this.empinfo.employeeId,
      createdDate: new Date(),
    };

    console.log("Payload:", payload);
    this.subscription = this.http.postdata(`HelpDeskQueries`, payload).subscribe({
      next: (response: any) => {
        this.helpDeskForm.reset();
        this.getemployedeshdata();
        this.confirmation.openSuccessModal('Query raised successfully');
        this.isLoading = false;
        setTimeout(() => {
          this.offcanvasService.dismiss();
          // refresh table
        }, 1500);

      },
      error: (err: any) => {
        console.error(err);
        this.confirmation.openErrorModal(err.error?.message || 'An error occurred while updating the query');
        this.isLoading = false;
      }
    });
  }
  openModal(content: any) {
    this.helpDeskForm.reset();

    // Disable dependent dropdowns again
    // this.helpDeskForm.get('categoryId')?.disable();
    this.helpDeskForm.get('subcategoryId')?.disable();
    // this.modalService.open(content, { centered: true, size: 'lg', backdrop: 'static' });
    this.offcanvasService.open(content, { position: 'end', backdrop: 'static' });
  }

  onDropdownClear(controlName: string) {
    const control = this.helpDeskForm.get(controlName);

    if (control) {
      control.reset();
      control.markAsPristine();
      control.markAsUntouched();
      control.updateValueAndValidity();
    }

    // if (controlName === 'department') {
    //   this.categoryDetails = [];
    //   this.subCategoryDetails = [];
    //   this.helpDeskForm.get('categoryId')?.disable();
    //   this.helpDeskForm.get('subcategoryId')?.disable();
    // }

    if (controlName === 'categoryId') {
      this.subCategoryDetails = [];
      this.helpDeskForm.get('subcategoryId')?.disable();
    }
  }
  cleardata() {
    this.ngOnInit();
    this.modalService.dismissAll();
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
