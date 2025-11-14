import { Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { AccessForEmployeeinfoService } from '../../../services/access-for-employeeinfo.service';
import { RbacService } from '../../../services/rbac.service';
import { FormValidationService } from '../../../../../../preonboarding/src/app/common-services/form-validation.service';
import { OpenModalService } from '../../../services/open-modal.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpService } from '../../../services/http.service';
import { NgbModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { Select } from 'primeng/select';
import { AuthService } from '../../../services/auth.service';
import { map, Subject, Subscription, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NoDataFoundComponent } from '../../../shared/no-data-found/no-data-found.component';
import { DataLoaderContentComponent } from '../../../shared/data-loader-content/data-loader-content.component';
import { FormValidationsService } from '../../../services/form-validations.service';
@Component({
  selector: 'app-my-skills',
  imports: [ReactiveFormsModule, Select, FormsModule, CommonModule, NgbModalModule, NoDataFoundComponent, DataLoaderContentComponent,],
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
  spinnerLoaderforallrecoders = false;
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
  values: string[] | undefined;
  typedSkill: string = '';

  constructor(private readonly modalService: NgbModal, private authService: AuthService, private http: HttpService,
    private fb: FormBuilder, private conformationPopup: OpenModalService, public formValidation: FormValidationService, private router: Router, public formValidations: FormValidationsService,
    public rbac: RbacService, public permissionRouteService: AccessForEmployeeinfoService) { }

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.getEmpInfoFromRoute()
    this.getCategory()
    this.getSkills()
    this.AddForm = this.fb.group({
      skillcategory: ['', [Validators.required, Validators.pattern(/^[^\s].*$/)]],
      skills: [[], [this.validateSkillArray.bind(this), this.formValidations.maxCharactersValidators(41)]],
      proficiencylevel: ['', Validators.required],
    });
  }

  validateSkillArray(control: any) {
    const value = control.value;
    return value && value.length > 0 ? null : { required: true };
  }

  getEmpInfoFromRoute(): void {
    const fullPath = this.router.url;

    if (fullPath.startsWith('/personalinfo')) {
      this.empinfo = JSON.parse(localStorage.getItem("personaldata") || '{}');

    } else if (fullPath.startsWith('/myinfo')) {
      this.empinfo = JSON.parse(localStorage.getItem("rightlyHrUser") || '{}');

    }
  }

  canAccess(action: 'view' | 'create' | 'update' | 'delete', permission: string) {
    return this.permissionRouteService.canAccessField(action, permission);
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
      this.AddForm.get('skills')?.updateValueAndValidity();
      return;
    }
    this.spinnerLoader = true;
    const formValue = this.AddForm.value;
    const skillNames = formValue.skills;
    const skillsList = skillNames.map((skill: string) => ({
      skillCategory: formValue.skillcategory,
      skillName: skill,
      proficiencyLevel: formValue.proficiencylevel,
      isActive: true
    }));
    const payload = {
      employeeId: this.empinfo.employeeId,
      createdBy: loggedInUser.employeeId,
      allowOverride: false,
      createdAt: new Date().toISOString(),
      skills: skillsList
    };
    this.http.postdata('EmployeeSkills/postSkillSet', payload).subscribe({
      next: (res: any) => {
        this.spinnerLoader = false;
        this.AddForm.reset();
        this.modalService.dismissAll();
        this.getSkills();
        this.conformationPopup.openSuccessModal('Skills added successfully');
      },
      error: (error: any) => {
        console.error('Error adding skill:', error);
        this.spinnerLoader = false;
        if (error?.status === 409) {
          const message = error?.error?.message || 'This skill already exists. Do you want to override it?';
          this.Status = message;
          this.openmodelforConfirm(this.Confirmation);
          this.overridePayload = { ...payload, allowOverride: true };
        } else {
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
        this.conformationPopup.openSuccessModal('Skill removed successfully');
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

  openDeletePopup(modal: any, skill: any, event?: MouseEvent) {
    event?.stopPropagation();
    this.selectedSkill = skill;
    this.deleteModalRef = this.modalService.open(modal, { centered: true, backdrop: 'static' });
  }

  addSkill(event: any): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.trim();
    const control = this.AddForm.get('skills');
    if (value) {
      const skills = control?.value || [];
      if (!skills.includes(value)) {
        skills.push(value);
        control?.setValue(skills);
      }
      control?.setErrors(null);
    }
    this.typedSkill = '';
    input.value = "";
    event.preventDefault();
  }

  removeSkill(skill: string): void {
    const skills = this.AddForm.get('skills')?.value || [];
    const updatedSkills = skills.filter((s: string) => s !== skill);
    this.AddForm.get('skills')?.setValue(updatedSkills);
    this.AddForm.get('skills')?.updateValueAndValidity();
    const control = this.AddForm.get('skills');
    control?.markAsTouched(); 
    control?.updateValueAndValidity();
  }

 onSkillBlur(): void {
  const control = this.AddForm.get('skills');
  const skills = control?.value || [];

  if (this.typedSkill.length > 0) {
    control?.setErrors({ pendingSkill: true });
  } 
  else {
    if (skills.length === 0) {
      control?.setErrors({ required: true });
    } else {
      control?.setErrors(null);
    }
  }

  control?.markAsTouched();
}

  getSkillsByLevel(level: string, skills: any[]) {
    return skills.filter(skill => skill.proficiencyLevel === level);
  }

 onSkillInput(event: any): void {
  this.typedSkill = event.target.value.trim();
  const control = this.AddForm.get('skills');
  const skills = control?.value || [];
  if (this.typedSkill.length > 0) {
    control?.setErrors({ pendingSkill: true });
  } 
  else {
    if (skills.length === 0) {
      control?.setErrors({ required: true });
    } else {
      control?.setErrors(null);
    }
  }
  control?.markAsTouched();
}

}