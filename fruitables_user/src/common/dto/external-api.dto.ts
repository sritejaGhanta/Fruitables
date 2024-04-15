export class SuccessCaseDto {
  condition?: {
    type?: string;
    oper?: string;
    key?: any;
    val?: any;
  };
  separator?: string;
  target?: any;
  output?: any;
}

export class FailureCaseDto {
  condition?: {
    type?: string;
    oper?: string;
    key?: any;
    val?: any;
  };
  separator?: string;
  target?: any;
  output?: any;
}
