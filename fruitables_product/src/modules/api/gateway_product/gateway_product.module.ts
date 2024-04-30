import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GlobalModule } from 'src/modules/global/global.module';
import { GatewayProductController } from './gateway_product.controller';

import { DashboardProductsExtendedService } from './services/extended/dashboard_products.extended.service';
import { FaqAddService } from './services/faq_add.service';
import { FaqListExtendedService } from './services/extended/faq_list.extended.service';
import { FaqUpdateService } from './services/faq_update.service';
import { GetProductAndReviewsCountService } from './services/get_product_and_reviews_count.service';
import { ProductCategoryAddService } from './services/product_category_add.service';
import { ProductCategoryAutocompleteService } from './services/product_category_autocomplete.service';
import { ProductCategoryChangeStatusService } from './services/product_category_change_status.service';
import { ProductCategoryDeleteService } from './services/product_category_delete.service';
import { ProductCategoryDetailsService } from './services/product_category_details.service';
import { ProductCategoryListExtendedService } from './services/extended/product_category_list.extended.service';
import { ProductCategoryUpdateExtendedService } from './services/extended/product_category_update.extended.service';
import { ProductReviewsListExtendedService } from './services/extended/product_reviews_list.extended.service';
import { ProductReviewsAddService } from './services/product_reviews_add.service';
import { ProductReviewsDeleteService } from './services/product_reviews_delete.service';
import { ProductReviewsUpdateService } from './services/product_reviews_update.service';
import { ProductsAddService } from './services/products_add.service';
import { ProductsAutocompleteService } from './services/products_autocomplete.service';
import { ProductsChangeStatusService } from './services/products_change_status.service';
import { ProductsDeleteService } from './services/products_delete.service';
import { ProductsDetailsService } from './services/products_details.service';
import { ProductsListExtendedService } from './services/extended/products_list.extended.service';
import { ProductsUpdateService } from './services/products_update.service';
import { RmqGetProductDetailsService } from './services/rmq_get_product_details.service';
import { RmqGetProductsListService } from './services/rmq_get_products_list.service';

import { ProductsEntity } from 'src/entities/products.entity';
import { FaqEntity } from 'src/entities/faq.entity';
import { ProductReviewsEntity } from 'src/entities/product-reviews.entity';
import { ProductCategoryEntity } from 'src/entities/product-category.entity';

@Module({
  imports: [
    GlobalModule,
    TypeOrmModule.forFeature([
      ProductsEntity,
      FaqEntity,
      ProductReviewsEntity,
      ProductCategoryEntity,
    ]),
  ],
  controllers: [GatewayProductController],
  providers: [
    DashboardProductsExtendedService,
    FaqAddService,
    FaqListExtendedService,
    FaqUpdateService,
    GetProductAndReviewsCountService,
    ProductCategoryAddService,
    ProductCategoryAutocompleteService,
    ProductCategoryChangeStatusService,
    ProductCategoryDeleteService,
    ProductCategoryDetailsService,
    ProductCategoryListExtendedService,
    ProductCategoryUpdateExtendedService,
    ProductReviewsListExtendedService,
    ProductReviewsAddService,
    ProductReviewsDeleteService,
    ProductReviewsUpdateService,
    ProductsAddService,
    ProductsAutocompleteService,
    ProductsChangeStatusService,
    ProductsDeleteService,
    ProductsDetailsService,
    ProductsListExtendedService,
    ProductsUpdateService,
    RmqGetProductDetailsService,
    RmqGetProductsListService,
  ],
})
export default class GatewayProductModule {}
