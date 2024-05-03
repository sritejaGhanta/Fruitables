import { Injectable } from '@nestjs/common';

import { BaseService } from 'src/services/base.service';
@Injectable()
export class CreateTokenService extends BaseService {
  constructor() {
    super();
  }

  async test(params: object) {
    return { success: 1 };
  }
}
