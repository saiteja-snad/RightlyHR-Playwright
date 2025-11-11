import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormValidationsService } from '../../../../services/form-validations.service';
import { HttpService } from '../../../../services/http.service';
import { OpenModalService } from '../../../../services/open-modal.service';
import { RbacService } from '../../../../services/rbac.service';
import { forkJoin, Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { IEAV } from '../../models/project-type.modal';
import { DataLoaderContentComponent } from "../../../../shared/data-loader-content/data-loader-content.component";

@Component({
  selector: 'app-task',
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, DataLoaderContentComponent],
  templateUrl: './task.component.html',
  styleUrl: './task.component.scss'
})
export class TaskComponent implements OnInit, OnDestroy {
  subscription!: Subscription;
  addForm!: FormGroup;
  updateForm!: FormGroup;
  projectTypes: IEAV[] = [];
  taskTypes: IEAV[] = [];
  loading = false;
  selectedEAV!: IEAV;
  @ViewChild('addpopup') addpopup: any;
  @ViewChild('updatepopup') updatepopup: any;
  @ViewChild('deletepopup') deletepopup: any;

  constructor(
    private fb: FormBuilder,
    private modalService: NgbModal,
    private http: HttpService,
    private conformationPopup: OpenModalService,
    public formValidations: FormValidationsService,
    public rbac: RbacService) { }

  ngOnInit(): void {
    this.initialiseForm();
    this.getEAV();
  }

initialiseForm() {
  this.addForm = this.fb.group({
    projectType: [null, [
      Validators.required,
      this.formValidations.minCharactersValidator(2),
      this.formValidations.maxCharactersValidator(51),
      Validators.pattern(/^[^\s].*$/)
    ]],
    taskType: [null, [
      Validators.required,
      this.formValidations.minCharactersValidator(2),
      this.formValidations.maxCharactersValidator(51),
      Validators.pattern(/^[^\s].*$/)
    ]],
    color: ['']
  });

  this.updateForm = this.fb.group({
    projectType: [null, [
      Validators.required,
      this.formValidations.minCharactersValidator(2),
      this.formValidations.maxCharactersValidator(51),
      Validators.pattern(/^[^\s].*$/)
    ]],
    taskType: [null, [
      Validators.required,
      this.formValidations.minCharactersValidator(2),
      this.formValidations.maxCharactersValidator(51),
      Validators.pattern(/^[^\s].*$/)
    ]],
    updatecolor: ['']
  });
}


getEAV() {
  this.loading = true;

  const project$ = this.http.getData('entityAttributeValues?entity=Project&attribute=Project Type');
  const task$ = this.http.getData('entityAttributeValues?entity=Task&attribute=Task Type');

  this.subscription = forkJoin([project$, task$]).subscribe({
    next: ([projectData, taskData]: any) => {
      this.loading = false;
      this.projectTypes = projectData.map((item: any) => ({
        ...item,
        meta: typeof item.meta === 'string' ? JSON.parse(item.meta) : item.meta
      }));

      this.taskTypes = taskData.map((item: any) => ({
        ...item,
        meta: typeof item.meta === 'string' ? JSON.parse(item.meta) : item.meta
      }));
    },
    error: () => (this.loading = false),
    complete: () => (this.loading = false)
  });
}


onAddSubmit(modal: any) {
  if (this.addForm.valid) {
    const formValue = this.addForm.value;
    const requests = [];

    if (formValue.projectType) {
      requests.push(this.http.postdata('entityAttributeValues', {
        entity: 'Project',
        attribute: 'Project Type',
        value: formValue.projectType,
        meta: JSON.stringify({ graphData: { color: formValue.color } })
      }));
    }

    if (formValue.taskType) {
      requests.push(this.http.postdata('entityAttributeValues', {
        entity: 'Task',
        attribute: 'Task Type',
        value: formValue.taskType,
        meta: JSON.stringify({ graphData: { color: formValue.color } })
      }));
    }

    forkJoin(requests).subscribe({
      next: () => {
        this.conformationPopup.openSuccessModal('Project and Task Type(s) added successfully');
        modal.close();
        this.addForm.reset();
      },
      error: (error: any) => {
        this.conformationPopup.openErrorModal(error?.error?.Message || 'Failed to add data');
      },
      complete: () => this.getEAV()
    });
  }
}


  close(): void {
    this.modalService.dismissAll();
    this.updateForm.reset();
  }

  closed(modal: any) {
    modal.close();
    this.addForm.reset();
  }

  openupdateDialog(project: any) {
    // this.selectedId = jobrole.id;
    this.selectedEAV = project;
    let color = "";
    if (project.meta) {
      const metaObj = typeof project.meta === 'string' ? JSON.parse(project.meta) : project.meta;
      color = metaObj?.graphData?.color ?? color;
    }
    this.updateForm.patchValue({
      projectType: project.value,
      updatecolor: color
    });
    this.modalService.open(this.updatepopup, { backdrop: 'static', centered: true });
  }

  opendeleted(project: any) {
    this.selectedEAV = project;
    this.modalService.open(this.deletepopup, { backdrop: 'static', centered: true });
  }

  updateProjectType(form: FormGroup): void {
    if (form.valid && this.selectedEAV) {
      const payload = {
        id: this.selectedEAV.id,
        value: form.value.projectType,
        meta: JSON.stringify({
          graphData: {
            color: form.value.updatecolor
          }
        })
      };
      this.subscription = this.http.postdata('entityAttributeValues/update', payload).subscribe({
        next: (data: any) => {
          this.modalService.dismissAll();
          this.conformationPopup.openSuccessModal('Project Type updated successfully');
        },
        error: (error: any) => {
          this.conformationPopup.openErrorModal(error?.error?.Message || 'Failed to update Project Type');
        },
        complete: () => {
          this.getEAV();
          form.reset();
          this.selectedEAV = {} as IEAV;
        }
      });
    }
  }

  deleteProjectType(): void {
    if (this.selectedEAV) {
      this.subscription = this.http.deleteData(`entityAttributeValues/${this.selectedEAV.id}`).subscribe({
        next: (data: any) => {
          this.modalService.dismissAll();
          this.conformationPopup.openSuccessModal('Project Type deleted successfully');
        },
        error: (error: any) => {
          this.conformationPopup.openErrorModal(error?.error?.Message || 'Failed to delete Project Type');
        },
        complete: () => {
          this.getEAV();
          this.selectedEAV = {} as IEAV;
        }
      });
    }
  }

  openDialog() {
    this.modalService.open(this.addpopup, {
      backdrop: 'static',
      centered: true
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
