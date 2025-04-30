import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { HttpService } from '../../../../services/http.service';
import { CommonModule } from '@angular/common';
import { NgbModal, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder} from '@angular/forms';
import { NoDataFoundComponent } from '../../../../shared/no-data-found/no-data-found.component';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { RbacService } from '../../../../services/rbac.service';
import { IPolicy } from './policies.model';


@Component({
  selector: 'app-pending-policies',
  imports: [CommonModule, NoDataFoundComponent, TranslateModule, NgbPopoverModule],
  templateUrl: './pending-policies.component.html',
  styleUrl: './pending-policies.component.scss'
})
export class PendingPoliciesComponent implements OnInit, OnDestroy {

  subscription!: Subscription
  allPolicies: IPolicy[] = [];

  constructor(public router: Router, private http: HttpService, private modalService: NgbModal, private fb: FormBuilder, public rbac: RbacService) { }
  
  ngOnInit(): void {
    this.getAllPolicies();
  }
  
  nagvition() {
    this.router.navigate(['/settings/employee-fields/addpolices']);
  }

  updateNavigation(policy: any) {
    localStorage.setItem('updatepolicies', JSON.stringify(policy));
    this.router.navigate(['/settings/employee-fields/updatepolices']);
  }

  getAllPolicies() {
    this.subscription = this.http.getData('orgPolicies').subscribe({
      next: (data: any) => {
        console.log(data);
        this.allPolicies = data.filter(
          (status: { status: string; }) => status.status === 'Pending for submission'
        );
        console.log(this.allPolicies);
      }, error: (err: any) => {
        console.error(err);
      }
    })

  }

  getPolicyNames(policy: any) {
    return policy.shiftName || '';
 }

 ngOnDestroy(): void {
  if (this.subscription) {
    this.subscription.unsubscribe();
  }
 }
}
