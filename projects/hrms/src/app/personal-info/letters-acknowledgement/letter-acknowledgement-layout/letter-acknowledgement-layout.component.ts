import { Component } from '@angular/core';
import { DocumentAcknowledgementTabsComponent } from "../document-acknowledgement-tabs/document-acknowledgement-tabs.component";
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-letter-acknowledgement-layout',
  imports: [DocumentAcknowledgementTabsComponent,CommonModule,RouterModule],
  templateUrl: './letter-acknowledgement-layout.component.html',
  styleUrl: './letter-acknowledgement-layout.component.scss'
})
export class LetterAcknowledgementLayoutComponent {

}
