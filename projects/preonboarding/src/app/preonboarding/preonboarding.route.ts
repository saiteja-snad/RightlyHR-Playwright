import { Route } from "@angular/router";
import { PersonalDetailsComponent } from "./personal-details/personal-details.component";
import { OnboardingDocumentsComponent } from "./onboarding-documents/onboarding-documents.component";
import { JobDetailsComponent } from "./job-details/job-details.component";
import { OfferLetterComponent } from "./offer-letter/offer-letter.component";
import { EducationDetailsComponent } from "./education-details/education-details.component";
import { EmergencyContactDetailsComponent } from "./emergency-contact-details/emergency-contact-details.component";
import { ExperienceDetailsComponent } from "./experience-details/experience-details.component";
import { ReviewComponent } from "./review/review.component";
import { TraineeOfferletterComponent } from "./trainee-offerletter/trainee-offerletter.component";
import { ApplicationSubmitComponent } from "./application-submit/application-submit.component";

export default [
    { path: '', redirectTo: '/job-details', pathMatch: 'full' },
    { path: 'job-details', component: JobDetailsComponent },
    { path: 'personal-details', component: PersonalDetailsComponent },
    { path: 'document', component: OnboardingDocumentsComponent },
    { path: 'offer-letter', component: OfferLetterComponent },
    { path: 'trainee-offerletter', component: TraineeOfferletterComponent },
    { path: 'education-details', component: EducationDetailsComponent },
    { path: 'emergency-details', component: EmergencyContactDetailsComponent },
    { path: 'experience-details', component: ExperienceDetailsComponent },
    { path: 'review', component: ReviewComponent },
    { path: 'application-submited', component: ApplicationSubmitComponent }
] as Route[];