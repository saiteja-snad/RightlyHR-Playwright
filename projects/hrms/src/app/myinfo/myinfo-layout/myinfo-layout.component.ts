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
import { MultiSelectModule } from 'primeng/multiselect';
import { SignalsService } from '../../services/signals.service';
import { RbacService } from '../../services/rbac.service';
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
    private fb: FormBuilder, private conformationPopup: OpenModalService, private signalService: SignalsService,public rbac: RbacService) { }

  ngOnInit(): void {
  
    this.empinfo = JSON.parse(localStorage.getItem("rightlyHrUser") || '{}');

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