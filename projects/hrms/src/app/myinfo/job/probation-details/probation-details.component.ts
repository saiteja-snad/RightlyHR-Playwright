import { Component } from '@angular/core';
import { DateformatPipe } from "../../../Pipes/dateformat.pipe";
import { NgbModal, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { RbacService } from '../../../services/rbac.service';
import { HttpService } from '../../../services/http.service';
import { TranslateModule } from '@ngx-translate/core';
import { ProbationformViewComponent } from '../../../shared/probationform-view/probationform-view.component';
import { CommonModule } from '@angular/common';
import { IJob } from '../../../Interfaces/letters-model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-probation-details',
  imports: [CommonModule, DateformatPipe, TranslateModule, NgbPopoverModule, ProbationformViewComponent],
  templateUrl: './probation-details.component.html',
  styleUrl: './probation-details.component.scss'
})
export class ProbationDetailsComponent {
  getProbationRequestDetails = [] as any;
  appcomment = {} as any;
  empdata = {} as any;
  empinfo = {} as IJob;
  subscription!: Subscription;

  constructor(private http: HttpService,
    private modalService: NgbModal, public rbac: RbacService) { }


  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    this.getEmployeeId();
    this.getProbationRequest();
  }

  getEmployeeId(): void {
    const employeeId = parseInt(this.empinfo.employeeId);
    this.subscription = this.http.getData(`Employeedata/${employeeId}`).subscribe({
      next: (data: any) => {
        this.empdata = data;
      },
      error: (err: any) => {
        console.log(err);
      }
    });
  }

  getProbationRequest() {
    let EmployeeId = parseInt(this.empinfo.employeeId)
    this.subscription = this.http.getData(`ProbationFlow/getbyemployeeId/${EmployeeId}`).subscribe({
      next: (data: any) => {
        this.getProbationRequestDetails = data;
      }
    })
  }

  setformView(employeeId: number, responseId: number) {
    this.http.communicationService.next({ employeeId, responseId });
  }

  openview(content: any) {
    this.modalService.open(content, { size: 'xl', centered: true, backdrop: 'static' });
  }

  closeModel() {
    this.modalService.dismissAll();
  }

  probationCommentsFunction(Value: any, content: any) {
    this.modalService.open(content, { size: 'xl', centered: true, backdrop: 'static' });
    this.appcomment = Value.map((ele: any) => {
      const parsedMetaData = JSON.parse(ele.metaData);
      return {
        ...ele,
        metadata: parsedMetaData
      };
    });
  }
}
