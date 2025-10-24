import { Component } from '@angular/core';
import { ModuleInfoIconComponent } from "../../../../icons/module-info-icon/module-info-icon.component";
import { DataLoaderContentComponent } from "../../../../shared/data-loader-content/data-loader-content.component";
import { NoDataFoundComponent } from "../../../../shared/no-data-found/no-data-found.component";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormValidationService } from '../../../../../../../preonboarding/src/app/common-services/form-validation.service';
import { HttpService } from '../../../../services/http.service';
import { ProfileIconComponent } from "../../../../icons/profile-icon/profile-icon.component";
import { MailIconComponent } from "../../../../icons/mail-icon/mail-icon.component";
import { ChatIconComponent } from "../../../../icons/chat-icon/chat-icon.component";

@Component({
  selector: 'app-skill-directory-management',
  imports: [ModuleInfoIconComponent, DataLoaderContentComponent, NoDataFoundComponent, ProfileIconComponent, MailIconComponent, ChatIconComponent],
  templateUrl: './skill-directory-management.component.html',
  styleUrl: './skill-directory-management.component.scss'
})
export class SkillDirectoryManagementComponent {
  searchValue: any;
  // loading: boolean = false;
   data = [
    { identityType: 'Employee ID', identityNumber: '12345' },
    { identityType: 'Passport', identityNumber: 'A1234567' }
  ];
  imageUrl: any;
    constructor(private http: HttpService,public formValidation: FormValidationService, private modalService: NgbModal) { }

  openModal(content: any) {
    this.modalService.open(content, { centered: true, size: 'xl', backdrop: 'static' });
  }
   viewItem(expid: number,) {
    
  }
  shareVia(platform: string): void {
  }

}
