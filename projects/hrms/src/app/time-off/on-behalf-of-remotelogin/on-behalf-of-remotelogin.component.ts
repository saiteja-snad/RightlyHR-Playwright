import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators, FormsModule } from '@angular/forms';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { NgbPopoverModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { DropdownModule } from 'primeng/dropdown';
import { Select } from 'primeng/select';
import { Subject, filter, takeUntil } from 'rxjs';
import { environment } from '../../../environments/environment';
import { IJob } from '../../Interfaces/letters-model';
import { FormValidationsService } from '../../services/form-validations.service';
import { HttpService } from '../../services/http.service';
import { OpenModalService } from '../../services/open-modal.service';
import { RbacService } from '../../services/rbac.service';
import { ModuleInformationComponent } from '../../shared/module-information/module-information.component';
import { MODULE_INFOS } from '../../shared/modules-info';
import { AuthService } from '../../services/auth.service';
import { OnBehalfOfRemoteloginTabsComponent } from '../../shared/time-off-module-tabs/on-behalf-of-remotelogin-tabs/on-behalf-of-remotelogin-tabs.component';
import { ModuleInfoIconComponent } from '../../icons/module-info-icon/module-info-icon.component';
@Component({
  selector: 'app-on-behalf-of-remotelogin',
  imports: [CommonModule, RouterModule, ReactiveFormsModule, TranslateModule, DropdownModule, ModuleInfoIconComponent,
    Select, ModuleInformationComponent, NgbPopoverModule, FormsModule, OnBehalfOfRemoteloginTabsComponent],
  templateUrl: './on-behalf-of-remotelogin.component.html',
  styleUrl: './on-behalf-of-remotelogin.component.scss',
  encapsulation: ViewEncapsulation.None,
})

export class OnBehalfOfRemoteloginComponent implements OnInit, OnDestroy {
  empinfo = {} as IJob;
  remoteLogin = [] as any;
  destroy$: Subject<boolean> = new Subject<boolean>();
  spinnerLoader = false;
  employeeiddetails = [] as any;
  myTeamData = [] as any;
  selectedOtherEmployee: any = null;
  selectedEmpName!: string;
  selectedEmpFusionId!: string;
  today: string = new Date().toISOString().split('T')[0];

  constructor(private modalService: NgbModal, private fb: FormBuilder, private http: HttpService, 
    private sharedModalService: OpenModalService, public rbac: RbacService, public formsValidation: FormValidationsService, 
    public readonly router: Router, private authService: AuthService) { }

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    this.updateModuleInfo();
    this.initiateUpdateModuleInfo();
    this.intializewfhForm();
    this.getEmployeeId();
    this.getMyTeam();
    this.handleAvailingChange();
  }

  addRemoteLoginForm!: FormGroup;
  intializewfhForm() {
    this.addRemoteLoginForm = this.fb.group({
      workedDate: ['', [Validators.required]],
      availing: ['', Validators.required],
      halfType: [''],
      reason: ['', [Validators.required, Validators.minLength(10)]],
    });
  }

  moduleinfo: string = '';
  initiateUpdateModuleInfo() {
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      this.updateModuleInfo();
    });
  }

  updateModuleInfo() {
    const url = this.router.url;
    const routeToInfoMap: { [key: string]: string } = {
      '/on-behalf-of/on-behalf-of-remotelogin': MODULE_INFOS.ON_BEHALF_OF_REMOTELOGIN_MODULE_INFO,
    };
    const matchedEntry = Object.entries(routeToInfoMap).find(([route]) =>
      url.includes(route)
    );
    this.moduleinfo = matchedEntry ? matchedEntry[1] : '';
  }

  // Method to get the Active employees list
  getEmployeeId() {
    let loggedInUser = this.authService.getToken();
    this.http.getData('Employeedata/ActiveEmployees').pipe(takeUntil(this.destroy$)).subscribe({
      next: (data: any) => {
        this.employeeiddetails = data.filter((emp: any) => emp.employeeId != loggedInUser.employeeId).map((emp: any) => {
          const fusionPart = emp.fusionEmpId ? `${emp.fusionEmpId} - ` : '';
          const fullName = `${fusionPart}${emp.firstName ?? ''} ${emp.middleName ? emp.middleName + ' ' : '' }${emp.lastName ?? ''}`.trim();
          const leaveRequestName = `${emp.firstName ?? ''} ${emp.middleName ? emp.middleName + ' ' : '' }${emp.lastName ?? ''} 
          ${emp.fusionEmpId ? `(${emp.fusionEmpId})` : '' }`.trim();
          return {
            ...emp,
            fullName,
            leaveRequestName,
          };
        })
        // Alphabetical sorting by firstName
          .sort((a: any, b: any) =>
            a.firstName.localeCompare(b.firstName, 'en', {
              sensitivity: 'base',
            })
          );
      },
        error: (reason: any) => {
          console.error(reason);
        },
      });
  }

  // Method to get the Reportess list
  getMyTeam() {
    let loggedInUser = this.authService.getToken();
    this.http.getData(`Employeedata/getEmployeesByhierarchy/${loggedInUser.employeeId}`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data: any) => {
        this.myTeamData = data.filter((emp: any) => emp.employeeId != loggedInUser.employeeId).map((emp: any) => {
          const fusionPart = emp.fusionEmpId ? `${emp.fusionEmpId} - ` : '';
          const fullName = `${fusionPart}${emp.firstName ?? ''} ${emp.middleName ? emp.middleName + ' ' : ''}${emp.lastName ?? ''}`.trim();
          const leaveRequestName = `${emp.firstName ?? ''} ${emp.middleName ? emp.middleName + ' ' : ''}${emp.lastName ?? ''} 
          ${emp.fusionEmpId ? `(${emp.fusionEmpId})` : ''}`.trim();
          return {
            ...emp,
            fullName,
            leaveRequestName,
          };
        })
        // Alphabetical sorting by firstName
          .sort((a: any, b: any) =>
            a.firstName.localeCompare(b.firstName, 'en', {
              sensitivity: 'base',
            })
          );
        },
        error: (reason: any) => {
          console.error(reason);
        },
    });
  }

  openModal(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  cleardata() {
    this.modalService.dismissAll();
    this.addRemoteLoginForm.reset();
    // this.availablebalance = 0;
  }

  getRemoteLoginRequest(employeedId: any) {
    const year = new Date().getFullYear();
    this.http.getFilterOnBehalfRemoteLoginDataByID(employeedId, year).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        this.remoteLogin = response;
      },
      error: (reason: any) => {
        console.log(reason);
      },
    });
  }

  handleAvailingChange() {
    this.addRemoteLoginForm.get('availing')?.valueChanges.subscribe((value) => {
      const halfTypeControl = this.addRemoteLoginForm.get('halfType');
      if (value === 'Half Day') {
        halfTypeControl?.setValidators([Validators.required]);
        halfTypeControl?.enable();
      } else {
        halfTypeControl?.clearValidators();
        halfTypeControl?.setValue('');
        halfTypeControl?.disable();
      }
      halfTypeControl?.updateValueAndValidity();
    });
  }

  onEmployeeChange(event: any): void {
    const selectedEmp = event?.value?.employeeId || 0;
    this.selectedOtherEmployee = event?.value;
    this.selectedEmpName = `${this.selectedOtherEmployee?.firstName ?? ''} ${this.selectedOtherEmployee?.middleName 
      ? this.selectedOtherEmployee?.middleName + ' ' : '' }${this.selectedOtherEmployee?.lastName ?? ''}`;
    this.selectedEmpFusionId = this.selectedOtherEmployee?.fusionEmpId;
    this.http.onBehalfOfRemoteLoginSelectedEmp$.next(selectedEmp);
    this.http.onBehlafOfRemoteLoginSignal.set(!!selectedEmp);
    if (selectedEmp) {
      this.getRemoteLoginRequest(selectedEmp);
    } else {
      this.http.onBehalfOfRemoteLoginSelectedEmp$.next(null);
    }
  }

  onClearEmployee(): void {
    this.selectedOtherEmployee = null;
    this.http.onBehalfOfRemoteLoginSelectedEmp$.next(null);
    this.http.onBehlafOfRemoteLoginSignal.set(false);
    // reset your WFH data or any dependent state here if needed
  }

  applyRemoteLogin(addForm: FormGroup) {
    if (addForm.valid) {
      const formData = addForm.value;
      const isFullDay = +formData.availing === 2;
      const payload = {
        empId: this.selectedOtherEmployee.employeeId,
        startTime: formData.workedDate,
        endTime: formData.workedDate,
        requestedComments: formData.reason,
        durationType: isFullDay ? 2 : +formData.halfType,
        duration: isFullDay ? 1 : 0.5,
        status: 'Processed',
        requestedCategory: environment.remoteLoginModuleId,
        requestedBy: this.empinfo.employeeId,
        requestedDate: new Date(),
      };
      this.spinnerLoader = true;
      this.http.postdata('AttendanceRequests/postRemoteLoginRequest', payload).pipe(takeUntil(this.destroy$)).subscribe({
        next: (res: any) => {
          this.modalService.dismissAll();
          this.sharedModalService.openSuccessModal('Remote login processed successfully');
          this.http.onBehlafOfRemoteLoginSignal.set(true);
        },
        error: (err: any) => {
          this.spinnerLoader = false;
          this.sharedModalService.openErrorModal(err.error.message);
        },
        complete: () => {
          this.addRemoteLoginForm.reset();
          this.spinnerLoader = false;
        },
      });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
    this.http.setEmployeeIdWFH(null);
  }
}