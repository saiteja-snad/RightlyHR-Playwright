import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { HttpService } from '../../services/http.service';
import { OpenModalService } from '../../services/open-modal.service';
import { Router } from '@angular/router';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { NoDataFoundComponent } from "../../shared/no-data-found/no-data-found.component";

@Component({
  selector: 'app-my-tickets',
  imports: [NoDataFoundComponent],
  templateUrl: './my-tickets.component.html',
  styleUrl: './my-tickets.component.scss'
})
export class MyTicketsComponent {


  constructor(
    private readonly fb: FormBuilder,
    private readonly http: HttpService,
    private readonly modalService: NgbModal,

    public conformationPopup: OpenModalService,

    config: NgbModalConfig) {
    config.backdrop = 'static';
    config.keyboard = false;
  }


  openModal(content: any) {
    this.modalService.open(content, { centered: true, size: 'lg', backdrop: 'static' });
  }

}
