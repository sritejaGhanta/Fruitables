import { IsString, IsNotEmpty, IsInt, IsIn } from 'class-validator';
import * as custom from 'src/utilities/custom-helper';

export class ProductsUpdateDto {

  @IsString()
  @IsNotEmpty({ message: () => custom.lang('Please enter value for product_name field') })
  product_name: string;

  @IsString()
  @IsNotEmpty({ message: () => custom.lang('Please enter value for product_image field') })
  product_image: string;

  @IsString()
  @IsNotEmpty({ message: () => custom.lang('Please enter value for product_cost field') })
  product_cost: string;

  @IsString()
  @IsNotEmpty({ message: () => custom.lang('Please enter value for product_description field') })
  product_description: string;

  @IsInt()
  @IsNotEmpty({ message: () => custom.lang('Please enter value for product_category_id field') })
  product_category_id: number;

  @IsString()
  @IsIn(['Active', 'active', 'Inactive', 'inactive'])
  @IsNotEmpty({ message: () => custom.lang('Please enter value for status field') })
  status: string;

  @IsString()
  @IsIn(['Free delivery', 'free delivery', 'Discount', 'discount'])
  @IsNotEmpty({ message: () => custom.lang('Please enter value for offer_type field') })
  offer_type: string;

}



export class ProductsUpdateParamDto {

  @IsString()
  @IsNotEmpty({ message: () => custom.lang('Please enter value for id field') })
  id: string;

}
