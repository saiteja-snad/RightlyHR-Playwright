export type IProjectAuthority = {
  id: number
  authority: {
    id: number
    fusionEmployeeId: string
    name: string
    workMail: string
  }
  createdBy: number
  createdAt: string
  isActive: boolean
}