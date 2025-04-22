import { Component } from '@angular/core';
import { NoDataFoundComponent } from "../../shared/no-data-found/no-data-found.component";

@Component({
  selector: 'app-solved-tickets',
  imports: [NoDataFoundComponent],
  templateUrl: './solved-tickets.component.html',
  styleUrl: './solved-tickets.component.scss'
})
export class SolvedTicketsComponent {

}
