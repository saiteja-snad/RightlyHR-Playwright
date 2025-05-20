export interface IPermissions {
    id: number,
    claimType: string,
    claimValue: string,
    roleId: string;
}
export interface IRoles {
    id: string,
    concurrencyStamp: string,
    name: string,
    normalizedName: string
    normailizedId: number
}