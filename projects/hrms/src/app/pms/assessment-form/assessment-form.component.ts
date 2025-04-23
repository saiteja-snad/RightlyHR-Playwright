import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule, NgForm, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NgbModalRef, NgbModalConfig, NgbModal, NgbNavModule, NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { Location } from '@angular/common';
import { Subscription } from 'rxjs';
import { HttpService } from '../../services/http.service';
import { CommonModule } from '@angular/common';
import { DateformatPipe } from "../../Pipes/dateformat.pipe";
import { SelectModule } from 'primeng/select';

@Component({
  selector: 'app-assessment-form',
  imports: [CommonModule, FormsModule, NgbPaginationModule,
    ReactiveFormsModule,
    NgbNavModule, DateformatPipe, RouterModule,SelectModule  ],
  templateUrl: './assessment-form.component.html',
  styleUrl: './assessment-form.component.scss'
})
export class AssessmentFormComponent implements OnInit {
  subscription!: Subscription;
  templateId!: number;
  currentStage!: number;
  employeeDetails!: any;
  assessmentFormData: any;
  employeeId!: any;
  assessorItemId!: any
  minValue!: number;
  maxValue!: number;
  employeeComments: string[] = [];
  comments: string[] = [];
  rating: string[] = []
  rmComments!: string;
  tmComments!: string;
  hrComments!: string;
  Status!: string;
  currentStageName!: string;
  lastStage!: number;
  selected_questions = [] as any;
  updateselected_questions = [] as any;
  reviewCycles: any[] = [];
  reviewcycleitemformresponseid!: number;
  reviewEmployeeId!: number;
  formresponseid!: number;
  overallRating!: number;
  employeeOverAllRating = 0;
  rmOverAllRating = 0;
  tmOverAllRating = 0;
  hrOverAllRating = 0;
  hrOverAllRatingForProrata = 0;
  @ViewChild('success') success: any;
  @ViewChild('error') error: any;
  @ViewChild('loading') loading: any;
  modalRef!: NgbModalRef;
  dynamicBindLabel = 'designationName';
  dataload = false;
  max=5;
  min=1;
  selectedOption: any;
  assessortype: any;
  constructor(
    config: NgbModalConfig, private readonly modalService: NgbModal,
    //  public _userAcessService: UserAccessService,
    private route: ActivatedRoute,
    private http: HttpService,
    private router: Router,
    private location: Location
  ) {
    config.backdrop = 'static';
    config.keyboard = false;
  }

  ngOnInit(): void {

    const queryParamsString = localStorage.getItem('queryParams');
    if (queryParamsString) {
      const queryParams = JSON.parse(queryParamsString);
      console.log(queryParams)
      // Extract values from queryParams
      this.templateId = queryParams.reviewCycleItemId;
      this.currentStage = queryParams.currentStage;
      this.assessorItemId = queryParams.assessorItemId;
      this.assessortype=queryParams.assessorType;
      console.log(this.assessortype)
      this.reviewcycleitemformresponseid = queryParams.reviewcycleitemformresponseid
      console.log(this.currentStage, this.assessorItemId);
      this.reviewEmployeeId = queryParams.reviewEmployeeId;
      this.formresponseid = queryParams.formresponseid
      // Parse and assign reviewCycles
      this.reviewCycles = JSON.parse(queryParams.reviewCycles);
      console.log(this.reviewCycles);
      // Call getAssessmentData with the templateId
      if (this.templateId) {
        this.getAssessmentData(queryParams);
      } else {
        console.error('templateId is missing.');
      }
    } else {
      console.error('No queryParams found in localStorage.');
    }

    // Retrieve fusionuser data from localStorage
    const fusionuserString = localStorage.getItem('rightlyHrUser');
    if (fusionuserString) {
      const fusionuser = JSON.parse(fusionuserString);
      this.employeeId = fusionuser.employeeId;
    } else {
      console.error('No fusionuser found in localStorage.');
    }


    this.getDesignationwithGradeid();
    this.getAllReviewCycleNames();
  }
  //function to get all Get all assesor item details
  reviewCycleData = [] as any;
  getAllReviewCycleNames() {
    this.subscription = this.http
      .getData('Assessor/GetReviewCycleNames')
      .subscribe({
        next: (data: any) => {
          this.reviewCycleData = data;
          console.log(data);
        },
      });
  }
  //function to get the Designation data with grade id
  getDesignationWithGradeIdDetails = [] as any;
  getDesignationwithGradeid() {
    this.subscription = this.http.getData("DesignationGradeMapper").subscribe({
      next: (data: any) => {
        this.getDesignationWithGradeIdDetails = data
      },
      error: (err: any) => {
        console.log(err)
      }
    })
  }
  close1() {
    this.modalService.dismissAll();
    //location.reload();
    // this.router.navigate(['/pms/my-performance-review']);
    this.location.back();
  }
  remove() {
    this.location.back();
  }

