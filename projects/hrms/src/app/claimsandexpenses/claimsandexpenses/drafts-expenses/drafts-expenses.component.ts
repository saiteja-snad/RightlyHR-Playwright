import { Component } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-drafts-expenses',
  imports: [],
  templateUrl: './drafts-expenses.component.html',
  styleUrl: './drafts-expenses.component.scss'
})
export class DraftsExpensesComponent {
  constructor(private modalService: NgbModal) { }
  openModal(content: any) {
    this.modalService.open(content, { centered: true, size:'lg' ,backdrop: 'static' });
  }
}
