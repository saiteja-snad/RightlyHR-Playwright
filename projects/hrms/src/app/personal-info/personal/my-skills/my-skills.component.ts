import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AccessForEmployeeinfoService } from '../../../services/access-for-employeeinfo.service';
import { RbacService } from '../../../services/rbac.service';
import { FormValidationService } from '../../../../../../preonboarding/src/app/common-services/form-validation.service';
import { OpenModalService } from '../../../services/open-modal.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpService } from '../../../services/http.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Select } from 'primeng/select';
import { ChipModule } from 'primeng/chip';


@Component({
  selector: 'app-my-skills',
  imports: [ReactiveFormsModule, Select, ChipModule],
  templateUrl: './my-skills.component.html',
  styleUrl: './my-skills.component.scss'
})
export class MySkillsComponent {
  AddForm!: FormGroup;
  isremove: boolean = false;
  skillList: any[] = [];
  proficiencyoptions = [
    { label: 'Beginner', value: 'Beginner' },
    { label: 'Intermediate', value: 'Intermediate' },
    { label: 'Expert', value: 'Expert' },
  ];
  technicalSkills = [
    { name: 'Angular', level: 'Expert' },
    { name: 'React', level: 'Intermediate' }
  ];
  constructor(private readonly modalService: NgbModal, private http: HttpService, private fb: FormBuilder, private conformationPopup: OpenModalService, public formValidation: FormValidationService, public rbac: RbacService, public permissionRouteService: AccessForEmployeeinfoService, private router: Router) { }

  openModal(content: any) {
    this.modalService.open(content, { centered: true, size: 'm', backdrop: 'static' });
  }
  ngOnInit(): void {
    this.AddForm = this.fb.group({
      skillcategory: ['', [Validators.required, Validators.pattern(/^[^\s].*$/)]],
      skills: ['', Validators.required],
      proficiencylevel: ['', Validators.required],
    });

  }
  close(modal: any) {
    modal.close();
  }
  resetForm() {
    this.modalService.dismissAll()
    this.AddForm.reset();
  }
  openConfirmationModal(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }
  addjobrole(modal: any) {

  }

  removeSkill(skill: any) {
    this.technicalSkills = this.technicalSkills.filter(s => s !== skill);
  }
}
