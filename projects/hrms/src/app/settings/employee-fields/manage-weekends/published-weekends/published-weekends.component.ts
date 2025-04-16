import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { HttpService } from '../../../../services/http.service';
import { IWeekends } from '../pending-weekends/weekends.model';
import { CommonModule } from '@angular/common';

@Component({
   selector: 'app-published-weekends',
   imports: [CommonModule],
   templateUrl: './published-weekends.component.html',
   styleUrl: './published-weekends.component.scss'
})
export class PublishedWeekendsComponent {
   weekendsList: IWeekends[] = [];
   destroy$: Subject<boolean> = new Subject<boolean>();

   constructor(
      private router: Router,
      private http: HttpService,
   ) { }

   ngOnInit(): void {
      this.getAllWeekend();
   }

   getAllWeekend() {
      this.http.getData(`OrgWeekendHeader/getAll`).pipe(takeUntil(this.destroy$)).subscribe({
         next: (data: any) => {
            console.log(data);
            this.weekendsList = data.filter((item: any) => item.status === 'Published');
         }
      })
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
