import { Injectable } from '@nestjs/common';

import { GetBestsellerProductsService } from '../get_bestseller_products.service';

@Injectable()
export class GetBestsellerProductsExtendedService extends GetBestsellerProductsService {
  addOrderBy(quary) {
    quary.addOrderBy('SUM(oi.iOrderQty)', 'DESC');
  }
  prepare(inputParams) {
    return {
      ids: inputParams.get_ids.map((e) => e.product_id),
    };
  }
}
