import { Component, OnDestroy, OnInit } from '@angular/core';
import { NoDataFoundComponent } from '../../../shared/no-data-found/no-data-found.component';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { HttpService } from '../../../services/http.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { Subject, takeUntil } from 'rxjs';
import { IAllFormsData } from '../../../Interfaces/dynamic-forms.model';
import { IJob } from '../../../Interfaces/letters-model';
import { SearchFormPipe } from "../search-form.pipe";

@Component({
  selector: 'app-active-forms',
  imports: [
    NoDataFoundComponent,
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    FormsModule,
    SearchFormPipe
],
  templateUrl: './active-forms.component.html',
  styleUrl: './active-forms.component.scss',
})
export class ActiveFormsComponent implements OnInit,OnDestroy{
  empinfo = {} as IJob;
  searchValue: any;
  allFormsDetails = [] as IAllFormsData[];
  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private fb: FormBuilder,
    private http: HttpService,
    private router: Router,
    private modalService: NgbModal,
    config: NgbModalConfig,
    private route: ActivatedRoute
  ) {}
  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    this.getAllFormDetails();
  }



  navigateToUpdateComponent(formId: number) {
    this.router.navigate(['/settings/dynamic-forms/update-form'], { state: { formId: formId } });
  }
  navigateToViewComponent(formId: number) {
    this.router.navigate(['/settings/dynamic-forms/view-form'], { state: { formId: formId } });
  }


  getAllFormDetails() {
    this.http.getData("Form/getAllFormDetails").pipe(takeUntil(this.destroy$)).subscribe({
      next: (data: any) => {
        this.allFormsDetails = (data as IAllFormsData[]);

      }
    })
  }


  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

}
