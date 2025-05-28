import { Component, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import moment from 'moment';
import { HttpService } from '../../../services/http.service';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { Subscription } from 'rxjs';
import { IFormDetails, ISection } from './assessmentform';
import { environment } from '../../../../environments/environment';
import { CommonModule } from '@angular/common';
import { RbacService } from '../../../services/rbac.service';
import { OpenModalService } from '../../../services/open-modal.service';
import { TranslateModule } from '@ngx-translate/core';
@Component({
  selector: 'app-assessmentform',
  imports: [FormsModule, CommonModule, TranslateModule],
  templateUrl: './assessmentform.component.html',
  styleUrl: './assessmentform.component.scss'
})

export class AssessmentformComponent {
  subscription!: Subscription;
  dynamicformSubmit = {} as IFormDetails;
  dynamicFormDetails = {} as IFormDetails;
  dynamicFormQuestions = [] as ISection[];
  dynamicFormHeader = [] as ISection[];
  dynamicFormFooter = [] as ISection[];
  empinfo = {} as any;
  formemployeedetails = {} as any;
  selectedData = {} as any;
  isempeffectivevaild: boolean = true;
  issubmitdiable: boolean = false;
  isSubmitted = true;
  isButtonClicked = false;
  retrivingData = {} as any;
  selected_questions = [] as any;
  selected_approve = {} as any;
  responseId!: number;
  displayTextArea = true;
  indexspace = 25;
  loggedindata = {} as any;
  jsonData = {} as any;
  discontinue: boolean = false;
  extend: boolean = false;
  approve: boolean = false;
  buttondisable: boolean = false;
  formFile = {} as any;
  probationExtensiondays = [] as any;
  probationExtensionDuration!: number;
  probationExtensionTimes!: number;
  overallRatingcount: number = 0;
  sectionRatings: { [key: number]: number } = {}; // Object to hold ratings for each section
  @ViewChild('formsavepopup') formsavepopup!: any;
  @ViewChild('cancelmodal') cancelmodal!: any;
  Status: any;

  constructor(
    private router: Router,
    private http: HttpService,
    private authService: AuthService,
    config: NgbModalConfig,
    private modalService: NgbModal,
    private openModalService: OpenModalService,
    public rbac: RbacService,
  ) {
    config.backdrop = 'static';
    config.keyboard = false;
  }

  ngOnInit(): void {
    this.loggedindata = this.authService.getToken();
    this.getProbationExtendDays();
    let data = localStorage.getItem('formdata');
    if (data) {
      this.formemployeedetails = JSON.parse(data);
      this.getFormDetails(this.formemployeedetails?.entity?.employeeId);
      this.selected_approve = this.formemployeedetails.entity;
    }
  }

  openmodel(content: any) {
    this.modalService.open(content, { centered: true })
  }

  //function to get the probation extend days
  getProbationExtendDaysconfig() {
    let moduleId = environment.SeparationrequestmoduleId;
    this.subscription = this.http.getData(`ProbationFlow/settingsconfigvalue/${moduleId}`).subscribe({
        next: (data: any) => {
          this.probationExtensiondays = data;
        },
      });
  }


  getProbationExtendDays() {
    let extensionId = environment.ProbationExtensionId;
    let extensionPeriodTimes = environment.ProbationExtendPeriodTimes;
    this.subscription = this.http
      .getData(`ProbationFlow/settingsprobationconfiggetall`)
      .subscribe({
        next: (data: any) => {
          let duration = data.find((ele: any) => {
            return ele.configValueId === extensionId;
          });
          this.probationExtensionDuration = duration.noOfDays;
            let extendTimes = data.find((ele: any) => {
            return ele.configValueId === extensionPeriodTimes;
          });
          this.probationExtensionTimes = extendTimes.noOfDays;
          console.log(this.probationExtensionTimes);
        },
      });
  }

  //function when they enter nulls in start
  ifreasonnull(Value: any) {
    //console.log(Value);
    const trimmedValue = Value?.trim();
  const startsWithSpecialChar = /^[^a-zA-Z0-9]/.test(trimmedValue);

  if (!trimmedValue || startsWithSpecialChar) {
    this.issubmitdiable = true;
  } else {
    this.issubmitdiable = false;
  }
  }

  //function call to get the data
  functioncall() {
    this.subscription = this.http.communicationService.subscribe({
      next: (response: any) => {
        this.getFormDetails(response);
      },
      error: (err: any) => {
        console.error('Error retrieving data', err);
        // Handle the error accordingly
      },
      complete: () => {
        console.log('Request completed');
      },
    });
  }

  //functions to render data
  currentSectionIndex = 0;
  get currentSection() {
    return this.dynamicFormQuestions[this.currentSectionIndex];
  }

  get isFirstSection() {
    return this.currentSectionIndex === 0;
  }

  get isLastSection() {
    return this.currentSectionIndex === this.dynamicFormQuestions.length - 1;
  }

  nextSection() {
    if (!this.isLastSection) {
      this.currentSectionIndex++;
      let questiondata = this.dynamicFormQuestions.find((ele: any) => {
        return ele.id == this.currentSectionIndex;
      });
    }
  }

  previousSection() {
    if (!this.isFirstSection) {
      this.currentSectionIndex--;
    }
  }

  //function get selected question details

  onCheckboxChange(
    questions: any,
    rating: string,
    optionId: number,
    section: any,
    sectionId: number,
    quetsionId: number,
    meta: any
  ): void {
    // Initialize section rating for the current section if it's not set
    if (!this.sectionRatings[sectionId]) {
      this.sectionRatings[sectionId] = 0;
    }
    // Reset section rating for the current section
    this.sectionRatings[sectionId] = 0;
    // Iterate through sections to find the correct section based on sectionId
    section?.forEach((sec: any) => {
      if (sec.id === sectionId) {
        // Iterate through questions in the current section
        questions.forEach((optionsarray: any) => {
          optionsarray.options.forEach((element: any) => {
            if (element.optionId === optionId) {
              // Toggle the checkbox state and update section rating
              if (element.checked) {
                // Checkbox is being unchecked
                element.checked = false;
                this.sectionRatings[sectionId] = Math.max(
                  0,
                  this.sectionRatings[sectionId] - parseInt(rating, 10)
                ); // Ensure rating doesn't go below 0
              } else {
                // Checkbox is being checked
                element.checked = true;
                this.sectionRatings[sectionId] += parseInt(rating, 10); // Add rating to section rating
              }
            } else {
              // Ensure other options in the same section are unchecked
              element.checked = false;
            }
          });
        });
      }
    });
    const hasdata = this.selected_questions.filter(
      (t: any) => t.id === sectionId
    );
    // Calculate overall rating by summing section ratings
    this.overallRatingcount = 0;
    if (this.overallRatingcount >= 0) {
      Object.keys(this.sectionRatings).forEach((key: string) => {
        this.overallRatingcount +=
          this.sectionRatings[parseInt(key, 10)] /
          this.dynamicFormDetails.overAllRating;
      });
    }
    if (hasdata.length > 0) {
      this.selected_questions.forEach((ele: any) => {
        if (ele.id === sectionId && ele.data.optionId) {
          ele.data.optionId = optionId;
        }
      });
    } else {
      questions.forEach((ele: any) => {
        if (ele.options.length > 0) {
          this.selected_questions.push({
            id: sectionId,
            data: {
              questionId: ele.id,
              optionId: optionId,
              meta: meta,
              sectionId: sectionId,
            },
          });
        } else {
          this.selected_questions.push({
            id: sectionId,
            data: {
              questionId: ele.id,
              optionId: optionId,
              meta: meta,
              sectionId: sectionId,
            },
          });
        }
      });
    }
    this.selected_questions.forEach((ele: any) => {
      if (ele.id === sectionId && ele.data.optionId) {
        ele.data.optionId = optionId;
      }
    });
  }

  //function to get the footer values
  onCheckboxforfootertext(
    questions: any,
    rating: string,
    optionId: number,
    section: any,
    sectionId: number,
    quetsionId: number,
    meta: any
  ): void {
    const hasdata = this.selected_questions.filter(
      (t: any) => t.data.questionId === quetsionId
    );
    if (hasdata.length > 0) {
      this.selected_questions.forEach((ele: any) => {
        if (ele.data.questionId === quetsionId) {
          ele.data.optionId = optionId;
          ele.data.questionId = quetsionId;
          ele.data.meta = meta;
        }
      });

    } else {

      this.selected_questions.push({
        id: sectionId,
        data: {
          questionId: quetsionId,
          optionId: optionId,
          meta: meta,
          sectionId: sectionId,
        },
      });

    }

  }

  onCheckboxChangefooter(questions: any, rating: string, optionId: number, section: any, sectionId: number, quetsionId: number, meta: any): void {

    if (!this.sectionRatings[sectionId]) {
      this.sectionRatings[sectionId] = 0;
    }
    // Reset section rating for the current section
    this.sectionRatings[sectionId] = 0;

    questions.forEach((optionsarray: any) => {
      optionsarray.options.forEach((element: any) => {
        if (element.optionId === optionId) {
          // Toggle the checkbox state and update section rating
          if (element.checked) {
            // Checkbox is being unchecked
            element.checked = false;
            this.sectionRatings[sectionId] = Math.max(
              0,
              this.sectionRatings[sectionId] - parseInt(rating, 10)
            ); // Ensure rating doesn't go below 0
          } else {
            // Checkbox is being checked
            element.checked = true;
            this.sectionRatings[sectionId] += parseInt(rating, 10); // Add rating to section rating
          }
        } else {
          // Ensure other options in the same section are unchecked
          element.checked = false;
        }
      });
    });
    // }
    // });
    const hasdata = this.selected_questions.filter(
      (t: any) => t.data.questionId === quetsionId
    );
    // Calculate overall rating by summing section ratings
    this.overallRatingcount = 0;
    if (this.overallRatingcount >= 0) {
      Object.keys(this.sectionRatings).forEach((key: string) => {
        this.overallRatingcount +=
          this.sectionRatings[parseInt(key, 10)] /
          this.dynamicFormDetails.overAllRating;
      });
    }
    if (hasdata.length > 0) {
      this.selected_questions.forEach((ele: any) => {
        if (ele.data.questionId === quetsionId) {
          ele.data.optionId = optionId;
          ele.data.questionId = quetsionId;
          ele.data.meta = meta;
        }
      });

    } else {
      // questions.forEach((ele:any)=>{
      this.selected_questions.push({
        id: sectionId,
        data: {
          questionId: quetsionId,
          optionId: optionId,
          meta: meta,
          sectionId: sectionId,
        },
      });
      // })
    }
  }

  //function to add the default section id and question id to the form
  defaultaddingforvalues(questions: any, rating: string, optionId: number, section: any, sectionId: number, quetsionId: number, meta: any): void {
    // Initialize section rating for the current section if it's not set
    if (!this.sectionRatings[sectionId]) {
      this.sectionRatings[sectionId] = 0;
    }
    // Reset section rating for the current section
    this.sectionRatings[sectionId] = 0;
    // Iterate through sections to find the correct section based on sectionId
    section?.forEach((sec: any) => {
      if (sec.id === sectionId) {
        // Iterate through questions in the current section
        questions.forEach((optionsarray: any) => {
          optionsarray.options.forEach((element: any) => {
            if (element.optionId === optionId) {
              // Toggle the checkbox state and update section rating
              if (element.checked) {
                // Checkbox is being unchecked
                element.checked = false;
              } else {
                // Checkbox is being checked
                element.checked = true;
              }
            } else {
              // Ensure other options in the same section are unchecked
              element.checked = false;
            }
          });
        });
      }
    });
    const hasdata = this.selected_questions.filter(
      (t: any) => t.id === sectionId
    );
    if (hasdata.length > 0) {
      this.selected_questions.forEach((ele: any) => {
        if (ele.id === sectionId && ele.data.optionId) {
          ele.data.optionId = optionId;
        }
      });
    } else {
      questions.forEach((ele: any) => {
        if (ele.options.length > 0) {
          this.selected_questions.push({
            id: sectionId,
            data: {
              questionId: ele.id,
              optionId: optionId,
              meta: meta,
              sectionId: sectionId,
            },
          });
        } else {
          this.selected_questions.push({
            id: sectionId,
            data: {
              questionId: ele.id,
              optionId: optionId,
              meta: meta,
              sectionId: sectionId,
            },
          });
        }
      });
    }
  }

  textArea() {
    this.displayTextArea = false;
    this.indexspace = 3
    this.modalService.open(this.formsavepopup, { centered: true });
  }

  FormDownload() {
    localStorage.setItem('assessmentform', 'true');
    const pdfContent = document.getElementById('content');
    if (pdfContent) {
      html2canvas(pdfContent, { scale: 3, scrollX: 0, scrollY: 0 }).then(
        (canvas) => {
          const imgData = canvas.toDataURL('image/png');
          const pdf = new jsPDF('p', 'mm', 'a4');
          const imgWidth = pdf.internal.pageSize.getWidth();
          const pageHeight = pdf.internal.pageSize.getHeight();
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          let heightLeft = imgHeight;
          let position = 0;
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, '', 'FAST');
          heightLeft -= pageHeight;
          while (heightLeft >= 0) {
            position = heightLeft - imgHeight + 2;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, '', 'FAST');
            heightLeft -= pageHeight;
          }
          const fileName = `${this.dynamicFormDetails.employeeName
            }_${new Date().getTime()}_Probation Assessment form Confirmed by ${this.dynamicFormDetails.reviewerName
            }.pdf`;
          pdf.save(fileName);
          const blob = pdf.output('blob');
          console.log(blob);
          // Creating form file to upload into Azure
          let d = new Date();
          const file = new File([blob], fileName, {
            type: 'application/pdf',
          });
          this.formFile = file;
          this.AssessmentFormUpload(
            this.dynamicFormDetails.employeeId,
            this.formFile
          );
        }
      );
    }
    this.displayTextArea = !this.displayTextArea;
    this.indexspace = 25

  }

  //to store file to the azure and return to the url
  AssessmentFormUpload(empId: number, file: File) {
    let filePath = `/FusionDocuments/Employee Documents/Probation Assessment Form/${empId}`;
    this.subscription = this.http.uploadFileWithQuery('FileSystem/uploadfiletodirectory', filePath, file).subscribe({
      next: (data: any) => {
        if (data) {

          console.log(data);
        }
      },
      error: (reason: any) => {
        console.log(reason);
        alert('file upload  is failed');
      },
    });
  }

  //function to upload the assesment form
  postProbationDetails() { }

  close() {
    this.closeModal()
    this.router.navigate(['/time-off/pending-approvals/probation-request']);
  }

  reset(content:any) {
    this.modalService.open(content, { centered: true })
    this.clearApproveData();
    this.clearExtendData();
    this.clearDiscontinueData();
    this.discontinue = false;
    this.extend = false;
    this.approve = false;
  }

  closeModal() {
    this.modalService.dismissAll();
  }

  openModal(content: any) {
    this.modalService.dismissAll();
    this.modalService.open(content, { centered: true })
  }

  closeSuccess() {
    this.modalService.dismissAll();
  }

  //function to submit the formdata
  formSubmit(content: any) {
    this.modalService.dismissAll();
    let loginuserdata = this.authService.getToken();
    this.jsonData = JSON.stringify({
      Overallrating: this.overallRatingcount,
      Text: this.dynamicformSubmit.textarea,
    });
    let questionAnswers = [] as any;
    if (this.selected_questions.length > 0) {
      this.selected_questions.forEach((ele: any) => {
        questionAnswers.push(ele.data);
      });
    }
    let payload = {
      employeeId: this.dynamicFormDetails.employeeId,
      formId: this.dynamicFormDetails.formId,
      questionAnswers: questionAnswers,
      meta: this.jsonData,
      raisedBy: loginuserdata.employeeId,
      reportingManagerId: this.dynamicFormDetails.rmEmpId,
      teamManagerId: this.dynamicFormDetails.tmEmpId,
    };
    this.subscription = this.http.postdata(`ProbationFlow/postOrUpdateFormResponse`, payload).subscribe({
      next: (data: any) => {
        if (data) {
          this.responseId = data.responseId;
          this.FormDownload();
          this.closeModal();
          this.modalService.open(content, { centered: true })
        }
      },
    });
  }


  handleAccept(f: NgForm) {
    this.isSubmitted = false;
    this.openModalService.openLoaderModal('Requesting....')
    let successMessage = '';
    if (this.selected_approve.requestSelectedType == 'Approve') {
      this.jsonData = JSON.stringify({
        Overallrating: this.overallRatingcount,
        status: 'Confirmed',
        responseId: this.responseId,
      });
      successMessage = 'Probation request approved successfully';
    }
    if (this.selected_approve.requestSelectedType == 'Reject') {
      this.jsonData = JSON.stringify({
        Overallrating: this.overallRatingcount,
        status: 'Rejected',
        responseId: this.responseId,
      });
      successMessage = 'Probation request rejected successfully';
    }
    if (this.selected_approve.requestSelectedType == 'Extend') {
      this.jsonData = JSON.stringify({
        Overallrating: this.overallRatingcount,
        PrExtendedDate: this.selected_approve.extenddate,
        status: 'Extended',
        responseId: this.responseId,
      });
      successMessage = 'Probation request extended successfully';
    }
    let requestBody = {
      status: 'Approved',
      comments: this.selected_approve.comments,
      probationExtendedDate: this.selected_approve.extenddate,
      meta: this.jsonData,
      responseId: this.responseId,
      currentStage: parseInt(this.formemployeedetails.approvalHeader?.currentapprovalStage)
    };
    if (this.selected_approve.requestSelectedType == 'Approve') {
      requestBody.status = 'Approved';
    }
    if (this.selected_approve.requestSelectedType == 'Reject') {
      requestBody.status = 'Rejected';
      requestBody.comments = this.selected_approve.rejectedReason;
    }
    if (this.selected_approve.requestSelectedType == 'Extend') {
      requestBody.probationExtendedDate = this.selected_approve.extenddate;
      requestBody.comments = this.selected_approve.reasonForExtend;
      requestBody.status = 'Approved';
    }
    this.subscription = this.http
      .putData(
        `PendingApproval/${this.formemployeedetails.approvalHeader?.id}`,
        requestBody
      )
      .subscribe({
        next: (respone: any) => {
          this.modalService.dismissAll();
          this.openModalService.openSuccessModal(successMessage);
          setTimeout(() => {
            this.modalService.dismissAll();
            this.router.navigate(['/time-off/pending-approvals/probation-request']);
          }, 2000);
        },
        error: (reason: any) => {
          this.openModalService.openErrorModal(reason.error.message);

        },
        complete: () => {
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        },
      });
  }

  //function to handle the process request
  handleProcess(f: NgForm) {
    this.isSubmitted = false;
    if (this.selected_approve.requestSelectedType == 'Approve') {
      this.jsonData = JSON.stringify({
        Overallrating: this.overallRatingcount,
        status: 'Processed',
      });
    }
    if (this.selected_approve.requestSelectedType == 'Reject') {
      this.jsonData = JSON.stringify({
        Overallrating: this.overallRatingcount,
        status: 'Rejected',
      });
    }
    if (this.selected_approve.requestSelectedType == 'Extend') {
      this.jsonData = JSON.stringify({
        Overallrating: this.overallRatingcount,
        status: 'Extended',
      });
    }
    let requestBody = {
      status: 'Processed',
      comments: this.selected_approve.comments,
      extendedDate: this.selected_approve.extenddate,
      meta: this.jsonData,
      responseId: this.responseId,
      currentStage:parseInt(this.formemployeedetails.approvalHeader?.currentapprovalStage)
    };
    if (this.selected_approve.requestSelectedType == 'Approve') {
      requestBody.status = 'Processed';
    }
    if (this.selected_approve.requestSelectedType == 'Reject') {
      requestBody.status = 'Rejected';
    }
    if (this.selected_approve.requestSelectedType == 'Extend') {
      requestBody.extendedDate = this.selected_approve.extenddate;
      requestBody.status = 'Processed';
    }
    this.subscription = this.http
      .putData(
        `PendingApproval/process/${this.formemployeedetails.approvalHeader?.id}`,
        requestBody
      )
      .subscribe({
        next: (respone: any) => {
          this.openModalService.openSuccessModal('Probation request processed successfully');

        },
        error: (reason: any) => {
          // this.dataFailureMsg(reason.error.message)
          this.openModalService.openErrorModal(reason.error.message);

        },
        complete: () => {
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        },
      });
  }

  //function to get the form answers
  getFormDetails(Value: any) {
    this.subscription = this.http
      .getData(`ProbationFlow/getFormResponseByFormId/1?employeeId=${Value}`)
      .subscribe({
        next: (response: any) => {
          console.log(response);
          this.dynamicFormDetails = response;
          this.dynamicFormQuestions = response.sectionDetails
            .filter(
              (ele: any) =>
                ele.sectionName !== 'Header' &&
                ele.sectionName !== 'Overall Rating'
            )
            .map((section: any) => ({
              ...section,
              questions: section.questions.map((question: any) => ({
                ...question,
                options: question.options.map((option: any) => ({
                  ...option,
                  checked: false,
                })),
              })),
            }));
          this.dynamicFormHeader = response.sectionDetails.filter(
            (ele: any) => {
              return ele.sectionName === 'Header';
            }
          );
          this.dynamicFormFooter = response.sectionDetails
            .filter((ele: any) => ele.sectionName === 'Overall Rating')
            .map((section: any) => ({
              ...section,
              questions: section.questions.map((question: any) => ({
                ...question,
                options: question.options.map((option: any) => ({
                  ...option,
                  checked: false,
                })),
              })),
            }));
          this.dynamicFormHeader.forEach((ele: any) => {
            ele.questions.forEach((question: any) => {
              if (question.options.length > 0) {
                question.options.forEach((option: any) => {
                  this.defaultaddingforvalues(
                    ele.questions,
                    ele.rating,
                    option.optionId,
                    this.dynamicFormHeader,
                    ele.id,
                    question.quetsionId,
                    question.meta
                  );
                });
              } else {
                this.defaultaddingforvalues(
                  ele.questions,
                  ele.rating,
                  0,
                  this.dynamicFormHeader,
                  ele.id,
                  question.quetsionId,
                  question.meta
                );
              }
            });
          });
        },
        error: (err: any) => {
          console.log(err);
        },
      });
  }

  // Function to handle toggling Early Relieving option
  toggleApprove() {
    if (!this.approve) {
      this.discontinue = false;
      this.extend = false;
      this.approve = true;
      this.buttondisable = true;
      this.selected_approve.requestSelectedType = 'Approve';
      // Clear data related to Extend and Discontinue
      this.clearExtendData();
      this.clearDiscontinueData();
    }
  }

  // Function to handle toggling Extend option
  toggleExtend() {
    this.discontinue = false;
    this.approve = false;
    this.extend = true;
    this.buttondisable = true;
    this.selected_approve.requestSelectedType = 'Extend';
    // Clear data related to approve Relieving and Discontinue
    this.clearApproveData();
    this.clearDiscontinueData();
  }

  // Function to handle toggling Discontinue option
  toggleDiscontinue() {
    this.extend = false;
    this.approve = false;
    this.discontinue = true;
    this.buttondisable = true;
    this.selected_approve.requestSelectedType = 'Reject';
    // Clear data related to Early Relieving and Extend
    this.clearApproveData();
    this.clearExtendData();
  }

  // Function to clear data related to Early Relieving
  clearApproveData() {
    this.selected_approve.comments = '';
  }

  // Function to clear data related to Extend
  clearExtendData() {
    this.selected_approve.extenddate = null;
    this.selected_approve.reasonForExtend = '';
  }

  // Function to clear data related to Discontinue
  clearDiscontinueData() {
    this.selected_approve.rejectedReason = '';
  }

  getBlockedFutureDate(lastWorkingDate: string,extendedDate:string): string {
    if(extendedDate){
      lastWorkingDate = extendedDate;
    }
    const lastWorkingDateObj = moment(lastWorkingDate).startOf('day').add(1, 'day');; // Set time to start of day (midnight)
    // Format the date as "YYYY-MM-DD"
    const formattedDate = lastWorkingDateObj.format('YYYY-MM-DD');
    return formattedDate;
  }

  getBlockedFutureDateupto(startDate: string, duration: number): string {
    const startDateObj = moment(startDate).startOf('day'); // Set time to start of day (midnight)
    // Add the duration (e.g., 90 days) to the start date
    const futureDate = startDateObj.add(duration, 'days');
    // Format the future date as "YYYY-MM-DD"
    const formattedFutureDate = futureDate.format('YYYY-MM-DD');
    return formattedFutureDate;
  }

  formatText(text: string): string {
    if (!text) return text;
    const breakAt = 100;
    const regex = new RegExp(`.{1,${breakAt}}`, 'g');
    return text.match(regex)?.join('\n') || text;
  }

  letters(event: KeyboardEvent): boolean {
    const charCode = event.key.charCodeAt(0);
    if (
      (charCode < 65 || charCode > 90) &&
      (charCode < 97 || charCode > 122) &&
      charCode !== 32
    ) {
      return false;
    }
    return true;
  }
}