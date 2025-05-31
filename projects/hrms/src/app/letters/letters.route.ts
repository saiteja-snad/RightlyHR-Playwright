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
import { PermissionsGuard } from "../guards/permissions.guard";

export default [
    // { path: '', redirectTo: '/letters/offer-letter', pathMatch: 'full' },
    { path: 'offer-letter', component: OfferLetterComponent,canActivate: [PermissionsGuard], data: { permission: 'Dashboard Generate Documents Offer Letter.view' } },
    { path: 'appointment-letter', component: AppointmentLetterComponent,canActivate: [PermissionsGuard], data: { permission: 'Dashboard Generate Documents Appointment Letter.view' } },
    { path: 'trainee-offer-letter', component: TraineeOfferLetterComponent,canActivate: [PermissionsGuard], data: { permission: 'Dashboard Generate Documents Trainee Offer Letter.view' } },
    { path: 'trainee-appointment-letter', component: TraineeAppointmentLetterComponent ,canActivate: [PermissionsGuard], data: { permission: 'Dashboard Generate Documents Trainee Appointment Letter.view' }},
    { path: 'bank-loan-letter', component: BankLoanLetterComponent,canActivate: [PermissionsGuard], data: { permission: 'Bank Loan Letter.view' } },
    { path: 'address-proof-letter', component: AddressProofLetterComponent,canActivate: [PermissionsGuard], data: { permission: 'Address Proof Letter.view' } },
    { path: 'apprisal-letter', component: ApprisalLetterComponent,canActivate: [PermissionsGuard], data: { permission: 'Apprisal Letter.view' } },
    { path: 'promotion-letter', component: PromotionLetterComponent ,canActivate: [PermissionsGuard], data: { permission: 'Promotion Letter.view' }},
    { path: 'salary-revision-letter', component: SalaryRevisionLetterComponent,canActivate: [PermissionsGuard], data: { permission: 'Salary Revision Letter.view' } },
    { path: 'relieving-letter', component: RelievingLetterComponent,canActivate: [PermissionsGuard], data: { permission: 'Relieving Letter.view' } },
    { path: 'probation-confirmation-letter', component: ProbationConfirmationLetterComponent ,canActivate: [PermissionsGuard], data: { permission: 'Probation Confirmation Letter.view' }},
    { path: 'probation-extension-letter', component: ProbationExtensionLetterComponent,canActivate: [PermissionsGuard], data: { permission: 'Probation Extension Letter.view' } },
    // { path: 'welcome-letter', component: WelcomeLetterComponent,canActivate: [PermissionsGuard], data: { permission: 'Dashboard Generate Documents Welcome Letter.view' } },
] as Route[];