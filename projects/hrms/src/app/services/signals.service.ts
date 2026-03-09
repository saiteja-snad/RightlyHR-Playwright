import { Injectable, signal } from '@angular/core';
import { OpenModalService } from './open-modal.service';

@Injectable({
  providedIn: 'root',
})
export class SignalsService {
  authSignal = signal<string>('');

  // WFH PendingApprovals Signals
  wfhForYouTriggerSignal = signal<boolean>(false);
  wfhForRoleTriggerSignal = signal<boolean>(false);
  wfhSidNavCountTriggerSignal = signal<boolean>(false);

  // Permissions PendingApprovals Signals
  permissionForYouTriggerSignal = signal<boolean>(false);
  permissionForRoleTriggerSignal = signal<boolean>(false);
  permissionSidNavCountTriggerSignal = signal<boolean>(false);

  // CompOff PendingApprovals Signals
  compOffForYouTriggerSignal = signal<boolean>(false);
  compOffForRoleTriggerSignal = signal<boolean>(false);
  compOffSidNavCountTriggerSignal = signal<boolean>(false);

  // RemoteLoginRequest Signal
  remoteLoginRequestTriggerSignal = signal<boolean>(false);
  remoteLoginForYouTriggerSignal = signal<boolean>(false);
  retoteLoginForRoleTriggerSignal = signal<boolean>(false);
  remoteLoginSidNavCountTriggerSignal = signal<boolean>(false);


  //Separation request
  separationForYouTriggerSignal = signal<boolean>(false);
  separationForRoleTriggerSignal = signal<boolean>(false);
  separationSidNavCountTriggerSignal = signal<boolean>(false);

  //Recall request
  recallSeparationForYouTriggerSignal = signal<boolean>(false);
  recallSeparationForRoleTriggerSignal = signal<boolean>(false);
  recallSeparationSidNavCountTriggerSignal = signal<boolean>(false);

  // Regularization PendingApprovals Signals
  regularizationForYouTriggerSignal = signal<boolean>(false);
  regularizationForRoleTriggerSignal = signal<boolean>(false);
  regularizationSidNavCountTriggerSignal = signal<boolean>(false);

  noDueTriggerSignal = signal<boolean>(false);
  noDueSideNavCountTriggerSignal = signal<boolean>(false);
  //Time off request
  timecountTriggerSignal = signal<boolean>(false);
  timeoffForYouTriggerSignal = signal<boolean>(false);
  timeoffForRoleTriggerSignal = signal<boolean>(false);
  timeOffsidenavCountSignal = signal<boolean>(false);
  // Desk Allocation request
  deskForYouTriggerSignal = signal<boolean>(false);
  deskForRoleTriggerSignal = signal<boolean>(false);

  clamisandexpensesForYouTriggerSignal = signal<boolean>(false);
  claimsandexpensesForRoleTriggerSignal = signal<boolean>(false);
// employeinfo for you,for your role
  employeinfoDetailsForYouTriggerSignal = signal<boolean>(false);
  employeinfoDetailsForRoleTriggerSignal = signal<boolean>(false);
  //trainee details trigger signals
  traineeDetailsTriggerSignal = signal<boolean>(false);
  // probation deatils
  probationDetailsTriggerSignal = signal<boolean>(false);
// employeinfo
  employeinfoDetailsTriggerSignal = signal<boolean>(false);
  contractForyouTriggerSignal = signal<boolean>(false);

  contractConversionForYouTriggerSignal = signal<boolean>(false);
  contractConversionForYouRoleTriggerSignal = signal<boolean>(false);

  
  constructor(
    private sharedModalService: OpenModalService,
  ) { }

  handleResponse(respone: any, status: string) {
    if (respone.failureRecordsCount != 0) {
      this.sharedModalService.openErrorModal(respone.failureRecords[0].message, 5000)
    } else {
      this.sharedModalService.openSuccessModal(status);
    }
  }
}
