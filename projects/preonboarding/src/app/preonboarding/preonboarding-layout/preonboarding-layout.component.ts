import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from "../../shared/header/header.component";
import { ModuleInformationComponent } from "../../shared/module-information/module-information.component";
import { filter } from 'rxjs';
import { MODULE_INFOS } from '../../shared/module-info';

@Component({
  selector: 'app-preonboarding-layout',
  imports: [CommonModule, RouterOutlet, HeaderComponent, ModuleInformationComponent],
  templateUrl: './preonboarding-layout.component.html',
  styleUrl: './preonboarding-layout.component.scss'
})

export class PreonboardingLayoutComponent implements OnInit{
  moduleinfo : string = '';

  constructor(public router: Router) { }

  ngOnInit(): void {
    this.updateModuleInfo();
    this.initiateUpdateModuleInfo();
  }

  initiateUpdateModuleInfo(){
    this.router.events
    .pipe(filter(event => event instanceof NavigationEnd))
    .subscribe(() => {
      this.updateModuleInfo();
    });
  }

  updateModuleInfo() {
    const url = this.router.url;
  
    const routeToInfoMap: { [key: string]: string } = {
      '/job-details': MODULE_INFOS.APPLICATION_SCREEN_MODULE_INFO,
      '/personal-details': MODULE_INFOS.PERSONAL_DETAILS_PAGE_MODULE_INFO,
      '/document': MODULE_INFOS.ONBOARDING_DOCUMENTS_PAGE_MODULE_INFO,
      '/experience-details' : MODULE_INFOS.EXPERIENCE_DETAILS_MODULE_PAGE,
      '/education-details' : MODULE_INFOS.EDUCATION_DETAILS_MODULE_PAGE,
      '/emergency-details': MODULE_INFOS.EMERGENCY_CONTACT_DETAILS,
      '/offer-letter' : MODULE_INFOS.OFFER_LETTER_MODULE_INFO,
      '/review' : MODULE_INFOS.REVIEW_MODULE_INFO,
      '/trainee-offerletter' :  MODULE_INFOS.OFFER_LETTER_MODULE_INFO
    };
  
    const matchedEntry = Object.entries(routeToInfoMap).find(([route]) => url.includes(route));
    this.moduleinfo = matchedEntry ? matchedEntry[1] : '';
  }
  
}