  cancle() {
    this.router.navigate(['/pms/my-performance-review']);
  }
  //function to open the model popup
  openconfirmationModel(content: any) {
    this.modalService.open(content, { centered: true });
  }
  openModal(content: any,) {
    this.modalService.open(content, { centered: true })
  }
  //function get the employee details 
  getAssessmentData(data: any) {
    this.dataload = true;
    const reviewcycleitemid = data.reviewCycleItemId;
    const employeeId = data.reviewEmployeeId;
    this.http.getAssesnmentFormById(`reviewCycleHeader/getFormResponseByFormId/{reviewcycleitemid}`, reviewcycleitemid, employeeId).subscribe({
      next: (data) => {
        console.log('Assessment Data:', data);
        this.assessmentFormData = data;
        // Check if formresponse has length > 0
             const ratingScale = this.assessmentFormData.ratingScaleRange;
            // Split the range into min and max
           const [min, max] = ratingScale.split("-").map(Number);
           this.min=min;
           this.max=max;
             console.log("Min:", min); // 1
             console.log("Max:", max); // 5
        this.assessmentFormData.formResponses = this.assessmentFormData.formResponses.map((response: any) => {
          this.assessmentFormData.revisedDesignation = null;
          // Ensure response.formresponse exists
          response.formresponse = response.formresponse ?? {};
          if (response.order === this.currentStage - 1) {
            console.log('Found name for currentStage:', response.formresponse.name);
            // You can store this name if needed
            this.currentStageName = response.name;
          }
          // Ensure employeeComments exists
          response.formresponse.employeeComments = response.formresponse.employeeComments ?? '';
          console.log(response.formresponse.employeeComments);

          // Check and append missing sectionDetails
          if (!response.formresponse.sectionDetails || response.formresponse.sectionDetails.length === 0) {
            console.log("Section details missing. Appending default section details.");
            response.formresponse.sectionDetails = this.assessmentFormData.sectionDetails.map((section: any) => ({
              ...section, // Clone the section structure
              questions: section.questions.map((question: any) => ({
                ...question, // Clone each question
                optionsData: {
                  ...question.optionsData,
                  meta: question.optionsData?.meta ?? { rating: null, Comments: '' }, // Default meta to an empty object if not defined
                },
              })),
            }));
          }
       
          if (response.formresponse.revisedDesignation) {
            this.assessmentFormData.revisedDesignation = response.formresponse.revisedDesignation
            this.gradeId = response.formresponse.jobgradeid;
          }

          this.assessmentFormData.cmincrementpercentagebasedonprorata = response.formresponse.incrementPercentageMannual;
          this.assessmentFormData.cmrevicedSalary = response.formresponse.revisedSalaryAuto;
          this.assessmentFormData.cmIncrementalAmount = response.formresponse.incrementAmountMannual
          // this.assessmentFormData.eligibleforpromotion=response.formresponse.isApplicableForPromotion
          this.assessmentFormData.totaldurationinmonths = response.formresponse.totalDurationInMonths
          this.assessmentFormData.cmincrementpercentagebasedonprorata = response.formresponse.incrementPercentageMannual;
          this.assessmentFormData.cmrevicedSalary = response.formresponse.revisedSalaryMannual;
          if (this.assessmentFormData.considermanualinputcheck) {
            this.assessmentFormData.cmcurrentSalaryAuto = response.formresponse.currentSalaryMannual;
          }
          this.assessmentFormData.cmIncrementalAmount = response.formresponse.incrementAmountMannual;
          this.assessmentFormData.isApplicableForIncrement = response.isApplicableForIncrement;
          if(response.formresponse.isSameAsPreviousAssessor){
            this.assessmentFormData.isSameAsPreviousAssessor=response.formresponse.isSameAsPreviousAssessor;
            console.log(response.formresponse)
            console.log(this.assessmentFormData.isSameAsPreviousAssessor)
            this.assessmentFormData.sameaspreviousassesor=true;
          }
          else{ 
            this.assessmentFormData.isSameAsPreviousAssessor=false;
          }
         if(response.formresponse.hrOverAllRating>0){
          this.assessmentFormData.hrratingexist=true;
         }
         else{
          this.assessmentFormData.hrratingexist=false;
         }

          this.employeeComments = response.formresponse.employeeComments;
          this.employeeOverAllRating = response.formresponse.employeeOverAllRating;
          this.tmOverAllRating = response.formresponse.tmOverrAllRating;
          this.rmOverAllRating = response.formresponse.rmOverAllRating;
          this.hrOverAllRating = response.formresponse.hrOverAllRating;
          this.assessmentFormData.IncrementalAmount = response.formresponse.incrementAmountAuto;
          this.assessmentFormData.revicedSalary = response.formresponse.revisedSalaryAuto;
          this.assessmentFormData.considermanualinputcheck = response.formresponse.isConsiderManualInputs;
          this.assessmentFormData.eligibleforpromotion = response.formresponse.isApplicableForPromotion;
          // Safely parse meta for existing sectionDetails
          response.formresponse.sectionDetails.forEach((section: any) => {
            section.questions.forEach((question: any) => {
              if(question.optionsData){
                if (question.optionsData?.meta) {
                  try {
                    question.optionsData.meta = JSON.parse(question.optionsData.meta);
                  } catch (error) {
                    //console.error('Invalid JSON in optionsData.meta:', question.optionsData.meta);
                    question.optionsData.meta = { rating: null, Comments: '' }; // Default to empty object on error
                  }
                } else {
                  question.optionsData.meta = { rating: null, Comments: '' }; // Default if meta doesn't exist
                }
              }
              else{
                question.optionsData={meta : { rating: null, Comments: '' }}; // Default if meta doesn't exist
              }
           
            });
          });

          // // Ensure sectionDetails exists before iterating
          // if (this.assessmentFormData.sectionDetails && Array.isArray(this.assessmentFormData.sectionDetails)) {
          //   this.assessmentFormData.sectionDetails.forEach((section: any) => {
          //     if (section.questions && Array.isArray(section.questions)) {
          //       section.questions.forEach((question: any) => {
          //         // Check if sectionDetails exists in formresponse
          //         const sectionDetails = response.formresponse.sectionDetails ?? [];
          //         sectionDetails.forEach((ele: any) => {
          //           if (ele.questions && Array.isArray(ele.questions)) {
          //             ele.questions.forEach((questionMeta: any) => {
          //               try {
          //                 const parsedMeta = questionMeta.optionsData?.meta ? JSON.parse(questionMeta.optionsData.meta) : null;
          //                 console.log(parsedMeta);
          //                 question.meta = parsedMeta || { rating: null, comments: '' }; // Fallback meta
          //               } catch (error) {
          //                 console.error('Error parsing meta:', error);
          //                 question.meta = { rating: null, comments: '' };
          //               }
          //             });
          //           }
          //         });
          //       });
          //     }
          //   });
          // }

          return response; // Return the modified response for the map function
        });
        const lastStageResponse = this.assessmentFormData.formResponses[this.assessmentFormData.formResponses.length - 1];

        if (lastStageResponse) {
          console.log('Last Stage Response:', lastStageResponse);
          console.log('Last Stage Name:', lastStageResponse.formresponse.name || 'No Name');
          console.log('Last Stage Order:', lastStageResponse.order);
          this.lastStage = lastStageResponse.order;
        } else {
          console.log('No formResponses found.');
        }
        if (this.assessmentFormData.formresponse?.length > 0) {
          console.log('Form Responses:', this.assessmentFormData.formresponse);

        }

        // Final logging of the updated sectionDetails
        console.log(this.assessmentFormData.sectionDetails);

        console.log(this.assessmentFormData)
        this.saveAsDraft();
      },
      error: (err) => {
        console.error('Error fetching assessment data:', err);
        if (err.status === 404) {
          this.Status = "The requested resource was not found. Please check the URL or contact the administrator for assistance.";
        } else if (err.status === 500) {
          this.Status = err.error.details;
        } else {
          this.Status = err.error.message;
        }
        this.modalService.open(this.error, { centered: true });
        this.dataload = false;
      },
      complete: () => {
        this.dataload = false;
      }
    });

  }
  // Update bindLabel dynamically based on revisedDesignation
  gradeId!: any;
  designationChange(Value:any){
     console.log(Value);
     if(Value.value){
       this.gradeId=Value.value.gradeId;
       console.log(this.gradeId);
       
     }
     else{  
      this.gradeId=null;
     }
     
  }

  @ViewChild('form') form!: NgForm;
  postcomments(Value: any) {
    console.log(this.form)
    this.employeeComments = Value
  }
  //function to update the form rating
  updateRating(section: any, question: any, response: any, rating: any, comments: any): void {
    console.log(section.sectionweightage)
    console.log(rating)
    // Find the optionId based on the rating given by the user
    let selectedOption: any;
    if(rating){
      this.selectedOption = question.options.find((option: any) => option.optionWeightage === parseInt(rating));
      console.log(this.selectedOption)
    }
    // else{
    //   this.selectedOption = question.options.find((option: any) => option.optionWeightage === parseInt("1"));
    //   console.log(this.selectedOption)
    // }
   
    // Construct the data object for the selected question
    const data = {
      sectionId: section.id,
      questionId: question.id,
      optionId: this.selectedOption ? +this.selectedOption.optionId : null,
      meta: JSON.stringify({ rating: rating, comments: comments }),
      rating: parseInt(rating),
      comments: comments?.toString(), // Comments will be updated separately
      sectionweightage: section.sectionweightage
    };
     console.log(data)
    // Update the selected questions array dynamically
    this.updateSelectedQuestions(data, section.id, question.id);
    console.log('Updated selected_questions:', this.selected_questions);
    let overallRatingSum = 0;
    let totalSectionWeightage = 0;
    console.log(response.formresponse.sectionDetails);
    
    response.formresponse.sectionDetails.forEach((section: any) => {
      section.questions.forEach((question : any)=>{
        const sectionQuestions = this.selected_questions.filter((q: any) => q.sectionId === section.id);
        const totalQuestions = sectionQuestions.length;
        console.log(totalQuestions)
        if (totalQuestions > 0) {
          // const sumOfRatings = sectionQuestions.reduce((sum: any, q: { rating: any; }) => sum + q.rating, 0);
          // console.log(sumOfRatings)
          // const input = sumOfRatings / totalQuestions;
          // console.log(input)
          const sectionWeightageDecimal = section.sectionweightage / 100; // Convert percentage to decimal
          console.log(sectionWeightageDecimal)
          const questionWeightageDecimal = question.questionweightage / 100; // Convert percentage to decimal
          console.log(questionWeightageDecimal)
          const rating=question?.optionsData?.meta?.rating ? question?.optionsData?.meta?.rating : 0;
          const sectionRating = rating * sectionWeightageDecimal * questionWeightageDecimal;
          console.log(sectionRating)
          overallRatingSum += sectionRating;
          console.log(overallRatingSum)
          totalSectionWeightage += sectionWeightageDecimal;
        }
      })
      
    });

    const overallRating = overallRatingSum ? overallRatingSum.toFixed(2) : '0.00'; // Round to 2 decimal places
    console.log('Overall Rating:', overallRating);
    // response.formresponse.employeeOverAllRating=overallRating
    this.updateOverallRating(response, overallRating);


  }

