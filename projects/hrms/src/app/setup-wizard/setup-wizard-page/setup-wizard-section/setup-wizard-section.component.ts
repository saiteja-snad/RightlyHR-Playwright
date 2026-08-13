import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LocationComponent } from '../../../settings/employee-fields/job/location/location.component';
import { SubLocationComponent } from '../../../settings/employee-fields/job/sub-location/sub-location.component';
import { SetupWizardStatusSectionComponent } from '../setup-wizard-status-section/setup-wizard-status-section.component';
import { DepartmentComponent } from '../../../settings/employee-fields/job/department/department.component';
import { TeamComponent } from '../../../settings/employee-fields/job/team/team.component';
import { SalutationComponent } from '../../../settings/employee-fields/personal/salutation/salutation.component';
import { GenderComponent } from '../../../settings/employee-fields/personal/gender/gender.component';
import { StatusComponent } from '../../../settings/employee-fields/personal/status/status.component';
import { MaritalstatusComponent } from '../../../settings/employee-fields/personal/maritalstatus/maritalstatus.component';
import { DegreeComponent } from '../../../settings/employee-fields/personal/degree/degree.component';
import { JobroleComponent } from '../../../settings/employee-fields/job/jobrole/jobrole.component';
import { JobtypeComponent } from '../../../settings/employee-fields/job/jobtype/jobtype.component';
import { ProbationstatusComponent } from '../../../settings/employee-fields/job/probationstatus/probationstatus.component';
import { PaytypeComponent } from '../../../settings/employee-fields/job/paytype/paytype.component';
import { GradeComponent } from '../../../settings/employee-fields/job/grade/grade.component';
import { CompensationReasonComponent } from '../../../settings/employee-fields/job/compensation-reason/compensation-reason.component';
import { OrganizationchartComponent } from '../../../organizationchart/organizationchart/organizationchart.component';
import { LeaveAlloctaionComponent } from '../../../settings/time-off/leave-alloctaion/leave-alloctaion.component';
import { SignatureAuthorityComponent } from '../../../settings/employee-fields/job/signature-authority/signature-authority.component';
import { SetupWizardSectionKey } from '../../models/setup-wizard.model';

@Component({
  selector: 'app-setup-wizard-section',
  imports: [
    CommonModule,
    LocationComponent,
    SubLocationComponent,
    SetupWizardStatusSectionComponent,
    DepartmentComponent,
    TeamComponent,
    SalutationComponent,
    GenderComponent,
    StatusComponent,
    MaritalstatusComponent,
    DegreeComponent,
    JobroleComponent,
    JobtypeComponent,
    ProbationstatusComponent,
    PaytypeComponent,
    GradeComponent,
    CompensationReasonComponent,
    OrganizationchartComponent,
    LeaveAlloctaionComponent,
    SignatureAuthorityComponent
  ],
  templateUrl: './setup-wizard-section.component.html',
  styleUrl: './setup-wizard-section.component.scss'
})
export class SetupWizardSectionComponent {
  readonly sectionKey = input.required<SetupWizardSectionKey>();
}
