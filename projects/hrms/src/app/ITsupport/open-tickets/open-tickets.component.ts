import { Component } from '@angular/core';
import { HttpService } from '../../services/http.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Ipersonal } from '../../Interfaces/members-model';
import { CommonModule } from '@angular/common';
import { NoDataFoundComponent } from "../../shared/no-data-found/no-data-found.component";
import { Subscription } from 'rxjs';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-open-tickets',
  imports: [CommonModule,RouterModule,NoDataFoundComponent],
  templateUrl: './open-tickets.component.html',
  styleUrl: './open-tickets.component.scss'
})
export class OpenTicketsComponent {
  subscription!: Subscription;
  empinfo = {} as Ipersonal;
  tickets: any = [];


  constructor(
    private readonly http: HttpService,
    private readonly modalService: NgbModal,
  ) {}

  

  ngOnInit() {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.getuserticketsbyempid();
  }
  
  getuserticketsbyempid(){
    let EmpId = parseInt(this.empinfo.employeeId);
    this.subscription = this.http.getData(`Tickets/getnamesbyEmpId/${EmpId}`).subscribe({ 
      next: (data: any) => {
        console.log(data);
          this.tickets = data.filter((ticket: any) => ticket.ticketStatus === 'Open')
          console.log(this.tickets)
      },
      error: (err: any) => {
        console.log(err);

      }
    })
  }

  openModal(content: any) {
    this.modalService.open(content, { centered: true, size: 'lg', backdrop: 'static' });
  }

}
