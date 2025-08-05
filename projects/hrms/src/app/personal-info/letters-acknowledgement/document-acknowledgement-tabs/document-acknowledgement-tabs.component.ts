import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { NgbModalConfig, NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { HttpService } from '../../../services/http.service';
import { AcknowledgeletterComponent } from "../acknowledgeletter/acknowledgeletter.component";
@Component({
  selector: 'app-document-acknowledgement-tabs',
  imports: [TranslateModule, CommonModule, NgbNavModule, AcknowledgeletterComponent],
  templateUrl: './document-acknowledgement-tabs.component.html',
  styleUrl: './document-acknowledgement-tabs.component.scss'
})

export class DocumentAcknowledgementTabsComponent implements OnInit, OnDestroy {
  active!: string;
  subscription !: Subscription;
  selectedFile: any;
  
  Documents = [] as any;
  @Input() document: any;

  constructor(private http: HttpService, config: NgbModalConfig) {
    config.backdrop = 'static';
    config.keyboard = false;
  }

  ngOnInit() {

    this.getAllLettersAcknowledgement();
  }

  onSelectedFile(folder: any) {
    this.selectedFile = folder
  }

  getAllLettersAcknowledgement() {
    this.subscription = this.http.getData('LetterAcknowledgment/getall').subscribe({
      next: (data: any) => {
        this.Documents = data;
        // const traineeLetter = this.Documents.find(
        //   (doc: any) => doc.documentName === 'Trainee Appointment Letter'
        // );
        // this.active = traineeLetter ? traineeLetter.documentName : (this.Documents[0]?.documentName || '');
        this.active = this.Documents[0]?.documentName || '';
        console.log( this.active)

        // this.getAllSignatureLetterType();
      },
      error: (reason: any) => {
        console.log(reason);
      }
    });
  }

  ngOnDestroy(): void {
    if(this.subscription){
      this.subscription.unsubscribe();
    }
  }

}