import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { SettingsLoaderComponent } from '../../../../shared/settings-loader/settings-loader.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormValidationsService } from '../../../../services/form-validations.service';
import { HttpService } from '../../../../services/http.service';
import { OpenModalService } from '../../../../services/open-modal.service';
import { RbacService } from '../../../../services/rbac.service';
import { Subscription } from 'rxjs';
import { SettingsDeleteIconComponent } from "../../../../icons/settings-delete-icon/settings-delete-icon.component";
import { SettingsUpdateIconComponent } from "../../../../icons/settings-update-icon/settings-update-icon.component";

@Component({
  selector: 'app-skill-set',
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, SettingsLoaderComponent, SettingsDeleteIconComponent, SettingsUpdateIconComponent],
  templateUrl: './skill-set.component.html',
  styleUrl: './skill-set.component.scss'
})
export class SkillSetComponent {
  AddForm!: FormGroup;
  updateForm!: FormGroup;
  @ViewChild('addpopup') addpopup: any;
  @ViewChild('deletepopup') deletepopup: any;
  @ViewChild('updatepopup') updatepopup: any;
  SkillAttachment: File | null = null;
  displayskillAttachment: string = '';
  fileErrorMessage: string = '';
  categoryList: any
  empinfo: any = {};
  subscription!: Subscription;
  SkilltypeDetail: any[] = [];
  loader = false;
  selectedId: number | null = null;
  selectedDeleteDep: any = null;
  constructor(
    private modalService: NgbModal,
    private fb: FormBuilder,
    private http: HttpService,
    private conformationPopup: OpenModalService,
    public formValidations: FormValidationsService,
    public rbac: RbacService,
  ) {

  }
  ngOnInit(): void {
    this.AddForm = this.fb.group({
      skilltype: ['', [Validators.required, this.formValidations.maxCharactersValidator(101), Validators.pattern(/^[^\s].*$/)]],
      logo: [null],
    });
    this.updateForm = this.fb.group({
      skilltype: ['', [Validators.required, this.formValidations.maxCharactersValidator(101), Validators.pattern(/^[^\s].*$/)]],
      logo: [null],
    });
    this.getskilltype();
  }

  getskilltype() {
    const params = {
      entity: "Employee",
      attribute: "Skill Category",
    };

    this.subscription = this.http.getDataIncludeParams("entityAttributeValues", params).subscribe({
      next: (data: any) => {
        this.SkilltypeDetail = data;
        this.loader = false;
      }
    });
  }

  openupdate(skilllist: any) {
    this.selectedId = skilllist.id;
    this.AddForm.reset();
    this.updateForm.patchValue({ skilltype: skilllist.value });
    this.modalService.open(this.updatepopup, { backdrop: 'static', centered: true });
  }
  addskillType(modal: any) {
    let metaValue = "";
    if (this.SkillAttachment) {
      const metaObj = {
        logoUrl: this.SkillAttachment.name
      };
      metaValue = JSON.stringify(metaObj);
    }
    const params = {
      entity: "Employee",
      attribute: "Skill Category",
      value: this.AddForm.value.skilltype,
      meta: metaValue
    };
    this.http.postdata("entityAttributeValues", params).subscribe({
      next: (data: any) => {
        modal.close();
        this.getskilltype();
        this.conformationPopup.openSuccessModal('Skill Category added successfully');
        this.resetForm();
      },
      error: (reason: any) => {
        const errorMessage = reason.error?.Message;
        this.conformationPopup.openErrorModal(errorMessage);
      },
    });
  }
  openDialog() {
    this.modalService.open(this.addpopup, {
      backdrop: 'static',
      centered: true
    });
  }
  close(modal: any) {
    modal.close();
  }
  resetForm() {
    this.AddForm.reset();
  }

  onChangeClientAttachment(event: any): void {
    this.displayskillAttachment = '';
    this.fileErrorMessage = '';
    const file: File = event.target.files[0];
    if (!file) return;
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/jpg',
    ];
    const maxSizeInMB = 25;
    const fileSizeInMB = file.size / (1024 * 1024);
    if (!allowedTypes.includes(file.type)) {
      this.fileErrorMessage = 'Invalid file type. Only jpg, png, jpeg are allowed.';
      this.SkillAttachment = null;
      this.resetClientFormAttachment();
      return;
    }
    if (fileSizeInMB > maxSizeInMB) {
      this.SkillAttachment = null;
      this.displayskillAttachment = '';
      this.fileErrorMessage = 'The file size should be less than 25MB.';
      this.resetClientFormAttachment();
      return;
    }
    const timestamp = new Date().getTime();
    this.SkillAttachment = this.renameFileAttachment(file, `${this.empinfo.employeeId}_${timestamp}_${file.name}`);
    this.displayskillAttachment = this.SkillAttachment.name;
  }

  private renameFileAttachment(originalFile: File, newName: string): File {
    return new File([originalFile], newName, {
      type: originalFile.type,
      lastModified: originalFile.lastModified
    });
  }

  resetClientFormAttachment() {
    this.AddForm.get('logo')?.reset();
    this.AddForm.get('logo')?.markAsUntouched();
  }
  closeDelete(modal: any) {
    modal.dismiss();
    this.selectedDeleteDep = null;
  }
  opendelete(skilltypelist: any) {
    this.AddForm.reset();
    this.selectedDeleteDep = skilltypelist;
    this.modalService.open(this.deletepopup, { backdrop: 'static', centered: true });
  }
  onDelete(modal: any) {
    this.subscription = this.http.deleteData(`entityAttributeValues/${this.selectedDeleteDep.id}`).subscribe({
      next: (data: any) => {
        this.getskilltype();
        modal.close();
        this.conformationPopup.openSuccessModal('Skill Category deleted successfully');
      }
    });
  }
  updateskillType(modal: any) {
    if (this.updateForm.valid && this.selectedId) {
      let metaValue = "";
      if (this.SkillAttachment) {
        const metaObj = {
          logoUrl: this.SkillAttachment.name
        };
        metaValue = JSON.stringify(metaObj);
      }
      const params = {
        entity: "Employee",
        attribute: "Skill Category",
        value: this.updateForm.value.skilltype,
        meta: metaValue,
        id: this.selectedId
      };

      this.subscription = this.http.postdata('entityAttributeValues/update', params).subscribe({
        next: () => {
          this.getskilltype();
          modal.close();
          this.updateForm.reset();
          this.conformationPopup.openSuccessModal('Skill Category updated successfully');
        },
        error: (err: any) => {
          const errorMessage = err.error?.Message;
          this.conformationPopup.openErrorModal(errorMessage);
        }
      });
    }
  }

}

