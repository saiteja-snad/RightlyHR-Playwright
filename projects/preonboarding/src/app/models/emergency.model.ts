export interface IEmergency {
    emergencyName: string,
    emailId: string,
    emergencycode: string,
    mobileNumber: any,
    relationShip: string,
    emergencyName1: string
    emergencyEmail1: string
    emergencycode1: number
    emergencyNumber1: number
    relationship1: string
}

export interface IRelation {
    sno: number,
    relationship1: string,
    isdeleted: string
    isDependent?: boolean
}