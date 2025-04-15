import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-shits',
  imports: [CommonModule],
  templateUrl: './add-shits.component.html',
  styleUrl: './add-shits.component.scss'
})
export class AddShitsComponent {
  constructor( public router:Router) { }

  nagvition(){
    this.router.navigate(['/settings/employee-fields/manage-shifts/pending-for-submit']);
  }
}
