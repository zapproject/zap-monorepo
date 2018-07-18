export interface CurveType {
  constants:number[],
  parts : number[],
  dividers: number[]
}

export interface CurveTerm {
  fn :  number,
    power : number,
    coef : number
}