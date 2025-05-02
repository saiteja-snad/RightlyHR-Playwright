import { Component } from '@angular/core';
import { HttpService } from '../../services/http.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Ipersonal } from '../../Interfaces/members-model';
import { CommonModule } from '@angular/common';
import { NoDataFoundComponent } from "../../shared/no-data-found/no-data-found.component";
import { Subscription } from 'rxjs';
import { RouterModule } from '@angular/router';
import { Ticket } from '../../Interfaces/hierachy.modal';
import { ItsupportPipe } from "../../Pipes/itsupport.pipe";
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-solved-tickets',
  imports: [CommonModule, RouterModule, NoDataFoundComponent, FormsModule,ItsupportPipe],
  templateUrl: './solved-tickets.component.html',
  styleUrl: './solved-tickets.component.scss'
})
export class SolvedTicketsComponent {
subscription!: Subscription;
  empinfo = {} as Ipersonal;
  tickets = [] as Ticket[];
  searchValue!:string;


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
    this.subscription = this.http.getData(`Tickets/getTicketsByReportingId/${EmpId}`).subscribe({ 
      next: (data: any) => {
        console.log(data);
        this.tickets = data.filter((ticket: any) => ticket.ticketStatus === 'Closed')
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
