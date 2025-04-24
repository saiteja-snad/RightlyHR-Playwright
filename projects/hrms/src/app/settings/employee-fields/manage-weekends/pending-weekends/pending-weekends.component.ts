import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { HttpService } from '../../../../services/http.service';
import { IWeekends } from './weekends.model';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { RbacService } from '../../../../services/rbac.service';
@Component({
   selector: 'app-pending-weekends',
   imports: [CommonModule, NgbPopoverModule, TranslateModule],
   templateUrl: './pending-weekends.component.html',
   styleUrl: './pending-weekends.component.scss'
})

export class PendingWeekendsComponent implements OnInit, OnDestroy {
   weekendsList: IWeekends[] = [];
   destroy$: Subject<boolean> = new Subject<boolean>();

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
      this.http.getData(`OrgWeekendHeader/getAll`).pipe(takeUntil(this.destroy$)).subscribe({
         next: (data: any) => {
            console.log(data);
            this.weekendsList = data.filter((item: any) => item.status === 'Pending for submission');
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
