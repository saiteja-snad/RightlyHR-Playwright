import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pending-weekends',
  imports: [CommonModule],
  templateUrl: './pending-weekends.component.html',
  styleUrl: './pending-weekends.component.scss'
})
export class PendingWeekendsComponent {
   constructor(private router:Router){

   }

   addWeekends(){
      this.router.navigate(['/settings/employee-fields/add-weekends']);
   }
}
