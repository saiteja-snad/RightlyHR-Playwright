import { Component, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import moment from 'moment';
import { HttpService } from '../../../services/http.service';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { Subscription } from 'rxjs';
import { IFormDetails, ISection } from './assessmentform';
import { environment } from '../../../../environments/environment.dev';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-assessmentform',
  imports: [ReactiveFormsModule,CommonModule],
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
  rejectSeparationForm!: FormGroup;
  rejectSubmitted = false; 
  acceptForm!: FormGroup;
  formSubmitted = false;
  approve = false;
  extend = false;
  discontinue = false;
  loggedindata = {} as any;
  @ViewChild('successhide') private readonly successhide!: NgbModal;
  @ViewChild('errorhide') private readonly errorhide!: NgbModal;
  @ViewChild('loaderpopup') loaderpopup!: ElementRef;
  @ViewChild('successpopup') successpopup!: ElementRef;
  @ViewChild('formsavepopup') formsavepopup!: ElementRef;
  Status: any;

  constructor( private router: Router, private http: HttpService,private fb: FormBuilder,
     private authService: AuthService,
    config: NgbModalConfig, private modalService: NgbModal) {
    config.backdrop = 'static';
    config.keyboard = false;
  }

  ngOnInit(): void {
    this.loggedindata = this.authService.getToken();
    this.getProbationExtendDays();
    let data = localStorage.getItem('formdata');
    if (data) {
      this.formemployeedetails = JSON.parse(data);
      console.log(this.formemployeedetails?.entity?.employeeId);
      this.getFormDetails(3356);
      this.selected_approve = this.formemployeedetails.entity;
      console.log(this.formemployeedetails);
    }
    this.rejectSeparationForm = this.fb.group({
      rejectedReason: [this.selectedData?.rejectedReason || '', Validators.required]
    });
  }
  personalForm!: FormGroup;
  initForm() {
    this.personalForm = this.fb.group({
      // section questions array
      dynamicSections: this.fb.array(this.dynamicFormQuestions.map(section =>
        this.fb.group(
          (section.questions ?? []).map(question =>
            this.fb.group({
              EmployeeId: [''],
              options: this.fb.array((question.options ?? []).map(option =>
                this.fb.group({
                  option: [option.option],
                  optionId: [option.optionId],
                  checked: [option.checked],
                  optionWeightage: [option.optionWeightage],
                  meta: [option.meta]
                })
              ))
            })
          )
        )
      )),
  
      // footer section
      footer: this.fb.array((this.dynamicFormFooter[0]?.questions ?? []).map(item =>
        this.fb.group({
          question: [item.question],
          options: this.fb.array((item.options ?? []).map(option =>
            this.fb.group({
              option: [option.option],
              optionId: [option.optionId],
              checked: [option.checked],
              value: [''],
              optionWeightage: [option.optionWeightage],
              meta: [option.meta]
            })
          ))
        })
      ))
    });
  }
  
  openmodel(content: any) {
    this.modalService.open(content, { centered: true })
  }

  dataSuccessMsg(msg: string) {
    this.Status = msg;
    this.openmodel(this.successhide);
    setTimeout(() => {
      this.modalService.dismissAll();
    }, 2000);
  }

  dataFailureMsg(msg: string) {
    this.Status = msg;
    this.openmodel(this.errorhide);
    setTimeout(() => {
      this.modalService.dismissAll();
    }, 2000);
  }

  //function to get the probation extend days
  probationExtensiondays = [] as any;
  getProbationExtendDaysconfig() {
    let moduleId = environment.SeparationrequestmoduleId;
    this.subscription = this.http
      .getData(`ProbationFlow/settingsconfigvalue/${moduleId}`)
      .subscribe({
        next: (data: any) => {
          console.log(data);
          this.probationExtensiondays = data;
        },
      });
  }

  probationExtensionDuration!: number;
  getProbationExtendDays() {
    let extensionId = environment.ProbationExtensionId;
    this.subscription = this.http
      .getData(`ProbationFlow/settingsprobationconfiggetall`)
      .subscribe({
        next: (data: any) => {
          console.log(data);
          let duration = data.find((ele: any) => {
            return ele.configValueId === extensionId;
          });
          console.log(duration);
          this.probationExtensionDuration = duration.noOfDays;
        },
      });
  }

  //function when they enter nulls in start
  ifreasonnull(Value: any) {
    //console.log(Value);
    if (!Value || !Value.trim()) {
      this.issubmitdiable = true;
    } else {
      this.issubmitdiable = false;
    }
  }

  //function call to get the data
  functioncall() {
    this.subscription = this.http.communicationService.subscribe({
      next: (response: any) => {
        console.log(response);
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
  overallRatingcount: number = 0;
  sectionRatings: { [key: number]: number } = {}; // Object to hold ratings for each section
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
      // .forEach((ele:any)=>{

      //     if(ele.id===sectionId){
      //       ele.data.optionId=optionId
      //     }

      //   })
      // .push({
      //   id: sectionId,
      //   data:  {"questionId":quetsionId,
      //     "optionId": optionId,
      //   "meta":meta,
      // "sectionId":sectionId}
      // }
      //  )
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
    // this.selected_questions.push({
    //   id: sectionId,
    //   data:  {"questionId":quetsionId,
    //     "optionId": optionId,
    //   "meta":meta,
    // "sectionId":sectionId}
    // }
    //  )
  }

  onCheckboxChangefooter(questions: any, rating: string, optionId: number, section: any, sectionId: number, quetsionId: number, meta: any): void {
    // Initialize section rating for the current section if it's not set
    if (!this.sectionRatings[sectionId]) {
      this.sectionRatings[sectionId] = 0;
    }
    // Reset section rating for the current section
    this.sectionRatings[sectionId] = 0;
    // Iterate through sections to find the correct section based on sectionId
    // section?.forEach((sec: any) => {
    // if (sec.id === sectionId) {
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
      // .forEach((ele:any)=>{
      //     if(ele.id===sectionId){
      //       ele.data.optionId=optionId
      //     }
      //   })
      // .push({
      //   id: sectionId,
      //   data:  {"questionId":quetsionId,
      //     "optionId": optionId,
      //   "meta":meta,
      // "sectionId":sectionId}
      // }
      //  )
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
    //console.log(this.selected_questions);
  }

  textArea() {
    this.displayTextArea = false;
    this.indexspace = 3
    this.modalService.open(this.formsavepopup,{centered:true});
  }

  cancel() {
    // this.displayTextArea = !this.displayTextArea;
    this.indexspace = 25;
    this.closeSave()
  }

  closeSave() {
    this.modalService.dismissAll();
  }

  formFile = {} as any;
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
    // this.router.navigate(["/timeoffleaves/probation-approvals"])
  }

  get comments() {
    return this.acceptForm.get('comments')!;
  }
  get extendDate() {
    return this.acceptForm.get('extendDate')!;
  }
  get extendReason() {
    return this.acceptForm.get('extendReason')!;
  }
  get rejectedReason() {
    return this.rejectSeparationForm.get('rejectedReason')!;
  }
  //to store file to the azure and return to the url
  AssessmentFormUpload(empId: number, file: File) {
    let filePath = `/FusionDocuments/Employee Documents/Probation Assessment Form/${empId}`;
    this.subscription = this.http.uploadFileWithQuery('FileSystem/uploadfiletodirectory', filePath, file).subscribe({
      next: (data: any) => {
        if (data) {
          // this.postProbationDetails(empId, data.path);
          //this.updateOfferDetails(data.path);
          console.log(data);
        }
      },
      error: (reason: any) => {
        console.log(reason);
        alert('file upload  is failed');
      },
    });
  }
  onRejectSubmit() {
    this.rejectSubmitted = true;
    if (this.rejectSeparationForm.valid) {
      const reason = this.rejectSeparationForm.value.rejectedReason;
      this.selectedData.rejectedReason = reason;
      // Proceed with submission logic here
    }
  }
  //function to upload the assesment form
  postProbationDetails() { }

  close() {
    this.router.navigate(['/timeoffleaves/probation-approvals']);
  }

  reset() {
    this.clearApproveData();
    this.clearExtendData();
    this.clearDiscontinueData();
    this.discontinue = false;
    this.extend = false;
    this.approve = false;
  }

  showloader() {
    this.modalService.open(this.loaderpopup, { centered: true });
  }

  closeLoader() {
    this.modalService.dismissAll();
  }

  openModal(content: any) {
    this.modalService.dismissAll();
    this.modalService.open(content, { centered: true })
  }

  showsuccess() {
    this.modalService.open(this.successpopup, { centered: true })
  }

  closeSuccess() {
    this.modalService.dismissAll();
  }

  openformApproval() {
    const modalElement = document.getElementById('formapprovals');
    const overlay = document.createElement('div');
    if (modalElement) {
      modalElement.classList.add('show');
      modalElement.style.display = 'block';
      document.body.classList.add('modal-open');
      overlay.className = 'modal-backdrop fade show';
      document.body.appendChild(overlay);
    }
  }

  //function to submit the formdata
  formSubmit() {
    this.closeSave()
    this.showloader();
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
        console.log(data);
        if (data) {
          this.responseId = data.responseId;
          this.FormDownload();
          this.closeLoader();
          this.showsuccess();
        }
      },
    });
  }

  click() {
    const modalElement = document.getElementById('savesuccess');
    if (modalElement) {
    }
  }

  //function to send approved status and comments
  jsonData = {} as any;
  handleAccept(f: NgForm) {
    this.isSubmitted = false;
    if (this.selected_approve.requestSelectedType == 'Approve') {
      this.jsonData = JSON.stringify({
        Overallrating: this.overallRatingcount,
        status: 'Confirmed',
        responseId: this.responseId,
      });
    }
    if (this.selected_approve.requestSelectedType == 'Reject') {
      this.jsonData = JSON.stringify({
        Overallrating: this.overallRatingcount,
        status: 'Rejected',
        responseId: this.responseId,
      });
    }
    if (this.selected_approve.requestSelectedType == 'Extend') {
      this.jsonData = JSON.stringify({
        Overallrating: this.overallRatingcount,
        PrExtendedDate: this.selected_approve.extenddate,
        status: 'Extended',
        responseId: this.responseId,
      });
    }
    let requestBody = {
      status: 'Approved',
      comments: this.selected_approve.comments,
      probationExtendedDate: this.selected_approve.extenddate,
      meta: this.jsonData,
      responseId: this.responseId,
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
          this.dataSuccessMsg('Probation Request Submitted Successfully');
          setTimeout(() => {
            this.modalService.dismissAll();
            this.router.navigate(['/timeoffleaves/probation-approvals']);
          }, 2000);
        },
        error: (reason: any) => {
          this.dataFailureMsg(reason.error.message)

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
          this.dataSuccessMsg('Probation Request Processed Successfully');

        },
        error: (reason: any) => {
          this.dataFailureMsg(reason.error.message)

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
          //  response.sectionDetails.filter((ele: any) => {
          //   return ele.sectionName === 'Overall Rating' ;
          // });
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
                  // onCheckboxChange(section.questions, options.optionWeightage,options.optionId,dynamicFormQuestions,section.id,questions.id,options.meta)
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
  
  
  buttondisable: boolean = false;
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
    // else {
    //   // Toggle off Early Relieving
    //   this.approve = false;
    //   this.clearApproveData();
    // }
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

  getBlockedFutureDate(lastWorkingDate: string): string {
    const lastWorkingDateObj = moment(lastWorkingDate).startOf('day'); // Set time to start of day (midnight)
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
