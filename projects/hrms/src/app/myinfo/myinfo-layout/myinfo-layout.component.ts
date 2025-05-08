import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { MyInfoPersonalTabsComponent } from '../../shared/myinfo-tabs/my-info-personal-tabs/my-info-personal-tabs.component';
import { MyinfoJobTabsComponent } from "../../shared/myinfo-tabs/myinfo-job-tabs/myinfo-job-tabs.component";
import { Select } from 'primeng/select';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpService } from '../../services/http.service';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { OpenModalService } from '../../services/open-modal.service';
import { Ipersonal, Iteammembers } from '../../Interfaces/members-model';
import { MyinfoDetailsComponent } from "../../shared/myinfo-details/myinfo-details.component";
import { TranslateModule } from '@ngx-translate/core';
import { RbacService } from '../../services/rbac.service';
import { MultiSelectModule } from 'primeng/multiselect';
import { SignalsService } from '../../services/signals.service';
@Component({
  selector: 'app-myinfo-layout',
  imports: [CommonModule, RouterOutlet, Select, MyInfoPersonalTabsComponent, MyinfoJobTabsComponent, FormsModule, ReactiveFormsModule, MyinfoDetailsComponent, TranslateModule, MultiSelectModule],
  templateUrl: './myinfo-layout.component.html',
  styleUrl: './myinfo-layout.component.scss',
  encapsulation: ViewEncapsulation.None,
})

export class MyinfoLayoutComponent implements OnInit, OnDestroy {
  teamForm!: FormGroup;
  managers: any[] = [];
  teamMembersdata: any[] = [];
  TeamMemberArray: Iteammembers[] = [];
  activeButton!: string;
  activeSideNav!: string;
  activeItem!: string;
  empinfo = {} as Ipersonal;
  subscription!: Subscription;
  selectedData: any = {};
  selectedEmployeeIds: any;
  selectedManager: any = null;
  pouptext1: any
  selectedEmployees: any[] = []; // Ensure it's an array
  spinnerLoader = false;
  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(private http: HttpService, private router: Router, private modalService: NgbModal,

    private fb: FormBuilder, private conformationPopup: OpenModalService, private signalService: SignalsService, public rbac: RbacService) { }

  ngOnInit(): void {
    this.formsubmit();
    this.empinfo = JSON.parse(localStorage.getItem("rightlyHrUser") || '{}');
    this.getAllTeammembersList();
    this.getEmployee();
  }

  onSelectManager(event: any, field: string) {
    console.log("Selected Value for", field, event.value);
    if (field === 'teamMembers') {
      this.selectedEmployees = Array.isArray(event.value) ? event.value : [event.value];
      this.selectedEmployeeIds = this.selectedEmployees.map(emp => emp.employeeId);
    }
    if (field === 'reportingManager') {
      this.teamForm.patchValue({
        reportingManager: event.value
      });
    }
  }

  getEmployee() {
    this.subscription = this.http.getData('JobDetails/getAllReportingManagers').subscribe({
      next: (data: any) => {
        this.managers = data
          .filter((emp: { fusionEmpId: any }) => emp.fusionEmpId)
          .map((emp: { fusionEmpId: string; firstName: any; middleName?: string; lastName: any }) => ({
            ...emp,
            name: `${emp.fusionEmpId} - ${emp.firstName} ${emp.middleName ? emp.middleName + ' ' : ''}${emp.lastName}`
          }));
      },
      error: (err: any) => console.log(err),
    });
  }

  getAllTeammembersList() {
    let EmployeeId = parseInt(this.empinfo.employeeId);
    this.subscription = this.http.getData(`Employeedata/v1/getEmployeesByhierarchy/${EmployeeId}`).subscribe({
      next: (data: any) => {
        this.teamMembersdata = data.map((member: any) => ({
          ...member,
          name: `${member.fusionEmpId} - ${member.firstName} ${member.middleName ? member.middleName + ' ' : ''}${member.lastName}`
        }));
      },
      error: (err: any) => console.log(err),
    }
    );
  }

  updateTeamRM() {
    this.spinnerLoader = true;
    if (!Array.isArray(this.selectedEmployees) || this.selectedEmployees.length === 0) {
      console.error("selectedEmployees is not a valid array", this.selectedEmployees);
      return;
    }
    let requestBody = this.selectedEmployees.map(employee => ({
      jobRole: employee.jobRole,
      firstName: employee.firstName,
      lastName: employee.lastName,
      middleName: employee.middleName ?? "",
      workEmail: employee.workEmail,
      fusionEmpId: employee.fusionEmpId,
      employeeId: employee.employeeId,
      contactnumber: employee.contactnumber,
      id: employee.id
    }));
    const ManagerId = this.teamForm.value.reportingManager?.employeeId;
    if (!ManagerId) {
      console.error("No valid ManagerId found.");
      return;
    }
    this.http.postdata(`JobDetails/joblist/updater?ManagerId=${ManagerId}`, requestBody)
    .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          this.modalService.dismissAll();
          this.conformationPopup.openSuccessModal('Reporting Manager Updated Successfully');
        },
        error: (reason: any) => {
          console.log(reason);
          if (reason) {
            this.modalService.dismissAll();
            this.conformationPopup.openSuccessModal('Reporting Manager Updated Successfully');
            this.spinnerLoader = false;
            this.teamForm.reset();  // Reset the form
          }
        },
      });
  }

  openModal(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static', size: 'lg' });
  }

  isActive(route: string): boolean {
    return this.router.url.includes(route); //based on the route, header tab will be changes
  }

  formatEmployeeName(employee: any): string {
    const nameParts = [];

    if (employee.firstName) {
      nameParts.push(employee.firstName);
    }

    if (employee.middleName) {
      nameParts.push(employee.middleName);
    }

    if (employee.lastName) {
      nameParts.push(employee.lastName);
    }
    return nameParts.join(' ');
  }

  firstSelectedEmployee: Iteammembers | null = null;
  getSelectedTeamMembersLabel(): string {
    const selectedCount = this.selectedEmployees.length;
    if (selectedCount === 0) {
      return 'Select Team Members';
    } else if (selectedCount === 1) {
      return this.formatEmployeeName(this.firstSelectedEmployee);
    } else {
      return `${this.formatEmployeeName(this.firstSelectedEmployee)} +${selectedCount - 1}`;
    }
  }

  formsubmit() {
    this.teamForm = this.fb.group({
      teamMembers: [null, Validators.required],
      reportingManager: [null, Validators.required]
    });
  }

  closeModal() {
    this.teamForm.reset();  // Reset the form
    this.teamForm.markAsPristine();  // Make sure the form appears as untouched
    this.teamForm.markAsUntouched();  // Ensure validation styles are cleared
    this.modalService.dismissAll();  // Dismiss the modal
  }
  resetAndClose(modal: any): void {
    this.teamForm.reset();
    this.modalService.dismissAll();
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
  }
}