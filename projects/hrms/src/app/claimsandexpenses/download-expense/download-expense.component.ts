
import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Subscription } from 'rxjs';
import { HttpService } from '../../services/http.service';
import { DateformatPipe } from "../../Pipes/dateformat.pipe";
import { environment } from '../../../environments/environment.dev';
import { CurrencyPipe } from '@angular/common';
import { CommonModule } from '@angular/common';
import { OpenModalService } from '../../services/open-modal.service';
@Component({
  selector: 'app-download-expense',
  imports: [DateformatPipe, CommonModule, CurrencyPipe],
  templateUrl: './download-expense.component.html',
  styleUrl: './download-expense.component.scss',
})
export class DownloadExpenseComponent implements OnInit, OnDestroy {

  subscription!: Subscription;
  @Input() downloadData: any;
  selectedItems = {} as any;
  empdata = {} as any;
  isLoading = false;
  Status!: string
  currencyCode = environment.currencyCode;
  Approverdata = {} as any;
  @ViewChild('successhide') private readonly successhide!: NgbModal;
  constructor(
    public router: Router,
    private http: HttpService,
    config: NgbModalConfig, private modalService: NgbModal,
    private conformationPopup: OpenModalService,
  ) {
    config.backdrop = 'static';
    config.keyboard = false;
  }
  ngOnInit(): void {
    console.log(this.downloadData);
    if (this.downloadData) {
      this.Approverdata = this.downloadData.expenseApproverComments?.find((item: any) => item?.action === 'Approved');
      console.log(this.Approverdata);

      this.getItem(this.downloadData.expenses_ID);
    } else {
      this.getItem(0); // Default to 0 if no data is provided
    }
  }
  //function to get the expense item by id
  getItem(expid: number) {
    this.subscription = this.http
      .getitembyid(`Expenses_Header/getby_Expense_ID`, expid).subscribe({
        next: (data: any) => {
          this.selectedItems = data;
          this.getEmployeeDetails(this.selectedItems.employeeId);
          console.log(this.selectedItems);
        }, error(err) {
          console.log("expensesheadererror", err)
        },
      });

  }
  //function to get the employee details by id
  getEmployeeDetails(employeeId: number) {
    this.subscription = this.http.getData(`Employeedata/${employeeId}`).subscribe({
      next: (data: any) => {
        console.log(data);
        this.empdata = data;
        this.getJobdetails(this.empdata);
      },
      error: (reason: any) => {
        console.log(reason);
      },
    });
  }
  //get Job Details by empployeeid
  getJobdetails(Employee: any) {
    this.subscription = this.http
      .getData(`JobDetails/Empname/${Employee.employeeId}`)
      .subscribe({
        next: (data: any) => {
          console.log(data);
          const today = new Date();
          const pastEffectiveJobs = data.filter((job: any) =>
            new Date(job.effectiveDate) <= today
          );
          pastEffectiveJobs.sort((a: any, b: any) =>
            new Date(b.effectiveDate).getTime() - new Date(a.effectiveDate).getTime()
          );
          const res = pastEffectiveJobs[0];
          Employee.jobRole = res.jobRole;
          Employee.workLocation = res.lopcation;
          Employee.subLocation = res.subLocation;
          Employee.departmentName = res.departmentName;
          Employee.subdepartmentName = res.subdepartmentName;
          console.log(Employee.jobRole);
        },
        error: (reason: any) => {
          console.log(reason);
        },
      });
  }
  //function to download the file
  async downloadfile() {
    this.isLoading = true;

    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = pdf.internal.pageSize.getWidth();
    const imgHeight = pdf.internal.pageSize.getHeight();

    const pdfContents = [
      'pdfContent1',
    ]; // Add more content IDs if needed
    // Create a single canvas to combine all content elements
    const combinedCanvas = document.createElement('canvas');
    combinedCanvas.width = imgWidth;
    combinedCanvas.height = pdfContents.length * imgHeight;
    const imagesData = [];

    for (const contentId of pdfContents) {
      const pdfContent = document.getElementById(contentId);
      if (pdfContent) {
        const canvas = await html2canvas(pdfContent, { scale: 3 });
        const imgData = canvas.toDataURL('image/png');
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        imagesData.push({ imgData, imgHeight });
      }
    }

    // Add all images to the PDF except for the last one
    for (let i = 0; i < imagesData.length - 1; i++) {
      const imageData = imagesData[i];
      pdf.addImage(
        imageData.imgData,
        'PNG',
        0,
        0,
        imgWidth,
        imageData.imgHeight,
        '',
        'FAST'
      );
      pdf.addPage(); // Add a new page for the next image (except for the last one)
    }

    // Add the last image without adding a new page
    if (imagesData.length > 0) {
      const lastImageData = imagesData[imagesData.length - 1];
      pdf.addImage(
        lastImageData.imgData,
        'PNG',
        0,
        0,
        imgWidth,
        lastImageData.imgHeight,
        '',
        'FAST'
      );
    }

    const fileName = `${this.selectedItems.expenses_Title}_${new Date().getTime()}_Expense.pdf`;
    pdf.save(fileName);
    this.isLoading = false;
    const blob = pdf.output('blob');
       this.conformationPopup.openSuccessModal('Expense statement downloaded successfully ');
  }
  openmodel(content: any) {
    this.modalService.open(content, { centered: true });
  }
  dataSuccessMsg(msg: string) {
    this.Status = msg;
    this.openmodel(this.successhide);
    setTimeout(() => {
      this.modalService.dismissAll();
    }, 2000);
  }
  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
  }

}
