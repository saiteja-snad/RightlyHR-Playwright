export interface IPolicy {
    id: number;
    locationId: number;
    locationName : string;
    subLocationId: number;
    subLocationName: string;
    shiftID: number;
    shiftName: string;
    applicableyear: number;
    status: string;
    addedby: number;
    addedbyName: string;
    addedDate: string;
    authorizedby: number;
    authorizedDate: string;
    authorizedstatus: string;
    statusCode : number;
    orgPolicyItems: IOrgPolicyItem[];
}

export interface IOrgPolicyItem {
    id: number;
    headerId: number;
    policyName: string;
    policyAttachment: string;
    policyDescription : string;
    requiresAcknowledgment : boolean;
    sendEmailNotification : boolean;
    sendNotification : boolean;
    sendPushNotification : boolean;
    status  : string;
}