  // Function to update the overall rating for a given role
  updateOverallRating(response: any, rating: any): void {
    switch (response.name) {
      case 'Employee':
        this.employeeOverAllRating = parseFloat(rating);
        response.formresponse.employeeOverAllRating = rating;
        break;
      case 'Team Manager':
        this.tmOverAllRating = parseFloat(rating);
        response.formresponse.tmOverrAllRating = rating;
        if(this.currentStage==this.lastStage){
          response.formresponse.hrOverAllRating = rating;
          this.prorataCalculation(response.formresponse.hrOverAllRating);
        }
        break;
      case 'Reporting Manager':
        this.rmOverAllRating = parseFloat(rating);
        response.formresponse.rmOverAllRating = rating;
        if(this.currentStage==this.lastStage){
          response.formresponse.hrOverAllRating = rating;
          this.prorataCalculation(response.formresponse.hrOverAllRating);
        }
        break;
      case 'HR':
        this.hrOverAllRating = parseFloat(rating);
        if(this.currentStage==this.lastStage){
          response.formresponse.hrOverAllRating = rating;
          this.prorataCalculation(response.formresponse.hrOverAllRating);
        }
       
        break;
      default:
        break;
    }
  }
  // Function to update the selected questions array dynamically
  updateSelectedQuestions(data: any, sectionId: number, questionId: number): void {
    //  // Remove objects that have undefined or NaN for meta, rating, or comments
    // const isValidData =
    //   !isNaN(data.rating) &&
    //   (data.comments !== undefined ||
    //     data.comments !== '' ||
    //     data.comments !== null);
    // //console.log('Is valid data:', isValidData);
    // const index = this.selected_questions.findIndex(
    //   (q: any) => q.sectionId === sectionId && q.questionId === questionId
    // );
    // //console.log('Found index:', index);
    // if (isValidData) {
    //   if (index > -1) {
    //     ///  console.log('Updating existing object at index:', index);
    //     this.selected_questions[index] = data; // Update existing object
    //   } else {
    //     //console.log('Adding new object');
    //     this.selected_questions.push(data); // Add new object
    //   }
    // } else {
    //   if (index > -1) {
    //     // console.log('Removing invalid object at index:', index);
    //     this.selected_questions.splice(index, 1); // Remove invalid object
    //   } else {
    //     // console.log('No matching object to remove');
    //   }
    // }

    // Remove objects that have undefined or NaN for meta, rating, or comments
    const isValidData =
      !isNaN(data.rating) ||
      (data.comments !== undefined ||
        data.comments !== '' ||
        data.comments !== null);
    //console.log('Is valid data:', isValidData);
    const index = this.selected_questions.findIndex(
      (q: any) => q.sectionId === sectionId && q.questionId === questionId
    );
    //console.log('Found index:', index);
    if (isValidData) {
      if (index > -1) {
        // Update existing object
        this.selected_questions[index].rating = data.rating;
        this.selected_questions[index].comments = data.comments;
        this.selected_questions[index].optionId = data.optionId;
        this.selected_questions[index].questionId= data.questionId;
      } else {
        // Add new object
        this.selected_questions.push(data);
      }
    } else {
      if (index > -1) {
        // Remove invalid object
        this.selected_questions.splice(index, 1);
      } else {
        // No matching object to remove
      }
    }
    console.log('Updated selected_questions:', this.selected_questions);
    console.log('Updated selected_questions:', this.selected_questions);
  }

