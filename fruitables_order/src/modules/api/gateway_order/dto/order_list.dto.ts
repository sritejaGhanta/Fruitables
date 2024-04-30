import { IsInt, IsNotEmpty } from 'class-validator';
import * as custom from 'src/utilities/custom-helper';

export class OrderListDto {
  @IsInt()
  @IsNotEmpty({
    message: () => custom.lang('Please enter a value for the user_id field.'),
  })
  user_id: number;

  @IsInt()
  @IsNotEmpty({
    message: () => custom.lang('Please enter a value for the limit field.'),
  })
  limit: number;

  @IsInt()
  @IsNotEmpty({
    message: () => custom.lang('Please enter a value for the page field.'),
  })
  page_index: number;
}
