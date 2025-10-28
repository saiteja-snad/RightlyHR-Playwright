import { Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { AccessForEmployeeinfoService } from '../../../services/access-for-employeeinfo.service';
import { RbacService } from '../../../services/rbac.service';
import { FormValidationService } from '../../../../../../preonboarding/src/app/common-services/form-validation.service';
import { OpenModalService } from '../../../services/open-modal.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpService } from '../../../services/http.service';
import { NgbModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { Select } from 'primeng/select';
import { ChipModule } from 'primeng/chip';
import { AuthService } from '../../../services/auth.service';
import { map, Subject, Subscription, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-my-skills',
  imports: [ReactiveFormsModule, Select, ChipModule, CommonModule, NgbModalModule],
  templateUrl: './my-skills.component.html',
  styleUrl: './my-skills.component.scss',
  encapsulation: ViewEncapsulation.None
})

export class MySkillsComponent {
  destroy$: Subject<boolean> = new Subject<boolean>();
  AddForm!: FormGroup;
  isremove: boolean = false;
  skillList: any[] = [];
  empinfo: any = {};
  MySkills: any[] = [];
  categoryList: any
  spinnerLoader = false;
  subscription!: Subscription;
  overridePayload: any;
  @ViewChild('Confirmation') Confirmation!: NgbModal;
  proficiencyoptions = [
    { label: 'Beginner', value: 'Beginner' },
    { label: 'Intermediate', value: 'Intermediate' },
    { label: 'Expert', value: 'Expert' },
  ];
  technicalSkills: any[] = [];
  selectedSkill: any = null;
  softSkills: any[] = [];
  deleteModalRef: any;
  Status: any;

  constructor(private readonly modalService: NgbModal, private authService: AuthService, private http: HttpService, 
    private fb: FormBuilder, private conformationPopup: OpenModalService, public formValidation: FormValidationService, 
    public rbac: RbacService, public permissionRouteService: AccessForEmployeeinfoService) { }

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.getCategory()
    this.getSkills()
    this.AddForm = this.fb.group({
      skillcategory: ['', [Validators.required, Validators.pattern(/^[^\s].*$/)]],
      skills: ['', Validators.required],
      proficiencylevel: ['', Validators.required],
    });
  }

  openModal(content: any) {
    this.modalService.open(content, { centered: true, size: 'm', backdrop: 'static' });
  }

  closepopup(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static' })
  }

  close(modal: any) {
    modal.close();
  }

  resetForm() {
    this.modalService.dismissAll()
    this.AddForm.reset();
  }

  DeleteskillDailog(content: any, skill: any) {
    this.selectedSkill = skill;
    this.deleteModalRef = this.modalService.open(content, { centered: true });
  }

  openmodelforConfirm(content: any) {
    this.modalService.open(this.Confirmation, { centered: true });
  }

  getSkills(): void {
    const params = {
      employeeId: this.empinfo.employeeId,
      isActive: true
    };
    this.http.getDataIncludeParams('EmployeeSkills/getEmployeeSkills', params).pipe(takeUntil(this.destroy$),
      map((res: any) => {
        if (res?.data?.items && Array.isArray(res.data.items) && res.data.items.length > 0) {
          return res.data.items[0].skills || [];
        }
        return [];
      })
    ).subscribe({
      next: (skills: any[]) => {
        // Filter & assign
        this.technicalSkills = skills.filter(s => s.skillCategory?.toLowerCase().includes('technical') && s.isActive);
        this.softSkills = skills.filter(s => s.skillCategory?.toLowerCase().includes('soft') && s.isActive);
      },
      error: (err) => {
        console.error(' Error fetching skills:', err);
      }
    });
  }

  getCategory() {
    const params = {
      entity: "employee",
      attribute: "skillset"
    }
    this.subscription = this.http.getDataIncludeParams("entityAttributeValues", params).subscribe({
      next: (data: any) => {
        this.categoryList = data;
      }
    })
  }

  addjobrole(modal: any) {
    const loggedInUser = this.authService.getToken();
    if (this.AddForm.invalid) {
      this.AddForm.markAllAsTouched();
      return;
    }
    this.spinnerLoader = true;
    const formValue = this.AddForm.value;
    const payload = {
      employeeId: this.empinfo.employeeId,
      createdBy: loggedInUser.employeeId,
      allowOverride: false, // initially false
      createdAt: new Date().toISOString(),
      skills: [
        {
          skillCategory: formValue.skillcategory,
          skillName: formValue.skills,
          proficiencyLevel: formValue.proficiencylevel,
          isActive: true
        }
      ]
    };
    this.http.postdata('EmployeeSkills/postSkillSet', payload).subscribe({
      next: (res: any) => {
        this.spinnerLoader = false;
        this.AddForm.reset();
        this.modalService.dismissAll();
        this.getSkills();
        this.conformationPopup.openSuccessModal('Skill added successfully');
      },
      error: (error: any) => {
        console.error('Error adding skill:', error);
        this.spinnerLoader = false;
        //  Handle 409 duplicate skill conflict
        if (error?.status === 409) {
          const message = error?.error?.message || 'This skill already exists. Do you want to override it?';
          // Show your confirmation modal
          this.Status = message;
          this.openmodelforConfirm(this.Confirmation);
          // Save payload temporarily if needed for "Yes" click
          this.overridePayload = { ...payload, allowOverride: true };
        } else {
          // Other errors
          this.conformationPopup.openErrorModal(error?.error?.message || 'Failed to add skill');
        }
      }
    });
  }

  confirmOverride() {
    if (!this.overridePayload) return;
    this.spinnerLoader = true;
    this.http.postdata('EmployeeSkills/postSkillSet', this.overridePayload).subscribe({
      next: (res: any) => {
        this.spinnerLoader = false;
        this.AddForm.reset();
        this.modalService.dismissAll();
        this.getSkills();
        this.conformationPopup.openSuccessModal('Skill added successfully');
      },
      error: (overrideError: any) => {
        console.error('Error overriding skill:', overrideError);
        this.conformationPopup.openErrorModal(
          overrideError?.error?.message || 'Failed to override skill'
        );
        this.spinnerLoader = false;
      }
    });
  }

  confirmDelete(modal: any) {
    if (!this.selectedSkill) return;
    const loggedInUser = this.authService.getToken();
    const payload = {
      employeeId: this.empinfo.employeeId,
      skillId: this.selectedSkill.skillId,
      isActive: false, // mark as inactive (deleted)
      updatedBy: loggedInUser.employeeId
    };
    this.spinnerLoader = true;
    this.http.putData('EmployeeSkills/updateSkillSet', payload).subscribe({
      next: (res: any) => {
        this.spinnerLoader = false;
        modal.close();
        this.conformationPopup.openSuccessModal('Skill deleted successfully');
        // Remove only after success
        this.technicalSkills = this.technicalSkills.filter(
          (s: any) => s.skillId !== this.selectedSkill.skillId
        );
        this.softSkills = this.softSkills.filter(
          (s: any) => s.skillId !== this.selectedSkill.skillId
        );
      },
      error: (err: any) => {
        this.spinnerLoader = false;
        modal.close();
        this.conformationPopup.openErrorModal('Failed to delete skill');
        console.error('Delete error:', err);
      }
    });
  }

  removeSkill(skill: any) {
    this.technicalSkills = this.technicalSkills.filter(s => s !== skill);
    this.softSkills = this.softSkills.filter(s => s !== skill);
  }

  openDeletePopup(modal: any, skill: any, event?: MouseEvent) {
    event?.stopPropagation();
    this.selectedSkill = skill;
    this.deleteModalRef = this.modalService.open(modal, { centered: true, backdrop: 'static' });
  }
}