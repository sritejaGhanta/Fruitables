import { Injectable } from '@nestjs/common';

@Injectable()
export class OperationExecuteService {
  constructor() {}

  async executeOperationBasedJobs(notificationName: string) {
    let ApiResponse: any = {};
    return ApiResponse;
  }
}
