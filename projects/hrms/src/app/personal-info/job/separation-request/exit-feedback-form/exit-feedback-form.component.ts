import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpService } from '../../../../services/http.service';
import { Subscription } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { DataLoaderContentComponent } from "../../../../shared/data-loader-content/data-loader-content.component";
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { OpenModalService } from '../../../../services/open-modal.service';
import { AuthService } from '../../../../services/auth.service';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { LettersheaderComponent } from "../../../../shared/letters-shared-content/lettersheader/lettersheader.component";
import { LetterFooterComponent } from "../../../../shared/letters-shared-content/letter-footer/letter-footer.component";

interface IFormSection {
  id: number;
  sectionName: string;
  sectionType: string;
  order: number;
  questions: IFormQuestion[];
}

interface IFormQuestion {
  id: number;
  question: string;
  type: string;
  questionWeightage: number;
  required: boolean;
  order: number;
  options: IFormOption[];
}

interface IFormOption {
  optionId: string;
  option: string;
  optionWeightage: number;
}

interface IFormDetails {
  department: any;
  team: any;
  doj: string | number | Date;
  sublocation: any;
  location: any;
  jobRole: any;
  employeeName: any;
  fusionEmpId: any;
  formId: number;
  formName: string;
  moduleId: number;
  slug: string;
  ratingScaleRange: string;
  overAllRating: number;
  sectionDetails: IFormSection[];
}

@Component({
  selector: 'app-exit-feedback-form',
  imports: [CommonModule, TranslateModule, DataLoaderContentComponent, ReactiveFormsModule, LettersheaderComponent, LetterFooterComponent],
  templateUrl: './exit-feedback-form.component.html',
  styleUrl: './exit-feedback-form.component.scss'
})
export class ExitFeedbackFormComponent implements OnInit, OnDestroy {
  
  empinfo = {} as any;
  formDetails = {} as IFormDetails;
  data: any;
  formSections: IFormSection[] = [];
  isDataLoaded = false;
  subscription!: Subscription;
  formData: any;
  selectedAnswers: { [key: number]: string } = {};
  textAnswers: { [key: number]: string } = {};
  isSubmitting = false;
  formFile: any;
  documentUrl: string = '';
  isGeneratingPdf = false;
  empResponseId: number = 0;

