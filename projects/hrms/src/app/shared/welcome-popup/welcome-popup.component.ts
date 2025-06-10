import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { HttpService } from '../../services/http.service';

@Component({
  selector: 'app-welcome-popup',
  imports: [CommonModule,],
  templateUrl: './welcome-popup.component.html',
  styleUrl: './welcome-popup.component.scss'
})
export class WelcomePopupComponent implements OnInit, OnDestroy {

  subscription!:Subscription
  empInfo:any

  constructor(
    private modalService:NgbModal,
    private httpService: HttpService
  ){}

 


  ngOnInit(): void {
    this.empInfo = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
  }

  onClickGetStarted(){
     this.subscription = this.httpService.postdata('BetaUser/post', { employeeId: this.empInfo.employeeId, popUpShown:true }).subscribe({
      next: (response: any) => {
        console.log(response);
        this.modalService.dismissAll();
        
      },
      error: (err) => {
        console.error(err);
      },
    })
  }


   ngOnDestroy(): void {
    if(this.subscription){
      this.subscription.unsubscribe()
    }
  }

}
