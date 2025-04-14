import { Component } from '@angular/core';
import { NoDataFoundComponent } from "../../../shared/no-data-found/no-data-found.component";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-no-due-clearance-configurations',
  imports: [NoDataFoundComponent],
  templateUrl: './no-due-clearance-configurations.component.html',
  styleUrl: './no-due-clearance-configurations.component.scss'
})
export class NoDueClearanceConfigurationsComponent {
constructor(private modalService :NgbModal){}

  openModal(content: any) {
    this.modalService.open(content, { centered: true,size:'lg', backdrop: 'static' });
  }

}
