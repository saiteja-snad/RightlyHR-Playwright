import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SignalsService {
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

  // Regularization PendingApprovals Signals
  regularizationForYouTriggerSignal = signal<boolean>(false);
  regularizationForRoleTriggerSignal = signal<boolean>(false);
  regularizationSidNavCountTriggerSignal = signal<boolean>(false);

  constructor() {}
}
