import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { NgbModalConfig, NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { HttpService } from '../../../services/http.service';
import { AcknowledgeletterComponent } from "../acknowledgeletter/acknowledgeletter.component";
import { DragDropModule } from '@angular/cdk/drag-drop';
import { TabsDndDirective } from '../../../shared/tabs-dnd/tabs-dnd.directive';
import { MenuOrderService } from '../../../services/theme-service/menu-order.service';
import { ScrollingModule } from '@angular/cdk/scrolling';

interface LetterAcknowledgementDoc {
  id: number;
  documentName: string;
  documentType?: string;
  isAcknowledgementRequired?: boolean;
  updatedBy?: number;
  updatedAt?: string;
  route: string;
}

@Component({
  selector: 'app-document-acknowledgement-tabs',
  imports: [TranslateModule, CommonModule, NgbNavModule, AcknowledgeletterComponent, DragDropModule, TabsDndDirective, ScrollingModule],
  templateUrl: './document-acknowledgement-tabs.component.html',
  styleUrl: './document-acknowledgement-tabs.component.scss'
})

export class DocumentAcknowledgementTabsComponent implements OnInit, OnDestroy {
  readonly tabsKey = 'letter-acknowledgement-documents-tabs';
  active: number | null = null;
  subscription !: Subscription;
  selectedFile: LetterAcknowledgementDoc | null = null;

  Documents: LetterAcknowledgementDoc[] = [];
  @Input() document: any;

  constructor(private http: HttpService, config: NgbModalConfig, private menuOrderService: MenuOrderService,) {
    config.backdrop = 'static';
    config.keyboard = false;
  }

  ngOnInit() {

    this.getAllLettersAcknowledgement();
  }

  onSelectedFile(folder: LetterAcknowledgementDoc) {
    this.selectedFile = folder;
    this.active = folder.id;
  }

  getAllLettersAcknowledgement() {
    this.subscription = this.http.getData('LetterAcknowledgment/getall').subscribe({
      next: (data: any) => {
        const mapped: LetterAcknowledgementDoc[] = (Array.isArray(data) ? data : []).map((doc: any) => ({
          ...doc,
          route: '/myinfo/documents/letter-acknowledge-documents',
        }));

        this.Documents = mapped;
        this.ensureActiveIsValid();

        void this.menuOrderService.ensureLoaded().then(() => {
          const ordered = this.menuOrderService.applySavedTabsOrder(
            this.tabsKey,
            this.Documents,
            (d) => String(d.id ?? '')
          );

          this.Documents = ordered;
          this.active = this.Documents[0]?.id ?? null;
        });
        // this.getAllSignatureLetterType();
      },
      error: (reason: any) => {
        console.log(reason);
      }
    });
  }

  trackByDocId(_: number, doc: LetterAcknowledgementDoc): number {
    return doc.id;
  }

  private ensureActiveIsValid(): void {
    if (!Array.isArray(this.Documents) || this.Documents.length === 0) {
      this.active = null;
      return;
    }

    if (this.active != null && this.Documents.some((d) => d.id === this.active)) return;
    this.active = this.Documents[0]?.id ?? null;
  }

  ngOnDestroy(): void {
    if(this.subscription){
      this.subscription.unsubscribe();
    }
  }

}
