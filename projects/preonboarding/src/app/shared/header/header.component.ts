import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { TenantService } from '../../common-services/tenant.service';

@Component({
  selector: 'app-header',
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit, OnDestroy {
  prospectiveEmpData = {} as any;
  companyLogo: string = '';
  subscription!: Subscription;
  @ViewChild('logoutpopup') logoutpopup: any;

  constructor(private router: Router, private modalservie: NgbModal, public tenantService: TenantService) { }

  ngOnInit(): void {
    this.prospectiveEmpData = JSON.parse(localStorage.getItem('prospectiveemppersonaldata') || '{}');
    this.subscription = this.tenantService.logo$.subscribe(logo => {
      this.companyLogo = logo || this.tenantService.currentLogo;
    });
    if (!this.tenantService.isLogoLoaded) {
      this.tenantService.verifyDomain(this.tenantService.currentDomain).subscribe();
    }
  }

  openlogoutModal() {
    this.modalservie.open(this.logoutpopup, { centered: true });
  }

  close() {
    this.modalservie.dismissAll();
  }

  logOut() {
    localStorage.removeItem('prospectiveusertoken');
    localStorage.removeItem('prospectiveemppersonaldata');
    this.modalservie.dismissAll();
    this.router.navigate(['']);
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