  //function to restrict the input field
  restrictInput(event: Event, questionIndex: number, rating: any): void {
    const inputElement = event.target as HTMLInputElement;

    // Get the current value of the input
    const value = inputElement.value;

    // Allow only values between 1 and 5
    if (/^[1-5]$/.test(value)) {
      return; // Valid input, do nothing
    }

    // If the value is invalid, set the input to null
    inputElement.value = ''; // Clear the input
    rating = null; // Set the value to null in the model
  }
  //function change same rating to another
  checkTmAndRm(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target && target.checked) {
      this.assessmentFormData.isSameAsPreviousAssessor = true;
      this.selected_questions = [];
      const previousStage = this.currentStage - 1;
      const currentStage = this.currentStage;

      const previousResponse = this.assessmentFormData.formResponses.find((response: any) => response.order === previousStage);
      const currentResponse = this.assessmentFormData.formResponses.find((response: any) => response.order === currentStage);

      if (previousResponse && currentResponse) {
        currentResponse.formresponse.sectionDetails = previousResponse.formresponse.sectionDetails.map((section: any) => ({
          ...section,
          questions: section.questions.map((question: any) => ({
            ...question,
            optionsData: {
              ...question.optionsData,
              meta: { ...question.optionsData.meta }
            }
          }))
        }));
        currentResponse.overallrating = previousResponse.overallrating;
        currentResponse.formresponse.employeeComments = previousResponse.formresponse.employeeComments;
        this.employeeComments = currentResponse.formresponse.employeeComments;
        // Push the copied data to the selected_questions array
        previousResponse.formresponse.sectionDetails.forEach((section: any) => {
          section.questions.forEach((question: any) => {
            const data = {
              sectionId: section.id,
              questionId: question.id,
              optionId: question.optionsData.optionId,
              meta: JSON.stringify(question.optionsData.meta),
              rating: question.optionsData.meta.rating,
              comments: question.optionsData.meta.comments,
              sectionweightage: section.sectionweightage
            };
            this.selected_questions.push(data);
          });
        });

        console.log('Updated selected_questions:', this.selected_questions);
        // Calculate the overall rating
        // Calculate the overall rating for each section separately
        let overallRatingSum = 0;
        let totalSectionWeightage = 0;

        previousResponse.formresponse.sectionDetails.forEach((section: any) => {
          const sectionQuestions = this.selected_questions.filter((q: any) => q.sectionId === section.id);
          const totalQuestions = sectionQuestions.length;
          const sumOfRatings = sectionQuestions.reduce((sum: any, q: { rating: any; }) => sum + q.rating, 0);
          section.questions.forEach((question : any)=>{
            const sectionQuestions = this.selected_questions.filter((q: any) => q.sectionId === section.id);
            const totalQuestions = sectionQuestions.length;
            console.log(totalQuestions)
            if (totalQuestions > 0) {
              // const sumOfRatings = sectionQuestions.reduce((sum: any, q: { rating: any; }) => sum + q.rating, 0);
              // console.log(sumOfRatings)
              // const input = sumOfRatings / totalQuestions;
              // console.log(input)
              const sectionWeightageDecimal = section.sectionweightage / 100; // Convert percentage to decimal
              console.log(sectionWeightageDecimal)
              const questionWeightageDecimal = question.questionweightage / 100; // Convert percentage to decimal
              console.log(questionWeightageDecimal);
              const rating=question?.optionsData?.meta?.rating ? question?.optionsData?.meta?.rating : 0;
              const sectionRating = rating * sectionWeightageDecimal * questionWeightageDecimal;
              console.log(sectionRating)
              overallRatingSum += sectionRating;
              console.log(overallRatingSum)
              totalSectionWeightage += sectionWeightageDecimal;
            }
          })
          // const input = sumOfRatings / totalQuestions;
          // const sectionWeightageDecimal = section.sectionweightage / 100; // Convert percentage to decimal
          // const sectionRating = input * sectionWeightageDecimal;

          // overallRatingSum += sectionRating;
          // totalSectionWeightage += sectionWeightageDecimal;
        });

        // const overallRating = (overallRatingSum / totalSectionWeightage).toFixed(2); // Round to 2 decimal places

        // console.log('Overall Rating:', overallRating);
        const overallRating = overallRatingSum ? overallRatingSum.toFixed(2) : '0.00'; // Round to 2 decimal places
        console.log('Overall Rating:', overallRating);

        // Update the overall rating based on the responder name
        this.updateOverallRating(currentResponse, overallRating);
      }
    }
    else {
      this.assessmentFormData.isSameAsPreviousAssessor = false;
      this.selected_questions = [];
      this.employeeComments = [];
      const currentResponse = this.assessmentFormData.formResponses.find((response: any) => response.order === this.currentStage);
      if (currentResponse) {
        currentResponse.formresponse.sectionDetails.forEach((section: any) => {
          section.questions.forEach((question: any) => {
            question.optionsData.meta.rating = null;
            question.optionsData.meta.comments = '';
          });
        });
        currentResponse.overallrating = null;
        currentResponse.formresponse.employeeComments = '';
        this.updateOverallRating(currentResponse, null);
      }
    }
  }
  //function update the that was entered
  saveAsDraft() {
    // Clear the selected_questions array before updating
    this.selected_questions = [];

    // Update necessary fields in this.assessmentFormData
    this.assessmentFormData.formResponses = this.assessmentFormData.formResponses.map((response: any) => {
      // Ensure response.formresponse exists
      response.formresponse = response.formresponse ?? {};

      // Apply updates only when formResponse.order is equal to the currentStage
      if (response.order === this.currentStage) {
        // Update employeeComments
        response.formresponse.employeeComments = response.formresponse.employeeComments ?? '';
        console.log(response.formresponse.employeeComments);
        if (response.formresponse.isSameAsPreviousAssessor) {
          this.assessmentFormData.isSameAsPreviousAssessor = response.formresponse.isSameAsPreviousAssessor;
        }
        this.assessmentFormData.isApplicableForIncrement = response.isApplicableForIncrement;
        this.employeeComments = response.formresponse.employeeComments;
        this.employeeOverAllRating = response.formresponse.employeeOverAllRating;
        this.tmOverAllRating = response.formresponse.tmOverrAllRating;
        this.rmOverAllRating = response.formresponse.rmOverAllRating;
        this.hrOverAllRating = response.formresponse.hrOverAllRating;
        this.assessmentFormData.IncrementalAmount = response.formresponse.incrementAmountAuto;
        this.assessmentFormData.revicedSalary = response.formresponse.revisedSalaryAuto;
        this.assessmentFormData.considermanualinputcheck = response.formresponse.isConsiderManualInputs;
        this.assessmentFormData.eligibleforpromotion = response.formresponse.isApplicableForPromotion;
        this.assessmentFormData.salaryCorrectioninputcheck=response.formresponse.isSalaryCorrection;
        this.assessmentFormData.scincrementpercentagebasedonprorata = response.formresponse.salaryCorrectionIncrementPercentage;
        this.assessmentFormData.sccurrentSalaryAuto = response.formresponse.salaryCorrectionCurrentAmount;
        this.assessmentFormData.screvicedSalary = response.formresponse.salaryCorrectionRevisedAmount;
        this.assessmentFormData.scIncrementalAmount = response.formresponse.salaryCorrectionIncrementAmount;
        // Check and append missing sectionDetails
        if (!response.formresponse.sectionDetails || response.formresponse.sectionDetails.length === 0) {
          console.log("Section details missing. Appending default section details.");
          response.formresponse.sectionDetails = this.assessmentFormData.sectionDetails.map((section: any) => ({
            ...section, // Clone the section structure
            questions: section.questions.map((question: any) => ({
              ...question, // Clone each question
              optionsData: {
                ...question.optionsData,
                meta: question.optionsData?.meta ?? { rating: null, comments: '' }, // Default meta to an empty object if not defined
              },
            })),
          }));
        }

       

        // Update revised designation if present
        if (response.formresponse.revisedDesignation) {
          this.assessmentFormData.revisedDesignation = response.formresponse.revisedDesignation;
        }

        // Update other fields
        this.assessmentFormData.cmincrementpercentagebasedonprorata = response.formresponse.incrementPercentageMannual;
        this.assessmentFormData.cmrevicedSalary = response.formresponse.revisedSalaryMannual;
        if (response.formresponse.isConsiderManualInputs) {
          this.assessmentFormData.cmcurrentSalaryAuto = response.formresponse.currentSalaryMannual;
        }
        if(response.formresponse.currentSalaryAuto){
          this.assessmentFormData.currentSalaryAuto=response.formresponse.currentSalaryAuto;
           // Update prorata calculation if HR overall rating is present
        if (response.formresponse.hrOverAllRating > 0) {
          this.prorataCalculation(response.formresponse.hrOverAllRating);
        }
        }

        this.assessmentFormData.cmIncrementalAmount = response.formresponse.incrementAmountMannual;
        this.assessmentFormData.totaldurationinmonths = response.formresponse.totalDurationInMonths;

        // Safely parse meta for existing sectionDetails
        response.formresponse.sectionDetails.forEach((section: any) => {
          section.questions.forEach((question: any) => {
            if(question.optionsData){
              if (typeof question.optionsData?.meta === 'string') {
                try {
                  question.optionsData.meta = JSON.parse(question.optionsData.meta);
                } catch (error) {
                  console.error('Invalid JSON in optionsData.meta:', question.optionsData.meta);
                  question.optionsData.meta = { rating: null, comments: '' }; // Default to empty object on error
                }
              } else if (typeof question.optionsData?.meta !== 'object') {
                question.optionsData.meta = { rating: null, comments: '' }; // Default if meta doesn't exist
              }
            }
            else{
              question.optionsData={meta : { rating: null, Comments: '' }}; // Default if meta doesn't exist
            }
            // Find the optionId based on the rating
            let selectedOption = null;
            if (section.questions) {
              selectedOption = section.questions.find((option: any) => option?.optionsData?.optionWeightage === question?.optionsData?.meta?.rating);
            }
            //  if(!selectedOption){
            //  selectedOption = section.questions.find((option: any) => option?.optionsData?.optionWeightage === 1);
            //  }
            // Push the data to selected_questions
            const data = {
              sectionId: section.id,
              questionId: question.id,
              optionId: selectedOption ? (selectedOption.optionsData?.optionId ?? null) : null, // Set optionId if found
              meta:question?.optionsData?.meta? JSON.stringify(question?.optionsData?.meta):null,
              rating:  question?.optionsData?.meta?.rating ? question?.optionsData?.meta?.rating:null,
              comments: question?.optionsData?.meta?.comments? question?.optionsData?.meta?.comments:null,
              sectionweightage: section.sectionweightage
            };
            this.selected_questions.push(data);
          });
        });
      }
       else{
        if(response.formresponse.currentSalaryAuto){
          this.assessmentFormData.currentSalaryAuto=response.formresponse.currentSalaryAuto;
           // Update prorata calculation if HR overall rating is present
        if (response.formresponse.hrOverAllRating > 0) {
          this.prorataCalculation(response.formresponse.hrOverAllRating);
        }
        }
        this.assessmentFormData.salaryCorrectioninputcheck=response.formresponse.isSalaryCorrection;
        this.assessmentFormData.scincrementpercentagebasedonprorata = response.formresponse.salaryCorrectionIncrementPercentage;
        this.assessmentFormData.sccurrentSalaryAuto = response.formresponse.salaryCorrectionCurrentAmount;
        this.assessmentFormData.screvicedSalary = response.formresponse.salaryCorrectionRevisedAmount;
        this.assessmentFormData.scIncrementalAmount = response.formresponse.salaryCorrectionIncrementAmount;
       }
      return response; // Return the modified response for the map function
    });

    console.log(this.selected_questions);
  }
  //function check
  saveAsDraftcheck() {
    console.log(this.selected_questions);
    //this.saveAsDraft();
  }
  //function to get the prorata calculation
  prorataCalculation(Value: any) {
    if (Value && this.assessmentFormData.currentSalaryAuto&&this.assessmentFormData.isApplicableForIncrement) {
      const numericValue = parseFloat(Value); // Convert the input to a number
      if (!isNaN(numericValue)) {
        this.hrOverAllRatingForProrata = Math.round(numericValue); // Round to 1 decimal place
        console.log(this.hrOverAllRatingForProrata)
        console.log(this.assessmentFormData.ipData);
        const incrementadetails = this.assessmentFormData.ipData.forEach((ele: any) => {
          const currentSalary = parseFloat(this.assessmentFormData.currentSalaryAuto);
          if (currentSalary >= parseFloat(ele.min) && currentSalary <= parseFloat(ele.max)) {
            const IncrementalData = ele?.items?.find((ele: any) => parseInt(ele.ratingColumn) === this.hrOverAllRatingForProrata);
            console.log(IncrementalData);
            if (IncrementalData) {
              this.assessmentFormData.incrementpercentagebasedonprorata = IncrementalData?.percentage;
              console.log(this.assessmentFormData.incrementpercentagebasedonprorata);
              console.log(this.assessmentFormData.currentSalaryAuto);
            }

          }
        })
        this.prorataCalculationBasedontotaldurationinmonths(this.assessmentFormData.totaldurationinmonths)
      } else {
        console.error("Invalid input for prorataCalculation:", Value);
      }
    }
  }
  //function to get the calculation based on the total duration in months
  prorataCalculationBasedontotaldurationinmonths(Value: any) {
    if (Value && Value >= 1) {
      this.assessmentFormData.totaldurationinmonths = Value;
      // Calculate IncrementalAmount and round to 2 decimal places
      const incrementalAmount = (this.assessmentFormData.currentSalaryAuto * (this.assessmentFormData.incrementpercentagebasedonprorata / 100)) * (this.assessmentFormData.totaldurationinmonths / 12);
      this.assessmentFormData.IncrementalAmount = Math.round(incrementalAmount * 100) / 100;
      console.log(this.assessmentFormData.IncrementalAmount);
console.log(this.assessmentFormData.currentSalaryAuto)
      // Calculate revicedSalary and round to 2 decimal places
      const revisedSalary = this.assessmentFormData.currentSalaryAuto + this.assessmentFormData.IncrementalAmount;
      this.assessmentFormData.revicedSalary = Math.round(revisedSalary * 100) / 100;

      if (this.assessmentFormData.considermanualinputcheck) {
        // Calculate cmIncrementalAmount and round to 2 decimal places
        const cmIncrementalAmount = (this.assessmentFormData.currentSalaryAuto * (this.assessmentFormData.cmincrementpercentagebasedonprorata / 100)) * (this.assessmentFormData.totaldurationinmonths / 12);
        this.assessmentFormData.cmIncrementalAmount = Math.round(cmIncrementalAmount * 100) / 100;
        console.log(this.assessmentFormData.cmIncrementalAmount);

        // Calculate cmrevicedSalary and round to 2 decimal places
        const cmRevisedSalary = this.assessmentFormData.currentSalaryAuto + this.assessmentFormData.cmIncrementalAmount;
        this.assessmentFormData.cmrevicedSalary = Math.round(cmRevisedSalary * 100) / 100;
      }
      else {
        this.assessmentFormData.cmIncrementalAmount = null,
          this.assessmentFormData.cmrevicedSalary = null
      }
      if (this.assessmentFormData.salaryCorrectioninputcheck) {
        // Calculate cmIncrementalAmount and round to 2 decimal places
        if( this.assessmentFormData.considermanualinputcheck){
          this.assessmentFormData.sccurrentSalaryAuto = this.assessmentFormData.cmrevicedSalary
          console.log(this.assessmentFormData.sccurrentSalaryAuto)
        }
        else if(this.assessmentFormData.revicedSalary){
          this.assessmentFormData.sccurrentSalaryAuto = this.assessmentFormData.revicedSalary
          console.log(this.assessmentFormData.sccurrentSalaryAuto)
        }

        // Calculate screvicedSalary and round to 2 decimal places
        const scRevisedSalary = this.assessmentFormData.sccurrentSalaryAuto +this.assessmentFormData.scIncrementalAmount;
        this.assessmentFormData.screvicedSalary=parseFloat(scRevisedSalary.toFixed(2));
      }
      else {
        this.assessmentFormData.scIncrementalAmount = null,
          this.assessmentFormData.screvicedSalary = null
      }
    }
    else {
      this.assessmentFormData.totaldurationinmonths = null,
        this.assessmentFormData.IncrementalAmount = null,
        this.assessmentFormData.cmIncrementalAmount = null,
        this.assessmentFormData.cmrevicedSalary = null,
        this.assessmentFormData.revicedSalary = null
    }
  }
  //function to check whether consider manual input is checked or not
  considermanualinput(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target && target.checked) {
      this.assessmentFormData.considermanualinputcheck = true;
      this.assessmentFormData.cmincrementpercentagebasedonprorata = null;
      this.assessmentFormData.cmcurrentSalaryAuto = null;
      this.assessmentFormData.cmrevicedSalary = null;
      this.assessmentFormData.cmIncrementalAmount = null;
    }
    else {
      this.assessmentFormData.considermanualinputcheck = false;
      this.assessmentFormData.cmincrementpercentagebasedonprorata = null;
      this.assessmentFormData.cmcurrentSalaryAuto = null;
      this.assessmentFormData.cmrevicedSalary = null;
      this.assessmentFormData.cmIncrementalAmount = null
      if(this.assessmentFormData.salaryCorrectioninputcheck){
        this.salaryCorrectionmanualinputProrataCheck(this.assessmentFormData.scincrementpercentagebasedonprorata)
      }
    }
  }
  salaryCorrectionmanualinput(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target && target.checked) {
      this.assessmentFormData.salaryCorrectioninputcheck = true;
      this.assessmentFormData.scincrementpercentagebasedonprorata = null;
      this.assessmentFormData.sccurrentSalaryAuto = null;
      this.assessmentFormData.screvicedSalary = null;
      this.assessmentFormData.scIncrementalAmount = null;
    }
    else {
      this.assessmentFormData.salaryCorrectioninputcheck = false;
      this.assessmentFormData.scincrementpercentagebasedonprorata = null;
      this.assessmentFormData.sccurrentSalaryAuto = null;
      this.assessmentFormData.screvicedSalary = null;
      this.assessmentFormData.scIncrementalAmount = null;

    }
  }
  eligibleforrehirecheck(event: Event) {
    const target = event.target as HTMLInputElement;
    this.assessmentFormData.revisedDesignation = null;
    if (target && target.checked) {
      this.assessmentFormData.eligibleforpromotion = true;

    }
    else {
      this.assessmentFormData.eligibleforpromotion = false;
    }
  }
  //function to enter the Incremental percentage Based on Rating for consider manual input
  considermanualinputProrataCheck(Value: any) {
    if (this.assessmentFormData.considermanualinputcheck === true) {
      if (Value && Value >= 1) {
        const incrementadetails = this.assessmentFormData.ipData.forEach((ele: any) => {
          const currentSalary = parseFloat(this.assessmentFormData.currentSalaryAuto);
          if (currentSalary >= parseFloat(ele.min) && currentSalary <= parseFloat(ele.max)) {
            const IncrementalData = ele?.items?.find((ele: any) => parseInt(ele.ratingColumn) === this.hrOverAllRatingForProrata);
            console.log(IncrementalData);
            if (IncrementalData) {
              this.assessmentFormData.cmincrementpercentagebasedonprorata = Value;
              console.log(this.assessmentFormData.cmincrementpercentagebasedonprorata)
              this.assessmentFormData.cmcurrentSalaryAuto = this.assessmentFormData.currentSalaryAuto
              console.log(this.assessmentFormData.currentSalaryAuto)
              this.assessmentFormData.cmcurrentSalaryAuto = this.assessmentFormData.currentSalaryAuto;
              // Calculate cmIncrementalAmount and round to 2 decimal places
              const cmIncrementalAmount = (this.assessmentFormData.currentSalaryAuto * (this.assessmentFormData.cmincrementpercentagebasedonprorata / 100)) * (this.assessmentFormData.totaldurationinmonths / 12);
              this.assessmentFormData.cmIncrementalAmount = Math.round(cmIncrementalAmount * 100) / 100;
              console.log(this.assessmentFormData.cmIncrementalAmount);

              // Calculate cmrevicedSalary and round to 2 decimal places
              const cmRevisedSalary = this.assessmentFormData.currentSalaryAuto + this.assessmentFormData.cmIncrementalAmount;
              this.assessmentFormData.cmrevicedSalary = Math.round(cmRevisedSalary * 100) / 100;
            }
          }
        })
        if(this.assessmentFormData.salaryCorrectioninputcheck){
          this.salaryCorrectionmanualinputProrataCheck(this.assessmentFormData.scincrementpercentagebasedonprorata)
        }
      }
      else {
        this.assessmentFormData.cmincrementpercentagebasedonprorata = null;
        this.assessmentFormData.cmcurrentSalaryAuto = null;
        this.assessmentFormData.cmrevicedSalary = null;
        this.assessmentFormData.cmIncrementalAmount = null
      }
    }
    else {
      this.assessmentFormData.cmincrementpercentagebasedonprorata = null;
      this.assessmentFormData.cmcurrentSalaryAuto = null;
      this.assessmentFormData.cmrevicedSalary = null;
      this.assessmentFormData.cmIncrementalAmount = null
    }

  }
  //function to enter the Incremental Percentage Based on Rating for salary correction
  salaryCorrectionmanualinputProrataCheck(Value: any) {
    if (this.assessmentFormData.salaryCorrectioninputcheck === true) {
      if (Value && Value >= 1) {
        const incrementadetails = this.assessmentFormData.ipData.forEach((ele: any) => {
          const currentSalary = parseFloat(this.assessmentFormData.currentSalaryAuto);
          if (currentSalary >= parseFloat(ele.min) && currentSalary <= parseFloat(ele.max)) {
            const IncrementalData = ele?.items?.find((ele: any) => parseInt(ele.ratingColumn) === this.hrOverAllRatingForProrata);
            console.log(IncrementalData);
            if (IncrementalData) {
              this.assessmentFormData.scincrementpercentagebasedonprorata = Value;
              console.log(this.assessmentFormData.scincrementpercentagebasedonprorata)
              if( this.assessmentFormData.considermanualinputcheck){
              this.assessmentFormData.sccurrentSalaryAuto = this.assessmentFormData.cmrevicedSalary
              console.log(this.assessmentFormData.sccurrentSalaryAuto)
            }
            else if(this.assessmentFormData.revicedSalary){
              this.assessmentFormData.sccurrentSalaryAuto = this.assessmentFormData.revicedSalary
              console.log(this.assessmentFormData.sccurrentSalaryAuto)
            }
              // Calculate scIncrementalAmount and round to 2 decimal places
              const scIncrementalAmount = (this.assessmentFormData.sccurrentSalaryAuto * (this.assessmentFormData.scincrementpercentagebasedonprorata / 100)) * (this.assessmentFormData.totaldurationinmonths / 12);
              this.assessmentFormData.scIncrementalAmount = Math.round(scIncrementalAmount * 100) / 100;
              console.log(this.assessmentFormData.scIncrementalAmount);

              // Calculate screvicedSalary and round to 2 decimal places
              
                const scRevisedSalary = this.assessmentFormData.sccurrentSalaryAuto + this.assessmentFormData.scIncrementalAmount;
                this.assessmentFormData.screvicedSalary = Math.round(scRevisedSalary * 100) / 100;
            
            }
          }
        })
      }
      else {
        this.assessmentFormData.scincrementpercentagebasedonprorata = null;
        this.assessmentFormData.sccurrentSalaryAuto = null;
        this.assessmentFormData.screvicedSalary = null;
        this.assessmentFormData.scIncrementalAmount = null
      }
    }
    else {
      this.assessmentFormData.scincrementpercentagebasedonprorata = null;
      this.assessmentFormData.sccurrentSalaryAuto = null;
      this.assessmentFormData.screvicedSalary = null;
      this.assessmentFormData.scIncrementalAmount = null
    }

  }
  //funtion to enter the Incremental Amount Based on Rating for consider manual input
  considermanualinputProrataCheckforpercentage(Value: any) {
    if (this.assessmentFormData.considermanualinputcheck === true) {
      if (Value && Value >= 1) {
        const incrementadetails = this.assessmentFormData.ipData.forEach((ele: any) => {
          const currentSalary = parseFloat(this.assessmentFormData.currentSalaryAuto);
          if (currentSalary >= parseFloat(ele.min) && currentSalary <= parseFloat(ele.max)) {
            const IncrementalData = ele?.items?.find((ele: any) => parseInt(ele.ratingColumn) === this.hrOverAllRatingForProrata);
            console.log(IncrementalData);
            console.log(IncrementalData)
            this.assessmentFormData.cmcurrentSalaryAuto = this.assessmentFormData.currentSalaryAuto;
            console.log(this.assessmentFormData.cmcurrentSalaryAuto)
            this.assessmentFormData.cmIncrementalAmount = parseFloat(Value);
            console.log(this.assessmentFormData?.cmIncrementalAmount);
            // Calculate cmrevicedSalary and round to 2 decimal places
            const cmRevisedSalary = this.assessmentFormData.currentSalaryAuto + Value;
            this.assessmentFormData.cmrevicedSalary = Math.round(cmRevisedSalary * 100) / 100;
            const Incrementpercentage = (this.assessmentFormData.cmIncrementalAmount * 12) / (this.assessmentFormData.totaldurationinmonths * this.assessmentFormData.cmcurrentSalaryAuto);
            this.assessmentFormData.cmincrementpercentagebasedonprorata = ((Incrementpercentage) * 100).toFixed(2);
            console.log(this.assessmentFormData.cmincrementpercentagebasedonprorata)
          }
        })
        if(this.assessmentFormData.salaryCorrectioninputcheck){
          this.salaryCorrectionmanualinputProrataCheck(this.assessmentFormData.scincrementpercentagebasedonprorata)
        }
      }
      else {
        this.assessmentFormData.cmincrementpercentagebasedonprorata = null;
        this.assessmentFormData.cmcurrentSalaryAuto = null;
        this.assessmentFormData.cmrevicedSalary = null;
        this.assessmentFormData.cmIncrementalAmount = null
      }

    }
    else {
      this.assessmentFormData.cmincrementpercentagebasedonprorata = null;
      this.assessmentFormData.cmcurrentSalaryAuto = null;
      this.assessmentFormData.cmrevicedSalary = null;
      this.assessmentFormData.cmIncrementalAmount = null
    }
  }
  //function to enter the Incremental Amount Based on Rating for salary correction
  salaryCorrectionmanualinputProrataCheckforpercentage(Value: any) {
    if (this.assessmentFormData.salaryCorrectioninputcheck === true) {
      if (Value && Value >= 1) {
        const incrementadetails = this.assessmentFormData.ipData.forEach((ele: any) => {
          const currentSalary = parseFloat(this.assessmentFormData.currentSalaryAuto);
          if (currentSalary >= parseFloat(ele.min) && currentSalary <= parseFloat(ele.max)) {
            const IncrementalData = ele?.items?.find((ele: any) => parseInt(ele.ratingColumn) === this.hrOverAllRatingForProrata);
            console.log(IncrementalData);
            console.log(IncrementalData)
            if( this.assessmentFormData.considermanualinputcheck){
              this.assessmentFormData.sccurrentSalaryAuto = this.assessmentFormData.cmrevicedSalary
              console.log(this.assessmentFormData.sccurrentSalaryAuto)
            }
            else if(this.assessmentFormData.revicedSalary){
              this.assessmentFormData.sccurrentSalaryAuto = this.assessmentFormData.revicedSalary
              console.log(this.assessmentFormData.sccurrentSalaryAuto)
            }
            console.log(this.assessmentFormData.sccurrentSalaryAuto)
            this.assessmentFormData.scIncrementalAmount = parseFloat(Value);
            console.log(this.assessmentFormData?.scIncrementalAmount);
            // Calculate screvicedSalary and round to 2 decimal places
          
            const scRevisedSalary = this.assessmentFormData.sccurrentSalaryAuto + Value;
            this.assessmentFormData.screvicedSalary = Math.round(scRevisedSalary * 100) / 100;
            const Incrementpercentage = (this.assessmentFormData.scIncrementalAmount * 12) / (this.assessmentFormData.totaldurationinmonths * this.assessmentFormData.sccurrentSalaryAuto);
            this.assessmentFormData.scincrementpercentagebasedonprorata = ((Incrementpercentage) * 100).toFixed(2);
            console.log(this.assessmentFormData.scincrementpercentagebasedonprorata)
          }
        })
      }
      else {
        this.assessmentFormData.scincrementpercentagebasedonprorata = null;
        this.assessmentFormData.sccurrentSalaryAuto = null;
        this.assessmentFormData.screvicedSalary = null;
        this.assessmentFormData.scIncrementalAmount = null
      }

    }
    else {
      this.assessmentFormData.scincrementpercentagebasedonprorata = null;
      this.assessmentFormData.sccurrentSalaryAuto = null;
      this.assessmentFormData.screvicedSalary = null;
      this.assessmentFormData.scIncrementalAmount = null
    }
  }
  //function to submit the form
  onSubmit() {
    this.modalRef = this.modalService.open(this.loading, { centered: true });
    // if (this.assessmentForm.valid) {
    console.log(this.assessmentFormData);
    
    const payload = {
      employeeId: this.employeeId,
      formId: this.assessmentFormData.formId,
      raisedBy: this.employeeId,
      reportingManagerId: this.assessmentFormData.rmEmpId,
      teamManagerId: this.assessmentFormData.tmEmpId,
      employeeOverAllRating: this.employeeOverAllRating?.toString(),
      rmOverAllRating: this.rmOverAllRating?.toString(),
      tmOverAllRating: this.tmOverAllRating?.toString(),
      hrOverAllRating: this.hrOverAllRating?.toString(),
      hrComments: this.hrComments,
      tmComments: this.tmComments,
      rmComments: this.rmComments,
      employeeComments: this.employeeComments.toString(),
      assessorItemId: this.assessorItemId,
      questionAnswers: this.selected_questions,
      reviewCycleItemId: this.templateId,
      stage: this.currentStage,
      incrementPercentageMannual: this.assessmentFormData.cmincrementpercentagebasedonprorata,
      incrementAmountMannual: this.assessmentFormData.cmIncrementalAmount,
      currentSalaryMannual: this.assessmentFormData.cmcurrentSalaryAuto,
      revisedSalaryMannual: this.assessmentFormData.cmrevicedSalary,
      incrementPercentageAuto: this.assessmentFormData.incrementpercentagebasedonprorata,
      isConsiderManualInputs: this.assessmentFormData.considermanualinputcheck,
      isApplicableForPromotion: this.assessmentFormData.eligibleforpromotion,
      incrementAmountAuto: this.assessmentFormData.IncrementalAmount,
      currentSalaryAuto: this.assessmentFormData.currentSalaryAuto,
      revisedSalaryAuto: this.assessmentFormData.revicedSalary,
      currentDesignation: this.assessmentFormData.currentDesignation,
      revisedDesignation: this.assessmentFormData.revisedDesignation?.designationName,
      totalDurationInMonths: this.assessmentFormData.totaldurationinmonths,
      status: "Submitted",
      currentStage: this.currentStage + 1,
      reviewcycleitemformresponseid: this.reviewcycleitemformresponseid,
      reviewemployeeId: this.reviewEmployeeId,
      isSameAsPreviousAssessor: this.assessmentFormData.isSameAsPreviousAssessor,
      jobgradeid: this.gradeId,
      isSalaryCorrection: this.assessmentFormData.salaryCorrectioninputcheck,
      salaryCorrectionIncrementPercentage:this.assessmentFormData.scincrementpercentagebasedonprorata,
      salaryCorrectionIncrementAmount: this.assessmentFormData.scIncrementalAmount,
      salaryCorrectionCurrentAmount:this.assessmentFormData.sccurrentSalaryAuto,
      salaryCorrectionRevisedAmount: this.assessmentFormData.screvicedSalary,
    };
    this.http.postdata(`reviewCycleHeader/upsertquery`, payload).subscribe({
      next: (data) => {
        if (this.modalRef) {
          this.modalRef.close();  // or this.modalRef.dismiss();
        }
        this.Status = 'Submitted Successfully'
        this.modalService.open(this.success, { centered: true });
        console.log('Assessment Data:', data);
      },
      error: (err) => {
        if (this.modalRef) {
          this.modalRef.close();  // or this.modalRef.dismiss();
        }
        if (err.status === 404) {
          this.Status = "The requested resource was not found. Please check the URL or contact the administrator for assistance.";
        } else if (err.status === 500) {
          this.Status = err.error.details;
        } else {
          this.Status = err.error.message;
        }
        this.modalService.open(this.error, { centered: true });
      }
    });
    // } else {
    //   console.log('Form is invalid');
    // }
  }
    //function to re-submit the form
    onReSubmit() {
      this.modalRef = this.modalService.open(this.loading, { centered: true });
      // if (this.assessmentForm.valid) {
      const payload = {
        employeeId: this.employeeId,
        formId: this.assessmentFormData.formId,
        raisedBy: this.employeeId,
        reportingManagerId: this.assessmentFormData.rmEmpId,
        teamManagerId: this.assessmentFormData.tmEmpId,
        employeeOverAllRating: this.employeeOverAllRating?.toString(),
        rmOverAllRating: this.rmOverAllRating?.toString(),
        tmOverAllRating: this.tmOverAllRating?.toString(),
        hrOverAllRating: this.hrOverAllRating?.toString(),
        hrComments: this.hrComments,
        tmComments: this.tmComments,
        rmComments: this.rmComments,
        employeeComments: this.employeeComments.toString(),
        assessorItemId: this.assessorItemId,
        questionAnswers: this.selected_questions,
        reviewCycleItemId: this.templateId,
        stage: this.currentStage,
        incrementPercentageMannual: this.assessmentFormData.cmincrementpercentagebasedonprorata,
        incrementAmountMannual: this.assessmentFormData.cmIncrementalAmount,
        currentSalaryMannual: this.assessmentFormData.cmcurrentSalaryAuto,
        revisedSalaryMannual: this.assessmentFormData.cmrevicedSalary,
        incrementPercentageAuto: this.assessmentFormData.incrementpercentagebasedonprorata,
        isConsiderManualInputs: this.assessmentFormData.considermanualinputcheck,
        isApplicableForPromotion: this.assessmentFormData.eligibleforpromotion,
        incrementAmountAuto: this.assessmentFormData.IncrementalAmount,
        currentSalaryAuto: this.assessmentFormData.currentSalaryAuto,
        revisedSalaryAuto: this.assessmentFormData.revicedSalary,
        currentDesignation: this.assessmentFormData.currentDesignation,
        revisedDesignation: this.assessmentFormData.revisedDesignation?.designationName,
        totalDurationInMonths: this.assessmentFormData.totaldurationinmonths,
        status: "Re-Submitted",
        currentStage: this.currentStage + 1,
        reviewcycleitemformresponseid: this.reviewcycleitemformresponseid,
        reviewemployeeId: this.reviewEmployeeId,
        isSameAsPreviousAssessor: this.assessmentFormData.isSameAsPreviousAssessor,
        jobgradeid: this.gradeId,
        isSalaryCorrection: this.assessmentFormData.salaryCorrectioninputcheck,
        salaryCorrectionIncrementPercentage:this.assessmentFormData.scincrementpercentagebasedonprorata,
        salaryCorrectionIncrementAmount: this.assessmentFormData.scIncrementalAmount,
        salaryCorrectionCurrentAmount:this.assessmentFormData.sccurrentSalaryAuto,
        salaryCorrectionRevisedAmount: this.assessmentFormData.screvicedSalary,
      };
      this.http.postdata(`reviewCycleHeader/upsertquery`, payload).subscribe({
        next: (data) => {
          if (this.modalRef) {
            this.modalRef.close();  // or this.modalRef.dismiss();
          }
          this.Status = 'Submitted Successfully'
          this.modalService.open(this.success, { centered: true });
          console.log('Assessment Data:', data);
        },
        error: (err) => {
          if (this.modalRef) {
            this.modalRef.close();  // or this.modalRef.dismiss();
          }
          if (err.status === 404) {
            this.Status = "The requested resource was not found. Please check the URL or contact the administrator for assistance.";
          } else if (err.status === 500) {
            this.Status = err.error.details;
          } else {
            this.Status = err.error.message;
          }
          this.modalService.open(this.error, { centered: true });
        }
      });
      // } else {
      //   console.log('Form is invalid');
      // }
    }
  //function to submit the form as draft
  onSaveasDraft() {
    this.modalRef = this.modalService.open(this.loading, { centered: true });
    // if (this.assessmentForm.valid) {
    const payload = {
      employeeId: this.employeeId,
      formresponseid: this.formresponseid,
      formId: this.assessmentFormData.formId,
      raisedBy: this.employeeId,
      reportingManagerId: this.assessmentFormData.rmEmpId,
      teamManagerId: this.assessmentFormData.tmEmpId,
      employeeOverAllRating: this.employeeOverAllRating?.toString(),
      rmOverAllRating: this.rmOverAllRating?.toString(),
      tmOverAllRating: this.tmOverAllRating?.toString(),
      hrOverAllRating: this.hrOverAllRating?.toString(),
      hrComments: this.hrComments,
      tmComments: this.tmComments,
      rmComments: this.rmComments,
      employeeComments: this.employeeComments.toString(),
      assessorItemId: this.assessorItemId,
      questionAnswers: this.selected_questions,
      reviewCycleItemId: this.templateId,
      stage: this.currentStage,
      incrementPercentageMannual: this.assessmentFormData.cmincrementpercentagebasedonprorata,
      incrementAmountMannual: this.assessmentFormData.cmIncrementalAmount,
      currentSalaryMannual: this.assessmentFormData.cmcurrentSalaryAuto,
      revisedSalaryMannual: this.assessmentFormData.cmrevicedSalary,
      incrementPercentageAuto: this.assessmentFormData.incrementpercentagebasedonprorata,
      isConsiderManualInputs: this.assessmentFormData.considermanualinputcheck,
      isApplicableForPromotion: this.assessmentFormData.eligibleforpromotion,
      incrementAmountAuto: this.assessmentFormData.IncrementalAmount,
      currentSalaryAuto: this.assessmentFormData.currentSalaryAuto,
      revisedSalaryAuto: this.assessmentFormData.revicedSalary,
      currentDesignation: this.assessmentFormData.currentDesignation,
      revisedDesignation: this.assessmentFormData.revisedDesignation?.designationName,
      totalDurationInMonths: this.assessmentFormData.totaldurationinmonths,
      status: "Draft",
      currentStage: this.currentStage,
      reviewcycleitemformresponseid: this.reviewcycleitemformresponseid,
      reviewemployeeId: this.reviewEmployeeId,
      isSameAsPreviousAssessor: this.assessmentFormData.isSameAsPreviousAssessor,
      jobgradeid: this.gradeId,
      isSalaryCorrection: this.assessmentFormData.salaryCorrectioninputcheck,
      salaryCorrectionIncrementPercentage:this.assessmentFormData.scincrementpercentagebasedonprorata,
      salaryCorrectionIncrementAmount: this.assessmentFormData.scIncrementalAmount,
      salaryCorrectionCurrentAmount:this.assessmentFormData.sccurrentSalaryAuto,
      salaryCorrectionRevisedAmount: this.assessmentFormData.screvicedSalary,
    };
    this.http.postdata(`reviewCycleHeader/upsertquery`, payload).subscribe({
      next: (data) => {
        if (this.modalRef) {
          this.modalRef.close();  // or this.modalRef.dismiss();
        }
        this.Status = 'Saved as Draft Successfully'
        this.modalService.open(this.success, { centered: true });
        console.log('Assessment Data:', data);
      },
      error: (err) => {
        if (this.modalRef) {
          this.modalRef.close();  // or this.modalRef.dismiss();
        }
        if (err.status === 404) {
          this.Status = "The requested resource was not found. Please check the URL or contact the administrator for assistance.";
        } else if (err.status === 500) {
          this.Status = err.error.details;
        } else {
          this.Status = err.error.message;
        }
        this.modalService.open(this.error, { centered: true });
      }
    });
    // } else {
    //   console.log('Form is invalid');
    // }
  }
}
