import { Component, computed } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TabsModule } from 'primeng/tabs';
import { HttpService } from '../../../../services/http.service';
import { FormValidationService } from '../../../../../../../preonboarding/src/app/common-services/form-validation.service';
import { Chip } from "primeng/chip";
import { environment } from '../../../../../environments/environment.dev';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-skill-directory-management',
  standalone: true,
  imports: [
    TabsModule,
    Chip, RouterModule
  ],
  templateUrl: './skill-directory-management.component.html',
  styleUrl: './skill-directory-management.component.scss'
})
export class SkillDirectoryManagementComponent {
  filteredTabs: any[] = [];
  imageUrl: string = 'assets/images/profile1.png';
  columnsPerRow = 3;
  navTabs: any[] = [];
  constructor(
    private http: HttpService,
    public formValidation: FormValidationService,
    private modalService: NgbModal
  ) { }
  ngOnInit(): void {
    this.navTabs = [
      { label: 'Skills' },
      { label: 'Projects' },
    ];
  }
  openModal(content: any) {
    this.modalService.open(content, { centered: true, size: 'lg', backdrop: 'static' });
  }

  closePopup(modal: any) {
    modal.dismiss();
  }
}
