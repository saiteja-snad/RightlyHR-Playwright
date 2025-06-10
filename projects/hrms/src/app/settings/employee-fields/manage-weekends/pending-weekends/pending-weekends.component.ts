import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { HttpService } from '../../../../services/http.service';
import { IWeekends } from './weekends.model';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { RbacService } from '../../../../services/rbac.service';
import { NoDataFoundComponent } from "../../../../shared/no-data-found/no-data-found.component";
import { DataLoaderContentComponent } from "../../../../shared/data-loader-content/data-loader-content.component";
import { InfoIconComponent } from "../../../../icons/info-icon/info-icon.component";
@Component({
   selector: 'app-pending-weekends',
   imports: [CommonModule, NgbPopoverModule, TranslateModule, NoDataFoundComponent, DataLoaderContentComponent, InfoIconComponent],
   templateUrl: './pending-weekends.component.html',
   styleUrl: './pending-weekends.component.scss'
})

export class PendingWeekendsComponent implements OnInit, OnDestroy {
   weekendsList: IWeekends[] = [];
   destroy$: Subject<boolean> = new Subject<boolean>();
   loading = false;
   constructor(
      private router: Router,
      private http: HttpService,
      public rbac: RbacService
   ) { }

   ngOnInit(): void {
      this.getAllWeekend();
   }

   addWeekends() {
      this.router.navigate(['/settings/employee-fields/add-weekends']);
   }

   openUpdate(weekend: IWeekends){
      localStorage.setItem('weekend-update', JSON.stringify(weekend));
      this.router.navigate(['/settings/employee-fields/update-weekends']);
   }

   getAllWeekend() {
      this.loading = true;
      this.http.getData(`OrgWeekendHeader/getAll`).pipe(takeUntil(this.destroy$)).subscribe({
         next: (data: any) => {
            this.loading = false;
            this.weekendsList = data.filter((item: any) => item.status === 'Pending for submission');
         },
          error: (error) => {
            this.loading = false;
            console.error('Error fetching weekends:', error);
         }

      })
   }

   getShiftNames(shift: any) {
      return shift.orgWeekendItems.map((item: any) => item.weekday).join(', ');
   }

   ngOnDestroy(): void {
      this.destroy$.next(true);
      this.destroy$.unsubscribe();
   }
}
