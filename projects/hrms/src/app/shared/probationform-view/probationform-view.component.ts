import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpService } from '../../services/http.service';
import { IFormDetails, ISection } from '../../time-off/pending-approvals/assessmentform/assessmentform';
import { DateformatPipe } from "../../Pipes/dateformat.pipe";


@Component({
  selector: 'app-probationform-view',
  imports: [CommonModule, FormsModule, DateformatPipe],
  templateUrl: './probationform-view.component.html',
  styleUrl: './probationform-view.component.scss'
})
export class ProbationformViewComponent {
  subscription!: Subscription;
  constructor( private router: Router,private http: HttpService) {}

  dynamicformSubmit={} as IFormDetails;
  dynamicFormDetails={} as IFormDetails;
  dynamicFormQuestions=[] as ISection[];
  dynamicFormHeader=[] as ISection[];
  dynamicFormFooter=[] as ISection[];
  empinfo={} as any;
  formemployeedetails={} as any;
  selectedData={} as any;
  isempeffectivevaild: boolean = true;
  issubmitdiable:boolean=false;
  isSubmitted = true;
  isButtonClicked = false;
  retrivingData={} as any;
  selected_questions=[] as any;
  selected_approve={} as any;
  ngOnInit(): void {
   this.functioncall();

  }

  //function when they enter nulls in start
  ifreasonnull(Value:any){
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
        this.getFormDetails(response.employeeId,response.responseId);
      },
      error: (err: any) => {
        console.error('Error retrieving data', err);
        // Handle the error accordingly
      },
      complete: () => {
        console.log('Request completed');
      }
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
    console.log( this.dynamicFormQuestions);
   
    if (!this.isLastSection) {
      this.currentSectionIndex++;
      console.log(this.currentSectionIndex);
      let questiondata=this.dynamicFormQuestions.find((ele:any)=>{
       return ele.id== this.currentSectionIndex
      })
      console.log(questiondata);
      
    }
  }

  previousSection() {
    if (!this.isFirstSection) {
      this.currentSectionIndex--;
    }
  }

//function get selected question details
overallRating: number = 0;
sectionRatings: { [key: number]: number } = {}; // Object to hold ratings for each section
onCheckboxChange(questions: any, rating: string, optionId: number, section: any, sectionId: number,quetsionId:number,meta:any): void {
  
  // Initialize section rating for the current section if it's not set
  if (!this.sectionRatings[sectionId]) {
    this.sectionRatings[sectionId] = 0;
  }
  // Reset section rating for the current section
  this.sectionRatings[sectionId] = 0;
  // Iterate through sections to find the correct section based on sectionId
  section.forEach((sec: any) => {
    if (sec.id === sectionId) {
      // Iterate through questions in the current section
       questions.forEach((optionsarray: any) => {
        optionsarray.options.forEach((element: any) => {
          if (element.optionId === optionId) {
            // Toggle the checkbox state and update section rating
            if (element.checked) {
              // Checkbox is being unchecked
              element.checked = false;
              this.sectionRatings[sectionId] = Math.max(0, this.sectionRatings[sectionId] - parseInt(rating, 10)); // Ensure rating doesn't go below 0
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
  const hasdata=this.selected_questions.filter((t:any)=>t.id===sectionId
)
if(hasdata.length>0){

  this.selected_questions.forEach((ele:any)=>{
    if(ele.id===sectionId && ele.data.optionId){
      ele.data.optionId=optionId
    }
      
  })
} else{
  questions.forEach((ele:any)=>{
    if(ele.options.length>0){
      this.selected_questions.push({
        id: sectionId,
        data:  {"questionId": ele.id,
          "optionId": optionId,
        "meta":meta}
      }
       ) 
    }

  })
}
  
  // Calculate overall rating by summing section ratings
  this.overallRating = 0;
  Object.keys(this.sectionRatings).forEach((key: string) => {
    this.overallRating += this.sectionRatings[parseInt(key, 10)]/this.dynamicFormDetails.overAllRating;
  });
 
 // console.log('Overall Rating:', this.overallRating);
}
getFormDetails(employeeId:any,responseId:any){
  this.subscription=this.http.getData(`ProbationFlow/getFormResponseByEmployeeId/${employeeId}?formId=1&responseId=${responseId}`).subscribe({
    next:(response:any)=>{
      // .filter((ele: any) => {
        // Parse the metaData and assign it to metadata property
         const parsedMetaData = JSON.parse(response.meta);
        //  return {
          // ...ele, // Copy other properties from ele
          response.metadata= parsedMetaData // Assign parsed metaData to metadata property
        //  };
        // });
        this.dynamicFormDetails = response
      this.dynamicFormQuestions= response?.sectionDetails.filter((ele: any) => ele.sectionName !== 'Header' && ele.sectionName !== 'Overall Rating')
      .map((section: any) => ({
        ...section,
        questions: section?.questions?.map((question: any) => ({
          ...question,
          options: question?.options?.map((option: any) => ({
            ...option,
            checked: false
          }))
        }))
      }));
      this.dynamicFormHeader= response?.sectionDetails.filter((ele: any) => {
        return ele.sectionName === 'Header' ;
      });
      
      this.dynamicFormFooter= response?.sectionDetails.filter((ele: any) => {
        return ele.sectionName === 'Overall Rating' ;
      });
    },
    error:(err:any)=>{
      console.log(err);
      
    }
  })
}
discontinue: boolean = false;
extend: boolean = false;
approve: boolean = false;

// Function to handle toggling Early Relieving option
toggleApprove() {
  if (!this.approve) {
    this.discontinue = false;
    this.extend = false;
    this.approve = true;
this.selected_approve.requestSelectedType='Approve'
    // Clear data related to Extend and Discontinue
    this.clearExtendData();
    this.clearDiscontinueData();
  } else {
    // Toggle off Early Relieving
    this.approve = false;
    this.clearApproveData();
  }
}

// Function to handle toggling Extend option
toggleExtend() {
  this.discontinue = false;
  this.approve = false;
  this.extend = true;
 this.selected_approve.requestSelectedType='Extend'
  // Clear data related to approve Relieving and Discontinue
  this.clearApproveData();
  this.clearDiscontinueData();
}

// Function to handle toggling Discontinue option
toggleDiscontinue() {
  this.extend = false;
  this.approve = false;
  this.discontinue = true;
this.selected_approve.requestSelectedType='Reject'
  // Clear data related to Early Relieving and Extend
  this.clearApproveData();
  this.clearExtendData();
}

// Function to clear data related to Early Relieving
clearApproveData() {
   this.selectedData.comments = ''
}

// Function to clear data related to Extend
clearExtendData() {
  this.selectedData.extenddate = null;
  this.selectedData.comments = ''; // Assuming comments is used for Extend
  this.selectedData.reasonForExtend = '';
}

// Function to clear data related to Discontinue
clearDiscontinueData() {
  this.selectedData.comments = '';
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
close(){
  this.router.navigate(["/time-off/pending-approvals/probation-request"]);
}
}
