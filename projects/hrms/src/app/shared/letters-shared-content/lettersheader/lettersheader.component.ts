import { Component, OnInit } from '@angular/core';
import { TenantService } from '../../../services/tenant.service';


@Component({
  selector: 'app-lettersheader',
  imports: [],
  templateUrl: './lettersheader.component.html',
  styleUrl: './lettersheader.component.scss'
})
export class LettersheaderComponent implements OnInit {

  companyLogo: string = '';

  constructor(public tenantService: TenantService) {}

  ngOnInit(): void {
    this.tenantService.logo$.subscribe(logo => {
      this.companyLogo = logo || this.tenantService.currentLogo;

      console.log('Offer Letter Dynamic Logo:', this.companyLogo);
    });

    if (!this.tenantService.isLogoLoaded) {
      this.tenantService.verifyDomain(
        this.tenantService.currentDomain
      ).subscribe();
    }
  }
}