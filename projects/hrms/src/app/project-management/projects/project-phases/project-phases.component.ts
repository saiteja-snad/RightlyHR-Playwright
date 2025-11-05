import { Component, OnDestroy, OnInit } from '@angular/core';
import { DataLoaderContentComponent } from "../../../shared/data-loader-content/data-loader-content.component";
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Select } from 'primeng/select';
import { ConfirmationIconComponent } from '../../../icons/confirmation-icon/confirmation-icon.component';
import { DateformatPipe } from '../../../Pipes/dateformat.pipe';
import { NoDataFoundComponent } from '../../../shared/no-data-found/no-data-found.component';
import { Router, ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormValidationsService } from '../../../services/form-validations.service';
import { HttpService } from '../../../services/http.service';
import { OpenModalService } from '../../../services/open-modal.service';
import { RbacService } from '../../../services/rbac.service';

@Component({
  selector: 'app-project-phases',
  imports: [CommonModule, ConfirmationIconComponent, TranslateModule, ReactiveFormsModule, DateformatPipe,
    Select, DataLoaderContentComponent, NoDataFoundComponent],
  templateUrl: './project-phases.component.html',
  styleUrl: './project-phases.component.scss'
})
export class ProjectPhasesComponent implements OnInit, OnDestroy {
  loading: boolean = false;
  inactiveStatus: any;

  constructor(private router: Router, private fb: FormBuilder, public rbac: RbacService, private modalService: NgbModal,
    private http: HttpService, private route: ActivatedRoute, private conformationPopup: OpenModalService, 
    public formValidation: FormValidationsService,) {

  }
  ngOnInit(): void {
    
  }

  ngOnDestroy(): void {
    
  }
}
