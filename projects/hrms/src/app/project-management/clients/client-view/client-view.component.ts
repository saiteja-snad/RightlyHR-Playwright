import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ProjectManagementModuleInfoComponent } from "../../../shared/project-management-tabs/project-management-module-info/project-management-module-info.component";
import { ClientTabsComponent } from "../../../shared/project-management-tabs/client-tabs/client-tabs.component";
import { ActivatedRoute, NavigationEnd, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { ProjcetCreationComponent } from '../../shared-project-management-componenets/projcet-creation/projcet-creation.component';
import { ProjectContactInfoCreationComponent } from "../../shared-project-management-componenets/project-contact-info-creation/project-contact-info-creation.component";
import { filter, Subject, Subscription, takeUntil } from 'rxjs';
import { HttpService } from '../../../services/http.service';
import { OpenModalService } from '../../../services/open-modal.service';
import { Select } from 'primeng/select';
import { AuthService } from '../../../services/auth.service';
import { ResourceCreationComponent } from "../../shared-project-management-componenets/resource-creation/resource-creation.component";
import { RbacService } from '../../../services/rbac.service';
import { IEAV } from '../../../settings/project-management-configurations/models/project-type.modal';
import dayjs, { Dayjs } from 'dayjs';
import { IResource } from '../../../Interfaces/project-management/resources.model';
import { DatePicker } from 'primeng/datepicker';
import { Project } from '../../../Interfaces/projects.model';
@Component({
  selector: 'app-client-view',
  imports: [CommonModule, ProjectManagementModuleInfoComponent, DatePicker, ClientTabsComponent,
    RouterModule, ReactiveFormsModule, TranslateModule, ProjcetCreationComponent, ProjectContactInfoCreationComponent,
    ResourceCreationComponent, Select],
  templateUrl: './client-view.component.html',
  styleUrl: './client-view.component.scss'
})

export class ClientViewComponent implements OnInit, OnDestroy {
  addResourceForm!: FormGroup;
  // used for add document
  addDocumentForm!: FormGroup;
  subscription!: Subscription;
  clientid: any
  entitytype = 'Client';
  empinfo: any;
  employeeDetails: any;
  currentDate: any
  clientAttachment: File | null = null;
  spinnerLoader: boolean = false;
  displayClientAttachment: string = '';
  fileErrorMessage: string = '';
  signedCopy = [
    { key: 'Yes', value: 'yes' },
    { key: 'No', value: 'no' },
  ];
  documentTypes: IEAV[] = [];
  datepickerForm!: FormGroup;
  projectsDataDrown: Project[] = [];
  ranges: any;
  resourcesData = [] as IResource[];
  destroy$: Subject<boolean> = new Subject<boolean>();
  projectId: any;
  loading: boolean | undefined;
  clientsId!: any;
  inactiveClientStatus: any;

  constructor(private fb: FormBuilder, private router: Router, private route: ActivatedRoute, private http: HttpService, private modalService: NgbModal,
    private authService: AuthService, private conformationPopup: OpenModalService, public rbac: RbacService) { }

  ngOnInit() {
    this.createDatepickerForm();
    const now = new Date();
    this.route.queryParams.subscribe(params => {
      const clientID = params['id'];
      if (clientID) {
        this.clientid = clientID;
        this.getClientsData(clientID);
        this.getprojectbyid(clientID);
      }
    });
    this.currentDate = now.toISOString().split('T')[0];
    this.createDocumentForm();
    this.getAllActiveEmployees();
    this.getEAV();
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.enableProjectAndResourceOnDateChange();
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(() => {
      if (this.router.url.includes('/project-management/clients/details/timesheet')) {
        this.resetForm();
      }
    });
  }

  getClientsData(clientID: any): void {
    this.http.getData(`Client/${clientID}`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.inactiveClientStatus = res.data.status.toLowerCase();
      },
      error: (err) => {
        console.error('Error fetching clients:', err);
      }
    });
  }

  // initialization of form
  resetForm() {
    this.datepickerForm.reset();
    this.datepickerForm.get('projectId')?.disable();
    this.datepickerForm.get('resourceId')?.disable();
    this.http.clearRequestclienttimesheet();
    this.http.setRequestclienttimesheet(null);
  }

  // initialization of form
  createDocumentForm() {
    this.addDocumentForm = this.fb.group({
      // documentName: [null, Validators.required],
      documentType: [null, Validators.required],
      documentUrl: [null, Validators.required],
      signedCopy: [null],
    });
  }

  getEAV() {
    this.subscription = this.http.getData('entityAttributeValues?entity=Project&attribute=Client Document Type').subscribe({
      next: (data: any) => {
        this.documentTypes = data;
      },
      error: (error: any) => {
        this.documentTypes = [];
      }
    });
  }

  // get all active employees function
  getAllActiveEmployees() {
    this.subscription = this.http.getData('Employeedata/ActiveEmployees').subscribe({
      next: (data: any) => {
        this.employeeDetails = data.map((employee: any) => {
          return {
            ...employee,
            id: employee.employeeId,
            fullName: `${employee.employeeId ? employee.employeeId + ' - ' : ''}${employee.firstName} 
            ${employee.middleName ? employee.middleName + ' ' : ''}${employee.lastName}`,
          };
        });
      },
      error: (reason: any) => {
        console.log(reason);
      },
    });
  }

  // Update this method to accept both clientId and projectId
  getResourcesByClient(clientId: any, projectId: any) {
    this.http.getData(`ProjectResource?status=Active&entityType=project&entityRefId=${projectId}&clientId=${clientId}&isProjectRequired=true`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          // Remove duplicates by employee.id
          this.resourcesData = res?.data?.map((x: any) => x.employee) ?? []; // Extract "data" array
        },
        error: (err) => {
          console.error('Error fetching resource data:', err);
          this.resourcesData = [];
        }
      });
  }

  onProjectChange(event: any) {
    const projectId = event?.value;
    this.projectId = projectId; // <-- Add this line
    this.datepickerForm.get('resourceId')?.reset();
    this.resourcesData = [];
    if (projectId) {
      this.getResourcesByClient(this.clientid, projectId);
    }
  }

  getprojectbyid(clientID: any): void {
    this.loading = true
    this.http.getData(`Project?clientId=${clientID}&status=Active`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.loading = false
        this.projectsDataDrown = Array.isArray(res?.data) ? res.data : [];
        // store the clientId from the first project if exists
        if (this.projectsDataDrown.length > 0) {
          const project = this.projectsDataDrown[0];
          this.clientsId = project?.client?.clientId ?? null;
        } else {
          this.clientsId = null; // No projects returned
        }
      },
      error: (err) => {
        this.loading = false;
        console.error('Error fetching clients:', err);
        this.projectsDataDrown = [];
        this.clientsId = null;
      }
    });
  }

  isFilterApplied(): boolean {
    const formValue = this.datepickerForm.value;
    // Check if any field has value
    return (
      (formValue.dateRange && formValue.dateRange.length > 0) ||
      formValue.projectId !== null && formValue.projectId !== undefined ||
      (formValue.resourceId && formValue.resourceId.length > 0)
    );
  }
  opencontactModal(content: any) {
    this.modalService.open(content, { centered: true, size: 'xl', backdrop: 'static' });
  }

  isActive(route: string): boolean {
    return this.router.url.includes(route);
  }

  // open add modal
  openModal(content: any) {
    this.modalService.open(content, { centered: true, size: 'lg', backdrop: 'static' })
  }

  // data formatting function
  formatDateToLocal(dateString: string) {
    if (dateString) {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    return null; // Return null or handle the case when dateString is empty or invalid
  }

  // file select function
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.addDocumentForm.patchValue({ documentUrl: file });
      this.addDocumentForm.get('documentUrl')?.markAsTouched();
    }
  }

  // file select and validation function
  onChangeClientAttachment(event: any): void {
    this.displayClientAttachment = '';
    this.fileErrorMessage = '';
    const file: File = event.target.files[0];
    if (!file) return;
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    const maxSizeInMB = 25;
    const fileSizeInMB = file.size / (1024 * 1024);
    if (!allowedTypes.includes(file.type)) {
      this.fileErrorMessage = 'Invalid file type. Only jpg, png, jpeg are allowed.';
      this.clientAttachment = null;
      this.resetClientFormAttachment();
      return;
    }
    if (fileSizeInMB > maxSizeInMB) {
      this.clientAttachment = null;
      this.displayClientAttachment = '';
      this.fileErrorMessage = 'The file size should be less than 25MB.';
      this.resetClientFormAttachment();
      return;
    }
    const timestamp = new Date().getTime();
    this.clientAttachment = this.renameFileAttachment(file, `${this.empinfo.employeeId}_${timestamp}_${file.name}`);
    this.displayClientAttachment = this.clientAttachment.name;
  }

  // file rename function
  private renameFileAttachment(originalFile: File, newName: string): File {
    return new File([originalFile], newName, {
      type: originalFile.type,
      lastModified: originalFile.lastModified
    });
  }

  // file reset function
  resetClientFormAttachment() {
    this.addDocumentForm.get('documentUrl')?.reset();
    this.addDocumentForm.get('documentUrl')?.markAsUntouched();
  }

  // File upload function
  uploadClientAttachment(payload: any): void {
    const filePath = `/ProjectManagement/Clients/${this.route.snapshot.queryParams['id']}/Documents`;
    this.http.uploadFileWithQuery('FileSystem/uploadfiletodirectory', filePath, this.clientAttachment).subscribe({
      next: (data: any) => {
        if (data) {
          this.spinnerLoader = false;
          payload.documentUrl = data.path;
          this.saveProjectData(payload);
        }
      },
      error: () => {
        this.spinnerLoader = false;
        this.conformationPopup.openErrorModal('File upload failed');
      }
    });
  }

  // Add document payload function
  addDocumentpaylod(logoPath: string = '') {
    let loggedInUser = this.authService.getToken();
    if (this.addDocumentForm.invalid) {
      this.addDocumentForm.markAllAsTouched();
      return;
    }
    const formValue = this.addDocumentForm.value;
    const payload = {
      entityType: "client",
      entityId: this.route.snapshot.queryParams['id'],
      // documentName: formValue.documentName,
      documentType: formValue.documentType,
      documentUrl: logoPath,
      type: '',
      status: 'active',
      date: new Date(),
      createdBy: this.empinfo.employeeId,
      updatedBy: loggedInUser.employeeId,
      attributes: [
        {
          attributeKey: "signedCopy",
          attributeValue: formValue.signedCopy ? "yes" : "no",
          dataType: "string"
        }
      ]
    };
    return payload;
  }

  // Add document submit function
  addDocuments(): void {
    if (this.addDocumentForm.valid) {
      this.spinnerLoader = true;
      const payload = this.addDocumentpaylod();
      if (this.clientAttachment) {
        this.uploadClientAttachment(payload);
      } else {
        this.saveProjectData(payload);
      }
    } else {
      this.addDocumentForm.markAllAsTouched();
    }
  }

  // project add document function
  saveProjectData(payload: any): void {
    this.http.postdata('Documents', payload).subscribe({
      next: (res: any) => {
        this.spinnerLoader = false;
        this.addDocumentForm.reset();
        this.modalService.dismissAll();
        this.http.setnewdocumentsDetails();
        this.conformationPopup.openSuccessModal('Document added successfully');
      },
      error: (err: any) => {
        this.spinnerLoader = false;
        this.conformationPopup.openErrorModal(err.error.message);
      }
    });
  }

  // close popup function
  closePopup() {
    this.modalService.dismissAll();
  }

  closepopup(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  close() {
    this.modalService.dismissAll();
    this.addDocumentForm.reset();
  }

  navigationactive() {
    this.router.navigate(
      ['/project-management/clients/details/projects'],
      { queryParams: { id: this.clientid } } // using query params
    );
  }

  navigationtoinactive() {
    this.router.navigate(
      ['/project-management/clients/details/inactiveprojects'],
      { queryParams: { id: this.clientid } } // using query params
    );
  }

  navigationtoinactivedocuments() {
    this.router.navigate(
      ['/project-management/clients/details/inactivedocuments'],
      { queryParams: { id: this.clientid } } // using query params
    );
  }

  navigationtoactivedocuments() {
    this.router.navigate(
      ['/project-management/clients/details/documents'],
      { queryParams: { id: this.clientid } } // using query params
    );
  }

  // Create reactive form
  createDatepickerForm() {
    this.datepickerForm = this.fb.group({
      dateRange: [null, Validators.required],
      projectId: [{ value: null, disabled: true }, Validators.required],
      resourceId: [{ value: null, disabled: true }, Validators.required]
    });
  }

  enableProjectAndResourceOnDateChange() {
    this.datepickerForm.get('dateRange')?.valueChanges.subscribe(value => {
      if (value && value[0] && value[1]) {
        this.datepickerForm.get('projectId')?.enable();  // ✅ enable project dropdown
        this.datepickerForm.get('resourceId')?.enable(); // ✅ enable resource dropdown
      } else {
        this.datepickerForm.get('projectId')?.disable();
        this.datepickerForm.get('resourceId')?.disable();
      }
    });
  }

  // Define predefined ranges
  setDefaultRanges() {
    this.ranges = {
      Today: [dayjs().toDate(), dayjs().toDate()],
      Yesterday: [dayjs().subtract(1, 'day').toDate(), dayjs().subtract(1, 'day').toDate()],
      'Last 7 Days': [dayjs().subtract(6, 'day').toDate(), dayjs().toDate()],
      'This Month': [dayjs().startOf('month').toDate(), dayjs().endOf('month').toDate()],
      'Last Month': [
        dayjs().subtract(1, 'month').startOf('month').toDate(),
        dayjs().subtract(1, 'month').endOf('month').toDate()
      ]
    };
  }

  get rangeKeys(): string[] {
    return this.ranges ? Object.keys(this.ranges) : [];
  }

  setDefaultWeek() {
    const startOfWeek = dayjs().startOf('isoWeek').toDate();
    const endOfWeek = dayjs().endOf('isoWeek').toDate();
    this.datepickerForm.patchValue({
      dateRange: [startOfWeek, endOfWeek]
    });
  }

  // Select a range programmatically
  selectRange(range: string) {
    if (this.ranges[range]) {
      this.datepickerForm.patchValue({
        dateRange: this.ranges[range]
      });
    }
  }

  isFormCompletelyValid(): boolean {
    const formValue = this.datepickerForm.getRawValue(); // includes disabled controls
    return !!formValue.dateRange && !!formValue.projectId && !!formValue.resourceId;
  }

  onSubmit() {
    const dateRangeArray = this.datepickerForm.value.dateRange || [];
    const startDate = dateRangeArray[0] ? dayjs(dateRangeArray[0]).format('YYYY-MM-DDTHH:mm:ss') : null;
    const endDate = dateRangeArray[1] ? dayjs(dateRangeArray[1]).format('YYYY-MM-DDTHH:mm:ss') : startDate;
    const request = {
      dateRange: { startDate, endDate },
      resourceId: this.datepickerForm.value.resourceId,
      clientId: this.clientsId,
      projectId: this.projectId
    };
    this.http.setRequestclienttimesheet(request);
    // Send `request` to API if needed
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.http.clearRequestclienttimesheet();

    }
  }
}