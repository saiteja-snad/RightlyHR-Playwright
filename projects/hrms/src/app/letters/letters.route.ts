import { Route } from "@angular/router";
import { OfferLetterComponent } from "./offer-letter/offer-letter.component";
import { AppointmentLetterComponent } from "./appointment-letter/appointment-letter.component";
import { BankLoanLetterComponent } from "./bank-loan-letter/bank-loan-letter.component";
import { AddressProofLetterComponent } from "./address-proof-letter/address-proof-letter.component";
import { ApprisalLetterComponent } from "./apprisal-letter/apprisal-letter.component";
import { PromotionLetterComponent } from "./promotion-letter/promotion-letter.component";
import { SalaryRevisionLetterComponent } from "./salary-revision-letter/salary-revision-letter.component";
import { RelievingLetterComponent } from "./relieving-letter/relieving-letter.component";
import { ProbationConfirmationLetterComponent } from "./probation-confirmation-letter/probation-confirmation-letter.component";
import { ProbationExtensionLetterComponent } from "./probation-extension-letter/probation-extension-letter.component";
import { WelcomeLetterComponent } from "./welcome-letter/welcome-letter.component";
import { TraineeAppointmentLetterComponent } from "./trainee-appointment-letter/trainee-appointment-letter.component";
import { TraineeOfferLetterComponent } from "./trainee-offer-letter/trainee-offer-letter.component";

export default [
    { path: '', redirectTo: '/letters/offer-letter', pathMatch: 'full' },
    { path: 'offer-letter', component: OfferLetterComponent },
    { path: 'appointment-letter', component: AppointmentLetterComponent },
    { path: 'trainee-offer-letter', component: TraineeOfferLetterComponent },
    { path: 'trainee-appointment-letter', component: TraineeAppointmentLetterComponent },
    { path: 'bank-loan-letter', component: BankLoanLetterComponent },
    { path: 'address-proof-letter', component: AddressProofLetterComponent },
    { path: 'apprisal-letter', component: ApprisalLetterComponent },
    { path: 'promotion-letter', component: PromotionLetterComponent },
    { path: 'salary-revision-letter', component: SalaryRevisionLetterComponent },
    { path: 'relieving-letter', component: RelievingLetterComponent },
    { path: 'probation-confirmation-letter', component: ProbationConfirmationLetterComponent },
    { path: 'probation-extension-letter', component: ProbationExtensionLetterComponent },
    { path: 'welcome-letter', component: WelcomeLetterComponent },
] as Route[];