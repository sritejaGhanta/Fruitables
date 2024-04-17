import { Injectable } from '@nestjs/common';

import { FaqListService } from '../faq_list.service';

@Injectable()
export class FaqListExtendedService extends FaqListService {

  getColumnAliases(){
    return {
      id: 'f.id',
      product_id: 'f.iProductId',
      question_name: 'f.vQuestionName',
      answer: 'f.vAnswer',
    
    }
  }
}