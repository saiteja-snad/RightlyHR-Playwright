import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { HttpService } from '../../../../services/http.service';
import { IWeekends } from '../pending-weekends/weekends.model';
import { CommonModule } from '@angular/common';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { NoDataFoundComponent } from "../../../../shared/no-data-found/no-data-found.component";
import { RbacService } from '../../../../services/rbac.service';
import { DataLoaderContentComponent } from "../../../../shared/data-loader-content/data-loader-content.component";
@Component({
   selector: 'app-published-weekends',
   imports: [CommonModule, NgbPopoverModule, TranslateModule, NoDataFoundComponent, DataLoaderContentComponent],
   templateUrl: './published-weekends.component.html',
   styleUrl: './published-weekends.component.scss'
})

export class PublishedWeekendsComponent {
   weekendsList: IWeekends[] = [];
   destroy$: Subject<boolean> = new Subject<boolean>();
   loading = false;

   constructor(private router: Router, private http: HttpService, public rbac: RbacService) { }

   ngOnInit(): void {
      this.getAllWeekend();
   }

   getAllWeekend() {
      this.loading = true;
      this.http.getData(`OrgWeekendHeader/getAll`).pipe(takeUntil(this.destroy$)).subscribe({
         next: (data: any) => {
            this.loading = false;
            this.weekendsList = data.filter((item: any) => item.status === 'Published');
         },
         error: (error) => {
            this.loading = false;
            console.error('Error fetching weekends:', error);
         }

      })
   }

   addWeekends() {
      this.router.navigate(['/settings/employee-fields/add-weekends']);
   }

   navigateToClone(weekend: IWeekends) {
      localStorage.setItem('weekend-update', JSON.stringify(weekend));
      this.router.navigate(['/settings/employee-fields/clone-weekends']);
   }

   navigateToView(weekend: IWeekends) {
      localStorage.setItem('weekend-update', JSON.stringify(weekend));
      this.router.navigate(['/settings/employee-fields/view-weekends']);
   }

   getShiftNames(shift: any) {
      return shift.orgWeekendItems.map((item: any) => item.weekday).join(', ');
   }

   ngOnDestroy(): void {
      this.destroy$.next(true);
      this.destroy$.unsubscribe();
   }
}