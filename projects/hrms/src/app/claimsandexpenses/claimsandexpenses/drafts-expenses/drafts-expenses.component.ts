import { Component } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { IExpense, IExpensedatabyid, IExpenseHeader, INewExpense } from '../../../Interfaces/claimsandexpenses.model';
import { BehaviorSubject, Subscribable, Subscription } from 'rxjs';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpService } from '../../../services/http.service';
import { CommonModule, DatePipe } from '@angular/common';
import { DateformatPipe } from "../../../pipes/dateformat.pipe";
import { environment } from '../../../../environments/environment';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-drafts-expenses',
  imports: [CommonModule, DateformatPipe],
  templateUrl: './drafts-expenses.component.html',
  styleUrl: './drafts-expenses.component.scss',
  providers: [DatePipe]
})
export class DraftsExpensesComponent {
  empinfo: any
  subscription!: Subscription;
  ExpenseImageUrl: any;
  ExpenseViewURL: any;
  flitredDrafts = new BehaviorSubject<any[]>([]);
  expenseheader: IExpenseHeader[] = [];
  expenseheaderiteams: INewExpense[] = [];
  updataid!: number;
  constructor(public router: Router, private fb: FormBuilder, private datepipe: DatePipe,
    private http: HttpService, private modalService: NgbModal, private sanitizer: DomSanitizer,) { }
 
  expenesEmplyeedata: IExpense[] = [];
  draftsCount: number = 0;
  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.getexpensesheaderbyemployeeid(this.empinfo.employeeId);
  }


  openModal(content: any) {
    this.modalService.open(content, { centered: true, size: 'lg', backdrop: 'static' });
  }




  getexpensesheaderbyemployeeid(_employeeId: number): void {
    //params
    const params = this.empinfo.employeeId;

    this.subscription = this.http
      .getDatabyid(`Expenses_Header/gettotalamount`, params).subscribe({
        next: (data: any) => {
          this.expenesEmplyeedata = data as IExpense[];
          //this.filterAllExpenses();
        }, error(err) {
          console.log("expensesheadererror", err)
        },
      });
  }
  

  viewItem(expid: number,) {
    console.log(expid);
    this.updataid = expid;
    this.subscription = this.http
      .getitembyid(`Expenses_Header/getby_Expense_ID`, expid).subscribe({
        next: (data: any) => {
          this.expenseheaderiteams = data.expenseitem

        }, error(err) {
          console.log("expensesheadererror", err)
        },
      });

  }

  onSelectDownload(file: any): void {
    this.subscription = this.http.DownloadDataWithQuery('FileSystem/Downloadfile', file.value).subscribe({
      next: (res: any) => {
        // Check if the response body is of type Blob
        const blob: Blob = res.body as Blob;
        if (!blob) {
          return;
        }

        // Extract filename from 'content-disposition' header if available
        const contentDisposition = res.headers.get('content-disposition');
        let fileName = 'defaultFileName.pdf'; // Default filename

        if (contentDisposition) {
          const fileNameMatch = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition);
          if (fileNameMatch !== null && fileNameMatch[1]) {
            fileName = fileNameMatch[1].replace(/['"]/g, '');
          }
        } else {
          // Extract filename from the original file path if 'content-disposition' is not available
          const filePath = file.value;
          const parts = filePath.split('/');
          fileName = parts[parts.length - 1] || 'defaultFileName.pdf';
        }

        // Create a link element and trigger the download
        const a = document.createElement('a');
        const url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();

        // Clean up
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      },
      error: (reason) => {
        console.error('File download error:', reason);
      }
    });
  }

  onViewClickPending(url: any) {
    if (url.endsWith('jpg') || url.endsWith('png') || url.endsWith('jpeg')) {
      this.subscription = this.http
        .DownloadDataWithQuery('FileSystem/Downloadfile', url)
        .subscribe({
          next: (res: any) => {
            const blob = new Blob([res['body']], { type: 'image/png' });
            const objectURL = URL.createObjectURL(blob);
            this.ExpenseImageUrl = this.sanitizer.bypassSecurityTrustUrl(objectURL);
            // this.toggleViewModalpending()
          },
          error: (reason) => console.log(reason),
        });
    } else {
      this.ExpenseViewURL = `${environment.viewUrl}${url}`;
      // this.toggleViewModalpending()
    }
  }
  // toggleViewModal() {
  //   this.modalService.dismissAll();
  //   this.openModal(this.viewitemModal,)
  // }
  // toggleViewModalpending() {
  //   this.modalService.dismissAll();
  //   this.openModal(this.viewitemsModal);
  // }



  filterDraftsExpenses() {
    const draftExpenses = this.expenseheader
      .filter((expense) => expense.status === 'Draft')
      .reverse();
    this.flitredDrafts.next(draftExpenses);
    this.draftsCount = draftExpenses.length;
  }






}