  constructor(
    private router: Router,
    private http: HttpService,
    private openModalService: OpenModalService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.getEmpInfoFromRoute();
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
   getEmpInfoFromRoute(): void {
    const fullPath = this.router.url;
    console.log('Full path:', fullPath);
    if (fullPath.startsWith('/personalinfo')) {
      this.empinfo = JSON.parse(localStorage.getItem('personaldata') || '{}');
      this.loadFormData();
    } else if (fullPath.startsWith('/myinfo')) {
      this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
      this.loadFormData();
    }
  }
  loadFormData(): void {
    this.data = localStorage.getItem('exitfeedbackformdata');
    if (this.data) {
      this.formData = JSON.parse(this.data);
      this.getFormDetails(this.formData.entity.empFormId);
    } else {
      this.openModalService.openErrorModal('Failed to initiate form');
    }
  }

  getFormDetails(formId: number): void {
    this.isDataLoaded = true;
    this.subscription = this.http
      .getData(`ExitFeedbackRequest/getFormResponseByFormId/${formId}?employeeId=${this.empinfo.employeeId}`)
      .subscribe({
        next: (response: any) => {
          if (response.success && response.data) {
            this.formDetails = response.data;
            this.formSections = response.data.sectionDetails || [];
          }
          this.isDataLoaded = false;
        },
        error: (err: any) => {
          console.error('Error loading form details:', err);
          this.isDataLoaded = false;
        }
      });
  }

   

  goBack(): void {
    const fullPath = this.router.url;
    console.log('Full path:', fullPath);
    if (fullPath.startsWith('/personalinfo')) {
      this.empinfo = JSON.parse(localStorage.getItem('personaldata') || '{}');
      this.router.navigate(['/personalinfo/job/separation-details/exit-feedback-details']);
    } else if (fullPath.startsWith('/myinfo')) {
      this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
      this.router.navigate(['/myinfo/job/separation-details/exit-feedback-details']);
    }
    
  }

  onAnswerChange(questionId: number, optionId: string): void {
    this.selectedAnswers[questionId] = optionId;
  }

  onTextAnswerChange(questionId: number, event: any): void {
    this.textAnswers[questionId] = event.target.value;
  }

  getTextAnswer(questionId: number): string {
    return this.textAnswers[questionId] || '';
  }

  FormDownload(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.isGeneratingPdf = true;
      
      // Wait for DOM to update before capturing
      setTimeout(() => {
        const pdfContent = document.getElementById('content');
        if (pdfContent) {
          html2canvas(pdfContent, { scale: 2, scrollX: 0, scrollY: 0, useCORS: true }).then(
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
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, '', 'FAST');
                heightLeft -= pageHeight;
              }
              
              const fileName = `${this.formData.entity.employeeId}_${new Date().getTime()}_Exit_Feedback_Form.pdf`;
              pdf.save(fileName);
              const blob = pdf.output('blob');
              const file = new File([blob], fileName, {
                type: 'application/pdf',
              });
              this.formFile = file;
              this.ExitFeedbackFormUpload(
                this.formData.entity.employeeId,
                this.formFile
              ).then(() => {
                resolve();
              }).catch((error) => {
                reject(error);
              });
            }
          ).catch((error) => {
            this.isGeneratingPdf = false;
            reject(error);
          });
        } else {
          reject('PDF content not found');
        }
      }, 2000);
    });
  }

  ExitFeedbackFormUpload(empId: number, file: File): Promise<void> {
    return new Promise((resolve, reject) => {
      let filePath = `/FusionDocuments/Employee Documents/Exit Feedback Form/${empId}`;
      
      this.subscription = this.http.uploadFileWithQuery('FileSystem/uploadfiletodirectory', filePath, file).subscribe({
        next: (data: any) => {
          console.log('Upload response:', data);
          if (data && (data.path || data.url || data.filePath)) {
            this.documentUrl = data.path || data.url || data.filePath;
            console.log('Document uploaded successfully, URL:', this.documentUrl);
          }
          this.isGeneratingPdf = false;
          resolve();
        },
        error: (reason: any) => {
          console.log('Upload error:', reason);
          this.openModalService.openErrorModal('File upload failed');
          this.isGeneratingPdf = false;
          reject(reason);
        },
      });
    });
  }

  submitForm(): void {
    if (Object.keys(this.selectedAnswers).length === 0) {
      this.openModalService.openErrorModal('Please answer at least one question');
      return;
    }

    this.isSubmitting = true;
    const loggedInUser = this.authService.getToken();
    
    const questionAnswers = Object.entries(this.selectedAnswers).map(([questionId, optionId]) => {
      const question = this.findQuestionById(parseInt(questionId));
      const option = question?.options.find(opt => opt.optionId === optionId);
      
      return {
        questionId: parseInt(questionId),
        optionId: parseInt(optionId),
        sectionId: this.findSectionIdByQuestionId(parseInt(questionId)),
        meta: '',
        rating: option?.optionWeightage || 0,
        comments: ''
      };
    });

    const payload = {
      employeeId: parseInt(this.formData.entity.employeeId),
      formId: this.formDetails.formId,
      raisedBy: loggedInUser.employeeId,
      status: 'Submitted',
      questionAnswers: questionAnswers
    };

    this.subscription = this.http.postdata('ExitFeedbackRequest/submitformresponse', payload).subscribe({
      next: (response: any) => {
        this.isSubmitting = false;
        this.empResponseId = response.data?.id || response.id || 0;
        // Use async/await pattern for proper sequencing
        this.FormDownload().then(() => {
          console.log('PDF generated and uploaded, document URL:', this.documentUrl);
          this.submitExitFeedback();
        }).catch((error) => {
          console.error('PDF generation/upload failed:', error);
        });
        
        this.openModalService.openSuccessModal('Form submitted successfully');
        setTimeout(() => {
          this.goBack();
        }, 2000);
        
      },
      error: (err: any) => {
        this.isSubmitting = false;
        this.openModalService.openErrorModal(err.error?.message || 'Failed to submit form');
      }
    });
  }

  private findQuestionById(questionId: number): IFormQuestion | undefined {
    for (const section of this.formSections) {
      const question = section.questions.find(q => q.id === questionId);
      if (question) return question;
    }
    return undefined;
  }

  private findSectionIdByQuestionId(questionId: number): number {
    for (const section of this.formSections) {
      if (section.questions.some(q => q.id === questionId)) {
        return section.id;
      }
    }
    return 0;
  }

  submitExitFeedback(): void {
    this.data = localStorage.getItem('exitfeedbackformdata');
    const parsedData = JSON.parse(this.data!);
    const payload = {
      employeeId : parsedData.entity.employeeId,
      empFormId: parsedData.entity.empFormId,
      empResponseId: this.empResponseId,
      status: 'Submitted',
      initiatedBy: parsedData.entity.initiatedBy,
      moduleId : 33,
      initiatedAt : parsedData.entity.initiatedAt,
      lastWorkingDate : parsedData.entity.lastWorkingDate,
      separationId : parsedData.entity.separationId,
      empSubmittedAt : new Date().toISOString(),
      documentUrl: this.documentUrl
    };
    
    console.log('Updating exit feedback with document URL:', this.documentUrl);
    
    this.subscription = this.http.putData(`ExitFeedbackRequest/${parsedData.entity.id}`, payload).subscribe({
      next: (response: any) => {
        setTimeout(() => {
          window.location.reload();
        }, 2000);
        console.log('Exit feedback updated successfully with document URL');
      },
      error: (err: any) => {
        console.error('Failed to update exit feedback:', err);
      }
    });
  }
  }
