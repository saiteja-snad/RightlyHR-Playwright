import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { Select } from 'primeng/select';
import { HttpService } from '../../services/http.service';
import { ModuleInformationComponent } from "../../shared/module-information/module-information.component";
import { filter } from 'rxjs';
import { MODULE_INFOS } from '../../shared/modules-info';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
@Component({
  selector: 'app-holidays-layout',
  imports: [RouterModule, CommonModule, ReactiveFormsModule, Select, NgbPopoverModule, ModuleInformationComponent],
  templateUrl: './holidays-layout.component.html',
  styleUrl: './holidays-layout.component.scss',
  encapsulation: ViewEncapsulation.None
})

export class HolidaysLayoutComponent implements OnInit, OnDestroy {
  moduleinfo: string = '';
  optionalholidaysform!: FormGroup;
  years: number[] = [];
  empinfo: any;
  orgHolidayItemsArray: any[] = [];
  length: number = 0;
  optional: number = 0;
  currentYear: number = new Date().getFullYear();
  selectedYear: number = this.currentYear;
  subscription: any;
  Policies: any = [];
  jobshiftdetails: any;

  constructor(public router: Router, private http: HttpService) { }

  ngOnInit(): void {
    this.currentYear = new Date().getFullYear();
    this.selectedYear = this.currentYear; // Move this up
    // Populate years list
    for (let i = this.currentYear - 1; i <= this.currentYear + 1; i++) {
      this.years.push(i);
    }
    // Now initialize the form with the selectedYear
    this.optionalholidaysform = new FormGroup({
      selectedYear: new FormControl(this.selectedYear)
    });
    this.empinfo = JSON.parse(localStorage.getItem("rightlyHrUser") || '{}');
    this.updateModuleInfo();
    this.initiateUpdateModuleInfo();
  }

  initiateUpdateModuleInfo() {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updateModuleInfo();
      });
  }

  updateModuleInfo() {
    const url = this.router.url;
    const routeToInfoMap: { [key: string]: string } = {
      '/holidays': MODULE_INFOS.HOLIDAYS_MODULE_INFO
    };
    const matchedEntry = Object.entries(routeToInfoMap).find(([route]) => url.includes(route));
    this.moduleinfo = matchedEntry ? matchedEntry[1] : '';
  }

  onYearChange() {
    const selectedYear = this.optionalholidaysform.get('selectedYear')?.value;
    this.http.setSelectedYear(selectedYear);
  }

  ngOnDestroy(): void {
    this.optionalholidaysform.reset()
    this.http.setSelectedYear(this.currentYear);
  }
}