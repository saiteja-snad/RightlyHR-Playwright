export interface IEAV {
  id: number
  entity: string
  attribute: string
  value: string
  meta: {
    graphData : {
      color : string;
    }
  }
}